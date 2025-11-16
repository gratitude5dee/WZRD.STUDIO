// ============================================================================
// EDGE FUNCTION: invite-collaborator
// PURPOSE: Send email invitation to collaborate on project
// ROUTE: POST /functions/v1/invite-collaborator
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { authenticateRequest, AuthError } from '../_shared/auth.ts';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';

interface InviteRequest {
  projectId: string;
  email: string;
  role: 'editor' | 'viewer' | 'commenter';
  message?: string;
  customPermissions?: Record<string, any>;
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

    // Parse request body
    const body: InviteRequest = await req.json();
    const { projectId, email, role, message, customPermissions } = body;

    if (!projectId || !email || !role) {
      return errorResponse('Missing required fields: projectId, email, role', 400);
    }

    // Validate email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return errorResponse('Invalid email format', 400);
    }

    // Validate project ownership or share permission
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select(`
        *,
        project_collaborators!inner(
          user_id,
          permissions
        )
      `)
      .eq('id', projectId)
      .or(`user_id.eq.${user.id},and(project_collaborators.user_id.eq.${user.id},project_collaborators.permissions->>canShare.eq.true)`)
      .single();

    if (projectError || !project) {
      return errorResponse('Project not found or insufficient permissions', 403);
    }

    // Check if already invited
    const { data: existing } = await supabaseClient
      .from('project_collaborators')
      .select('id, invitation_status')
      .eq('project_id', projectId)
      .eq('invited_email', email)
      .single();

    if (existing && existing.invitation_status === 'accepted') {
      return errorResponse('User already collaborating on this project', 400);
    }

    // Generate secure invitation token
    const tokenArray = new Uint8Array(32);
    crypto.getRandomValues(tokenArray);
    const token = Array.from(tokenArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Default permissions by role
    const defaultPermissions = {
      editor: {
        canEdit: true,
        canComment: true,
        canShare: false,
        canExport: true,
        canManageCollaborators: false,
        canDeleteProject: false,
        canEditSettings: false,
        canViewHistory: true,
      },
      viewer: {
        canEdit: false,
        canComment: true,
        canShare: false,
        canExport: false,
        canManageCollaborators: false,
        canDeleteProject: false,
        canEditSettings: false,
        canViewHistory: true,
      },
      commenter: {
        canEdit: false,
        canComment: true,
        canShare: false,
        canExport: false,
        canManageCollaborators: false,
        canDeleteProject: false,
        canEditSettings: false,
        canViewHistory: false,
      },
    };

    const permissions = customPermissions || defaultPermissions[role];

    // Upsert invitation
    const { data: invitation, error: inviteError } = await supabaseClient
      .from('project_collaborators')
      .upsert({
        id: existing?.id,
        project_id: projectId,
        invited_email: email,
        role,
        permissions,
        invited_by: user.id,
        invitation_token: token,
        invitation_expires_at: expiresAt.toISOString(),
        invitation_status: 'pending',
        invitation_metadata: { message, source: 'email' },
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Invitation error:', inviteError);
      return errorResponse('Failed to create invitation', 500, inviteError.message);
    }

    // Log activity
    await supabaseClient
      .from('project_activity')
      .insert({
        project_id: projectId,
        user_id: user.id,
        actor_name: user.email || 'User',
        action: 'collaborator_added',
        action_target: 'collaborator',
        action_target_id: invitation.id,
        action_metadata: {
          role,
          email,
          invitationType: 'email',
        },
      });

    // Generate invite URL
    const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:5173';
    const inviteUrl = `${appUrl}/invite/${token}`;

    // TODO: Send email via Resend or similar service
    // For now, return the invite URL for testing
    console.log(`Invitation created: ${inviteUrl}`);

    return successResponse({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.invited_email,
        role: invitation.role,
        expiresAt: invitation.invitation_expires_at,
      },
      inviteUrl, // Return for testing
    });

  } catch (error) {
    console.error('Invite collaborator error:', error);

    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }

    return errorResponse(error.message || 'Failed to invite collaborator', 500);
  }
});
