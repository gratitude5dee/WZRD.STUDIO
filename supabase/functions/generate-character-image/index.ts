
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';
import { getCharacterVisualSystemPrompt, getCharacterVisualUserPrompt } from '../_shared/prompts.ts';

interface RequestBody {
  character_id: string;
  project_id?: string;
}

interface CharacterData {
  name: string;
  description: string | null;
  project?: {
    genre?: string | null;
    tone?: string | null;
    video_style?: string | null;
    cinematic_inspiration?: string | null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return handleCors();

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );

  try {
    const { character_id, project_id }: RequestBody = await req.json();
    if (!character_id) return errorResponse('character_id is required', 400);

    console.log(`Generating image for character ID: ${character_id}`);

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
          cinematic_inspiration
        )
      `)
      .eq('id', character_id)
      .single();

    const { data: charData, error: fetchError } = await query;

    if (fetchError || !charData) {
      console.error('Error fetching character:', fetchError?.message);
      return errorResponse('Character not found', 404, fetchError?.message);
    }

    // 2. Generate Visual Prompt using Groq
    console.log(`Generating visual prompt for character: ${charData.name}`);
    
    const visualPromptSystem = getCharacterVisualSystemPrompt();
    const visualPromptUser = getCharacterVisualUserPrompt(
      charData.name,
      charData.description,
      charData.project
    );

    const { data: groqResponse, error: groqError } = await supabaseClient.functions.invoke('groq-chat', {
      body: {
        prompt: `${visualPromptSystem}\n\n${visualPromptUser}`,
        model: 'llama3-8b-8192', // Using faster model for prompt generation
        temperature: 0.7,
        maxTokens: 200 // Visual prompts should be concise
      },
      headers: {
        'x-internal-request': 'true'
      }
    });

    if (groqError || !groqResponse?.text) {
      console.error('Failed to generate visual prompt:', groqError || 'No response text');
      return errorResponse('Failed to generate visual prompt', 500, groqError);
    }

    const visualPrompt = groqResponse.text.trim();
    console.log(`Generated visual prompt: ${visualPrompt}`);

    // 3. Generate Image using Gemini Nano banana
    console.log('Calling Gemini image generation (Nano banana)...');
    
    const { data: imageResponse, error: imageError } = await supabaseClient.functions.invoke('gemini-image-generation', {
      body: {
        prompt: visualPrompt,
        editMode: false
      }
    });

    if (imageError || !imageResponse?.imageUrl) {
      console.error('Failed to generate character image:', imageError || 'No image URL returned');
      return errorResponse('Failed to generate character image', 500, imageError);
    }

    const imageUrl = imageResponse.imageUrl;
    console.log(`Generated Image URL (base64): ${imageUrl.substring(0, 50)}...`);

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
            .update({ image_url: imageUrl })
            .eq('id', character_id);

          if (updateError) {
            console.error(`Background update failed for character ${character_id}:`, updateError);
          } else {
            console.log(`Successfully updated character ${character_id} with image URL`);
          }
        })()
      );
    } else {
      // Fallback for environments without EdgeRuntime.waitUntil
      const { error: updateError } = await supabaseClient
        .from('characters')
        .update({ image_url: imageUrl })
        .eq('id', character_id);

      if (updateError) {
        console.error(`Failed to update character ${character_id} with image URL:`, updateError);
      }
    }

    return successResponse(successResponseData);

  } catch (error) {
    console.error(`Error in generate-character-image:`, error);
    return errorResponse(error.message || 'Failed to generate character image', 500);
  }
});

