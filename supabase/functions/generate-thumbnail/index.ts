
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { authenticateRequest, AuthError } from '../_shared/auth.ts';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';

interface ThumbnailRequestBody {
  videoUrl: string;
  mediaItemId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return errorResponse('Method not allowed', 405);
    }

    // Authenticate the request
    const user = await authenticateRequest(req.headers);

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Parse and validate the request body
    const { videoUrl, mediaItemId }: ThumbnailRequestBody = await req.json();
    
    if (!videoUrl || !mediaItemId) {
      return errorResponse('Missing required fields', 400);
    }

    // In a real implementation, we would generate a thumbnail from the video here
    // For now, we'll just return a mock thumbnail URL
    const thumbnailUrl = `${videoUrl.split('.')[0]}_thumbnail.jpg`;

    // Merge the thumbnail URL into clip metadata
    const { data: clipData, error: clipError } = await supabaseClient
      .from('video_clips')
      .select('metadata')
      .eq('id', mediaItemId)
      .maybeSingle();

    if (clipError) {
      console.error('Error fetching clip metadata:', clipError);
      return errorResponse('Failed to locate media clip', 404, clipError.message);
    }

    const metadata = {
      ...(clipData?.metadata as Record<string, unknown> | null ?? {}),
      thumbnailUrl,
    };

    const { error: updateError } = await supabaseClient
      .from('video_clips')
      .update({
        metadata
      })
      .eq('id', mediaItemId);

    if (updateError) {
      console.error('Error updating media clip:', updateError);
      return errorResponse('Failed to update media clip with thumbnail', 500, updateError.message);
    }

    // Return the thumbnail URL
    return successResponse({ thumbnailUrl });
  } catch (error) {
    console.error('Generate thumbnail error:', error);
    
    // Handle authentication errors specifically
    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }
    
    // Handle other errors
    return errorResponse(error.message || 'Failed to generate thumbnail', 500);
  }
});
