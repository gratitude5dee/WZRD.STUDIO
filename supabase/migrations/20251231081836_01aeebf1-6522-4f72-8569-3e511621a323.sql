-- Add missing columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT true;

-- Create project_share_links table
CREATE TABLE IF NOT EXISTS project_share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  access_level TEXT NOT NULL DEFAULT 'view',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE project_share_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their project share links" ON project_share_links
  FOR ALL USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Create project_assets table
CREATE TABLE IF NOT EXISTS project_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  type TEXT NOT NULL,
  size INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE project_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their project assets" ON project_assets
  FOR ALL USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Create generation_outputs table
CREATE TABLE IF NOT EXISTS generation_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  prompt TEXT,
  output_url TEXT,
  thumbnail_url TEXT,
  output_type TEXT,
  model TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE generation_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their generation outputs" ON generation_outputs
  FOR ALL USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Create saved_flows table
CREATE TABLE IF NOT EXISTS saved_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  node_count INTEGER DEFAULT 0,
  edge_count INTEGER DEFAULT 0,
  flow_data JSONB,
  is_template BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE saved_flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their saved flows" ON saved_flows
  FOR ALL USING (user_id = auth.uid());