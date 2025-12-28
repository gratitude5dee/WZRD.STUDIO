import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as fal from "https://esm.sh/@fal-ai/serverless-client@0.15.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, question } = await req.json();

    if (!imageUrl || !question) {
      return new Response(
        JSON.stringify({ error: 'Missing imageUrl or question parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const FAL_KEY = Deno.env.get('FAL_KEY');
    if (!FAL_KEY) {
      console.error('FAL_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Configure FAL.AI
    fal.config({ credentials: FAL_KEY });

    console.log('🔍 Analyzing image with FAL.AI Moondream:', { question: question.substring(0, 50) });

    // Use FAL.AI Moondream2 for image analysis
    const result = await fal.subscribe("fal-ai/moondream2", {
      input: {
        image_url: imageUrl,
        prompt: question,
      },
      logs: true,
    });

    const resultData = result as any;
    const aiResponse = resultData?.output || resultData?.response || resultData?.answer;

    if (!aiResponse) {
      console.error('No content in FAL.AI response:', result);
      return new Response(
        JSON.stringify({ error: 'No response from AI' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Image analysis complete');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in gemini-image-analysis function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
