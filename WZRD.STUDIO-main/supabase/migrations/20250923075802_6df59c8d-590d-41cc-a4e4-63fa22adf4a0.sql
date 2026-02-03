-- Add video generation columns to shots table
ALTER TABLE public.shots 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS video_status TEXT DEFAULT 'pending' CHECK (video_status IN ('pending', 'generating', 'completed', 'failed'));