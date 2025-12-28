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
      model = 'llama-3.3-70b-versatile',
      responseSchema,
      temperature = 0.7
    } = await req.json();

    if (!prompt) {
      return errorResponse('Prompt is required', 400);
    }

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      return errorResponse('GROQ_API_KEY is not configured', 500);
    }

    console.log(`Generating structured storyline with Groq model: ${model}`);

    // Build the system message with schema instructions for JSON output
    let fullSystemPrompt = systemPrompt || '';
    if (responseSchema) {
      fullSystemPrompt += `\n\nIMPORTANT: You MUST respond with valid JSON that matches this exact schema:\n${JSON.stringify(responseSchema, null, 2)}\n\nDo not include any text before or after the JSON. Only output the JSON object.`;
    }

    const messages: any[] = [];
    if (fullSystemPrompt) {
      messages.push({ role: "system", content: fullSystemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    // Call Groq API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s timeout for long generations

    let response;
    try {
      response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: 8192,
          response_format: { type: "json_object" }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('Request timeout (120s exceeded)');
        return errorResponse("Request timeout (120s exceeded)", 504);
      }
      throw fetchError;
    }

    if (!response.ok) {
      if (response.status === 429) {
        return errorResponse("Rate limits exceeded, please try again later.", 429);
      }
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      return errorResponse("Groq API error", 500, { details: errorText });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Enhanced validation before JSON parsing
    if (!content || content.trim() === '') {
      console.error('Empty content from Groq API:', {
        status: response.status,
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
    } catch (parseError: unknown) {
      const parseMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      console.error("Failed to parse JSON response:", {
        error: parseMessage,
        contentPreview: content.substring(0, 500),
        contentLength: content.length,
        model
      });
      return errorResponse("Invalid JSON response from AI", 500, { 
        contentPreview: content.substring(0, 200),
        error: parseMessage,
        model
      });
    }

    return successResponse({
      text: content,
      parsed: parsedContent,
      usage: data.usage
    });

  } catch (error) {
    console.error("Error in storyline-generation:", error);
    return errorResponse(error instanceof Error ? error.message : "Unknown error", 500);
  }
});
