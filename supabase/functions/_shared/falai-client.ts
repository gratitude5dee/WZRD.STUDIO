export interface FalResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  requestId?: string
  logs?: any[]
}

export interface FalQueueStatus {
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  response_url?: string
  queue_position?: number
  logs?: any[]
  result?: any
}

export async function executeFalModel<T>(
  modelId: string,
  inputs: Record<string, any>,
  mode: 'sync' | 'queue' = 'queue'
): Promise<FalResponse<T>> {
  try {
    const falKey = Deno.env.get('FAL_KEY')
    if (!falKey) {
      throw new Error('FAL_KEY environment variable is not set')
    }

    console.log(`Executing Fal.AI model: ${modelId} with mode: ${mode}`)

    const response = await fetch(`https://fal.run/${modelId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputs),
    })

    const responseText = await response.text()
    console.log('Fal.AI response:', responseText)

    if (!response.ok) {
      let errorMessage
      try {
        const error = JSON.parse(responseText)
        errorMessage = error.message || error.error || `Failed to execute model (${response.status})`
      } catch {
        errorMessage = `Failed to execute model (${response.status}): ${responseText}`
      }
      throw new Error(errorMessage)
    }

    const result = JSON.parse(responseText)
    
    return {
      success: true,
      data: result,
      requestId: result.request_id,
      logs: result.logs,
    }
  } catch (error) {
    console.error('Fal.AI execution error:', error)
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    }
  }
}

export async function pollFalStatus(requestId: string): Promise<FalResponse<any>> {
  try {
    const falKey = Deno.env.get('FAL_KEY')
    if (!falKey) {
      throw new Error('FAL_KEY environment variable is not set')
    }

    const response = await fetch(`https://fal.run/v1/queue/status/${requestId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${falKey}`,
      },
    })

    const responseText = await response.text()
    console.log('Fal.AI status response:', responseText)

    if (!response.ok) {
      let errorMessage
      try {
        const error = JSON.parse(responseText)
        errorMessage = error.message || error.error || 'Failed to check status from fal.ai'
      } catch {
        errorMessage = 'Failed to check status from fal.ai: ' + responseText
      }
      throw new Error(errorMessage)
    }

    const data = JSON.parse(responseText)
    
    return {
      success: true,
      data: {
        status: data.status,
        result: data.logs?.length ? data.logs[data.logs.length - 1]?.result : null,
        logs: data.logs,
        queue_position: data.queue_position,
      },
    }
  } catch (error) {
    console.error('Fal.AI status check error:', error)
    return {
      success: false,
      error: error.message || 'Failed to poll fal.ai status',
    }
  }
}

export interface ModelInfo {
  id: string
  name: string
  category: string
  description: string
  capabilities: string[]
  inputSchema: Record<string, any>
  outputSchema: Record<string, any>
  pricing?: {
    costPer1k?: number
    currency?: string
  }
}

