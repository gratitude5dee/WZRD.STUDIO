-- Create studio_connections table for persisting canvas connections
CREATE TABLE IF NOT EXISTS public.studio_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  source_block_id UUID NOT NULL REFERENCES public.studio_blocks(id) ON DELETE CASCADE,
  target_block_id UUID NOT NULL REFERENCES public.studio_blocks(id) ON DELETE CASCADE,
  source_handle TEXT,
  target_handle TEXT,
  animated BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.studio_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own connections"
  ON public.studio_connections FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create connections for their projects"
  ON public.studio_connections FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own connections"
  ON public.studio_connections FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );