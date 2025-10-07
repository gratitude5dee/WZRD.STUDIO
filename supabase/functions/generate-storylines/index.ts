
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { authenticateRequest, AuthError } from '../_shared/auth.ts';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';
import { safeParseJson } from '../_shared/claude.ts';
import { 
  StorylineRequestBody, 
  StorylineResponseData, 
  AnalysisResponseData,
  StorylineGenerationResult
} from './types.ts';
import { 
  getStorylineSystemPrompt, 
  getStorylineUserPrompt, 
  getAnalysisSystemPrompt, 
  getAnalysisUserPrompt 
} from './prompts.ts';
import { 
  saveStorylineData, 
  updateProjectSettings, 
  triggerCharacterImageGeneration,
  triggerShotVisualPromptGeneration 
} from './database.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCors();
  }
  
  try {
    // Authenticate the request
    const user = await authenticateRequest(req.headers);
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Parse request body
    const { project_id, generate_alternative = false }: StorylineRequestBody = await req.json();
    if (!project_id) {
      return errorResponse('Project ID is required', 400);
    }
    console.log(`Received request for project ${project_id}. Generate alternative: ${generate_alternative}`);

    // Fetch project details
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('title, concept_text, genre, tone, format, custom_format_description, special_requests, product_name, target_audience, main_message, call_to_action')
      .eq('id', project_id)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      console.error('Project error:', projectError?.message);
      return errorResponse('Project not found or access denied', 404, projectError?.message);
    }

    // Fetch existing storylines if generating an alternative
    let existingStorylines: any[] = [];
    if (generate_alternative) {
      const { data: storylines, error: storylinesError } = await supabaseClient
        .from('storylines')
        .select('title, description')
        .eq('project_id', project_id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (!storylinesError && storylines) {
        existingStorylines = storylines;
        console.log(`Found ${existingStorylines.length} existing storylines to avoid duplicating`);
      }
    }

    // Start background processing with EdgeRuntime.waitUntil()
    const backgroundProcessing = (async () => {
      let storyline_id: string | null = null;
      
      try {
        // Step 1: Generate storyline with Gemini
        console.log('Generating storyline with Gemini AI (structured JSON output)...');
        const storylineSystemPrompt = getStorylineSystemPrompt(generate_alternative);
        const storylineUserPrompt = getStorylineUserPrompt(project, generate_alternative, existingStorylines);
        
        const { STORYLINE_RESPONSE_SCHEMA, ALTERNATIVE_STORYLINE_SCHEMA } = await import('./gemini-schemas.ts');
        const responseSchema = generate_alternative ? ALTERNATIVE_STORYLINE_SCHEMA : STORYLINE_RESPONSE_SCHEMA;
        
        const geminiResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/gemini-storyline-generation`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemPrompt: storylineSystemPrompt,
              prompt: storylineUserPrompt,
              model: generate_alternative ? 'google/gemini-2.5-flash' : 'google/gemini-2.5-pro',
              responseSchema: responseSchema,
              temperature: generate_alternative ? 1.0 : 0.7
            }),
          }
        );

        if (!geminiResponse.ok) {
          const errorData = await geminiResponse.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(`Gemini generation failed: ${errorData.error || geminiResponse.statusText}`);
        }

        const geminiData = await geminiResponse.json();
        const storylineData = geminiData.parsed as StorylineResponseData;

        if (!storylineData || !storylineData.primary_storyline) {
          throw new Error('Failed to parse valid storyline from Gemini');
        }

        console.log('Successfully generated storyline with Gemini');
        const fullStoryText = storylineData.primary_storyline.full_story;

        // Step 2: Create storyline skeleton
        const { data: storylineRecord, error: storylineError } = await supabaseClient
          .from('storylines')
          .insert({
            project_id,
            title: storylineData.primary_storyline.title,
            description: storylineData.primary_storyline.description,
            full_story: '', // Will be populated progressively
            status: 'generating',
            is_selected: !generate_alternative
          })
          .select()
          .single();
        
        if (storylineError) throw storylineError;
        storyline_id = storylineRecord.id;
        console.log(`Created storyline skeleton with ID: ${storyline_id}`);

        // Step 3: Stream full story (paragraph by paragraph)
        const paragraphs = fullStoryText.split('\n\n').filter(p => p.trim());
        let accumulatedStory = '';
        
        for (const paragraph of paragraphs) {
          accumulatedStory += paragraph + '\n\n';
          await supabaseClient
            .from('storylines')
            .update({ full_story: accumulatedStory.trim() })
            .eq('id', storyline_id);
          
          await new Promise(resolve => setTimeout(resolve, 100)); // Smooth streaming
        }

        console.log('Completed streaming full story');

        // Step 4: Stream scenes (one by one)
        const sceneBreakdown = storylineData.scene_breakdown || [];
        for (const scene of sceneBreakdown) {
          await supabaseClient
            .from('scenes')
            .insert({
              project_id,
              storyline_id,
              scene_number: scene.scene_number,
              title: scene.title,
              description: scene.description,
              location: scene.location,
              lighting: scene.lighting,
              weather: scene.weather
            });
          
          await new Promise(resolve => setTimeout(resolve, 150)); // Smooth scene appearance
        }

        console.log(`Completed streaming ${sceneBreakdown.length} scenes`);

        // Step 5: Analysis and character discovery (only for main storyline)
        let analysisData: AnalysisResponseData | null = null;
        if (!generate_alternative) {
          try {
            console.log('Analyzing storyline for characters and settings...');
            const analysisSystemPrompt = getAnalysisSystemPrompt();
            const analysisUserPrompt = getAnalysisUserPrompt(fullStoryText);
            const { ANALYSIS_RESPONSE_SCHEMA } = await import('./gemini-schemas.ts');

            const analysisResponse = await fetch(
              `${Deno.env.get('SUPABASE_URL')}/functions/v1/gemini-storyline-generation`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  systemPrompt: analysisSystemPrompt,
                  prompt: analysisUserPrompt,
                  model: 'google/gemini-2.5-flash',
                  responseSchema: ANALYSIS_RESPONSE_SCHEMA,
                  temperature: 0.5
                }),
              }
            );

            if (analysisResponse.ok) {
              const analysisData_raw = await analysisResponse.json();
              analysisData = analysisData_raw.parsed as AnalysisResponseData;
              
              // Stream characters
              if (analysisData?.characters) {
                for (const char of analysisData.characters) {
                  await supabaseClient
                    .from('characters')
                    .insert({
                      project_id,
                      name: char.name,
                      description: char.description
                    });
                  
                  await new Promise(resolve => setTimeout(resolve, 100));
                }
                console.log(`Completed streaming ${analysisData.characters.length} characters`);
              }
            }
          } catch (analysisError) {
            console.warn('Failed to analyze storyline:', analysisError.message);
          }
        }

        // Step 6: Complete the storyline
        await supabaseClient
          .from('storylines')
          .update({ status: 'complete' })
          .eq('id', storyline_id);

        // Step 7: Generate shots from scenes (only for main storyline)
        if (!generate_alternative && sceneBreakdown.length > 0) {
          const { data: scenesWithIds } = await supabaseClient
            .from('scenes')
            .select('id, scene_number, title, description, location, lighting, emotional_tone, color_palette')
            .eq('storyline_id', storyline_id)
            .order('scene_number');

          if (scenesWithIds) {
            console.log(`[Shot Generation] sceneBreakdown length: ${sceneBreakdown.length}`);
            console.log(`[Shot Generation] scenesWithIds length: ${scenesWithIds.length}`);
            sceneBreakdown.forEach((scene, idx) => {
              console.log(`[Scene ${idx + 1}] shot_ideas count: ${scene.shot_ideas?.length || 0}`);
            });

            const shotsToInsert: any[] = [];
            
            scenesWithIds.forEach((scene, sceneIdx) => {
              console.log(`[Scene ${scene.scene_number}] Processing... sceneData exists: ${!!sceneBreakdown[sceneIdx]}`);
              const sceneData = sceneBreakdown[sceneIdx];
              let shotIdeas = sceneData?.shot_ideas || [];
              console.log(`[Scene ${scene.scene_number}] shotIdeas count: ${shotIdeas.length}`);
              
              // FALLBACK: If no shot ideas provided, create 3 default shots using scene data from DB
              if (shotIdeas.length === 0) {
                console.warn(`[Scene ${scene.scene_number}] No shot_ideas from Gemini. Creating default shots using DB scene data.`);
                
                const sceneTitle = scene.title || sceneData?.title || `Scene ${scene.scene_number}`;
                const sceneDesc = scene.description || sceneData?.description || 'the scene unfolds';
                const location = scene.location || sceneData?.location || 'the location';
                const lighting = scene.lighting || sceneData?.lighting || 'cinematic lighting';
                const tone = scene.emotional_tone || sceneData?.emotional_tone || 'dramatic';
                const palette = scene.color_palette || sceneData?.color_palette || 'cinematic color grading';
                
                shotIdeas = [
                  {
                    shot_type: 'wide',
                    description: `Establishing shot: ${sceneTitle}`,
                    visual_prompt: `Wide angle establishing shot of ${location}, ${sceneDesc}, ${lighting}, professional cinematography, ${palette}`,
                    camera_movement: 'static',
                    duration_seconds: 4,
                    composition_notes: 'Establishing context'
                  },
                  {
                    shot_type: 'medium',
                    description: `Main action: ${sceneDesc.slice(0, 80)}`,
                    visual_prompt: `Medium shot, ${tone} atmosphere, ${sceneDesc}, ${lighting}, ${palette}, professional photography`,
                    camera_movement: 'subtle pan',
                    duration_seconds: 5,
                    composition_notes: 'Core narrative beat'
                  },
                  {
                    shot_type: 'close_up',
                    description: `Emotional close-up for ${sceneTitle}`,
                    visual_prompt: `Close-up shot, ${tone} mood, ${lighting}, shallow depth of field, 85mm lens, ${palette}`,
                    camera_movement: 'static',
                    duration_seconds: 3,
                    composition_notes: 'Emotional emphasis'
                  }
                ];
              }
              
              // Generate shots for this scene
              shotIdeas.forEach((shotIdea, index) => {
                shotsToInsert.push({
                  scene_id: scene.id,
                  project_id: project_id,
                  shot_number: index + 1,
                  shot_type: shotIdea.shot_type || 'medium',
                  prompt_idea: shotIdea.description,
                  visual_prompt: shotIdea.visual_prompt,
                  camera_movement: shotIdea.camera_movement,
                  duration_seconds: shotIdea.duration_seconds,
                  composition_notes: shotIdea.composition_notes,
                  image_status: 'prompt_ready'
                });
              });
            });

            console.log(`[Shot Generation] Prepared ${shotsToInsert.length} total shots for insertion`);
            console.log(`[Shot Generation] Shots per scene: ${JSON.stringify(
              scenesWithIds.map((s, i) => ({ 
                scene: s.scene_number, 
                count: shotsToInsert.filter(sh => sh.scene_id === s.id).length 
              }))
            )}`);

            if (shotsToInsert.length > 0) {
              const { data: newShots } = await supabaseClient
                .from('shots')
                .insert(shotsToInsert)
                .select('id');
              
              if (newShots) {
                console.log(`Created ${newShots.length} shots`);
                await triggerShotVisualPromptGeneration(supabaseClient, newShots.map(s => s.id));
              }
            }
          }
        }

        // Step 8: Update project settings (only for main storyline)
        if (!generate_alternative) {
          const updatedSettings: any = { selected_storyline_id: storyline_id };
          
          if (analysisData?.potential_genre) {
            updatedSettings.genre = analysisData.potential_genre;
          }
          if (analysisData?.potential_tone) {
            updatedSettings.tone = analysisData.potential_tone;
          }
          
          await updateProjectSettings(supabaseClient, project_id, updatedSettings);

          // Trigger character image generation
          if (analysisData?.characters?.length > 0) {
            const { data: characters } = await supabaseClient
              .from('characters')
              .select('id, name')
              .eq('project_id', project_id);
            
            if (characters) {
              await triggerCharacterImageGeneration(supabaseClient, project_id, characters);
            }
          }
        }

        console.log('Background storyline generation completed successfully');

      } catch (error) {
        console.error('Background generation error:', error);
        if (storyline_id) {
          await supabaseClient
            .from('storylines')
            .update({ 
              status: 'failed', 
              failure_reason: error.message 
            })
            .eq('id', storyline_id);
        }
      }
    })();

    // Use EdgeRuntime.waitUntil to keep function alive for background processing
    EdgeRuntime.waitUntil(backgroundProcessing);

    // Return immediately with 202 Accepted
    return successResponse({
      success: true,
      message: 'Storyline generation started',
      project_id
    }, 202);

  } catch (error) {
    console.error('Error in generate-storylines function:', error);
    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }
    if (error instanceof SyntaxError) {
      console.error('JSON Parsing Error:', error.message);
      return errorResponse('Failed to parse request body or API response', 400, { detail: error.message });
    }
    return errorResponse(error.message || 'Internal server error', 500);
  }
});
