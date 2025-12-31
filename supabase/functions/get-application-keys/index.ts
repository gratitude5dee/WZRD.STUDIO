
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

    // Instead of fetching from user profiles, get from environment variables
    const lumaApiKey = Deno.env.get('LUMA_API_KEY');
    const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');

    if (!lumaApiKey && !claudeApiKey) {
      console.error('API keys not configured in environment variables');
      return errorResponse('API keys not configured', 500);
    }

    // Return the API keys
    return successResponse({
      luma_api_key: lumaApiKey || null,
      claude_api_key: claudeApiKey || null
    });
  } catch (error) {
    console.error('Error in get-application-keys function:', error);
    
    // Handle authentication errors specifically
    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }
    
    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : 'Failed to get application keys';
    return errorResponse(errorMessage, 500);
  }
});
