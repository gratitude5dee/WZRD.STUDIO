
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest, AuthError } from '../_shared/auth.ts';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    // Authenticate the request
    await authenticateRequest(req.headers);

    // Log the received request
    console.log('Received headers:', Object.fromEntries(req.headers.entries()));

    // Retrieve FAL_KEY from the environment
    const falKey = Deno.env.get('FAL_KEY');
    if (!falKey) {
      console.error('FAL_KEY environment variable is not set');
      return errorResponse('Server configuration error: FAL_KEY not set', 500);
    }

    // Parse and validate the request body
    let endpoint, input, mode;
    try {
      const body = await req.json();
      endpoint = body.endpoint;
      input = body.input;
      mode = body.mode || 'queue'; // Default to queue mode if not specified
      
      if (!endpoint) return errorResponse('endpoint is required', 400);
      if (!input) return errorResponse('input is required', 400);
      
      console.log('Request body:', { endpoint, input, mode });
    } catch (e) {
      console.error('Failed to parse request:', e);
      return errorResponse('Invalid request body', 400);
    }

    // Submit request to fal.ai
    console.log(`Sending request to fal.ai endpoint: ${endpoint}`);
    const response = await fetch(`https://fal.run/v1/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...input,
        mode,
      }),
    });

    const responseText = await response.text();
    console.log('Fal.ai response:', responseText);

    if (!response.ok) {
      let errorMessage;
      try {
        const error = JSON.parse(responseText);
        errorMessage = error.message || error.error || `Failed to submit request to fal.ai (${response.status})`;
      } catch {
        errorMessage = `Failed to submit request to fal.ai (${response.status}): ${responseText}`;
      }
      return errorResponse(errorMessage, 500);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse fal.ai response:', e);
      return errorResponse('Invalid response from fal.ai', 500);
    }
    
    console.log('Sending response:', {
      requestId: data.request_id,
      status: data.status,
      result: data.result
    });

    return successResponse({
      requestId: data.request_id,
      status: data.status,
      result: data.result,
    });
  } catch (error) {
    console.error('Edge function error:', error);
    
    // Handle authentication errors specifically
    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }
    
    // Handle other errors
    const message = error instanceof Error ? error.message : 'Failed to process fal.ai request';
    return errorResponse(message, 500);
  }
});