// Comprehensive Fal.AI Model Registry organized by category
export const FAL_MODELS_BY_CATEGORY = {
  'image-generation': [
    {
      id: 'fal-ai/flux/schnell',
      name: 'FLUX.1 [schnell] Text to Image',
      description: 'Fast 12B parameter flow transformer for rapid text-to-image generation.',
      inputs: { prompt: 'string*', image_size: 'ImageSize|string', num_inference_steps: 'integer', guidance_scale: 'number' },
      outputs: { images: 'list<Image>' },
    },
    {
      id: 'fal-ai/flux/dev',
      name: 'FLUX.1 [dev] Text to Image',
      description: '12B parameter flow transformer for high-quality text-to-image generation.',
      inputs: { prompt: 'string*', image_size: 'ImageSize|string' },
      outputs: { images: 'list<Image>' },
    },
    {
      id: 'fal-ai/flux-pro/v1.1-ultra',
      name: 'FLUX1.1 [pro] ultra',
      description: 'Professional-grade image quality up to 2K resolution.',
      inputs: { prompt: 'string*', aspect_ratio: 'string' },
      outputs: { images: 'list<Image>' },
    },
    {
      id: 'fal-ai/hidream-i1-dev',
      name: 'Hidream I1 Dev Text to Image',
      description: '17B parameter model for state-of-the-art image generation.',
      inputs: { prompt: 'string*', image_size: 'ImageSize|string' },
      outputs: { images: 'list<Image>' },
    },
    {
      id: 'fal-ai/hidream-i1-fast',
      name: 'Hidream I1 Fast Text to Image',
      description: '17B parameter model for fast, high-quality image generation.',
      inputs: { prompt: 'string*', image_size: 'ImageSize|string' },
      outputs: { images: 'list<Image>' },
    },
    {
      id: 'fal-ai/ideogram/v3',
      name: 'Ideogram V3 Text to Image',
      description: 'Generate high-quality images, posters, and logos with great typography.',
      inputs: { prompt: 'string*' },
      outputs: { images: 'list<File>', seed: 'integer' },
    },
    {
      id: 'fal-ai/minimax/image-01',
      name: 'MiniMax (Hailuo AI) Text to Image',
      description: 'Generate high quality images from text prompts.',
      inputs: { prompt: 'string*' },
      outputs: { images: 'list<File>' },
    },
  ],
  'video-generation': [
    {
      id: 'fal-ai/magi',
      name: 'MAGI-1 (Text to Video)',
      description: 'Video generation model with exceptional understanding of physical interactions.',
      inputs: { prompt: 'string*' },
      outputs: { video: 'File' },
    },
    {
      id: 'fal-ai/magi/image-to-video',
      name: 'MAGI-1 (Image to Video)',
      description: 'Generates videos from images with exceptional understanding of physical interactions.',
      inputs: { prompt: 'string*', image_url: 'string*' },
      outputs: { video: 'File' },
    },
    {
      id: 'fal-ai/kling-video/v2/master/text-to-video',
      name: 'Kling 2.0 Master Text to Video',
      description: 'Generate video clips from prompts using Kling 2.0 Master.',
      inputs: { prompt: 'string*' },
      outputs: { video: 'File' },
    },
    {
      id: 'fal-ai/kling-video/v2/master/image-to-video',
      name: 'Kling 2.0 Master Image to Video',
      description: 'Generate video clips from images using Kling 2.0 Master.',
      inputs: { prompt: 'string*', image_url: 'string*' },
      outputs: { video: 'File' },
    },
    {
      id: 'fal-ai/ltx-video-v097',
      name: 'LTX Video-0.9.7 (Text to Video)',
      description: 'Generate videos from prompts using LTX Video-0.9.7.',
      inputs: { prompt: 'string*' },
      outputs: { video: 'File' },
    },
    {
      id: 'fal-ai/ltx-video-v097/image-to-video',
      name: 'LTX Video-0.9.7 (Image to Video)',
      description: 'Generate videos from prompts and images using LTX Video-0.9.7.',
      inputs: { prompt: 'string*', image_url: 'string*' },
      outputs: { video: 'File' },
    },
    {
      id: 'fal-ai/ltx-video-13b-distilled/image-to-video',
      name: 'LTX Video 13B Distilled (Image to Video)',
      description: 'High-quality image-to-video generation with advanced motion understanding and 13B parameters.',
      inputs: { 
        image_url: 'string*',
        prompt: 'string*',
        negative_prompt: 'string',
        resolution: 'string',
        aspect_ratio: 'string',
        num_frames: 'integer',
        first_pass_num_inference_steps: 'integer',
        second_pass_num_inference_steps: 'integer',
        frame_rate: 'integer',
        enable_safety_checker: 'boolean'
      },
      outputs: { video: 'File' },
    },
    {
      id: 'fal-ai/framepack',
      name: 'Framepack Image to Video',
      description: 'Efficient Image-to-video model that autoregressively generates videos.',
      inputs: { prompt: 'string*', image_url: 'string*' },
      outputs: { video: 'File', seed: 'integer' },
    },
    {
      id: 'fal-ai/wan-i2v',
      name: 'Wan-2.1 Image-to-Video',
      description: 'Generates high-quality videos from images.',
      inputs: { prompt: 'string*', image_url: 'string*' },
      outputs: { video: 'File' },
    },
    {
      id: 'fal-ai/veo2/image-to-video',
      name: 'Veo 2 (Image to Video)',
      description: 'Creates videos from images with realistic motion and high quality.',
      inputs: { prompt: 'string*', image_url: 'string*' },
      outputs: { video: 'File' },
    },
  ],
  'audio-generation': [
    {
      id: 'cassetteai/music-generator',
      name: 'Music Generator',
      description: 'Generates a 30-second sample in under 2 seconds and a full 3-minute track in under 10 seconds.',
      inputs: { prompt: 'string*', duration: 'integer*' },
      outputs: { audio_file: 'File' },
    },
    {
      id: 'cassetteai/sound-effects-generator',
      name: 'Sound Effects Generator',
      description: 'Generates high-quality SFX up to 30 seconds long in 1 second.',
      inputs: { prompt: 'string*', duration: 'integer*' },
      outputs: { audio_file: 'File' },
    },
    {
      id: 'fal-ai/ace-step/prompt-to-audio',
      name: 'ACE-Step Text to Audio',
      description: 'Generate music from a simple prompt using ACE-Step.',
      inputs: { prompt: 'string*', instrumental: 'boolean', duration: 'float' },
      outputs: { audio: 'File', seed: 'integer', tags: 'string', lyrics: 'string' },
    },
    {
      id: 'fal-ai/minimax/speech-02-hd',
      name: 'MiniMax Speech-02 HD',
      description: 'Generate high-quality text-to-speech.',
      inputs: { text: 'string*' },
      outputs: { audio: 'File' },
    },
    {
      id: 'fal-ai/dia-tts',
      name: 'Dia Text to Speech',
      description: 'Generates realistic dialogue from transcripts.',
      inputs: { text: 'string*' },
      outputs: { audio: 'File' },
    },
  ],
  'image-editing': [
    {
      id: 'fal-ai/hidream-e1-full',
      name: 'Hidream E1 Full Image to Image',
      description: 'Edit images with natural language.',
      inputs: { image_url: 'string*', edit_instruction: 'string' },
      outputs: { images: 'list<Image>' },
    },
    {
      id: 'fal-ai/step1x-edit',
      name: 'Step1X Edit',
      description: 'Transforms photos with simple instructions into professional-quality edits.',
      inputs: { prompt: 'string*', image_url: 'string*' },
      outputs: { images: 'list<Image>' },
    },
    {
      id: 'fal-ai/finegrain-eraser',
      name: 'Finegrain Eraser (Prompt)',
      description: 'Removes objects using natural language.',
      inputs: { image_url: 'string*', prompt: 'string*' },
      outputs: { image: 'File' },
    },
    {
      id: 'fal-ai/ideogram/v3/edit',
      name: 'Ideogram V3 Edit',
      description: 'Transform images with Ideogram V3\'s editing capabilities.',
      inputs: { prompt: 'string*', image_url: 'string*', mask_url: 'string*' },
      outputs: { images: 'list<File>' },
    },
    {
      id: 'fal-ai/cartoonify',
      name: 'Cartoonify Image to Image',
      description: 'Transform images into 3D cartoon artwork.',
      inputs: { image_url: 'string*' },
      outputs: { images: 'list<Image>', prompt: 'string' },
    },
  ],
  'speech-processing': [
    {
      id: 'fal-ai/speech-to-text',
      name: 'Speech-to-Text',
      description: 'Accurate and efficient speech-to-text transcription.',
      inputs: { audio_url: 'string*' },
      outputs: { output: 'string' },
    },
    {
      id: 'fal-ai/speech-to-text/turbo',
      name: 'Speech-to-Text (Turbo)',
      description: 'Rapid processing for speech-to-text transcription.',
      inputs: { audio_url: 'string*' },
      outputs: { output: 'string' },
    },
    {
      id: 'fal-ai/dia-tts/voice-clone',
      name: 'Dia Tts Voice Cloning',
      description: 'Clone dialog voices from a sample audio and generate dialogs from text.',
      inputs: { text: 'string*', ref_audio_url: 'string*', ref_text: 'string*' },
      outputs: { audio: 'File' },
    },
    {
      id: 'fal-ai/minimax/voice-clone',
      name: 'MiniMax Voice Cloning',
      description: 'Clone a voice from a sample audio.',
      inputs: { audio_url: 'string*' },
      outputs: { custom_voice_id: 'string' },
    },
  ],
  'vision-language': [
    {
      id: 'fal-ai/moondream2',
      name: 'Moondream2 (Caption)',
      description: 'Efficient vision language model for image understanding.',
      inputs: { image_url: 'string*' },
      outputs: { output: 'string' },
    },
    {
      id: 'fal-ai/moondream2/visual-query',
      name: 'Moondream2 (Visual Query)',
      description: 'Efficient vision language model for visual question answering.',
      inputs: { image_url: 'string*', query: 'string*' },
      outputs: { output: 'string' },
    },
    {
      id: 'fal-ai/moondream2/object-detection',
      name: 'Moondream2 (Object Detection)',
      description: 'Efficient vision language model for object detection.',
      inputs: { image_url: 'string*', object: 'string*' },
      outputs: { objects: 'list<object>', image: 'Image' },
    },
  ],
  '3d-generation': [
    {
      id: 'fal-ai/trellis/multi',
      name: 'Trellis (Multi-Image)',
      description: 'Generate 3D models from multiple images.',
      inputs: { image_urls: 'list<string>*' },
      outputs: { model_mesh: 'File' },
    },
  ],
  'enhancement': [
    {
      id: 'fal-ai/recraft/upscale/creative',
      name: 'Recraft Creative Upscale',
      description: 'Enhances raster images, increasing resolution and sharpness.',
      inputs: { image_url: 'string*' },
      outputs: { image: 'File' },
    },
    {
      id: 'fal-ai/recraft/upscale/crisp',
      name: 'Recraft Crisp Upscale',
      description: 'Enhances raster images, boosting resolution with a focus on details and faces.',
      inputs: { image_url: 'string*' },
      outputs: { image: 'File' },
    },
  ],
};

