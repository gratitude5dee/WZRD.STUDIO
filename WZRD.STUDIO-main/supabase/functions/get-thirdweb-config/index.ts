import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, successResponse, errorResponse, handleCors } from "../_shared/response.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    const clientId = Deno.env.get('THIRDWEB_CLIENT_ID');
    
    if (!clientId) {
      console.error('THIRDWEB_CLIENT_ID not configured in secrets');
      return errorResponse('Thirdweb not configured', 500);
    }

    console.log('Successfully retrieved Thirdweb Client ID');
    return successResponse({ clientId });
  } catch (error) {
    console.error('Error fetching Thirdweb config:', error);
    return errorResponse('Failed to fetch configuration', 500);
  }
});
