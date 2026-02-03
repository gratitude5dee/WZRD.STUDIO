-- Create video_clips table
CREATE TABLE IF NOT EXISTS public.video_clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('video', 'image')),
  storage_bucket TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  duration_ms INTEGER,
  start_time_ms INTEGER DEFAULT 0,
  end_time_ms INTEGER,
  layer INTEGER DEFAULT 0,
  transforms JSONB DEFAULT '{"position": {"x": 0, "y": 0}, "scale": {"x": 1, "y": 1}, "rotation": 0, "opacity": 1}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  thumbnail_bucket TEXT,
  thumbnail_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create audio_tracks table
CREATE TABLE IF NOT EXISTS public.audio_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  storage_bucket TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  duration_ms INTEGER,
  start_time_ms INTEGER DEFAULT 0,
  end_time_ms INTEGER,
  volume DECIMAL(3,2) DEFAULT 1.0 CHECK (volume >= 0 AND volume <= 1),
  is_muted BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_video_clips_project_id ON public.video_clips(project_id);
CREATE INDEX idx_video_clips_user_id ON public.video_clips(user_id);
CREATE INDEX idx_audio_tracks_project_id ON public.audio_tracks(project_id);
CREATE INDEX idx_audio_tracks_user_id ON public.audio_tracks(user_id);

-- Enable RLS
ALTER TABLE public.video_clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_tracks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for video_clips
CREATE POLICY "Users can view their own video clips"
ON public.video_clips FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own video clips"
ON public.video_clips FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video clips"
ON public.video_clips FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video clips"
ON public.video_clips FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for audio_tracks
CREATE POLICY "Users can view their own audio tracks"
ON public.audio_tracks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audio tracks"
ON public.audio_tracks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audio tracks"
ON public.audio_tracks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audio tracks"
ON public.audio_tracks FOR DELETE
USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_video_clips_updated_at
  BEFORE UPDATE ON public.video_clips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_audio_tracks_updated_at
  BEFORE UPDATE ON public.audio_tracks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();