// Flatten all models for easy access (excluding 3D generation from general list)
export const ALL_FAL_MODELS = Object.entries(FAL_MODELS_BY_CATEGORY)
  .filter(([category]) => category !== '3d-generation')
  .flatMap(([_, models]) => models);

// Legacy COMMON_MODELS for backward compatibility
export const COMMON_MODELS: ModelInfo[] = [
  {
    id: 'fal-ai/flux/dev',
    name: 'FLUX.1 [dev]',
    category: 'image-generation',
    description: 'High-quality text-to-image generation',
    capabilities: ['text-to-image', 'high-quality'],
    inputSchema: {
      prompt: { type: 'string', required: true },
      image_size: { type: 'string', default: '1024x1024' },
      num_inference_steps: { type: 'number', default: 28 },
      guidance_scale: { type: 'number', default: 3.5 },
      num_images: { type: 'number', default: 1 },
      seed: { type: 'number', optional: true },
      enable_safety_checker: { type: 'boolean', default: true },
    },
    outputSchema: {
      images: { type: 'array', items: { url: 'string', width: 'number', height: 'number' } },
    },
  },
  {
    id: 'fal-ai/magi',
    name: 'MAGI-1 (Text to Video)',
    category: 'video-generation',
    description: 'Video generation model with exceptional understanding of physical interactions',
    capabilities: ['text-to-video', 'physics-aware'],
    inputSchema: {
      prompt: { type: 'string', required: true },
      aspect_ratio: { type: 'string', default: '16:9' },
      loop: { type: 'boolean', default: false },
    },
    outputSchema: {
      video: { type: 'object', properties: { url: 'string' } },
    },
  },
  {
    id: 'cassetteai/music-generator',
    name: 'Music Generator',
    category: 'audio-generation',
    description: 'Fast music generation from text prompts',
    capabilities: ['text-to-audio', 'music'],
    inputSchema: {
      prompt: { type: 'string', required: true },
      duration: { type: 'number', default: 30 },
    },
    outputSchema: {
      audio_file: { type: 'object', properties: { url: 'string' } },
    },
  },
];

