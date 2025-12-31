
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
    const user = await authenticateRequest(req.headers);
    
    // Create Supabase client
    const supabaseClient = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse the request body
    const { luma_api_key, claude_api_key } = await req.json();
    
    // Update user's API keys in profiles table
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        luma_api_key: luma_api_key || null,
        claude_api_key: claude_api_key || null
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating API keys:', updateError);
      return errorResponse('Failed to store API keys', 500, updateError.message);
    }

    // Return success response
    return successResponse({ success: true });
  } catch (error) {
    console.error('Error in store-api-keys function:', error);
    
    // Handle authentication errors specifically
    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }
    
    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : 'Failed to store API keys';
    return errorResponse(errorMessage, 500);
  }
});
