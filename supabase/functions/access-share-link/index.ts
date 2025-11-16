// ============================================================================
// EDGE FUNCTION: access-share-link
// PURPOSE: Validate and create session for share link access
// ROUTE: POST /functions/v1/access-share-link
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';

interface AccessShareLinkRequest {
  token: string;
  password?: string;
  displayName?: string;
}

// Simple hash function for password verification
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate random cursor color
function generateCursorColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B4B4', '#A8E6CF'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
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

    // Create Supabase admin client (service role)
    const supabaseAdmin = createClient(
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
    const { token, password, displayName }: AccessShareLinkRequest = await req.json();

    if (!token) {
      return errorResponse('Missing required field: token', 400);
    }

    // Find share link
    const { data: shareLink, error: linkError } = await supabaseAdmin
      .from('project_share_links')
      .select(`
        *,
        projects (
          id,
          title,
          description,
          aspect_ratio,
          user_id
        )
      `)
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (linkError || !shareLink) {
      return errorResponse('Invalid or inactive share link', 404);
    }

    // Check expiration
    if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
      return errorResponse('Share link has expired', 400);
    }

    // Check max uses
    if (shareLink.max_uses && shareLink.current_uses >= shareLink.max_uses) {
      return errorResponse('Share link has reached maximum uses', 400);
    }

    // Verify password if required
    if (shareLink.requires_password) {
      if (!password) {
        return errorResponse('Password required', 401, { requiresPassword: true });
      }

      const passwordHash = await hashPassword(password);
      if (passwordHash !== shareLink.password_hash) {
        return errorResponse('Invalid password', 401);
      }
    }

    // Check if user is authenticated
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    let anonymousId = null;
    let userEmail = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) {
        userId = user.id;
        userEmail = user.email;
      }
    }

    // Create anonymous user if not authenticated
    if (!userId) {
      anonymousId = `anon_${crypto.randomUUID()}`;

      const cursorColor = generateCursorColor();

      const { error: anonError } = await supabaseAdmin
        .from('anonymous_users')
        .insert({
          id: anonymousId,
          display_name: displayName || 'Anonymous',
          avatar_seed: crypto.randomUUID(),
          cursor_color: cursorColor,
          first_share_link_id: shareLink.id,
          user_agent: req.headers.get('User-Agent'),
        });

      if (anonError) {
        console.error('Error creating anonymous user:', anonError);
      }
    }

    // Get cursor color
    let cursorColor = generateCursorColor();
    if (anonymousId) {
      const { data: anonUser } = await supabaseAdmin
        .from('anonymous_users')
        .select('cursor_color')
        .eq('id', anonymousId)
        .single();

      if (anonUser) {
        cursorColor = anonUser.cursor_color;
      }
    }

    // Create collaboration session
    const sessionToken = crypto.randomUUID();
    const channelName = `project:${shareLink.project_id}`;

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('collaboration_sessions')
      .insert({
        project_id: shareLink.project_id,
        user_id: userId,
        anonymous_id: anonymousId,
        session_token: sessionToken,
        channel_name: channelName,
        display_name: displayName || userEmail || 'Anonymous',
        cursor_color: cursorColor,
        is_active: true,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session error:', sessionError);
      return errorResponse('Failed to create session', 500, sessionError.message);
    }

    // Log activity
    await supabaseAdmin
      .from('project_activity')
      .insert({
        project_id: shareLink.project_id,
        user_id: userId,
        anonymous_id: anonymousId,
        actor_name: displayName || userEmail || 'Anonymous',
        action: 'user_joined',
        action_target: 'session',
        action_target_id: session.id,
        action_metadata: {
          viaShareLink: true,
          linkType: shareLink.link_type,
          accessLevel: shareLink.access_level,
        },
      });

    // Increment usage count
    await supabaseAdmin
      .from('project_share_links')
      .update({
        current_uses: shareLink.current_uses + 1,
        last_accessed_at: new Date().toISOString(),
      })
      .eq('id', shareLink.id);

    return successResponse({
      success: true,
      session: {
        id: session.id,
        sessionToken,
        channelName,
        displayName: session.display_name,
        cursorColor: session.cursor_color,
      },
      project: shareLink.projects,
      accessLevel: shareLink.access_level,
      permissions: shareLink.custom_permissions,
      anonymousId,
      isAnonymous: !userId,
    });

  } catch (error) {
    console.error('Access share link error:', error);
    return errorResponse(error.message || 'Failed to access share link', 500);
  }
});