// Helper function to get models by category
export function getModelsByCategory(category: string) {
  return FAL_MODELS_BY_CATEGORY[category] || [];
}

// Helper function to find a model by ID
export function getModelById(id: string) {
  return ALL_FAL_MODELS.find(model => model.id === id);
}

// Fal.ai Model Constants for easy reference
export const FAL_MODELS = {
  // Image Generation
  FLUX_PRO: "fal-ai/flux-pro/v1.1-ultra",
  FLUX_DEV: "fal-ai/flux/dev",
  FLUX_SCHNELL: "fal-ai/flux/schnell",
  STABLE_DIFFUSION_XL: "fal-ai/stable-diffusion-xl",
  HIDREAM_I1_DEV: "fal-ai/hidream-i1-dev",
  HIDREAM_I1_FAST: "fal-ai/hidream-i1-fast",
  IDEOGRAM_V3: "fal-ai/ideogram/v3",
  MINIMAX_IMAGE: "fal-ai/minimax/image-01",
  
  // Video Generation  
  MAGI_TEXT_TO_VIDEO: "fal-ai/magi",
  MAGI_IMAGE_TO_VIDEO: "fal-ai/magi/image-to-video",
  KLING_V2_TEXT_TO_VIDEO: "fal-ai/kling-video/v2/master/text-to-video",
  KLING_V2_IMAGE_TO_VIDEO: "fal-ai/kling-video/v2/master/image-to-video",
  LTX_VIDEO_TEXT: "fal-ai/ltx-video-v097",
  LTX_VIDEO_IMAGE: "fal-ai/ltx-video-v097/image-to-video",
  LTX_VIDEO_13B_DISTILLED_IMAGE_TO_VIDEO: "fal-ai/ltx-video-13b-distilled/image-to-video",
  FRAMEPACK: "fal-ai/framepack",
  WAN_I2V: "fal-ai/wan-i2v",
  VEO2_IMAGE_TO_VIDEO: "fal-ai/veo2/image-to-video",
  
  // Audio Generation
  MUSIC_GENERATOR: "cassetteai/music-generator",
  SOUND_EFFECTS: "cassetteai/sound-effects-generator",
  ACE_STEP_AUDIO: "fal-ai/ace-step/prompt-to-audio",
  MINIMAX_TTS: "fal-ai/minimax/speech-02-hd",
  DIA_TTS: "fal-ai/dia-tts",
  
  // Image Enhancement
  UPSCALE_CREATIVE: "fal-ai/recraft/upscale/creative",
  UPSCALE_CRISP: "fal-ai/recraft/upscale/crisp",
  
  // Image Editing
  HIDREAM_E1_EDIT: "fal-ai/hidream-e1-full",
  STEP1X_EDIT: "fal-ai/step1x-edit",
  FINEGRAIN_ERASER: "fal-ai/finegrain-eraser",
  CARTOONIFY: "fal-ai/cartoonify",
}

