import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as fal from "npm:@fal-ai/serverless-client";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

fal.config({
  credentials: Deno.env.get('FAL_KEY'),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      character_id,
      source_image_url,
      edit_prompt,
      style_reference_url,
    } = await req.json();

    if (!source_image_url || !edit_prompt) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Editing character ${character_id} with prompt: ${edit_prompt}`);

    const result = await fal.subscribe("fal-ai/flux-pro/v1.1/edit", {
      input: {
        image_url: source_image_url,
        prompt: edit_prompt,
        ...(style_reference_url
          ? {
              style_reference_url,
              style_strength: 0.5,
            }
          : {}),
        guidance_scale: 30,
        num_inference_steps: 28,
        image_size: "portrait_4_3",
      },
      logs: true,
    });

    const editedImageUrl = (result as any)?.images?.[0]?.url;

    if (!editedImageUrl) {
      throw new Error('No image returned from edit model');
    }

    console.log(`Edit complete: ${editedImageUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        edited_image_url: editedImageUrl,
        character_id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Edit error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
