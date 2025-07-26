import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest, AuthError } from '../_shared/auth.ts';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';
import { executeFalModel } from '../_shared/falai-client.ts';

interface ImageGenerationInput {
  prompt: string
  image_size?: string
  num_inference_steps?: number
  guidance_scale?: number
  num_images?: number
  seed?: number
  enable_safety_checker?: boolean
  output_format?: 'jpeg' | 'png' | 'webp'
  model_id?: string // Allow model selection
}

const IMAGE_MODELS = [
  'fal-ai/flux/dev',
  'fal-ai/flux-pro/v1.1-ultra', 
  'fal-ai/hidream-i1-fast',
  'fal-ai/ideogram/v3',
  'fal-ai/minimax/image-01'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    await authenticateRequest(req.headers);

    const input: ImageGenerationInput = await req.json();
    
    if (!input.prompt) {
      return errorResponse('Prompt is required', 400);
    }

    // Use specified model or default to FLUX dev
    const modelId = input.model_id || 'fal-ai/flux/dev';
    
    if (!IMAGE_MODELS.includes(modelId)) {
      return errorResponse(`Unsupported image model: ${modelId}`, 400);
    }

    // Prepare model-specific inputs
    const modelInput: Record<string, any> = {
      prompt: input.prompt,
    };

    // Add model-specific parameters
    if (modelId.includes('flux')) {
      modelInput.image_size = input.image_size || '1024x1024';
      modelInput.num_inference_steps = input.num_inference_steps || 28;
      modelInput.guidance_scale = input.guidance_scale || 3.5;
      modelInput.num_images = input.num_images || 1;
      if (input.seed) modelInput.seed = input.seed;
      modelInput.enable_safety_checker = input.enable_safety_checker ?? true;
    } else if (modelId.includes('ideogram')) {
      if (input.seed) modelInput.seed = input.seed;
    } else if (modelId.includes('hidream')) {
      modelInput.image_size = input.image_size || '1024x1024';
    }

    console.log(`Generating image with ${modelId}:`, modelInput);

    const result = await executeFalModel(modelId, modelInput);

    return successResponse({
      ...result,
      model_used: modelId,
    });
  } catch (error) {
    console.error('Image generation error:', error);
    
    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }
    
    return errorResponse(error.message || 'Failed to generate image', 500);
  }
});