import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenAI } from "npm:@google/genai@0.21.0";
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

    console.log('Generating image with native Google GenAI SDK (gemini-2.5-flash-image)');

    const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });

    // Build content based on edit mode
    let content: any = prompt;
    if (editMode && imageUrl) {
      // For edit mode, include the image in the request
      content = [
        { text: prompt },
        { 
          inlineData: {
            mimeType: "image/png",
            data: imageUrl.replace(/^data:image\/[a-z]+;base64,/, '')
          }
        }
      ];
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: content,
    });

    // Extract the generated image from the response
    let imageBase64: string | null = null;
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageBase64 = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageBase64) {
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
