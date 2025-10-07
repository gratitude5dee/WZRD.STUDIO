-- Add status tracking columns to storylines table
ALTER TABLE storylines 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'complete', 'failed'));

ALTER TABLE storylines 
ADD COLUMN IF NOT EXISTS failure_reason TEXT;

-- Enable Realtime for affected tables with full row data
ALTER TABLE storylines REPLICA IDENTITY FULL;
ALTER TABLE scenes REPLICA IDENTITY FULL;
ALTER TABLE characters REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE storylines;
ALTER PUBLICATION supabase_realtime ADD TABLE scenes;
ALTER PUBLICATION supabase_realtime ADD TABLE characters;