// Helper to handle Fal.ai queue with better error handling
export async function submitToFalQueue<T>(
  modelId: string,
  inputs: Record<string, any>,
  options: {
    pollInterval?: number;
    maxAttempts?: number;
    onProgress?: (status: any) => void;
  } = {}
): Promise<FalResponse<T>> {
  const { pollInterval = 2000, maxAttempts = 180, onProgress } = options;
  
  try {
    console.log(`[Fal Queue] Submitting to model: ${modelId}`);
    
    // Submit to queue
    const submitResponse = await executeFalModel(modelId, inputs, 'queue');
    
    if (!submitResponse.success) {
      throw new Error(submitResponse.error || 'Failed to submit to Fal queue');
    }
    
    const requestId = submitResponse.requestId;
    if (!requestId) {
      // If no request ID, it was processed synchronously
      return submitResponse;
    }
    
    console.log(`[Fal Queue] Request ID: ${requestId}, polling for result...`);
    
    // Poll for result
    let attempts = 0;
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      const statusResponse = await pollFalStatus(requestId);
      
      if (!statusResponse.success) {
        throw new Error(statusResponse.error || 'Failed to check status');
      }
      
      const { status, result } = statusResponse.data;
      
      if (onProgress) {
        onProgress({ status, attempts, requestId });
      }
      
      console.log(`[Fal Queue] Status: ${status} (attempt ${attempts + 1}/${maxAttempts})`);
      
      if (status === 'COMPLETED') {
        if (result) {
          return {
            success: true,
            data: result,
            requestId,
          };
        } else {
          throw new Error('Job completed but no result returned');
        }
      } else if (status === 'FAILED') {
        throw new Error('Fal.ai job failed');
      }
      
      attempts++;
    }
    
    throw new Error(`Polling timeout after ${maxAttempts} attempts`);
    
  } catch (error) {
    console.error('[Fal Queue] Error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error in Fal queue processing',
    };
  }
}