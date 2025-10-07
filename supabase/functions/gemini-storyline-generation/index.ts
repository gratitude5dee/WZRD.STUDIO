import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    const { 
      systemPrompt, 
      prompt, 
      model = 'google/gemini-2.5-flash',
      responseSchema,
      temperature = 0.7
    } = await req.json();

    if (!prompt) {
      return errorResponse('Prompt is required', 400);
    }

    if (!responseSchema) {
      return errorResponse('Response schema is required for structured output', 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return errorResponse('LOVABLE_API_KEY is not configured', 500);
    }

    console.log(`Generating structured storyline with model: ${model}`);

    const messages: any[] = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    // Call Lovable AI Gateway with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    let response;
    try {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "storyline_generation",
              strict: true,
              schema: responseSchema
            }
          }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('Request timeout (60s exceeded)');
        return errorResponse("Request timeout (60s exceeded)", 504);
      }
      throw fetchError;
    }

    if (!response.ok) {
      if (response.status === 429) {
        return errorResponse("Rate limits exceeded, please try again later.", 429);
      }
      if (response.status === 402) {
        return errorResponse("Payment required, please add funds to your Lovable AI workspace.", 402);
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return errorResponse("AI gateway error", 500, { details: errorText });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Enhanced validation before JSON parsing
    if (!content || content.trim() === '') {
      console.error('Empty content from AI Gateway:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        usage: data.usage,
        model
      });
      return errorResponse("Empty response from AI", 500, { 
        model, 
        usage: data.usage 
      });
    }

    // Parse the JSON response with better error details
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", {
        error: parseError.message,
        contentPreview: content.substring(0, 500),
        contentLength: content.length,
        model
      });
      return errorResponse("Invalid JSON response from AI", 500, { 
        contentPreview: content.substring(0, 200),
        error: parseError.message,
        model
      });
    }

    return successResponse({
      text: content,
      parsed: parsedContent,
      usage: data.usage
    });

  } catch (error) {
    console.error("Error in gemini-storyline-generation:", error);
    return errorResponse(error instanceof Error ? error.message : "Unknown error", 500);
  }
});
