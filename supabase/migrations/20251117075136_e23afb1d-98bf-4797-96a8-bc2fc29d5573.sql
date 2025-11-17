-- Add missing columns to media_items table
ALTER TABLE public.media_items 
ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid(),
ADD COLUMN IF NOT EXISTS storage_path text,
ADD COLUMN IF NOT EXISTS storage_bucket text DEFAULT 'project-media',
ADD COLUMN IF NOT EXISTS duration_seconds numeric,
ADD COLUMN IF NOT EXISTS file_size bigint,
ADD COLUMN IF NOT EXISTS mime_type text,
ADD COLUMN IF NOT EXISTS thumbnail_url text,
ADD COLUMN IF NOT EXISTS source_type text DEFAULT 'uploaded' CHECK (source_type IN ('uploaded', 'ai-generated', 'stock'));

-- Update status column constraint if needed
DO $$ 
BEGIN
  ALTER TABLE public.media_items DROP CONSTRAINT IF EXISTS media_items_status_check;
  ALTER TABLE public.media_items ADD CONSTRAINT media_items_status_check 
    CHECK (status IN ('processing', 'completed', 'failed', 'ready'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view media in their projects" ON public.media_items;
DROP POLICY IF EXISTS "Users can insert media in their projects" ON public.media_items;
DROP POLICY IF EXISTS "Users can update their project media" ON public.media_items;
DROP POLICY IF EXISTS "Users can delete their project media" ON public.media_items;

-- Create RLS Policies
CREATE POLICY "Users can view media in their projects"
  ON public.media_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = media_items.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert media in their projects"
  ON public.media_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = media_items.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their project media"
  ON public.media_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = media_items.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their project media"
  ON public.media_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = media_items.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Create storage bucket for project media
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-media', 'project-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
DROP POLICY IF EXISTS "Users can upload media to their projects" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view project media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their project media" ON storage.objects;

CREATE POLICY "Users can upload media to their projects"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'project-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view project media"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'project-media');

CREATE POLICY "Users can delete their project media"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'project-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_items_project_id ON public.media_items(project_id);
CREATE INDEX IF NOT EXISTS idx_media_items_user_id ON public.media_items(user_id);
CREATE INDEX IF NOT EXISTS idx_media_items_media_type ON public.media_items(media_type);
CREATE INDEX IF NOT EXISTS idx_media_items_status ON public.media_items(status);

-- Enable realtime for media_items
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.media_items;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;