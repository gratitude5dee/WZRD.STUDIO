-- Migration: Add media management schema and storage buckets
-- Description: Creates projects/video_clips/audio_tracks/render_jobs tables and configures storage buckets with RLS

-- Ensure pgcrypto extension is available for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Projects table baseline (add columns if they do not exist)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  aspect_ratio TEXT DEFAULT '16:9',
  selected_storyline_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS aspect_ratio TEXT DEFAULT '16:9',
  ADD COLUMN IF NOT EXISTS selected_storyline_id UUID,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS title TEXT;

ALTER TABLE public.projects
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN title SET NOT NULL;

-- Updated_at trigger for projects
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS projects_set_updated_at ON public.projects;
CREATE TRIGGER projects_set_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Video clips table
CREATE TABLE IF NOT EXISTS public.video_clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('video', 'image')),
  storage_bucket TEXT NOT NULL DEFAULT 'videos',
  storage_path TEXT NOT NULL,
  thumbnail_bucket TEXT DEFAULT 'thumbnails',
  thumbnail_path TEXT,
  duration_ms INTEGER,
  start_time_ms INTEGER,
  end_time_ms INTEGER,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_video_clips_project_id ON public.video_clips(project_id);
CREATE INDEX IF NOT EXISTS idx_video_clips_user_id ON public.video_clips(user_id);

DROP TRIGGER IF EXISTS video_clips_set_updated_at ON public.video_clips;
CREATE TRIGGER video_clips_set_updated_at
  BEFORE UPDATE ON public.video_clips
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.video_clips ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'video_clips' AND policyname = 'Users manage their video clips'
  ) THEN
    CREATE POLICY "Users manage their video clips"
      ON public.video_clips
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'video_clips' AND policyname = 'Service role manages all video clips'
  ) THEN
    CREATE POLICY "Service role manages all video clips"
      ON public.video_clips
      FOR ALL
      USING ((current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');
  END IF;
END $$;

-- Audio tracks table
CREATE TABLE IF NOT EXISTS public.audio_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'audio',
  storage_path TEXT NOT NULL,
  duration_ms INTEGER,
  start_time_ms INTEGER,
  end_time_ms INTEGER,
  waveform JSONB DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audio_tracks_project_id ON public.audio_tracks(project_id);
CREATE INDEX IF NOT EXISTS idx_audio_tracks_user_id ON public.audio_tracks(user_id);

DROP TRIGGER IF EXISTS audio_tracks_set_updated_at ON public.audio_tracks;
CREATE TRIGGER audio_tracks_set_updated_at
  BEFORE UPDATE ON public.audio_tracks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.audio_tracks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'audio_tracks' AND policyname = 'Users manage their audio tracks'
  ) THEN
    CREATE POLICY "Users manage their audio tracks"
      ON public.audio_tracks
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'audio_tracks' AND policyname = 'Service role manages all audio tracks'
  ) THEN
    CREATE POLICY "Service role manages all audio tracks"
      ON public.audio_tracks
      FOR ALL
      USING ((current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');
  END IF;
END $$;

-- Render jobs table
CREATE TABLE IF NOT EXISTS public.render_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  render_profile TEXT DEFAULT 'default',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  result_bucket TEXT,
  result_path TEXT,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_render_jobs_project_id ON public.render_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_render_jobs_user_id ON public.render_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_render_jobs_status ON public.render_jobs(status);

DROP TRIGGER IF EXISTS render_jobs_set_updated_at ON public.render_jobs;
CREATE TRIGGER render_jobs_set_updated_at
  BEFORE UPDATE ON public.render_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.render_jobs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'render_jobs' AND policyname = 'Users manage their render jobs'
  ) THEN
    CREATE POLICY "Users manage their render jobs"
      ON public.render_jobs
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'render_jobs' AND policyname = 'Service role manages all render jobs'
  ) THEN
    CREATE POLICY "Service role manages all render jobs"
      ON public.render_jobs
      FOR ALL
      USING ((current_setting('request.jwt.claims', true)::json->>'role') = 'service_role');
  END IF;
END $$;

-- Storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies helper
DO $$
DECLARE
  policy_exists BOOLEAN;
BEGIN
  -- Videos bucket policies
  SELECT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Videos bucket access'
  ) INTO policy_exists;
  IF NOT policy_exists THEN
    CREATE POLICY "Videos bucket access"
      ON storage.objects
      FOR ALL
      USING (bucket_id = 'videos' AND (owner = auth.uid() OR (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'))
      WITH CHECK (bucket_id = 'videos' AND (owner = auth.uid() OR (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'));
  END IF;

  -- Audio bucket policies
  SELECT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Audio bucket access'
  ) INTO policy_exists;
  IF NOT policy_exists THEN
    CREATE POLICY "Audio bucket access"
      ON storage.objects
      FOR ALL
      USING (bucket_id = 'audio' AND (owner = auth.uid() OR (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'))
      WITH CHECK (bucket_id = 'audio' AND (owner = auth.uid() OR (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'));
  END IF;

  -- Thumbnails bucket policies
  SELECT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Thumbnails bucket access'
  ) INTO policy_exists;
  IF NOT policy_exists THEN
    CREATE POLICY "Thumbnails bucket access"
      ON storage.objects
      FOR ALL
      USING (bucket_id = 'thumbnails' AND (owner = auth.uid() OR (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'))
      WITH CHECK (bucket_id = 'thumbnails' AND (owner = auth.uid() OR (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'));
  END IF;
END $$;
