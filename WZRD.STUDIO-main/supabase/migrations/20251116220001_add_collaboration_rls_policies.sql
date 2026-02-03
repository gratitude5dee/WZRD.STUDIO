-- ============================================================================
-- MIGRATION: Collaboration System - Row Level Security Policies
-- PURPOSE: Add comprehensive RLS policies for collaboration tables
-- AUTHOR: Claude
-- DATE: 2025-11-16
-- ============================================================================

-- ============================================================================
-- RLS POLICIES: project_collaborators
-- SECURITY: Only project owner can manage collaborators
-- ============================================================================

-- Project owners can manage all collaborators
CREATE POLICY "owners_manage_collaborators"
  ON public.project_collaborators
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_collaborators.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Collaborators can view other collaborators on their projects
CREATE POLICY "collaborators_view_others"
  ON public.project_collaborators
  FOR SELECT
  USING (
    -- User is a collaborator on this project
    project_id IN (
      SELECT project_id FROM public.project_collaborators
      WHERE user_id = auth.uid()
      AND is_active = TRUE
      AND invitation_status = 'accepted'
    )
    -- OR user accessed via share link
    OR project_id IN (
      SELECT project_id FROM public.collaboration_sessions
      WHERE user_id = auth.uid()
      AND is_active = TRUE
    )
  );

-- Users can view their own collaboration records
CREATE POLICY "users_view_own_collaborations"
  ON public.project_collaborators
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can accept their own invitations
CREATE POLICY "users_accept_own_invitations"
  ON public.project_collaborators
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id
    OR invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- ============================================================================
-- RLS POLICIES: project_share_links
-- SECURITY: Project collaborators with share permission can create/manage links
-- ============================================================================

-- Project owners can manage all share links
CREATE POLICY "owners_manage_share_links"
  ON public.project_share_links
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_share_links.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Editors with canShare permission can create share links
CREATE POLICY "editors_create_share_links"
  ON public.project_share_links
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_collaborators
      WHERE project_collaborators.project_id = project_id
      AND project_collaborators.user_id = auth.uid()
      AND project_collaborators.is_active = TRUE
      AND project_collaborators.invitation_status = 'accepted'
      AND (project_collaborators.permissions->>'canShare')::boolean = TRUE
    )
  );

-- Collaborators can view share links on their projects
CREATE POLICY "collaborators_view_share_links"
  ON public.project_share_links
  FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM public.project_collaborators
      WHERE user_id = auth.uid()
      AND is_active = TRUE
      AND invitation_status = 'accepted'
    )
    OR project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

-- Anyone can view active public share links by token (for validation)
CREATE POLICY "public_access_share_links_by_token"
  ON public.project_share_links
  FOR SELECT
  USING (
    is_active = TRUE
    AND (expires_at IS NULL OR expires_at > now())
    AND (max_uses IS NULL OR current_uses < max_uses)
  );

-- ============================================================================
-- RLS POLICIES: collaboration_sessions
-- SECURITY: Users can manage their own sessions, view others on same project
-- ============================================================================

-- Users can manage their own sessions
CREATE POLICY "users_manage_own_sessions"
  ON public.collaboration_sessions
  FOR ALL
  USING (auth.uid() = user_id OR anonymous_id IS NOT NULL)
  WITH CHECK (auth.uid() = user_id OR anonymous_id IS NOT NULL);

-- Users can view sessions on projects they have access to
CREATE POLICY "collaborators_view_project_sessions"
  ON public.collaboration_sessions
  FOR SELECT
  USING (
    project_id IN (
      -- User is project owner
      SELECT id FROM public.projects WHERE user_id = auth.uid()
      UNION
      -- User is collaborator
      SELECT project_id FROM public.project_collaborators
      WHERE user_id = auth.uid()
      AND is_active = TRUE
      AND invitation_status = 'accepted'
      UNION
      -- User has active session on project
      SELECT project_id FROM public.collaboration_sessions
      WHERE user_id = auth.uid()
      AND is_active = TRUE
    )
  );

-- ============================================================================
-- RLS POLICIES: project_activity
-- SECURITY: Activity visible to all project collaborators
-- ============================================================================

