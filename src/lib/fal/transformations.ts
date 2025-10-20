import * as fal from '@fal-ai/serverless-client';

// Configure fal.ai client
export const configureFal = () => {
  const falKey = import.meta.env.VITE_FAL_KEY;
  if (falKey) {
    fal.config({
      credentials: falKey,
    });
  }
};

// Initialize on module load
configureFal();

export type TransformationType =
  | 'upscale'
  | 'remove-bg'
  | 'style-transfer'
  | 'inpaint'
  | 'img2img';

interface TransformationParams {
  imageUrl: string;
  prompt?: string;
  strength?: number;
  [key: string]: any;
}

interface TransformationResult {
  imageUrl: string;
  metadata?: Record<string, any>;
}

const MODEL_MAP: Record<TransformationType, string> = {
  'upscale': 'fal-ai/clarity-upscaler',
  'remove-bg': 'fal-ai/imageutils/rembg',
  'style-transfer': 'fal-ai/fast-sdxl',
  'inpaint': 'fal-ai/stable-diffusion-inpainting',
  'img2img': 'fal-ai/fast-sdxl',
};

export async function applyAITransformation(
  transformation: TransformationType,
  params: TransformationParams,
  onProgress?: (update: any) => void
): Promise<TransformationResult> {
  try {
    const modelId = MODEL_MAP[transformation];

    const input = prepareInput(transformation, params);

    const result = await fal.subscribe(modelId, {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        console.log('Queue update:', update);
        onProgress?.(update);
      },
    });

    return {
      imageUrl: extractImageUrl(result),
      metadata: result,
    };
  } catch (error) {
    console.error('AI transformation error:', error);
    throw new Error(`Failed to apply ${transformation}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Prepare input based on transformation type
function prepareInput(transformation: TransformationType, params: TransformationParams): Record<string, any> {
  const { imageUrl, prompt, strength, ...rest } = params;

  switch (transformation) {
    case 'upscale':
      return {
        image_url: imageUrl,
        scale: 2,
        ...rest,
      };

    case 'remove-bg':
      return {
        image_url: imageUrl,
        ...rest,
      };

    case 'style-transfer':
    case 'img2img':
      return {
        image_url: imageUrl,
        prompt: prompt || 'enhance image quality',
        strength: strength || 0.75,
        ...rest,
      };

    case 'inpaint':
      return {
        image_url: imageUrl,
        prompt: prompt || 'fill the masked area',
        ...rest,
      };

    default:
      return { image_url: imageUrl, ...rest };
  }
}

// Extract image URL from fal.ai result
function extractImageUrl(result: any): string {
  // Different models return results in different formats
  if (result.image) {
    if (typeof result.image === 'string') {
      return result.image;
    }
    if (result.image.url) {
      return result.image.url;
    }
  }

  if (result.images && Array.isArray(result.images) && result.images.length > 0) {
    const firstImage = result.images[0];
    if (typeof firstImage === 'string') {
      return firstImage;
    }
    if (firstImage.url) {
      return firstImage.url;
    }
  }

  if (result.output && typeof result.output === 'string') {
    return result.output;
  }

  if (result.url) {
    return result.url;
  }

  throw new Error('Could not extract image URL from result');
}

// Preset transformations
export const presets = {
  upscale: (imageUrl: string) =>
    applyAITransformation('upscale', { imageUrl }),

  removeBackground: (imageUrl: string) =>
    applyAITransformation('remove-bg', { imageUrl }),

  styleTransfer: (imageUrl: string, prompt: string, strength: number = 0.75) =>
    applyAITransformation('style-transfer', { imageUrl, prompt, strength }),

  enhance: (imageUrl: string) =>
    applyAITransformation('img2img', {
      imageUrl,
      prompt: 'enhance image quality, professional lighting, high detail',
      strength: 0.5,
    }),
};
