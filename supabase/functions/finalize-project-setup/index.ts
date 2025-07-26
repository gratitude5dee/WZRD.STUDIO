
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { authenticateRequest, AuthError } from '../_shared/auth.ts';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';
import { callClaudeApi, safeParseJson } from '../_shared/claude.ts';
import {
  getShotIdeasSystemPrompt,
  getShotIdeasUserPrompt,
  getShotTypeSystemPrompt,
  getShotTypeUserPrompt,
  getVisualPromptSystemPrompt,
  getVisualPromptUserPrompt
} from '../_shared/prompts.ts';

interface RequestBody {
  project_id: string;
}

// Helper function to introduce delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

serve(async (req) => {
  if (req.method === 'OPTIONS') return handleCors();

  try {
    const user = await authenticateRequest(req.headers);
    const { project_id }: RequestBody = await req.json();
    if (!project_id) return errorResponse('project_id is required', 400);

    console.log(`[Finalize Setup ${project_id}] Starting...`);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!claudeApiKey) return errorResponse('Server config error: Anthropic key missing', 500);

    // 1. Fetch Project and Scene Data
    const { data: projectData, error: projectErr } = await supabaseClient
      .from('projects')
      .select('id, title, description, genre, tone, video_style, cinematic_inspiration, aspect_ratio')
      .eq('id', project_id)
      .eq('user_id', user.id)
      .single();

    if (projectErr || !projectData) {
      return errorResponse('Project not found or access denied', 404, projectErr?.message);
    }

    const { data: scenesData, error: scenesErr } = await supabaseClient
      .from('scenes')
      .select('id, scene_number, title, description, location, lighting, weather')
      .eq('project_id', project_id)
      .order('scene_number');

    if (scenesErr) return errorResponse('Failed to fetch scenes', 500, scenesErr.message);
    if (!scenesData || scenesData.length === 0) {
      console.log(`[Finalize Setup ${project_id}] No scenes found. Skipping shot generation.`);
      return successResponse({ message: 'Project setup finalized. No scenes to process.' });
    }

    console.log(`[Finalize Setup ${project_id}] Found ${scenesData.length} scenes. Processing shots...`);

    // 2. Process Each Scene Asynchronously (but wait for all scenes to finish *before* returning)
    const shotGenerationPromises: Promise<void>[] = [];
    let totalShotsCreated = 0;
    const createdShotIds: string[] = [];

    for (const scene of scenesData) {
      const sceneProcessingPromise = (async () => {
        try {
          console.log(`[Scene ${scene.scene_number}] Generating shot ideas...`);
          const shotIdeasContent = await callClaudeApi(
            claudeApiKey,
            getShotIdeasSystemPrompt(),
            getShotIdeasUserPrompt(scene),
            150 // Max tokens for shot ideas array
          );
          
          let shotIdeas: string[] = [];
          try {
            shotIdeas = JSON.parse(shotIdeasContent);
            if (!Array.isArray(shotIdeas)) throw new Error("Not an array");
            console.log(`[Scene ${scene.scene_number}] Got ${shotIdeas.length} shot ideas:`, shotIdeas);
          } catch (parseError) {
            console.error(`[Scene ${scene.scene_number}] Failed to parse shot ideas: ${parseError.message}. Content: ${shotIdeasContent}. Using default.`);
            shotIdeas = [`${scene.title || `Scene ${scene.scene_number}`} - Key moment`]; // Fallback
          }

          const shotsToInsert: any[] = [];
          const visualPromptPromises: Promise<void>[] = [];

          // Prepare shot records locally first
          for (let i = 0; i < shotIdeas.length; i++) {
            const idea = shotIdeas[i];
            const shotNumber = i + 1;

            // Determine shot type (could be parallelized later if needed)
            let shotType = 'medium'; // Default
            try {
              const typeContent = await callClaudeApi(claudeApiKey, getShotTypeSystemPrompt(), getShotTypeUserPrompt(idea), 20);
              shotType = typeContent.trim().toLowerCase() || 'medium';
              console.log(`[Scene ${scene.scene_number} / Shot ${shotNumber}] Determined shot type: ${shotType}`);
            } catch (typeError) {
              console.warn(`[Scene ${scene.scene_number} / Shot ${shotNumber}] Failed to get shot type: ${typeError.message}. Using default.`);
            }

            shotsToInsert.push({
              scene_id: scene.id,
              project_id: project_id,
              shot_number: shotNumber,
              shot_type: shotType,
              prompt_idea: idea,
              image_status: 'pending', // Start as pending
            });
          }

          // Insert all shots for the scene at once
          if (shotsToInsert.length > 0) {
            // First, check if shots already exist for this scene
            const { data: existingShots } = await supabaseClient
              .from('shots')
              .select('shot_number')
              .eq('scene_id', scene.id);

            // Filter out shots that already exist
            const existingShotNumbers = new Set(existingShots?.map(s => s.shot_number) || []);
            const newShotsToInsert = shotsToInsert.filter(shot => !existingShotNumbers.has(shot.shot_number));

            if (newShotsToInsert.length === 0) {
              console.log(`[Scene ${scene.scene_number}] All shots already exist, skipping insertion.`);
              return;
            }

            const { data: insertedShots, error: insertErr } = await supabaseClient
              .from('shots')
              .insert(newShotsToInsert)
              .select('id, prompt_idea, shot_type'); // Select data needed for visual prompt

            if (insertErr) {
              console.error(`[Scene ${scene.scene_number}] Error inserting shots:`, insertErr);
              return; // Skip visual prompt/image gen for this scene if insert failed
            }
            
            if (!insertedShots || insertedShots.length === 0) {
              console.warn(`[Scene ${scene.scene_number}] No new shots were inserted.`);
              return;
            }

            totalShotsCreated += insertedShots.length;
            console.log(`[Scene ${scene.scene_number}] Inserted ${insertedShots.length} shots.`);

            // Now generate visual prompts and trigger image generation for inserted shots
            for (const shot of insertedShots) {
              createdShotIds.push(shot.id); // Track created IDs

              visualPromptPromises.push((async () => {
                try {
                  console.log(`[Shot ${shot.id}] Generating visual prompt...`);
                  const visualPrompt = await callClaudeApi(
                    claudeApiKey,
                    getVisualPromptSystemPrompt(),
                    getVisualPromptUserPrompt(shot.prompt_idea || '', shot.shot_type || 'medium', scene, projectData),
                    300 // Max tokens for visual prompt
                  );
                  const cleanedVisualPrompt = visualPrompt.trim().replace(/^"|"$/g, '');

                  // Update shot with visual prompt and status
                  const { error: updateErr } = await supabaseClient
                    .from('shots')
                    .update({ visual_prompt: cleanedVisualPrompt, image_status: 'prompt_ready' })
                    .eq('id', shot.id);

                  if (updateErr) {
                    console.error(`[Shot ${shot.id}] Failed to update with visual prompt:`, updateErr);
                    // Optionally set status to failed?
                  } else {
                    console.log(`[Shot ${shot.id}] Visual prompt saved. Triggering image generation.`);
                    // Trigger image generation asynchronously (don't await)
                    supabaseClient.functions.invoke('generate-shot-image', {
                      body: { shot_id: shot.id }
                    }).catch(invokeError => {
                      console.error(`[Shot ${shot.id}] Error invoking generate-shot-image:`, invokeError);
                    });
                  }
                  
                  // Add a small delay between invoking image generations to potentially avoid rate limits
                  await delay(500); // 500ms delay

                } catch (vpError) {
                  console.error(`[Shot ${shot.id}] Error generating visual prompt: ${vpError.message}`);
                  // Optionally update shot status to failed
                  await supabaseClient.from('shots').update({ image_status: 'failed', failure_reason: 'Visual prompt generation failed' }).eq('id', shot.id);
                }
              })());
            }
            
            // Wait for all visual prompt generations *for this scene* to finish before moving to the next scene
            await Promise.all(visualPromptPromises);
            console.log(`[Scene ${scene.scene_number}] Finished processing visual prompts.`);
          }
        } catch (sceneError) {
          console.error(`[Scene ${scene.scene_number}] Error processing scene: ${sceneError.message}`);
          // Continue to the next scene
        }
      })();
      
      shotGenerationPromises.push(sceneProcessingPromise);
    }

    // Wait for all scenes to be processed
    await Promise.all(shotGenerationPromises);

    console.log(`[Finalize Setup ${project_id}] Finished processing all scenes. ${totalShotsCreated} shots created and generation triggered.`);

    return successResponse({
      message: `Storyboard preparation initiated for ${scenesData.length} scenes and ${totalShotsCreated} shots.`,
      projectId: project_id,
      scenesProcessed: scenesData.length,
      shotsCreated: totalShotsCreated,
    });

  } catch (error) {
    console.error('[Finalize Setup] Top-level error:', error);
    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }
    return errorResponse(error.message || 'Internal server error', 500);
  }
});
