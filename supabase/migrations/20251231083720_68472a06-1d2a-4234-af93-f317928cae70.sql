-- Create project_settings table
CREATE TABLE IF NOT EXISTS project_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
  base_text_model TEXT DEFAULT 'gpt-4o',
  base_image_model TEXT DEFAULT 'flux-2-turbo',
  base_video_model TEXT DEFAULT 'minimax-video-01',
  base_audio_model TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE project_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their project settings" ON project_settings
  FOR ALL USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));