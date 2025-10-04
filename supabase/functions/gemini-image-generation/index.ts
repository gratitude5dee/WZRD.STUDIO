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

    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    if (!GOOGLE_API_KEY) {
      return errorResponse('GOOGLE_API_KEY is not configured', 500);
    }

    console.log('Generating image with Gemini REST API (gemini-2.5-flash-image)');

    // Build the request body for Gemini REST API
    const parts: any[] = [{ text: prompt }];
    
    if (editMode && imageUrl) {
      // For edit mode, include the image in the request
      const base64Data = imageUrl.replace(/^data:image\/[a-z]+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: "image/png",
          data: base64Data
        }
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: parts
          }]
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return errorResponse(`Gemini API error: ${response.status}`, 500);
    }

    const data = await response.json();

    // Extract the generated image from the response
    let imageBase64: string | null = null;
    
    const parts_response = data.candidates?.[0]?.content?.parts || [];
    for (const part of parts_response) {
      if (part.inlineData) {
        imageBase64 = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageBase64) {
      console.error("No image in response:", JSON.stringify(data));
      return errorResponse("No image generated", 500);
    }

    console.log(`Successfully generated image (${imageBase64.length} bytes)`);

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
