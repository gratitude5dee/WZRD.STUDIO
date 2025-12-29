-- Create character_scene_appearances table for clothing data
CREATE TABLE IF NOT EXISTS character_scene_appearances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  clothing_prompt TEXT,
  clothing_reference_images TEXT[],
  accessories TEXT[],
  hair_style TEXT,
  makeup_description TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(character_id, scene_id)
);

-- Create scene_objects table for props/objects
CREATE TABLE IF NOT EXISTS scene_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  prompt_context TEXT,
  reference_images TEXT[],
  importance_level TEXT DEFAULT 'background',
  position_hint TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add location_details and enabled_sections columns to scenes table
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS location_details JSONB DEFAULT '{}';
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS location_prompt_context TEXT;
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS enabled_sections JSONB DEFAULT '{"clothing": true, "objects": false, "sound": true}';

-- Enable RLS on new tables
ALTER TABLE character_scene_appearances ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_objects ENABLE ROW LEVEL SECURITY;

-- RLS policy for character_scene_appearances
CREATE POLICY "Users can manage their character appearances"
  ON character_scene_appearances
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM scenes s
      JOIN projects p ON s.project_id = p.id
      WHERE s.id = character_scene_appearances.scene_id
      AND p.user_id = auth.uid()
    )
  );

-- RLS policy for scene_objects
CREATE POLICY "Users can manage their scene objects"
  ON scene_objects
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM scenes s
      JOIN projects p ON s.project_id = p.id
      WHERE s.id = scene_objects.scene_id
      AND p.user_id = auth.uid()
    )
  );