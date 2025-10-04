import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, errorResponse, handleCors } from '../_shared/response.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    const { prompt, model = 'google/gemini-2.5-flash', systemPrompt, stream = false } = await req.json();

    if (!prompt) {
      return errorResponse('Prompt is required', 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return errorResponse('LOVABLE_API_KEY is not configured', 500);
    }

    console.log('Generating text with model:', model);

    const messages: any[] = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        stream,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return errorResponse("Rate limits exceeded, please try again later.", 429);
      }
      if (response.status === 402) {
        return errorResponse("Payment required, please add funds to your Lovable AI workspace.", 402);
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return errorResponse("AI gateway error", 500);
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
