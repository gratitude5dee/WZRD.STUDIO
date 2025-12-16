-- Add image_progress column to shots table for real-time progress tracking
ALTER TABLE public.shots ADD COLUMN IF NOT EXISTS image_progress integer DEFAULT 0;

-- Enable realtime for shots table if not already enabled
ALTER PUBLICATION supabase_realtime ADD TABLE shots;