import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, errorResponse } from '../_shared/response.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return handleCors();

  try {
    const { prompt, systemPrompt, model = 'llama-3.3-70b-versatile', temperature = 0.7, maxTokens = 4096 } = await req.json();
    
    if (!prompt) {
      return errorResponse('Prompt is required', 400);
    }

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      return errorResponse('GROQ_API_KEY is not configured', 500);
    }

    console.log(`Groq streaming request - model: ${model}, prompt length: ${prompt.length}`);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
          { role: "user", content: prompt }
        ],
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Groq API error: ${response.status} - ${errorText}`);
      
      if (response.status === 429) {
        return errorResponse('Rate limited by Groq. Please wait and try again.', 429);
      }
      if (response.status === 402) {
        return errorResponse('Groq API payment required.', 402);
      }
      return errorResponse(`Groq API error: ${response.statusText}`, response.status);
    }

    // Pass through the SSE stream from Groq
    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      },
    });

  } catch (error) {
    console.error('Groq stream error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(errorMessage, 500);
  }
});
