-- Canvas Projects table
CREATE TABLE canvas_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  viewport JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "scale": 1}',
  settings JSONB NOT NULL DEFAULT '{"width": 1920, "height": 1080, "backgroundColor": "#0A0A0A", "fps": 30}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Canvas Objects table (for each layer/element)
CREATE TABLE canvas_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  object_type TEXT NOT NULL CHECK (object_type IN ('image', 'video', 'text', 'shape')),
  layer_index INTEGER NOT NULL,
  transform JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "scaleX": 1, "scaleY": 1, "rotation": 0}',
  visibility BOOLEAN NOT NULL DEFAULT true,
  locked BOOLEAN NOT NULL DEFAULT false,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Canvas Assets table (for uploaded files)
CREATE TABLE canvas_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('image', 'video', 'audio')),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Timeline Nodes table
CREATE TABLE canvas_timeline_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  node_type TEXT NOT NULL,
  position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0}',
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Timeline Edges table
CREATE TABLE canvas_timeline_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES canvas_timeline_nodes(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES canvas_timeline_nodes(id) ON DELETE CASCADE,
  edge_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_canvas_objects_project_id ON canvas_objects(project_id);
CREATE INDEX idx_canvas_objects_layer_index ON canvas_objects(layer_index);
CREATE INDEX idx_canvas_assets_project_id ON canvas_assets(project_id);
CREATE INDEX idx_canvas_timeline_nodes_project_id ON canvas_timeline_nodes(project_id);
CREATE INDEX idx_canvas_timeline_edges_project_id ON canvas_timeline_edges(project_id);

-- Enable RLS
ALTER TABLE canvas_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_timeline_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_timeline_edges ENABLE ROW LEVEL SECURITY;

-- Projects: Users can only access their own projects
CREATE POLICY "Users can view own projects" ON canvas_projects
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON canvas_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON canvas_projects
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON canvas_projects
  FOR DELETE USING (auth.uid() = user_id);

-- Objects: Access based on project ownership
CREATE POLICY "Users can view objects in own projects" ON canvas_objects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM canvas_projects 
      WHERE canvas_projects.id = canvas_objects.project_id 
      AND canvas_projects.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert objects in own projects" ON canvas_objects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM canvas_projects 
      WHERE canvas_projects.id = canvas_objects.project_id 
      AND canvas_projects.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update objects in own projects" ON canvas_objects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM canvas_projects 
      WHERE canvas_projects.id = canvas_objects.project_id 
      AND canvas_projects.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete objects in own projects" ON canvas_objects
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM canvas_projects 
      WHERE canvas_projects.id = canvas_objects.project_id 
      AND canvas_projects.user_id = auth.uid()
    )
  );

-- Assets: Users can only access their own assets
CREATE POLICY "Users can view assets in own projects" ON canvas_assets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert assets in own projects" ON canvas_assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete assets in own projects" ON canvas_assets
  FOR DELETE USING (auth.uid() = user_id);

-- Timeline nodes: Access based on project ownership
CREATE POLICY "Users can manage timeline nodes" ON canvas_timeline_nodes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM canvas_projects 
      WHERE canvas_projects.id = canvas_timeline_nodes.project_id 
      AND canvas_projects.user_id = auth.uid()
    )
  );

-- Timeline edges: Access based on project ownership
CREATE POLICY "Users can manage timeline edges" ON canvas_timeline_edges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM canvas_projects 
      WHERE canvas_projects.id = canvas_timeline_edges.project_id 
      AND canvas_projects.user_id = auth.uid()
    )
  );

-- Create canvas storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('canvas', 'canvas', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for canvas bucket
CREATE POLICY "Users can upload to own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'canvas' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view canvas assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'canvas');

CREATE POLICY "Users can delete own canvas assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'canvas' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_canvas_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_canvas_projects_timestamp
  BEFORE UPDATE ON canvas_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_canvas_timestamp();

CREATE TRIGGER update_canvas_objects_timestamp
  BEFORE UPDATE ON canvas_objects
  FOR EACH ROW
  EXECUTE FUNCTION update_canvas_timestamp();