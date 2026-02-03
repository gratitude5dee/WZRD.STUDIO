
import * as fal from '@fal-ai/serverless-client';
import { supabase } from '@/integrations/supabase/client';

export interface ApiInfo {
  id: string;
  name: string;
  description: string;
  modelId: string;
  input: Record<string, unknown>;
}

// Define available AI endpoints
export const AI_ENDPOINTS: ApiInfo[] = [
  {
    id: 'image-generate',
    name: 'Image Generation',
    description: 'Generate images from text descriptions',
    modelId: 'fal-ai/fast-sdxl',
    input: {
      prompt: '',
      negative_prompt: '',
      num_inference_steps: 50,
      scheduler: 'dpmpp_2m',
      guidance_scale: 7.5,
    },
  },
  {
    id: 'video-generate',
    name: 'Video Generation',
    description: 'Generate videos from images or text',
    modelId: 'fal-ai/fast-svd',
    input: {
      prompt: '',
      motion_bucket_id: 127,
      fps: 24,
      num_frames: 24,
    },
  }
];

interface FalRequestOptions {
  modelId: string;
  input: Record<string, unknown>;
}

export async function falRequest({ modelId, input }: FalRequestOptions) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    // Proxy the request through Supabase Edge Function
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fal`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          modelId,
          input,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to make fal.ai request');
    }

    return await response.json();
  } catch (error) {
    console.error('Fal.ai request failed:', error);
    throw error;
  }
}

// Helper function to check if an endpoint exists
export function getEndpoint(id: string): ApiInfo | undefined {
  return AI_ENDPOINTS.find(endpoint => endpoint.id === id);
}

// Example usage:
// const result = await falRequest({
//   modelId: 'fal-ai/fast-sdxl',
//   input: {
//     prompt: 'A beautiful sunset over mountains',
//     negative_prompt: 'blur, darkness, fog',
//     num_inference_steps: 50,
//   },
// });
