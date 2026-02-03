import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as fal from "https://esm.sh/@fal-ai/serverless-client@0.15.0";
import { corsHeaders, errorResponse, handleCors } from '../_shared/response.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    const { prompt, imageUrl, editMode = false, imageSize = 'square_hd' } = await req.json();

    if (!prompt) {
      return errorResponse('Prompt is required', 400);
    }

    const FAL_KEY = Deno.env.get("FAL_KEY");
    if (!FAL_KEY) {
      return errorResponse('FAL_KEY is not configured', 500);
    }

    // Configure FAL.AI
    fal.config({ credentials: FAL_KEY });

    console.log('Generating image with FAL.AI FLUX');

    // Determine image size format for FAL
    let falImageSize: any = imageSize;
    if (typeof imageSize === 'string') {
      // Map common size names to FAL format
      const sizeMap: Record<string, any> = {
        'square': 'square',
        'square_hd': 'square_hd',
        'portrait': 'portrait_4_3',
        'portrait_hd': 'portrait_16_9',
        'landscape': 'landscape_4_3',
        'landscape_hd': 'landscape_16_9',
      };
      falImageSize = sizeMap[imageSize] || 'square_hd';
    }

    let result: any;

    if (editMode && imageUrl) {
      // Image-to-image mode using FLUX img2img
      console.log('Using image-to-image mode');
      result = await fal.subscribe("fal-ai/flux/dev/image-to-image", {
        input: {
          prompt: prompt,
          image_url: imageUrl,
          strength: 0.75,
          num_inference_steps: 28,
          guidance_scale: 3.5,
          num_images: 1,
          enable_safety_checker: true,
        },
        logs: true,
      });
    } else {
      // Text-to-image mode using FLUX Schnell (fast) or Dev (quality)
      console.log('Using text-to-image mode');
      result = await fal.subscribe("fal-ai/flux/schnell", {
        input: {
          prompt: prompt,
          image_size: falImageSize,
          num_inference_steps: 4,
          num_images: 1,
          enable_safety_checker: true,
        },
        logs: true,
      });
    }

    const generatedImageUrl = result?.images?.[0]?.url;

    if (!generatedImageUrl) {
      console.error("No image in response:", JSON.stringify(result));
      return errorResponse("No image generated. The AI may need a more descriptive prompt.", 500);
    }

    console.log(`Successfully generated image`);

    return new Response(JSON.stringify({ 
      imageUrl: generatedImageUrl,
      prompt 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return errorResponse(error instanceof Error ? error.message : "Unknown error", 500);
  }
});
