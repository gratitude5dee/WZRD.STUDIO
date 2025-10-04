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

    console.log('Generating image with Lovable AI Gateway (gemini-2.5-flash-image-preview)');

    // Build message content for Lovable AI Gateway
    const content: any[] = [{ type: "text", text: prompt }];
    
    if (editMode && imageUrl) {
      // For edit mode, include the image
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
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      return errorResponse(`Lovable AI error: ${response.status}`, 500);
    }

    const data = await response.json();

    // Extract the generated image from the response
    const imageUrl_result = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl_result) {
      console.error("No image in response:", JSON.stringify(data));
      return errorResponse("No image generated", 500);
    }

    console.log(`Successfully generated image (${imageUrl_result.length} bytes)`);

    return new Response(JSON.stringify({ 
      imageUrl: imageUrl_result,
      prompt 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return errorResponse(error instanceof Error ? error.message : "Unknown error", 500);
  }
});
