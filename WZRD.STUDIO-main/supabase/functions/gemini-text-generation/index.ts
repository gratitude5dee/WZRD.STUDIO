import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, errorResponse, handleCors } from '../_shared/response.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    const { prompt, model = 'llama-3.3-70b-versatile', systemPrompt, stream = false } = await req.json();

    if (!prompt) {
      return errorResponse('Prompt is required', 400);
    }

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      return errorResponse('GROQ_API_KEY is not configured', 500);
    }

    // Map old model names to Groq models
    let groqModel = model;
    if (model.startsWith('google/') || model.startsWith('openai/')) {
      // Default to llama-3.3-70b-versatile for any external model request
      groqModel = 'llama-3.3-70b-versatile';
    }

    console.log('Generating text with Groq model:', groqModel);

    const messages: any[] = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: groqModel,
        messages,
        stream,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return errorResponse("Rate limits exceeded, please try again later.", 429);
      }
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      return errorResponse("Groq API error", 500);
    }

    if (stream) {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return errorResponse(error instanceof Error ? error.message : "Unknown error", 500);
  }
});
