-- ============================================================================
-- MIGRATION: Create Project Shares + Share Access Logs
-- VERSION: 1.0
-- DATE: 2025-12-20
-- ============================================================================

-- Project shares table
CREATE TABLE IF NOT EXISTS public.project_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  shared_with UUID REFERENCES public.users(id) ON DELETE SET NULL,
  share_token VARCHAR(64) UNIQUE,
  permission_level VARCHAR(20) DEFAULT 'view' CHECK (permission_level IN ('view', 'comment', 'edit')),
  is_public BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Share access log for analytics
CREATE TABLE IF NOT EXISTS public.share_access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  share_id UUID NOT NULL REFERENCES public.project_shares(id) ON DELETE CASCADE,
  accessed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shares_project ON public.project_shares(project_id);
CREATE INDEX IF NOT EXISTS idx_shares_token ON public.project_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_shares_shared_with ON public.project_shares(shared_with);

-- Enable RLS
ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;

-- Users can view shares for their own projects or shares they received
CREATE POLICY IF NOT EXISTS "users_view_project_shares"
  ON public.project_shares
  FOR SELECT
  USING (
    auth.uid() = shared_by
    OR auth.uid() = shared_with
    OR (is_public = TRUE AND (expires_at IS NULL OR expires_at > NOW()))
  );

-- Only project owners can create shares
CREATE POLICY IF NOT EXISTS "project_owners_create_shares"
  ON public.project_shares
  FOR INSERT
  WITH CHECK (
    auth.uid() = shared_by
    AND EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_id AND owner_id = auth.uid()
    )
  );

-- Only share creators can update their shares
CREATE POLICY IF NOT EXISTS "share_creators_update"
  ON public.project_shares
  FOR UPDATE
  USING (auth.uid() = shared_by);

-- Only share creators can delete shares
CREATE POLICY IF NOT EXISTS "share_creators_delete"
  ON public.project_shares
  FOR DELETE
  USING (auth.uid() = shared_by);

-- Update updated_at trigger
DROP TRIGGER IF EXISTS project_shares_updated_at ON public.project_shares;
CREATE TRIGGER project_shares_updated_at
  BEFORE UPDATE ON public.project_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
