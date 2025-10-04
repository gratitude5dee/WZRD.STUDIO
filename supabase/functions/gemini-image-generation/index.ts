import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, errorResponse, handleCors } from '../_shared/response.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    const { prompt, imageUrl, editMode = false } = await req.json();

    if (!prompt) {
      return errorResponse('Prompt is required', 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return errorResponse('LOVABLE_API_KEY is not configured', 500);
    }

    console.log('Generating image with Nano banana model');

    const content: any[] = [{ type: "text", text: prompt }];
    
    if (editMode && imageUrl) {
      content.push({
        type: "image_url",
        image_url: { url: imageUrl }
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [{ role: "user", content }],
        modalities: ["image", "text"]
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

    const data = await response.json();
    const imageBase64 = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageBase64) {
      return errorResponse("No image generated", 500);
    }

    return new Response(JSON.stringify({ 
      imageUrl: imageBase64,
      prompt 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return errorResponse(error instanceof Error ? error.message : "Unknown error", 500);
  }
});
