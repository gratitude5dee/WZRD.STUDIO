
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as fal from "https://esm.sh/@fal-ai/serverless-client@0.15.0";
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';
import { getCharacterVisualSystemPrompt, getCharacterVisualUserPrompt } from '../_shared/prompts.ts';

// Fetch with retry and timeout helper
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  retries = 3, 
  timeout = 30000
): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return response;
      }
      
      // If not ok and we have retries left, continue
      if (attempt < retries - 1) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt), 5000);
        console.log(`Request failed (status ${response.status}), retrying in ${backoffMs}ms... (attempt ${attempt + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        continue;
      }
      
      return response;
    } catch (error: unknown) {
      if (attempt < retries - 1) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt), 5000);
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.log(`Request error: ${message}, retrying in ${backoffMs}ms... (attempt ${attempt + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('Max retries exceeded');
}

interface RequestBody {
  character_id: string;
  project_id?: string;
  style_reference_url?: string;
}

interface ProjectData {
  genre?: string | null;
  tone?: string | null;
  video_style?: string | null;
  cinematic_inspiration?: string | null;
  style_reference_asset_id?: string | null;
}

interface CharacterData {
  name: string;
  description: string | null;
  project?: ProjectData | ProjectData[];
}

// Helper to get error message from unknown error
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return handleCors();

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );

  // Configure FAL.AI
  const FAL_KEY = Deno.env.get('FAL_KEY');
  if (!FAL_KEY) {
    return errorResponse('FAL_KEY not configured', 500);
  }
  fal.config({ credentials: FAL_KEY });

  try {
    const { character_id, project_id, style_reference_url }: RequestBody = await req.json();
    if (!character_id) return errorResponse('character_id is required', 400);

    console.log(`Generating image for character ID: ${character_id}`);
    
    // Update character status to generating
    await supabaseClient
      .from('characters')
      .update({ 
        image_status: 'generating',
        image_generation_error: null
      })
      .eq('id', character_id);

    // 1. Fetch Character Data and Project Context
    let query = supabaseClient
      .from('characters')
      .select(`
        name,
        description,
        project:projects (
          genre,
          tone,
          video_style,
          cinematic_inspiration,
          style_reference_asset_id
        )
      `)
      .eq('id', character_id)
      .single();

    const { data: charData, error: fetchError } = await query;

    if (fetchError || !charData) {
      console.error('Error fetching character:', fetchError?.message);
      return errorResponse('Character not found', 404, fetchError?.message);
    }

    // 2. Generate Visual Prompt using Groq API
    console.log(`Generating visual prompt for character: ${charData.name}`);
    
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (!GROQ_API_KEY) {
      return errorResponse('GROQ_API_KEY not configured', 500);
    }

    // Handle project data which may be array from join query
    const projectData: ProjectData | undefined = Array.isArray(charData.project) 
      ? charData.project[0] 
      : charData.project;

    const visualPromptSystem = getCharacterVisualSystemPrompt();
    const visualPromptUser = getCharacterVisualUserPrompt(
      charData.name,
      charData.description,
      projectData
    );

    const promptResponse = await fetchWithRetry('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: visualPromptSystem },
          { role: 'user', content: visualPromptUser }
        ],
        temperature: 0.7,
        max_tokens: 150
      }),
    }, 3, 30000);

    if (!promptResponse.ok) {
      console.error('Failed to generate visual prompt:', promptResponse.status);
      return errorResponse('Failed to generate visual prompt', 500);
    }

    const promptData = await promptResponse.json();
    const visualPrompt = promptData.choices?.[0]?.message?.content?.trim();

    if (!visualPrompt) {
      console.error('No visual prompt received');
      return errorResponse('Failed to generate visual prompt', 500);
    }

    console.log(`Generated visual prompt: ${visualPrompt}`);

    let styleReferenceUrl = style_reference_url;
    if (!styleReferenceUrl && projectData?.style_reference_asset_id) {
      const { data: mediaItem, error: mediaError } = await supabaseClient
        .from('media_items')
        .select('url, storage_bucket, storage_path')
        .eq('id', projectData.style_reference_asset_id)
        .single();

      if (!mediaError && mediaItem) {
        styleReferenceUrl =
          mediaItem.url ||
          (mediaItem.storage_bucket && mediaItem.storage_path
            ? `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/${mediaItem.storage_bucket}/${mediaItem.storage_path}`
            : undefined);
      }
    }

    // 3. Generate Image using FAL.AI FLUX
    console.log('Calling FAL.AI FLUX for image generation...');

    const falInput: Record<string, unknown> = {
      prompt: visualPrompt,
      image_size: "square_hd",
      num_inference_steps: 4,
      num_images: 1,
      enable_safety_checker: true,
    };

    if (styleReferenceUrl) {
      falInput.ip_adapter_style_reference = styleReferenceUrl;
      falInput.style_strength = 0.6;
    }

    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: falInput,
      logs: true,
    });

    // Cast result to handle FAL response structure
    const resultData = result as { images?: Array<{ url: string }> };
    const imageUrl = resultData?.images?.[0]?.url;

    if (!imageUrl) {
      console.error('No image URL returned from FAL.AI');
      return errorResponse('Failed to generate character image', 500);
    }
    console.log(`Generated Image URL: ${imageUrl}`);

    // 4. Return immediate response and update DB in background
    const successResponseData = { 
      success: true, 
      character_id: character_id, 
      image_url: imageUrl,
      visual_prompt: visualPrompt
    };

    // Update character record in background using waitUntil
    // @ts-ignore - EdgeRuntime is available in Deno Deploy
    if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
      // @ts-ignore
      EdgeRuntime.waitUntil(
        (async () => {
          const { error: updateError } = await supabaseClient
            .from('characters')
            .update({ 
              image_url: imageUrl,
              image_status: 'completed',
              image_generation_error: null
            })
            .eq('id', character_id);

          if (updateError) {
            console.error(`Background update failed for character ${character_id}:`, updateError);
          } else {
            console.log(`Successfully updated character ${character_id} with image URL and status`);
          }
        })()
      );
    } else {
      // Fallback for environments without EdgeRuntime.waitUntil
      const { error: updateError } = await supabaseClient
        .from('characters')
        .update({ 
          image_url: imageUrl,
          image_status: 'completed',
          image_generation_error: null
        })
        .eq('id', character_id);

      if (updateError) {
        console.error(`Failed to update character ${character_id} with image URL:`, updateError);
      }
    }

    return successResponse(successResponseData);

  } catch (error: unknown) {
    console.error(`Error in generate-character-image:`, error);
    const errorMsg = getErrorMessage(error);
    
    // Update character status to failed
    try {
      const { character_id } = await req.json();
      if (character_id) {
        await supabaseClient
          .from('characters')
          .update({ 
            image_status: 'failed',
            image_generation_error: errorMsg
          })
          .eq('id', character_id);
      }
    } catch (updateError) {
      console.error('Failed to update character error status:', updateError);
    }
    
    return errorResponse(errorMsg, 500);
  }
});
