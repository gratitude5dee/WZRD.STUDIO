
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
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

    // Parse the request body
    const { name } = await req.json();

    if (!name) {
      return errorResponse('Secret name is required', 400);
    }

    // Get the secret value from Deno.env
    const secretValue = Deno.env.get(name);

    if (!secretValue) {
      return errorResponse('Secret not found', 404);
    }

    // Return the secret value
    return successResponse({ value: secretValue });
  } catch (error) {
    console.error('Error in get-secret function:', error);
    
    // Handle authentication errors specifically
    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }
    
    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : 'Failed to get secret';
    return errorResponse(errorMessage, 500);
  }
});
