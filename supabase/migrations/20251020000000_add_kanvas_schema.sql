-- Kanvas Schema Migration
-- Creates tables for Infinite Kanvas integration

-- Canvas Projects Table
CREATE TABLE IF NOT EXISTS canvas_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  canvas_state JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{
    "width": 1920,
    "height": 1080,
    "backgroundColor": "#0A0A0A",
    "fps": 30
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canvas Layers Table
CREATE TABLE IF NOT EXISTS canvas_layers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES canvas_projects(id) ON DELETE CASCADE NOT NULL,
  layer_index INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'text', 'shape')),
  data JSONB NOT NULL,
  transform JSONB DEFAULT '{
    "x": 0,
    "y": 0,
    "scaleX": 1,
    "scaleY": 1,
    "rotation": 0
  }'::jsonb,
  visibility BOOLEAN DEFAULT TRUE,
  locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canvas Assets Table
CREATE TABLE IF NOT EXISTS canvas_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES canvas_projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio')),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timeline Nodes Table
CREATE TABLE IF NOT EXISTS timeline_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES canvas_projects(id) ON DELETE CASCADE NOT NULL,
  node_type TEXT NOT NULL,
  position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0}'::jsonb,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timeline Edges Table
CREATE TABLE IF NOT EXISTS timeline_edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES canvas_projects(id) ON DELETE CASCADE NOT NULL,
  source_id UUID REFERENCES timeline_nodes(id) ON DELETE CASCADE,
  target_id UUID REFERENCES timeline_nodes(id) ON DELETE CASCADE,
  edge_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_canvas_projects_user_id ON canvas_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_layers_project_id ON canvas_layers(project_id);
CREATE INDEX IF NOT EXISTS idx_canvas_layers_layer_index ON canvas_layers(layer_index);
CREATE INDEX IF NOT EXISTS idx_canvas_assets_project_id ON canvas_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_canvas_assets_user_id ON canvas_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_nodes_project_id ON timeline_nodes(project_id);
CREATE INDEX IF NOT EXISTS idx_timeline_edges_project_id ON timeline_edges(project_id);

-- Enable Row Level Security
ALTER TABLE canvas_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_edges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for canvas_projects
CREATE POLICY "Users can view their own canvas projects"
  ON canvas_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own canvas projects"
  ON canvas_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own canvas projects"
  ON canvas_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own canvas projects"
  ON canvas_projects FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for canvas_layers
CREATE POLICY "Users can view layers in their projects"
  ON canvas_layers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM canvas_projects
      WHERE canvas_projects.id = canvas_layers.project_id
      AND canvas_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create layers in their projects"
  ON canvas_layers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM canvas_projects
      WHERE canvas_projects.id = canvas_layers.project_id
      AND canvas_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update layers in their projects"
  ON canvas_layers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM canvas_projects
      WHERE canvas_projects.id = canvas_layers.project_id
      AND canvas_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete layers in their projects"
  ON canvas_layers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM canvas_projects
      WHERE canvas_projects.id = canvas_layers.project_id
      AND canvas_projects.user_id = auth.uid()
    )
  );

-- RLS Policies for canvas_assets
CREATE POLICY "Users can view assets in their projects"
  ON canvas_assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create assets in their projects"
  ON canvas_assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their assets"
  ON canvas_assets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their assets"
  ON canvas_assets FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for timeline_nodes
CREATE POLICY "Users can view timeline nodes in their projects"
  ON timeline_nodes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM canvas_projects
      WHERE canvas_projects.id = timeline_nodes.project_id
      AND canvas_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create timeline nodes in their projects"
  ON timeline_nodes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM canvas_projects
      WHERE canvas_projects.id = timeline_nodes.project_id
      AND canvas_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update timeline nodes in their projects"
  ON timeline_nodes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM canvas_projects
      WHERE canvas_projects.id = timeline_nodes.project_id
      AND canvas_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete timeline nodes in their projects"
  ON timeline_nodes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM canvas_projects
      WHERE canvas_projects.id = timeline_nodes.project_id
      AND canvas_projects.user_id = auth.uid()
    )
  );

-- RLS Policies for timeline_edges
CREATE POLICY "Users can view timeline edges in their projects"
  ON timeline_edges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM canvas_projects
      WHERE canvas_projects.id = timeline_edges.project_id
      AND canvas_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create timeline edges in their projects"
  ON timeline_edges FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM canvas_projects
      WHERE canvas_projects.id = timeline_edges.project_id
      AND canvas_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update timeline edges in their projects"
  ON timeline_edges FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM canvas_projects
      WHERE canvas_projects.id = timeline_edges.project_id
      AND canvas_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete timeline edges in their projects"
  ON timeline_edges FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM canvas_projects
      WHERE canvas_projects.id = timeline_edges.project_id
      AND canvas_projects.user_id = auth.uid()
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_canvas_projects_updated_at
  BEFORE UPDATE ON canvas_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_layers_updated_at
  BEFORE UPDATE ON canvas_layers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
