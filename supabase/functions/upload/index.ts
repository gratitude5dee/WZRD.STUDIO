
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse the multipart form data
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return errorResponse('No file uploaded', 400);
    }

    // Sanitize the filename to prevent issues with special characters
    const fileExt = file.name.split('.').pop();
    const sanitizedFileName = file.name
      .toLowerCase()
      .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
      .replace(/[^a-z0-9.-]/g, '-'); // Replace invalid characters with hyphens

    // Generate a unique filename
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '');
    const uniqueFileName = `${timestamp}-${sanitizedFileName}`;

    // Upload the file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('workflow-media')
      .upload(uniqueFileName, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return errorResponse('Failed to upload file', 500, uploadError.message);
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('workflow-media')
      .getPublicUrl(uniqueFileName);

    return successResponse({ 
      url: publicUrl,
      fileName: uniqueFileName,
      contentType: file.type,
      size: file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Handle authentication errors specifically
    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }
    
    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
    return errorResponse(errorMessage, 500);
  }
});
