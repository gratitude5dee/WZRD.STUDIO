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
  'fal-ai/flux-1/schnell',
  'fal-ai/flux/dev',
  'fal-ai/flux-pro/v1.1-ultra', 
  'fal-ai/hidream-i1-fast',
  'fal-ai/ideogram/v3',
  'fal-ai/minimax/image-01'
];

// Helper function to convert aspect ratio to FAL.AI image_size format
function getImageSizeForModel(modelId: string, sizeInput: string): any {
  // Handle direct dimension strings like "1536x1024"
  if (sizeInput.includes('x')) {
    const [width, height] = sizeInput.split('x').map(n => parseInt(n));
    
    // For FLUX models, convert to enum values
    if (modelId.includes('flux')) {
      const aspectRatio = width / height;
      if (aspectRatio > 1.5) return 'landscape_16_9';
      if (aspectRatio > 1.2) return 'landscape_4_3';
      if (aspectRatio < 0.7) return 'portrait_16_9';
      if (aspectRatio < 0.9) return 'portrait_4_3';
      return width > 1000 ? 'square_hd' : 'square';
    }
    
    // For other models that accept dimensions
    return sizeInput;
  }
  
  // Return as-is if it's already an enum value
  return sizeInput;
}

// Helper function to generate images with OpenAI as fallback
async function generateWithOpenAI(prompt: string, size: string = '1024x1024'): Promise<any> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('Neither FAL_KEY nor OPENAI_API_KEY is configured');
  }

  console.log('Falling back to OpenAI image generation...');
  
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt: prompt,
      n: 1,
      size: size,
      quality: 'high'
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  
  // Return in FAL-compatible format
  return {
    success: true,
    data: {
      images: [{
        url: `data:image/png;base64,${data.data[0].b64_json}`,
        width: parseInt(size.split('x')[0]),
        height: parseInt(size.split('x')[1])
      }]
    }
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    // Check if request is internal (from another edge function)
    const isInternalRequest = req.headers.get('x-internal-request') === 'true';
    
    // Only authenticate external requests
    if (!isInternalRequest) {
      await authenticateRequest(req.headers);
    }

    const input: ImageGenerationInput = await req.json();
    
    if (!input.prompt) {
      return errorResponse('Prompt is required', 400);
    }

    const falKey = Deno.env.get('FAL_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!falKey && !openaiKey) {
      return errorResponse('No image generation service configured. Please set FAL_KEY or OPENAI_API_KEY environment variable.', 500);
    }

    let result;
    
    // Try FAL.AI first if key is available
    if (falKey) {
      try {
        // Use specified model or default to FLUX schnell (faster)
        const modelId = input.model_id || 'fal-ai/flux-1/schnell';
        
        if (!IMAGE_MODELS.includes(modelId)) {
          return errorResponse(`Unsupported image model: ${modelId}`, 400);
        }

        // Prepare model-specific inputs
        const modelInput: Record<string, any> = {
          prompt: input.prompt,
        };

        // Add model-specific parameters
        if (modelId.includes('flux')) {
          // Convert image size to correct format for FLUX models
          const rawImageSize = input.image_size || '1024x1024';
          modelInput.image_size = getImageSizeForModel(modelId, rawImageSize);
          
          // Use correct defaults for FLUX models
          if (modelId.includes('schnell')) {
            modelInput.num_inference_steps = input.num_inference_steps || 4;
            modelInput.guidance_scale = input.guidance_scale || 3.5;
          } else {
            modelInput.num_inference_steps = input.num_inference_steps || 28;
            modelInput.guidance_scale = input.guidance_scale || 3.5;
          }
          
          modelInput.num_images = input.num_images || 1;
          if (input.seed) modelInput.seed = input.seed;
          modelInput.enable_safety_checker = input.enable_safety_checker ?? true;
          
          // Add output format if specified
          if (input.output_format) {
            modelInput.output_format = input.output_format;
          }
        } else if (modelId.includes('ideogram')) {
          if (input.seed) modelInput.seed = input.seed;
        } else if (modelId.includes('hidream')) {
          modelInput.image_size = input.image_size || '1024x1024';
        }

        console.log(`Generating image with ${modelId}:`, modelInput);
        result = await executeFalModel(modelId, modelInput);
        
        console.log('FAL.AI result:', JSON.stringify(result, null, 2));
        
        if (!result.success) {
          console.error('FAL.AI generation failed with error:', result.error);
          throw new Error(result.error || 'FAL.AI generation failed');
        }
        
        return successResponse({
          ...result,
          model_used: modelId,
        });
      } catch (falError) {
        console.error('FAL.AI generation failed:', falError);
        console.log('Attempting OpenAI fallback...');
        
        if (!openaiKey) {
          throw falError; // Re-throw if no fallback available
        }
      }
    }
    
    // Use OpenAI as fallback or primary if FAL key not available
    if (openaiKey) {
      result = await generateWithOpenAI(input.prompt, input.image_size || '1024x1024');
      
      return successResponse({
        ...result,
        model_used: 'openai-gpt-image-1',
      });
    }
    
    return errorResponse('All image generation services failed', 500);

  } catch (error) {
    console.error('Image generation error:', error);
    
    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }
    
    return errorResponse(error.message || 'Failed to generate image', 500);
  }
});