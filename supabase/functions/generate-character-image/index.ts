
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

    // 3. Generate Image using FAL.AI or OpenAI
    console.log('Calling image generation service...');
    
    const { data: imageResponse, error: imageError } = await supabaseClient.functions.invoke('falai-image-generation', {
      body: {
        prompt: visualPrompt,
        image_size: '1024x1024',
        model_id: 'fal-ai/flux/dev'
      },
      headers: {
        'x-internal-request': 'true'
      }
    });

    if (imageError || !imageResponse?.data?.images?.[0]?.url) {
      console.error('Failed to generate character image:', imageError || 'No image URL returned');
      return errorResponse('Failed to generate character image', 500, imageError);
    }

    const imageUrl = imageResponse.data.images[0].url;
    console.log(`Generated Image URL: ${imageUrl}`);

    // 4. Update Character Record
    const { error: updateError } = await supabaseClient
      .from('characters')
      .update({ image_url: imageUrl })
      .eq('id', character_id);

    if (updateError) {
      console.error(`Failed to update character ${character_id} with image URL:`, updateError);
      return errorResponse('Failed to save generated image URL', 500, updateError.message);
    }

    console.log(`Successfully updated character ${character_id} with image URL`);
    return successResponse({ 
      success: true, 
      character_id: character_id, 
      image_url: imageUrl,
      visual_prompt: visualPrompt // Including the prompt for transparency
    });

  } catch (error) {
    console.error(`Error in generate-character-image:`, error);
    return errorResponse(error.message || 'Failed to generate character image', 500);
  }
});

