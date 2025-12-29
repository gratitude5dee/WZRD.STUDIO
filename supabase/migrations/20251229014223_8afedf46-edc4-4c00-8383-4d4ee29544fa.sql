-- Add voiceover selection fields to projects table
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS voiceover_id TEXT,
  ADD COLUMN IF NOT EXISTS voiceover_name TEXT,
  ADD COLUMN IF NOT EXISTS voiceover_preview_url TEXT;

-- Add format-specific data as JSONB columns
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS ad_brief_data JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS music_video_data JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS infotainment_data JSONB DEFAULT '{}';