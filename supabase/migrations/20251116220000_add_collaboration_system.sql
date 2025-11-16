-- ============================================================================
-- MIGRATION: Real-Time Multiplayer Collaboration System
-- PURPOSE: Add enterprise-grade collaboration features with granular permissions
-- AUTHOR: Claude
-- DATE: 2025-11-16
-- ============================================================================

-- ============================================================================
-- SECTION 1: CUSTOM TYPES
-- ============================================================================

-- Collaboration roles
CREATE TYPE collaboration_role AS ENUM ('owner', 'editor', 'viewer', 'commenter');

-- Invitation status
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined', 'revoked');

-- Share link types
CREATE TYPE share_link_type AS ENUM ('private', 'public');

-- Share link access levels
CREATE TYPE share_link_access AS ENUM ('view', 'comment', 'edit');

-- Activity action types
CREATE TYPE activity_action AS ENUM (
  'project_created', 'project_updated', 'project_deleted',
  'collaborator_added', 'collaborator_removed', 'role_changed',
  'share_link_created', 'share_link_revoked',
  'asset_uploaded', 'asset_deleted',
  'node_created', 'node_updated', 'node_deleted', 'node_connected',
  'clip_added', 'clip_updated', 'clip_deleted',
  'canvas_updated', 'comment_added',
  'user_joined', 'user_left'
);

-- ============================================================================
-- SECTION 2: TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TABLE: project_collaborators
-- PURPOSE: Track users who have access to projects with specific roles
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.project_collaborators (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Role & Permissions
  role collaboration_role NOT NULL DEFAULT 'viewer',
  permissions JSONB DEFAULT '{
    "canEdit": false,
    "canComment": true,
    "canShare": false,
    "canExport": false,
    "canManageCollaborators": false,
    "canDeleteProject": false,
    "canEditSettings": false,
    "canViewHistory": true,
    "specificPages": []
  }'::jsonb,

  -- Invitation Tracking
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_email TEXT,
  invitation_status invitation_status NOT NULL DEFAULT 'pending',
  invitation_token TEXT UNIQUE,
  invitation_expires_at TIMESTAMPTZ,

  -- Access Control
  is_active BOOLEAN DEFAULT TRUE,
  last_accessed_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,

  -- Metadata
  invitation_metadata JSONB DEFAULT '{}'::jsonb,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT unique_project_user UNIQUE (project_id, user_id),
  CONSTRAINT valid_invitation_email CHECK (invited_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT pending_has_token CHECK (
    (invitation_status = 'pending' AND invitation_token IS NOT NULL) OR
    (invitation_status != 'pending')
  )
);

