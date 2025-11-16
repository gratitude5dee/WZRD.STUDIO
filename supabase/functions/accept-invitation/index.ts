// ============================================================================
// EDGE FUNCTION: accept-invitation
// PURPOSE: Accept collaboration invitation and link to user account
// ROUTE: POST /functions/v1/accept-invitation
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { authenticateRequest, AuthError } from '../_shared/auth.ts';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';

interface AcceptInvitationRequest {
  token: string;
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
    const { token }: AcceptInvitationRequest = await req.json();

    if (!token) {
      return errorResponse('Missing required field: token', 400);
    }

    // Find invitation
    const { data: invitation, error: inviteError } = await supabaseClient
      .from('project_collaborators')
      .select(`
        *,
        projects (
          id,
          title,
          description,
          user_id
        )
      `)
      .eq('invitation_token', token)
      .eq('invitation_status', 'pending')
      .single();

    if (inviteError || !invitation) {
      return errorResponse('Invalid or expired invitation', 404);
    }

    // Check expiration
    if (new Date(invitation.invitation_expires_at) < new Date()) {
      return errorResponse('Invitation has expired', 400);
    }

    // Verify email matches (if user email available)
    if (user.email && invitation.invited_email !== user.email) {
      return errorResponse(
        `This invitation was sent to ${invitation.invited_email}. Please log in with that email.`,
        403
      );
    }

    // Update invitation
    const { error: updateError } = await supabaseClient
      .from('project_collaborators')
      .update({
        user_id: user.id,
        invitation_status: 'accepted',
        accepted_at: new Date().toISOString(),
        is_active: true,
      })
      .eq('id', invitation.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return errorResponse('Failed to accept invitation', 500, updateError.message);
    }

    // Log activity
    await supabaseClient
      .from('project_activity')
      .insert({
        project_id: invitation.project_id,
        user_id: user.id,
        actor_name: user.email || 'New Collaborator',
        action: 'user_joined',
        action_target: 'collaborator',
        action_target_id: invitation.id,
        action_metadata: {
          role: invitation.role,
          email: invitation.invited_email,
        },
      });

    return successResponse({
      success: true,
      project: invitation.projects,
      role: invitation.role,
      permissions: invitation.permissions,
    });

  } catch (error) {
    console.error('Accept invitation error:', error);

    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }

    return errorResponse(error.message || 'Failed to accept invitation', 500);
  }
});
