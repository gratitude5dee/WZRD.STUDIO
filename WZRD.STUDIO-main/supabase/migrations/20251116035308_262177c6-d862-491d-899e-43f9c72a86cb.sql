-- Enable realtime on canvas_objects table
ALTER PUBLICATION supabase_realtime ADD TABLE canvas_objects;

-- Ensure canvas_objects table has proper structure for realtime
ALTER TABLE canvas_objects REPLICA IDENTITY FULL;

-- Create index for better realtime performance
CREATE INDEX IF NOT EXISTS idx_canvas_objects_project_updated 
ON canvas_objects(project_id, updated_at DESC);