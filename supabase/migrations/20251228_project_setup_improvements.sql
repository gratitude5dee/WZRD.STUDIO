-- Migration: Project Setup Improvements
-- Adds format types, voice selection, and ensures style reference support

ALTER TABLE public.projects
  ALTER COLUMN format SET DEFAULT 'custom';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'projects_format_check'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT projects_format_check
      CHECK (format IN ('custom', 'short_film', 'commercial', 'music_video', 'infotainment'));
  END IF;
END $$;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS voiceover_id TEXT,
  ADD COLUMN IF NOT EXISTS voiceover_name TEXT,
  ADD COLUMN IF NOT EXISTS voiceover_preview_url TEXT;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS ad_brief_data JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS music_video_data JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS infotainment_data JSONB DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_projects_style_reference
  ON public.projects(style_reference_asset_id);

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS style_applied BOOLEAN DEFAULT FALSE;

ALTER TABLE public.shots
  ADD COLUMN IF NOT EXISTS style_reference_used BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.projects.format IS 'Project format: custom, short_film, commercial, music_video, infotainment';
COMMENT ON COLUMN public.projects.voiceover_id IS 'ElevenLabs voice ID for project narration';
COMMENT ON COLUMN public.projects.ad_brief_data IS 'Commercial/Ad-specific brief data (AdCP standards)';
COMMENT ON COLUMN public.projects.music_video_data IS 'Music video-specific metadata';
COMMENT ON COLUMN public.projects.infotainment_data IS 'Infotainment-specific configuration';
