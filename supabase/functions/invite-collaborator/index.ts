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

    // Send email via Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    let emailSent = false;

    if (RESEND_API_KEY) {
      try {
        const inviterName = user.email?.split('@')[0] || 'Someone';

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'WZRD Studio <noreply@wzrd.studio>',
            to: [email],
            subject: `${inviterName} invited you to collaborate on a project`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Project Invitation</title>
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f5f5f5;
                  }
                  .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 40px 20px;
                  }
                  .card {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 40px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                  }
                  .logo {
                    text-align: center;
                    margin-bottom: 30px;
                  }
                  .logo span {
                    font-size: 24px;
                    font-weight: bold;
                    background: linear-gradient(135deg, #8B5CF6, #6366F1);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                  }
                  h1 {
                    color: #1a1a1a;
                    font-size: 24px;
                    margin-bottom: 20px;
                    text-align: center;
                  }
                  .role-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    background: linear-gradient(135deg, #8B5CF6, #6366F1);
                    color: white;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 500;
                  }
                  .button {
                    display: inline-block;
                    padding: 14px 32px;
                    background: linear-gradient(135deg, #8B5CF6, #6366F1);
                    color: white !important;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 16px;
                    margin: 20px 0;
                  }
                  .button:hover {
                    opacity: 0.9;
                  }
                  .message-box {
                    background: #f8f8f8;
                    border-left: 4px solid #8B5CF6;
                    padding: 16px;
                    margin: 20px 0;
                    border-radius: 0 8px 8px 0;
                  }
                  .footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    color: #666;
                    font-size: 13px;
                    text-align: center;
                  }
                  .link-text {
                    color: #666;
                    font-size: 12px;
                    word-break: break-all;
                    margin-top: 10px;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="card">
                    <div class="logo">
                      <span>WZRD Studio</span>
                    </div>
                    <h1>You're invited to collaborate!</h1>
                    <p style="text-align: center;">
                      <strong>${inviterName}</strong> has invited you to join their project as a
                      <span class="role-badge">${role}</span>
                    </p>
                    ${message ? `
                      <div class="message-box">
                        <p style="margin: 0; font-style: italic;">"${message}"</p>
                      </div>
                    ` : ''}
                    <p style="text-align: center;">
                      <a href="${inviteUrl}" class="button">Accept Invitation</a>
                    </p>
                    <p class="link-text">Or copy this link: ${inviteUrl}</p>
                    <div class="footer">
                      <p>This invitation expires in 7 days.</p>
                      <p>If you didn't expect this email, you can safely ignore it.</p>
                      <p style="margin-top: 20px;">
                        <a href="${appUrl}" style="color: #8B5CF6;">Visit WZRD Studio</a>
                      </p>
                    </div>
                  </div>
                </div>
              </body>
              </html>
            `,
          }),
        });

        if (emailResponse.ok) {
          emailSent = true;
          console.log(`Email sent successfully to ${email}`);
        } else {
          const errorText = await emailResponse.text();
          console.error('Email send failed:', errorText);
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    } else {
      console.log('RESEND_API_KEY not configured, skipping email');
    }

    console.log(`Invitation created: ${inviteUrl}`);

    return successResponse({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.invited_email,
        role: invitation.role,
        expiresAt: invitation.invitation_expires_at,
      },
      inviteUrl,
      emailSent,
    });

  } catch (error) {
    console.error('Invite collaborator error:', error);

    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to invite collaborator';
    return errorResponse(errorMessage, 500);
  }
});