-- Project collaborators can view activity
CREATE POLICY "collaborators_view_activity"
  ON public.project_activity
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
      UNION
      SELECT project_id FROM public.project_collaborators
      WHERE user_id = auth.uid()
      AND is_active = TRUE
      AND invitation_status = 'accepted'
      UNION
      SELECT project_id FROM public.collaboration_sessions
      WHERE user_id = auth.uid()
      AND is_active = TRUE
    )
  );

-- Authenticated users can insert activity for their own actions
CREATE POLICY "users_insert_own_activity"
  ON public.project_activity
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR anonymous_id IS NOT NULL);

-- ============================================================================
-- RLS POLICIES: anonymous_users
-- SECURITY: Anonymous users can manage their own records
-- ============================================================================

-- Anonymous users can view and update their own records
CREATE POLICY "anon_users_manage_own"
  ON public.anonymous_users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- RLS POLICIES: project_comments
-- SECURITY: Comments visible to project collaborators
-- ============================================================================

-- Collaborators can view comments
CREATE POLICY "collaborators_view_comments"
  ON public.project_comments
  FOR SELECT
  USING (
    deleted_at IS NULL
    AND project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
      UNION
      SELECT project_id FROM public.project_collaborators
      WHERE user_id = auth.uid()
      AND is_active = TRUE
      AND invitation_status = 'accepted'
      UNION
      SELECT project_id FROM public.collaboration_sessions
      WHERE user_id = auth.uid()
      AND is_active = TRUE
    )
  );

-- Users with comment permission can create comments
CREATE POLICY "users_create_comments"
  ON public.project_comments
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
      UNION
      SELECT project_id FROM public.project_collaborators
      WHERE user_id = auth.uid()
      AND is_active = TRUE
      AND invitation_status = 'accepted'
      AND (permissions->>'canComment')::boolean = TRUE
      UNION
      -- Share link access with comment permission
      SELECT sl.project_id
      FROM public.project_share_links sl
      JOIN public.collaboration_sessions cs ON cs.project_id = sl.project_id
      WHERE cs.user_id = auth.uid()
      AND sl.is_active = TRUE
      AND sl.access_level IN ('comment', 'edit')
    )
  );

-- Users can update/delete their own comments
CREATE POLICY "users_manage_own_comments"
  ON public.project_comments
  FOR UPDATE
  USING (auth.uid() = user_id OR anonymous_id IS NOT NULL);

CREATE POLICY "users_delete_own_comments"
  ON public.project_comments
  FOR DELETE
  USING (auth.uid() = user_id OR anonymous_id IS NOT NULL);

-- Project owners can manage all comments
CREATE POLICY "owners_manage_all_comments"
  ON public.project_comments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_comments.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- ============================================================================
-- UPDATE: projects table RLS for share link access
-- ============================================================================

-- Allow share link users to view projects
CREATE POLICY "share_link_users_view_projects"
  ON public.projects
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR id IN (
      SELECT project_id FROM public.project_collaborators
      WHERE user_id = auth.uid()
      AND is_active = TRUE
      AND invitation_status = 'accepted'
    )
    OR id IN (
      SELECT sl.project_id
      FROM public.project_share_links sl
      JOIN public.collaboration_sessions cs ON cs.project_id = sl.project_id
      WHERE cs.user_id = auth.uid()
      AND cs.is_active = TRUE
      AND sl.is_active = TRUE
      AND (sl.expires_at IS NULL OR sl.expires_at > now())
    )
  );

-- Allow editors to update projects
CREATE POLICY "editors_update_projects"
  ON public.projects
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR id IN (
      SELECT project_id FROM public.project_collaborators
      WHERE user_id = auth.uid()
      AND is_active = TRUE
      AND invitation_status = 'accepted'
      AND role IN ('owner', 'editor')
      AND (permissions->>'canEdit')::boolean = TRUE
    )
  );

-- ============================================================================
-- COMPLETION
-- ============================================================================

COMMENT ON POLICY "owners_manage_collaborators" ON public.project_collaborators
  IS 'Project owners have full control over collaborators';
COMMENT ON POLICY "collaborators_view_others" ON public.project_collaborators
  IS 'Collaborators can see other collaborators on their projects';