-- Indexes for project_collaborators
CREATE INDEX idx_collaborators_project ON public.project_collaborators(project_id);
CREATE INDEX idx_collaborators_user ON public.project_collaborators(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_collaborators_email ON public.project_collaborators(invited_email) WHERE invited_email IS NOT NULL;
CREATE INDEX idx_collaborators_token ON public.project_collaborators(invitation_token) WHERE invitation_token IS NOT NULL;
CREATE INDEX idx_collaborators_status ON public.project_collaborators(invitation_status);
CREATE INDEX idx_collaborators_active ON public.project_collaborators(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_collaborators_email_search ON public.project_collaborators USING GIN (
  to_tsvector('english', COALESCE(invited_email, ''))
);

-- ----------------------------------------------------------------------------
-- TABLE: project_share_links
-- PURPOSE: Generate shareable links for projects (private & public)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.project_share_links (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Link Configuration
  link_type share_link_type NOT NULL DEFAULT 'private',
  access_level share_link_access NOT NULL DEFAULT 'view',
  token TEXT NOT NULL UNIQUE,

  -- Access Control
  is_active BOOLEAN DEFAULT TRUE,
  requires_password BOOLEAN DEFAULT FALSE,
  password_hash TEXT,

  -- Restrictions
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  allowed_domains TEXT[],

  -- Custom Permissions
  custom_permissions JSONB,

  -- Metadata
  name TEXT,
  description TEXT,

  -- Analytics
  last_accessed_at TIMESTAMPTZ,
  access_logs JSONB DEFAULT '[]'::jsonb,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_token_format CHECK (token ~* '^[a-zA-Z0-9_-]{12,64}$'),
  CONSTRAINT valid_max_uses CHECK (max_uses IS NULL OR max_uses > 0),
  CONSTRAINT password_required_check CHECK (
    (requires_password = TRUE AND password_hash IS NOT NULL) OR
    (requires_password = FALSE)
  )
);

-- Indexes for project_share_links
CREATE INDEX idx_share_links_project ON public.project_share_links(project_id);
CREATE INDEX idx_share_links_token ON public.project_share_links(token) WHERE is_active = TRUE;
CREATE INDEX idx_share_links_type ON public.project_share_links(link_type);
CREATE INDEX idx_share_links_active ON public.project_share_links(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_share_links_expires ON public.project_share_links(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_share_links_valid ON public.project_share_links(token)
WHERE is_active = TRUE AND (expires_at IS NULL OR expires_at > now());

-- ----------------------------------------------------------------------------
-- TABLE: collaboration_sessions
-- PURPOSE: Track active real-time collaboration sessions
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.collaboration_sessions (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id TEXT,

  -- Session Details
  session_token TEXT NOT NULL UNIQUE,
  channel_name TEXT NOT NULL,

  -- User Info
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  cursor_color TEXT NOT NULL,

  -- Session State
  is_active BOOLEAN DEFAULT TRUE,
  current_page TEXT,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Presence Data
  presence_state JSONB DEFAULT '{}'::jsonb,

  -- Connection Info
  ip_address INET,
  user_agent TEXT,
  connection_quality TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT user_or_anonymous CHECK (
    (user_id IS NOT NULL AND anonymous_id IS NULL) OR
    (user_id IS NULL AND anonymous_id IS NOT NULL)
  ),
  CONSTRAINT valid_cursor_color CHECK (cursor_color ~* '^#[0-9A-Fa-f]{6}$')
);

-- Indexes for collaboration_sessions
CREATE INDEX idx_sessions_project ON public.collaboration_sessions(project_id);
CREATE INDEX idx_sessions_user ON public.collaboration_sessions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_sessions_anonymous ON public.collaboration_sessions(anonymous_id) WHERE anonymous_id IS NOT NULL;
CREATE INDEX idx_sessions_active ON public.collaboration_sessions(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_sessions_channel ON public.collaboration_sessions(channel_name);
CREATE INDEX idx_sessions_activity ON public.collaboration_sessions(last_activity_at DESC);
CREATE INDEX idx_sessions_stale ON public.collaboration_sessions(last_activity_at)
WHERE is_active = TRUE AND last_activity_at < now() - INTERVAL '1 hour';

-- ----------------------------------------------------------------------------
-- TABLE: project_activity
-- PURPOSE: Audit log of all project actions for activity feed
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.project_activity (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  -- Actor
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_id TEXT,
  actor_name TEXT NOT NULL,
  actor_avatar TEXT,

  -- Action
  action activity_action NOT NULL,
  action_target TEXT,
  action_target_id TEXT,

  -- Details
  action_metadata JSONB DEFAULT '{}'::jsonb,

  -- Context
  session_id UUID REFERENCES public.collaboration_sessions(id) ON DELETE SET NULL,
  page_context TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT actor_identity CHECK (
    (user_id IS NOT NULL AND anonymous_id IS NULL) OR
    (user_id IS NULL AND anonymous_id IS NOT NULL)
  )
);

-- Indexes for project_activity
CREATE INDEX idx_activity_project ON public.project_activity(project_id);
CREATE INDEX idx_activity_user ON public.project_activity(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_activity_action ON public.project_activity(action);
CREATE INDEX idx_activity_created ON public.project_activity(created_at DESC);
CREATE INDEX idx_activity_target ON public.project_activity(action_target, action_target_id);
CREATE INDEX idx_activity_feed ON public.project_activity(project_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- TABLE: anonymous_users
-- PURPOSE: Track anonymous users accessing via public share links
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.anonymous_users (
  -- Identity
  id TEXT PRIMARY KEY,

  -- Display Info
  display_name TEXT NOT NULL DEFAULT 'Anonymous',
  avatar_seed TEXT NOT NULL,
  cursor_color TEXT NOT NULL,

  -- Session Tracking
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_count INTEGER DEFAULT 1,

  -- Origin
  first_share_link_id UUID REFERENCES public.project_share_links(id) ON DELETE SET NULL,
  user_agent TEXT,
  ip_address INET,

  -- Constraints
  CONSTRAINT valid_anon_id CHECK (id ~* '^anon_[a-f0-9-]{36}$')
);

-- Indexes for anonymous_users
CREATE INDEX idx_anon_users_last_seen ON public.anonymous_users(last_seen_at DESC);
CREATE INDEX idx_anon_users_share_link ON public.anonymous_users(first_share_link_id) WHERE first_share_link_id IS NOT NULL;
CREATE INDEX idx_anon_users_stale ON public.anonymous_users(last_seen_at)
WHERE last_seen_at < now() - INTERVAL '30 days';

-- ----------------------------------------------------------------------------
-- TABLE: project_comments
-- PURPOSE: Comments on projects, nodes, clips, or canvas elements
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.project_comments (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  -- Author
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_id TEXT,
  author_name TEXT NOT NULL,
  author_avatar TEXT,

  -- Comment Content
  content TEXT NOT NULL,
  content_html TEXT,

  -- Context
  comment_type TEXT NOT NULL DEFAULT 'general',
  target_type TEXT,
  target_id TEXT,
  target_metadata JSONB,

  -- Threading
  parent_comment_id UUID REFERENCES public.project_comments(id) ON DELETE CASCADE,
  thread_depth INTEGER DEFAULT 0,

  -- Status
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,

  -- Reactions
  reactions JSONB DEFAULT '{}'::jsonb,

  -- Mentions
  mentioned_user_ids UUID[],

  -- Edit History
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  original_content TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT author_identity CHECK (
    (user_id IS NOT NULL AND anonymous_id IS NULL) OR
    (user_id IS NULL AND anonymous_id IS NOT NULL)
  ),
  CONSTRAINT valid_thread_depth CHECK (thread_depth >= 0 AND thread_depth <= 5),
  CONSTRAINT content_not_empty CHECK (LENGTH(TRIM(content)) > 0)
);

-- Indexes for project_comments
CREATE INDEX idx_comments_project ON public.project_comments(project_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_comments_target ON public.project_comments(target_type, target_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_comments_parent ON public.project_comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;
CREATE INDEX idx_comments_created ON public.project_comments(created_at DESC);
CREATE INDEX idx_comments_author ON public.project_comments(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_comments_unresolved ON public.project_comments(is_resolved) WHERE is_resolved = FALSE AND deleted_at IS NULL;
CREATE INDEX idx_comments_mentions ON public.project_comments USING GIN (mentioned_user_ids);
CREATE INDEX idx_comments_search ON public.project_comments USING GIN (
  to_tsvector('english', content)
) WHERE deleted_at IS NULL;

-- ============================================================================
-- SECTION 3: TRIGGERS & FUNCTIONS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER collaborators_updated_at
  BEFORE UPDATE ON public.project_collaborators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER share_links_updated_at
  BEFORE UPDATE ON public.project_share_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON public.collaboration_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON public.project_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-increment share link usage
CREATE OR REPLACE FUNCTION increment_share_link_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.project_share_links
  SET
    current_uses = current_uses + 1,
    last_accessed_at = now()
  WHERE id = NEW.first_share_link_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_share_link_usage
  AFTER INSERT ON public.anonymous_users
  FOR EACH ROW
  WHEN (NEW.first_share_link_id IS NOT NULL)
  EXECUTE FUNCTION increment_share_link_usage();

-- Update project's updated_at when activity occurs
CREATE OR REPLACE FUNCTION update_project_on_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.projects
  SET updated_at = now()
  WHERE id = NEW.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_activity_updates_project
  AFTER INSERT ON public.project_activity
  FOR EACH ROW
  EXECUTE FUNCTION update_project_on_activity();

-- Broadcast new activity to realtime channel
CREATE OR REPLACE FUNCTION broadcast_activity()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
BEGIN
  payload := json_build_object(
    'id', NEW.id,
    'project_id', NEW.project_id,
    'action', NEW.action,
    'actor_name', NEW.actor_name,
    'actor_avatar', NEW.actor_avatar,
    'action_metadata', NEW.action_metadata,
    'created_at', NEW.created_at
  );

  PERFORM pg_notify(
    'project_activity:' || NEW.project_id::text,
    payload::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_activity
  AFTER INSERT ON public.project_activity
  FOR EACH ROW
  EXECUTE FUNCTION broadcast_activity();

-- Function to end stale sessions
CREATE OR REPLACE FUNCTION end_stale_sessions()
RETURNS void AS $$
BEGIN
  UPDATE public.collaboration_sessions
  SET
    is_active = FALSE,
    ended_at = now()
  WHERE
    is_active = TRUE
    AND last_activity_at < now() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 4: ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 5: REALTIME CONFIGURATION
-- ============================================================================

-- Enable realtime for collaboration sessions (presence)
ALTER PUBLICATION supabase_realtime ADD TABLE public.collaboration_sessions;

-- Enable realtime for activity feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_activity;

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_comments;

-- Set replica identity for realtime
ALTER TABLE public.collaboration_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.project_activity REPLICA IDENTITY FULL;
ALTER TABLE public.project_comments REPLICA IDENTITY FULL;

-- ============================================================================
-- COMPLETION
-- ============================================================================

-- Add comment to track migration
COMMENT ON TABLE public.project_collaborators IS 'Tracks project collaborators with granular permissions';
COMMENT ON TABLE public.project_share_links IS 'Shareable links for projects with access controls';
COMMENT ON TABLE public.collaboration_sessions IS 'Active real-time collaboration sessions';
COMMENT ON TABLE public.project_activity IS 'Audit log for project activity feed';
COMMENT ON TABLE public.anonymous_users IS 'Anonymous users from public share links';
COMMENT ON TABLE public.project_comments IS 'Comments on projects and related entities';
