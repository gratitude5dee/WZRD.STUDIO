import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { errorResponse, handleCors, successResponse } from '../_shared/response.ts';
import { nanoid } from 'https://esm.sh/nanoid@4';

interface ShareRequest {
  projectId: string;
  // Accept both formats for compatibility
  permissionLevel?: 'view' | 'comment' | 'edit';
  permission?: 'view' | 'comment' | 'edit';
  isPublic: boolean;
  sharedWithEmail?: string;
  inviteEmail?: string;
  expiresInDays?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return errorResponse('Missing authorization header', 401);
    }

    // Use anon key + auth header to respect RLS with user context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError?.message);
      return errorResponse('Invalid authentication token', 401);
    }

    const body: ShareRequest = await req.json();
    console.log('Share request:', { projectId: body.projectId, userId: user.id });

    // Normalize field names (frontend sends 'permission', backend expects 'permissionLevel')
    const permissionLevel = body.permissionLevel ?? body.permission ?? 'view';
    const sharedWithEmail = body.sharedWithEmail ?? body.inviteEmail;

    // Verify project exists and user owns it (RLS will filter to user's projects)
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('id, user_id')
      .eq('id', body.projectId)
      .single();

    if (projectError) {
      console.error('Project query error:', projectError);
      return errorResponse('Failed to verify project access', 500);
    }

    if (!project) {
      console.error('Project not found for user:', user.id);
      return errorResponse('Project not found or access denied', 404);
    }

    if (project.user_id !== user.id) {
      console.error('User does not own project:', { projectUserId: project.user_id, userId: user.id });
      return errorResponse('Not authorized to share this project', 403);
    }

    const shareToken = nanoid(32);

    const expiresAt = body.expiresInDays
      ? new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Look up user by email if provided (use service role for this)
    let sharedWithId: string | null = null;
    if (sharedWithEmail) {
      const serviceClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );
      
      const { data: targetUser } = await serviceClient
        .from('users')
        .select('id')
        .eq('email', sharedWithEmail)
        .single();
      sharedWithId = targetUser?.id ?? null;
    }

    // Insert share record
    const { data: share, error: shareError } = await supabaseClient
      .from('project_shares')
      .insert({
        project_id: body.projectId,
        shared_by: user.id,
        shared_with: sharedWithId,
        share_token: shareToken,
        permission_level: permissionLevel,
        is_public: body.isPublic,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (shareError) {
      console.error('Share insert error:', shareError);
      return errorResponse(shareError.message, 500);
    }

    // Broadcast share creation event
    try {
      await supabaseClient.channel(`project:${body.projectId}`).send({
        type: 'broadcast',
        event: 'share_created',
        payload: { share },
      });
    } catch (broadcastError) {
      console.warn('Broadcast failed (non-critical):', broadcastError);
    }

    const appUrl = Deno.env.get('PUBLIC_APP_URL') || 'https://ixkkrousepsiorwlaycp.lovableproject.com';
    const shareUrl = `${appUrl}/shared/${shareToken}`;

    // Return both shareUrl and shareLink for frontend compatibility
    return successResponse({ 
      share, 
      shareUrl,
      shareLink: shareUrl,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    console.error('Create share error:', message);
    return errorResponse(message, 500);
  }
});
