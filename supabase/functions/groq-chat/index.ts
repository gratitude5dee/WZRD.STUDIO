
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest } from '../_shared/auth.ts';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    // Check if request is coming from another Edge Function
    const isInternalRequest = req.headers.get('x-internal-request') === 'true';
    
    // Only authenticate external requests (not from other Edge Functions)
    if (!isInternalRequest) {
      try {
        await authenticateRequest(req.headers);
      } catch (authError) {
        console.error('Authentication error:', authError.message);
        return errorResponse(authError.message, 401);
      }
    }

    // Get the GROQ API key from environment
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      return errorResponse('GROQ_API_KEY is not configured', 500);
    }

    // Parse the request body
    const { prompt, model, temperature = 0.7, maxTokens = 1024, systemPrompt, responseFormat } = await req.json();

    if (!prompt) {
      return errorResponse('prompt is required', 400);
    }

    if (!model) {
      return errorResponse('model is required', 400);
    }

    console.log('Making request to Groq API with model:', model);
    
    // Prepare messages array
    const messages = [
      { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
      { role: 'user', content: prompt }
    ];

    // Prepare request body - only add response_format if explicitly requested
    const requestBody: any = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    // Only add JSON response format if specifically requested
    if (responseFormat === 'json') {
      requestBody.response_format = { type: "json_object" };
    }

    // Make request to Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Groq API error:', error);
      return errorResponse(error.error?.message || 'Failed to generate text', response.status);
    }

    const data = await response.json();
    return successResponse({
      text: data.choices[0].message.content,
      usage: data.usage
    });

  } catch (error) {
    console.error('Error in groq-chat function:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
});
