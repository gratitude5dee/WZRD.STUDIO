
import { authenticateRequest, AuthError } from '../_shared/auth.ts';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    // Authenticate the request
    await authenticateRequest(req.headers);

    const url = new URL(req.url).searchParams.get('url');
    
    if (!url) {
      return errorResponse('URL parameter is required', 400);
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return errorResponse('Invalid URL provided', 400);
    }

    // Fetch the file
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    // Stream the response
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="download"`,
      },
    });

  } catch (error) {
    console.error('Download error:', error);
    
    // Handle authentication errors specifically
    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }
    
    // Handle other errors
    const message = error instanceof Error ? error.message : 'Failed to download file';
    return errorResponse(message, 500);
  }
});
