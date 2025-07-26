import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest, AuthError } from '../_shared/auth.ts';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';
import { executeFalModel } from '../_shared/falai-client.ts';

interface VideoGenerationInput {
  prompt: string
  image_url?: string
  aspect_ratio?: string
  duration?: number
  fps?: number
  motion_strength?: number
  model_id?: string
}

const VIDEO_MODELS = [
  'fal-ai/magi',
  'fal-ai/magi/image-to-video',
  'fal-ai/kling-video/v2/master/text-to-video',
  'fal-ai/kling-video/v2/master/image-to-video',
  'fal-ai/ltx-video-v097',
  'fal-ai/ltx-video-v097/image-to-video',
  'fal-ai/wan-i2v',
  'fal-ai/veo2/image-to-video'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    await authenticateRequest(req.headers);

    const input: VideoGenerationInput = await req.json();
    
    if (!input.prompt) {
      return errorResponse('Prompt is required', 400);
    }

    // Auto-select model based on input
    let modelId = input.model_id;
    if (!modelId) {
      if (input.image_url) {
        modelId = 'fal-ai/magi/image-to-video'; // Default image-to-video
      } else {
        modelId = 'fal-ai/magi'; // Default text-to-video
      }
    }
    
    if (!VIDEO_MODELS.includes(modelId)) {
      return errorResponse(`Unsupported video model: ${modelId}`, 400);
    }

    // Prepare model-specific inputs
    const modelInput: Record<string, any> = {
      prompt: input.prompt,
    };

    // Add image if provided for image-to-video models
    if (input.image_url && modelId.includes('image-to-video')) {
      modelInput.image_url = input.image_url;
    }

    // Add model-specific parameters
    if (modelId.includes('kling')) {
      if (input.aspect_ratio) modelInput.aspect_ratio = input.aspect_ratio;
      if (input.duration) modelInput.duration = input.duration;
    } else if (modelId.includes('ltx')) {
      if (input.fps) modelInput.fps = input.fps;
      if (input.motion_strength) modelInput.motion_strength = input.motion_strength;
    }

    console.log(`Generating video with ${modelId}:`, modelInput);

    const result = await executeFalModel(modelId, modelInput);

    return successResponse({
      ...result,
      model_used: modelId,
    });
  } catch (error) {
    console.error('Video generation error:', error);
    
    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }
    
    return errorResponse(error.message || 'Failed to generate video', 500);
  }
});