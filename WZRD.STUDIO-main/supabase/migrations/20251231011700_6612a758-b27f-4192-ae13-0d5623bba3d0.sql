-- Create project_shares table for sharing projects
CREATE TABLE IF NOT EXISTS public.project_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL,
  shared_with UUID NULL,
  share_token TEXT NOT NULL UNIQUE,
  permission_level TEXT NOT NULL DEFAULT 'view',
  is_public BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_project_shares_token ON public.project_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_project_shares_project ON public.project_shares(project_id);

-- Enable RLS
ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view shares they created
CREATE POLICY "Users can view own shares"
ON public.project_shares
FOR SELECT
TO authenticated
USING (auth.uid() = shared_by);

-- Policy: Users can create shares for their projects
CREATE POLICY "Users can create shares"
ON public.project_shares
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = shared_by);

-- Policy: Users can delete their own shares
CREATE POLICY "Users can delete own shares"
ON public.project_shares
FOR DELETE
TO authenticated
USING (auth.uid() = shared_by);

-- Policy: Allow public access to public shares (for viewing shared content)
CREATE POLICY "Anyone can view public shares by token"
ON public.project_shares
FOR SELECT
TO anon, authenticated
USING (is_public = true);