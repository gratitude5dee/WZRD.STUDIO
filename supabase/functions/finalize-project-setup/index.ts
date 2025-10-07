
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
  getVisualPromptUserPrompt,
  getDialogueSystemPrompt,
  getDialogueUserPrompt,
  getSoundEffectsSystemPrompt,
  getSoundEffectsUserPrompt
} from '../_shared/prompts.ts';

interface RequestBody {
  project_id: string;
}

// Helper function to introduce delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to call Lovable AI Gateway
async function callLovableAI(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY not configured');
  }
  
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: maxTokens
    }),
  });
  
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    if (response.status === 402) {
      throw new Error('Credits exhausted. Please add credits to your workspace.');
    }
    const errorText = await response.text();
    throw new Error(`AI Gateway error: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// Process a single shot: generate all content and trigger image generation
async function processSingleShot(
  shot: any,
  scene: any,
  projectData: any,
  supabaseClient: any,
  claudeApiKey: string
) {
  try {
    console.log(`[Shot ${shot.id}] Starting content generation...`);
    
    // Generate all content using Lovable AI (more reliable than Claude for this use case)
    let visualPrompt = '';
    let dialogue = '';
    let soundEffects = '';
    
    try {
      [visualPrompt, dialogue, soundEffects] = await Promise.all([
        // Visual Prompt using Lovable AI
        callLovableAI(
          getVisualPromptSystemPrompt(),
          getVisualPromptUserPrompt(shot.prompt_idea || '', shot.shot_type || 'medium', scene, projectData),
          300
        ),
        // Dialogue using Lovable AI
        callLovableAI(
          getDialogueSystemPrompt(),
          getDialogueUserPrompt(shot.prompt_idea, shot.shot_type, scene, projectData),
          150
        ),
        // Sound Effects using Lovable AI
        callLovableAI(
          getSoundEffectsSystemPrompt(),
          getSoundEffectsUserPrompt(shot.prompt_idea, shot.shot_type, scene),
          100
        )
      ]);
    } catch (aiError: any) {
      console.warn(`[Shot ${shot.id}] AI generation failed, using fallback:`, aiError.message);
      // Fallback: Create basic prompts from available data
      const sceneDesc = scene.description || scene.title || '';
      const shotDesc = shot.prompt_idea || sceneDesc;
      visualPrompt = `${shot.shot_type || 'Medium'} shot: ${shotDesc.substring(0, 150)}, professional cinematography, dramatic lighting, cinematic composition`;
      dialogue = '';
      soundEffects = `Ambient sound appropriate for ${scene.location || 'the scene'}`;
    }
    
    // Clean up responses
    const cleanedVisualPrompt = visualPrompt.trim().replace(/^"|"$/g, '');
    const cleanedDialogue = dialogue.trim().replace(/^"|"$/g, '');
    const cleanedSoundEffects = soundEffects.trim().replace(/^"|"$/g, '');
    
    console.log(`[Shot ${shot.id}] Generated content - Visual: ${cleanedVisualPrompt.substring(0, 50)}..., Dialogue: ${cleanedDialogue.substring(0, 30)}..., SFX: ${cleanedSoundEffects.substring(0, 30)}...`);
    
    // Update shot with ALL generated content
    const { error: updateErr } = await supabaseClient
      .from('shots')
      .update({ 
        visual_prompt: cleanedVisualPrompt,
        dialogue: cleanedDialogue,
        sound_effects: cleanedSoundEffects,
        image_status: 'prompt_ready'
      })
      .eq('id', shot.id);
    
    if (updateErr) {
      console.error(`[Shot ${shot.id}] Failed to update:`, updateErr);
      throw updateErr;
    }
    
    console.log(`[Shot ${shot.id}] All content saved to DB. Triggering image generation.`);
    
    // Trigger image generation asynchronously
    supabaseClient.functions.invoke('generate-shot-image', {
      body: { shot_id: shot.id }
    }).catch((invokeError: any) => {
      console.error(`[Shot ${shot.id}] Error invoking generate-shot-image:`, invokeError);
    });
    
    // Rate limit protection
    await delay(500);
    
  } catch (error: any) {
    console.error(`[Shot ${shot.id}] Error: ${error.message}`);
    // Mark as failed
    await supabaseClient.from('shots')
      .update({ 
        image_status: 'failed', 
        failure_reason: error.message 
      })
      .eq('id', shot.id);
  }
}

// Process a single scene: generate shot ideas and process each shot
async function processSingleScene(
  scene: any,
  projectData: any,
  project_id: string,
  supabaseClient: any,
  claudeApiKey: string
) {
  try {
    console.log(`[Scene ${scene.scene_number}] Generating shot ideas...`);
    
    let shotIdeasContent = '';
    try {
      shotIdeasContent = await callLovableAI(
        getShotIdeasSystemPrompt(),
        getShotIdeasUserPrompt(scene),
        150
      );
    } catch (aiError: any) {
      console.warn(`[Scene ${scene.scene_number}] AI shot generation failed, using fallback:`, aiError.message);
    }
    
    let shotIdeas: string[] = [];
    try {
      if (shotIdeasContent) {
        shotIdeas = JSON.parse(shotIdeasContent);
        if (!Array.isArray(shotIdeas)) throw new Error("Not an array");
        console.log(`[Scene ${scene.scene_number}] Got ${shotIdeas.length} shot ideas:`, shotIdeas);
      }
    } catch (parseError: any) {
      console.error(`[Scene ${scene.scene_number}] Failed to parse shot ideas: ${parseError.message}. Using default.`);
    }
    
    // Fallback: Create default shots with scene context
    if (shotIdeas.length === 0) {
      console.log(`[Scene ${scene.scene_number}] Using fallback shot structure (3 default shots)`);
      const sceneDesc = scene.description || '';
      const sceneTitle = scene.title || `Scene ${scene.scene_number}`;
      
      shotIdeas = [
        `Establishing wide shot: ${sceneTitle} - ${sceneDesc.substring(0, 80)}`,
        `Medium shot capturing the main action: ${sceneDesc.substring(0, 80)}`,
        `Close-up detail shot emphasizing key moment in ${sceneTitle}`
      ];
    }

    const shotsToInsert: any[] = [];

    // Prepare shot records - determine shot types
    for (let i = 0; i < shotIdeas.length; i++) {
      const idea = shotIdeas[i];
      const shotNumber = i + 1;

      // Determine shot type based on position and content
      let shotType = 'medium';
      if (i === 0) {
        shotType = 'wide'; // First shot is usually establishing
      } else if (idea.toLowerCase().includes('close') || idea.toLowerCase().includes('detail')) {
        shotType = 'close_up';
      } else if (idea.toLowerCase().includes('wide') || idea.toLowerCase().includes('establishing')) {
        shotType = 'wide';
      }
      
      console.log(`[Scene ${scene.scene_number} / Shot ${shotNumber}] Shot type: ${shotType}`);

      shotsToInsert.push({
        scene_id: scene.id,
        project_id: project_id,
        shot_number: shotNumber,
        shot_type: shotType,
        prompt_idea: idea,
        image_status: 'pending',
      });
    }

    // Insert shots
    if (shotsToInsert.length > 0) {
      const { data: existingShots } = await supabaseClient
        .from('shots')
        .select('shot_number')
        .eq('scene_id', scene.id);

      const existingShotNumbers = new Set(existingShots?.map((s: any) => s.shot_number) || []);
      const newShotsToInsert = shotsToInsert.filter(shot => !existingShotNumbers.has(shot.shot_number));

      if (newShotsToInsert.length === 0) {
        console.log(`[Scene ${scene.scene_number}] All shots already exist, skipping.`);
        return 0;
      }

      const { data: insertedShots, error: insertErr } = await supabaseClient
        .from('shots')
        .insert(newShotsToInsert)
        .select('id, prompt_idea, shot_type');

      if (insertErr) {
        console.error(`[Scene ${scene.scene_number}] Error inserting shots:`, insertErr);
        return 0;
      }
      
      if (!insertedShots || insertedShots.length === 0) {
        console.warn(`[Scene ${scene.scene_number}] No new shots inserted.`);
        return 0;
      }

      console.log(`[Scene ${scene.scene_number}] Inserted ${insertedShots.length} shots.`);

      // Process each shot sequentially to avoid rate limits and ensure proper ordering
      for (const shot of insertedShots) {
        await processSingleShot(shot, scene, projectData, supabaseClient, claudeApiKey);
      }
      
      console.log(`[Scene ${scene.scene_number}] Finished processing all shots.`);
      
      return insertedShots.length;
    }
    return 0;
  } catch (sceneError: any) {
    console.error(`[Scene ${scene.scene_number}] Error processing scene: ${sceneError.message}`);
    return 0;
  }
}

// Main processing function that runs in background
async function processProjectSetup(
  project_id: string,
  user_id: string,
  supabaseClient: any,
  claudeApiKey: string
) {
  console.log(`[Background Processing ${project_id}] Starting...`);
  
  try {
    // Fetch project and scenes
    const { data: projectData, error: projectErr } = await supabaseClient
      .from('projects')
      .select('id, title, description, genre, tone, video_style, cinematic_inspiration, aspect_ratio')
      .eq('id', project_id)
      .eq('user_id', user_id)
      .single();

    if (projectErr || !projectData) {
      console.error(`[Background Processing ${project_id}] Project not found:`, projectErr?.message);
      return;
    }

    const { data: scenesData, error: scenesErr } = await supabaseClient
      .from('scenes')
      .select('id, scene_number, title, description, location, lighting, weather')
      .eq('project_id', project_id)
      .order('scene_number');

    if (scenesErr || !scenesData || scenesData.length === 0) {
      console.log(`[Background Processing ${project_id}] No scenes found. Exiting.`);
      return;
    }

    console.log(`[Background Processing ${project_id}] Processing ${scenesData.length} scenes...`);
    console.log(`[Background Processing ${project_id}] Prioritizing Scene 1 for immediate loading...`);

    let totalShotsCreated = 0;
    
    // Process scenes sequentially to avoid overwhelming the API (Scene 1 first)
    for (const scene of scenesData) {
      console.log(`[Scene ${scene.scene_number}] Starting scene processing...`);
      const shotsCreated = await processSingleScene(
        scene,
        projectData,
        project_id,
        supabaseClient,
        claudeApiKey
      );
      totalShotsCreated += shotsCreated;
      console.log(`[Scene ${scene.scene_number}] Created ${shotsCreated} shots.`);
    }

    console.log(`[Background Processing ${project_id}] Complete. Created ${totalShotsCreated} shots.`);
    
  } catch (error: any) {
    console.error(`[Background Processing ${project_id}] Error:`, error.message);
  }
}

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

    console.log(`[Finalize Setup ${project_id}] Found ${scenesData.length} scenes. Starting background processing...`);

    // Start background processing immediately
    // @ts-ignore - EdgeRuntime is available in Deno Edge Functions
    if (typeof EdgeRuntime !== 'undefined') {
      // @ts-ignore
      EdgeRuntime.waitUntil(
        processProjectSetup(project_id, user.id, supabaseClient, claudeApiKey)
      );
    } else {
      // Fallback for local development
      processProjectSetup(project_id, user.id, supabaseClient, claudeApiKey).catch(err => {
        console.error('Background processing error:', err);
      });
    }

    // Return immediately to allow UI to navigate
    console.log(`[Finalize Setup ${project_id}] Background processing initiated. Returning response.`);
    
    return successResponse({
      message: `Storyboard preparation started for ${scenesData.length} scenes. Generation will continue in background.`,
      projectId: project_id,
      scenesProcessed: scenesData.length,
      status: 'processing'
    });

  } catch (error) {
    console.error('[Finalize Setup] Top-level error:', error);
    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }
    return errorResponse(error.message || 'Internal server error', 500);
  }
});
