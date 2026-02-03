
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

    // Retrieve FAL_KEY from the environment
    const falKey = Deno.env.get('FAL_KEY');
    if (!falKey) {
      console.error('FAL_KEY environment variable is not set');
      return errorResponse('Server configuration error: FAL_KEY not set', 500);
    }

    // Parse the request body
    const { requestId } = await req.json();
    if (!requestId) {
      return errorResponse('requestId is required', 400);
    }

    console.log('Checking status for request:', requestId);

    // Check status from fal.ai
    const response = await fetch(`https://fal.run/v1/queue/status/${requestId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${falKey}`,
      },
    });

    const responseText = await response.text();
    console.log('Fal.ai status response:', responseText);

    if (!response.ok) {
      let errorMessage;
      try {
        const error = JSON.parse(responseText);
        errorMessage = error.message || error.error || 'Failed to check status from fal.ai';
      } catch {
        errorMessage = 'Failed to check status from fal.ai: ' + responseText;
      }
      return errorResponse(errorMessage, 500);
    }

    const data = JSON.parse(responseText);
    
    return successResponse({
      status: data.status,
      result: data.logs?.length ? data.logs[data.logs.length - 1]?.result : null,
    });
  } catch (error) {
    console.error('Edge function error:', error);
    
    // Handle authentication errors specifically
    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }
    
    // Handle other errors
    const message = error instanceof Error ? error.message : 'Failed to poll fal.ai status';
    return errorResponse(message, 500);
  }
});
