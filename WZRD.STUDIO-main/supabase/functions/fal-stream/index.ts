import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { fal } from "https://esm.sh/@fal-ai/client@1.2.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map short-form model IDs to full Fal.ai format
const mapModelToFalId = (modelId: string): string => {
  const modelMap: Record<string, string> = {
    // Image models
    'flux-dev': 'fal-ai/flux/dev',
    'flux-schnell': 'fal-ai/flux/schnell',
    'flux-pro': 'fal-ai/flux-pro/v1.1',
    'fal-ai/flux-dev': 'fal-ai/flux/dev',
    'fal-ai/flux-pro/v1.1': 'fal-ai/flux-pro/v1.1',
    'ideogram': 'fal-ai/ideogram/v2',
    'recraft': 'fal-ai/recraft-v3',
    'fal-ai/recraft-v3': 'fal-ai/recraft-v3',
    'stable-diffusion': 'fal-ai/stable-diffusion-v35-large',
    
    // Video models
    'hailuo': 'fal-ai/minimax/video-01',
    'wan': 'fal-ai/wan/v2.1/text-to-video',
    'kling-pro-16': 'fal-ai/kling-video/v1.6/pro/text-to-video',
    'kling-pro-15': 'fal-ai/kling-video/v1.5/pro/text-to-video',
    'luma-ray': 'fal-ai/luma-dream-machine',
    'luma-ray-flash': 'fal-ai/luma-dream-machine',
    'luma-dream': 'fal-ai/luma-dream-machine',
    'pika': 'fal-ai/pika/v2',
    'lightricks': 'fal-ai/ltx-video/v0.9.1',
    'magi': 'fal-ai/magi',
    'fal-ai/magi': 'fal-ai/magi',
    'fal-ai/magi-1': 'fal-ai/magi-1',
    
    // Audio models
    'dia-tts': 'fal-ai/dia-tts',
    'minimax-speech': 'fal-ai/minimax/speech-02-hd',
  };
  
  // Return mapped ID or original if already in correct format
  return modelMap[modelId] || modelId;
};

// Model-specific input transformers
const MODEL_INPUT_TRANSFORMERS: Record<string, (inputs: any) => any> = {
  'fal-ai/flux/dev': (inputs) => ({
    prompt: inputs.prompt,
    image_size: inputs.image_size || 'landscape_16_9',
    num_inference_steps: inputs.num_inference_steps || 28,
    guidance_scale: inputs.guidance_scale || 3.5,
    num_images: inputs.num_images || 1,
    enable_safety_checker: true,
  }),
  'fal-ai/flux/schnell': (inputs) => ({
    prompt: inputs.prompt,
    image_size: inputs.image_size || 'landscape_16_9',
    num_inference_steps: inputs.num_inference_steps || 4,
    num_images: inputs.num_images || 1,
  }),
  'fal-ai/flux-pro/v1.1': (inputs) => ({
    prompt: inputs.prompt,
    image_size: inputs.image_size || 'landscape_16_9',
    num_images: inputs.num_images || 1,
    safety_tolerance: inputs.safety_tolerance || '2',
  }),
  'fal-ai/ideogram/v2': (inputs) => ({
    prompt: inputs.prompt,
    aspect_ratio: inputs.aspect_ratio || '16:9',
    style: inputs.style || 'auto',
  }),
  'fal-ai/recraft-v3': (inputs) => ({
    prompt: inputs.prompt,
    image_size: inputs.image_size || 'landscape_16_9',
    style: inputs.style || 'realistic_image',
  }),
  'fal-ai/magi-1': (inputs) => ({
    prompt: inputs.prompt,
    aspect_ratio: inputs.aspect_ratio || '16:9',
    duration: inputs.duration || '5s',
  }),
  'fal-ai/magi': (inputs) => ({
    prompt: inputs.prompt,
    aspect_ratio: inputs.aspect_ratio || '16:9',
    duration: inputs.duration || '5s',
  }),
  'fal-ai/magi/image-to-video': (inputs) => {
    if (!inputs.image_url) {
      throw new Error('image_url is required for fal-ai/magi/image-to-video');
    }

    return {
      prompt: inputs.prompt,
      image_url: inputs.image_url,
      aspect_ratio: inputs.aspect_ratio || '16:9',
      duration: inputs.duration || '5s',
    };
  },
  'fal-ai/luma-dream-machine': (inputs) => ({
    prompt: inputs.prompt,
    aspect_ratio: inputs.aspect_ratio || '16:9',
    loop: inputs.loop || false,
  }),
  'fal-ai/minimax/video-01': (inputs) => ({
    prompt: inputs.prompt,
    prompt_optimizer: inputs.prompt_optimizer !== false,
  }),
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { modelId, inputs } = await req.json();

    if (!modelId) {
      return new Response(
        JSON.stringify({ error: 'modelId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!inputs?.prompt && !inputs?.image_url) {
      return new Response(
        JSON.stringify({ error: 'prompt or image_url is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const FAL_KEY = Deno.env.get('FAL_KEY');
    if (!FAL_KEY) {
      console.error('FAL_KEY not configured in environment');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: API key missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Configure fal client
    fal.config({ credentials: FAL_KEY });

    // Map model ID to full Fal.ai format
    const mappedModelId = mapModelToFalId(modelId);
    
    // Transform inputs based on model
    const transformer = MODEL_INPUT_TRANSFORMERS[mappedModelId];
    const transformedInputs = transformer ? transformer(inputs) : inputs;

    console.log(`🚀 Generation request for: ${modelId} → ${mappedModelId}`);
    console.log('📝 Transformed inputs:', JSON.stringify(transformedInputs, null, 2));

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const falStream = await fal.stream(mappedModelId, { input: transformedInputs });
          
          let eventCount = 0;
          for await (const event of falStream) {
            eventCount++;
            console.log(`📡 Stream event ${eventCount}:`, JSON.stringify(event).slice(0, 200));
            
            // Send each event as SSE
            const sseData = `data: ${JSON.stringify({ type: 'progress', event })}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          }
          
          // Get final result
          const result = await falStream.done();
          console.log('✅ Stream completed, final result received');
          
          // Send final result
          const finalData = `data: ${JSON.stringify({ type: 'done', result })}\n\n`;
          controller.enqueue(encoder.encode(finalData));
          
          controller.close();
        } catch (error: any) {
          console.error('❌ Fal.ai error:', error);
          const errorMessage = error?.message || 'Generation failed';
          const errorData = `data: ${JSON.stringify({ 
            type: 'error', 
            error: errorMessage,
            details: error?.body || null 
          })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error: any) {
    console.error('Request processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Request failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
