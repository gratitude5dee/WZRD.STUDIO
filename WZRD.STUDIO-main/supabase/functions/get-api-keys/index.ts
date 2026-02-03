
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

    // Fetch user's API keys from profiles table
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('luma_api_key, claude_api_key')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return errorResponse('Failed to retrieve API keys', 500, profileError.message);
    }

    // Return the API keys
    return successResponse({
      luma_api_key: profileData.luma_api_key || null,
      claude_api_key: profileData.claude_api_key || null
    });
  } catch (error) {
    console.error('Error in get-api-keys function:', error);
    
    // Handle authentication errors specifically
    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }
    
    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : 'Failed to get API keys';
    return errorResponse(errorMessage, 500);
  }
});
