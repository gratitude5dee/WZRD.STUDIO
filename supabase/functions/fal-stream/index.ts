import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { fal } from "https://esm.sh/@fal-ai/client@1.2.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { modelId, inputs } = await req.json();

    if (!modelId || !inputs) {
      return new Response(
        JSON.stringify({ error: 'modelId and inputs are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const FAL_KEY = Deno.env.get('FAL_KEY');
    if (!FAL_KEY) {
      return new Response(
        JSON.stringify({ error: 'FAL_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Configure fal client
    fal.config({ credentials: FAL_KEY });

    console.log(`🚀 Starting streaming generation for model: ${modelId}`);
    console.log('📝 Inputs:', JSON.stringify(inputs, null, 2));

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const falStream = await fal.stream(modelId, { input: inputs });
          
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
          console.error('❌ Streaming error:', error);
          // Return generic error to client, log details server-side only
          const errorData = `data: ${JSON.stringify({ type: 'error', error: 'Media generation failed. Please try again.' })}\n\n`;
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
    console.error('Error in fal-stream:', error);
    // Return generic error to client, log details server-side only
    return new Response(
      JSON.stringify({ error: 'An error occurred during media streaming' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
