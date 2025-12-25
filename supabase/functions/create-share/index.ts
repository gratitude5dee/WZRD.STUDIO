import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { authenticateRequest } from '../_shared/auth.ts';
import { errorResponse, handleCors, successResponse } from '../_shared/response.ts';
import { nanoid } from 'https://esm.sh/nanoid@4';

interface ShareRequest {
  projectId: string;
  permissionLevel: 'view' | 'comment' | 'edit';
  isPublic: boolean;
  sharedWithEmail?: string;
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
    const user = await authenticateRequest(req.headers);

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

    const body: ShareRequest = await req.json();

    const { data: project } = await supabaseClient
      .from('projects')
      .select('id, owner_id')
      .eq('id', body.projectId)
      .single();

    if (!project || project.owner_id !== user.id) {
      return errorResponse('Not authorized to share this project', 403);
    }

    const shareToken = nanoid(32);

    const expiresAt = body.expiresInDays
      ? new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    let sharedWithId: string | null = null;
    if (body.sharedWithEmail) {
      const { data: targetUser } = await supabaseClient
        .from('users')
        .select('id')
        .eq('email', body.sharedWithEmail)
        .single();
      sharedWithId = targetUser?.id ?? null;
    }

    const { data: share, error: shareError } = await supabaseClient
      .from('project_shares')
      .insert({
        project_id: body.projectId,
        shared_by: user.id,
        shared_with: sharedWithId,
        share_token: shareToken,
        permission_level: body.permissionLevel,
        is_public: body.isPublic,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (shareError) {
      return errorResponse(shareError.message, 500);
    }

    await supabaseClient.channel(`project:${body.projectId}`).send({
      type: 'broadcast',
      event: 'share_created',
      payload: { share },
    });

    const shareUrl = `${Deno.env.get('PUBLIC_APP_URL')}/shared/${shareToken}`;

    return successResponse({ share, shareUrl });
  } catch (error: any) {
    return errorResponse(error?.message || 'Unexpected error', 500);
  }
});
