// ============================================================================
// EDGE FUNCTION: create-share-link
// PURPOSE: Generate shareable link for project (private or public)
// ROUTE: POST /functions/v1/create-share-link
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { authenticateRequest, AuthError } from '../_shared/auth.ts';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';

interface ShareLinkRequest {
  projectId: string;
  linkType: 'private' | 'public';
  accessLevel: 'view' | 'comment' | 'edit';
  name?: string;
  description?: string;
  password?: string;
  expiresInDays?: number;
  maxUses?: number;
  allowedDomains?: string[];
  customPermissions?: Record<string, any>;
}

// Simple hash function for passwords (in production, use bcrypt)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
    const body: ShareLinkRequest = await req.json();
    const {
      projectId,
      linkType,
      accessLevel,
      name,
      description,
      password,
      expiresInDays,
      maxUses,
      allowedDomains,
      customPermissions,
    } = body;

    if (!projectId || !linkType || !accessLevel) {
      return errorResponse('Missing required fields: projectId, linkType, accessLevel', 400);
    }

    // Verify user can create share links for this project
    const { data: project } = await supabaseClient
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

    if (!project) {
      return errorResponse('Project not found or insufficient permissions', 403);
    }

    // Generate secure token (URL-safe)
    const tokenArray = new Uint8Array(24);
    crypto.getRandomValues(tokenArray);
    const token = Array.from(tokenArray)
      .map(b => b.toString(36))
      .join('')
      .substring(0, 24)
      .replace(/[^a-zA-Z0-9_-]/g, 'x');

    // Hash password if provided
    let passwordHash = null;
    if (password) {
      passwordHash = await hashPassword(password);
    }

    // Calculate expiration
    let expiresAt = null;
    if (expiresInDays) {
      expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    }

    // Create share link
    const { data: shareLink, error: linkError } = await supabaseClient
      .from('project_share_links')
      .insert({
        project_id: projectId,
        created_by: user.id,
        link_type: linkType,
        access_level: accessLevel,
        token,
        name: name || `${linkType} ${accessLevel} link`,
        description,
        requires_password: !!password,
        password_hash: passwordHash,
        expires_at: expiresAt?.toISOString(),
        max_uses: maxUses,
        allowed_domains: allowedDomains,
        custom_permissions: customPermissions,
      })
      .select()
      .single();

    if (linkError) {
      console.error('Link creation error:', linkError);
      return errorResponse('Failed to create share link', 500, linkError.message);
    }

    // Log activity
    await supabaseClient
      .from('project_activity')
      .insert({
        project_id: projectId,
        user_id: user.id,
        actor_name: user.email || 'User',
        action: 'share_link_created',
        action_target: 'share_link',
        action_target_id: shareLink.id,
        action_metadata: {
          linkType,
          accessLevel,
          hasPassword: !!password,
          expiresAt: expiresAt?.toISOString(),
        },
      });

    // Generate full URL
    const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:5173';
    const shareUrl = `${appUrl}/share/${token}`;

    return successResponse({
      success: true,
      shareLink: {
        id: shareLink.id,
        token: shareLink.token,
        linkType: shareLink.link_type,
        accessLevel: shareLink.access_level,
        name: shareLink.name,
        description: shareLink.description,
        requiresPassword: shareLink.requires_password,
        expiresAt: shareLink.expires_at,
        maxUses: shareLink.max_uses,
        currentUses: shareLink.current_uses,
        createdAt: shareLink.created_at,
      },
      shareUrl,
    });

  } catch (error) {
    console.error('Create share link error:', error);

    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }

    return errorResponse(error.message || 'Failed to create share link', 500);
  }
});
