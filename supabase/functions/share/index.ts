
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { nanoid } from 'https://esm.sh/nanoid@5.0.4';
import { authenticateRequest, AuthError } from '../_shared/auth.ts';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';

interface ShareWorkflowBody {
  workflowId: string;
  title: string;
  description?: string;
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

    // Create Supabase client with service role key
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
    const { workflowId, title, description }: ShareWorkflowBody = await req.json();
    
    if (!workflowId || !title) {
      return errorResponse('Missing required fields', 400);
    }

    // Generate a unique share ID
    const shareId = nanoid(10);

    // Insert the shared workflow record
    const { data, error } = await supabaseClient
      .from('shared_workflows')
      .insert({
        workflow_id: workflowId,
        title,
        description,
        created_by: user.id,
        share_id: shareId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating shared workflow:', error);
      return errorResponse('Failed to create shared workflow', 500, error.message);
    }

    // Return the share ID
    return successResponse({ shareId });
  } catch (error) {
    console.error('Share workflow error:', error);
    
    // Handle authentication errors specifically
    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }
    
    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : 'Failed to share workflow';
    return errorResponse(errorMessage, 500);
  }
});
