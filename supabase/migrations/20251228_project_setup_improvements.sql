-- Migration: Project Setup Improvements
-- Adds format types, voice selection, and ensures style reference support

-- 1. Update format column to support new types
ALTER TABLE public.projects
  ALTER COLUMN format SET DEFAULT 'custom';

-- Add constraint for format values (if not exists)
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

-- 2. Add voiceover selection fields
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS voiceover_id TEXT,
  ADD COLUMN IF NOT EXISTS voiceover_name TEXT,
  ADD COLUMN IF NOT EXISTS voiceover_preview_url TEXT;

-- 3. Add format-specific data as JSONB columns
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS ad_brief_data JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS music_video_data JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS infotainment_data JSONB DEFAULT '{}';

-- 4. Ensure style_reference_asset_id exists with proper FK
CREATE INDEX IF NOT EXISTS idx_projects_style_reference
  ON public.projects(style_reference_asset_id);

-- 5. Add updated_at trigger if not exists
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

-- 6. Add style_reference_url to characters table for style propagation
ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS style_applied BOOLEAN DEFAULT FALSE;

-- 7. Add style_reference_used to shots table
ALTER TABLE public.shots
  ADD COLUMN IF NOT EXISTS style_reference_used BOOLEAN DEFAULT FALSE;

-- Comments for documentation
COMMENT ON COLUMN public.projects.format IS 'Project format: custom, short_film, commercial, music_video, infotainment';
COMMENT ON COLUMN public.projects.voiceover_id IS 'ElevenLabs voice ID for project narration';
COMMENT ON COLUMN public.projects.ad_brief_data IS 'Commercial/Ad-specific brief data (AdCP standards)';
COMMENT ON COLUMN public.projects.music_video_data IS 'Music video-specific metadata';
COMMENT ON COLUMN public.projects.infotainment_data IS 'Infotainment-specific configuration';
