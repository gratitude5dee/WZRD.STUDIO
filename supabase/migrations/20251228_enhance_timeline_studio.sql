-- Timeline & Studio Enhancement Migrations
-- Created: 2025-12-28

-- ============================================================================
-- PART 1: LOCATION & SCENE ENHANCEMENTS
-- ============================================================================

-- Add location details to scenes table
ALTER TABLE scenes
ADD COLUMN IF NOT EXISTS location_details JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS location_prompt_context TEXT,
ADD COLUMN IF NOT EXISTS enabled_sections JSONB DEFAULT '{"clothing": true, "objects": false, "sound": true}'::jsonb;

COMMENT ON COLUMN scenes.location_details IS 'Detailed location metadata: time_of_day, weather, atmosphere, etc.';
COMMENT ON COLUMN scenes.location_prompt_context IS 'Generated prompt context from location details';
COMMENT ON COLUMN scenes.enabled_sections IS 'Toggle which sidebar sections are active for this scene';

-- ============================================================================
-- PART 2: CHARACTER CLOTHING & APPEARANCE
-- ============================================================================

-- Create table for character appearances per scene
CREATE TABLE IF NOT EXISTS character_scene_appearances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  clothing_prompt TEXT,
  clothing_reference_images TEXT[] DEFAULT ARRAY[]::TEXT[],
  accessories TEXT[] DEFAULT ARRAY[]::TEXT[],
  hair_style TEXT,
  makeup_description TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(character_id, scene_id)
);

COMMENT ON TABLE character_scene_appearances IS 'Character clothing and appearance details per scene';

-- Add RLS policies
ALTER TABLE character_scene_appearances ENABLE ROW LEVEL SECURITY;

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

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_character_scene_appearances_scene
  ON character_scene_appearances(scene_id);
CREATE INDEX IF NOT EXISTS idx_character_scene_appearances_character
  ON character_scene_appearances(character_id);

-- ============================================================================
-- PART 3: OBJECT/SUBJECT REFERENCES
-- ============================================================================

-- Create table for scene objects/props
CREATE TABLE IF NOT EXISTS scene_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  prompt_context TEXT,
  reference_images TEXT[] DEFAULT ARRAY[]::TEXT[],
  importance_level TEXT DEFAULT 'background' CHECK (importance_level IN ('hero', 'featured', 'background')),
  position_hint TEXT DEFAULT 'center',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE scene_objects IS 'Props, vehicles, and key objects for scene composition';
COMMENT ON COLUMN scene_objects.importance_level IS 'Hero = main focus, Featured = notable, Background = set dressing';
COMMENT ON COLUMN scene_objects.position_hint IS 'Composition hint: foreground, midground, background, left, right, center';

-- Add RLS policies
ALTER TABLE scene_objects ENABLE ROW LEVEL SECURITY;

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

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_scene_objects_scene
  ON scene_objects(scene_id);

-- ============================================================================
-- PART 4: SHOT IMAGE ENHANCEMENTS
-- ============================================================================

-- Add image edit/upscale tracking to shots
ALTER TABLE shots
ADD COLUMN IF NOT EXISTS image_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS upscale_status TEXT,
ADD COLUMN IF NOT EXISTS upscaled_image_url TEXT;

COMMENT ON COLUMN shots.image_history IS 'Array of previous image versions with metadata';
COMMENT ON COLUMN shots.upscale_status IS 'Status of upscale operation: pending, processing, ready, failed';
COMMENT ON COLUMN shots.upscaled_image_url IS 'URL of 2x upscaled image';

-- ============================================================================
-- PART 5: AUDIO & SOUND SYSTEM
-- ============================================================================

-- Create table for scene audio tracks
CREATE TABLE IF NOT EXISTS scene_audio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  audio_type TEXT NOT NULL CHECK (audio_type IN ('voiceover', 'sfx', 'music')),
  name TEXT,
  prompt TEXT,
  audio_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'ready', 'failed')),
  duration_seconds NUMERIC,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE scene_audio IS 'Audio tracks (voiceovers, SFX, music) for scenes';

-- Add RLS policies
ALTER TABLE scene_audio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their scene audio"
  ON scene_audio
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM scenes s
      JOIN projects p ON s.project_id = p.id
      WHERE s.id = scene_audio.scene_id
      AND p.user_id = auth.uid()
    )
  );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_scene_audio_scene
  ON scene_audio(scene_id);
CREATE INDEX IF NOT EXISTS idx_scene_audio_type
  ON scene_audio(audio_type);

-- Add ElevenLabs voice ID to characters
ALTER TABLE characters
ADD COLUMN IF NOT EXISTS elevenlabs_voice_id TEXT,
ADD COLUMN IF NOT EXISTS voice_settings JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN characters.elevenlabs_voice_id IS 'Selected ElevenLabs voice ID for this character';

-- ============================================================================
-- PART 6: STUDIO CANVAS ENHANCEMENTS
-- ============================================================================

-- Create table for canvas node connections
CREATE TABLE IF NOT EXISTS canvas_node_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  source_node_id TEXT NOT NULL,
  target_node_id TEXT NOT NULL,
  source_handle TEXT DEFAULT 'output',
  target_handle TEXT DEFAULT 'input',
  connection_type TEXT DEFAULT 'data',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, source_node_id, target_node_id, source_handle, target_handle)
);

COMMENT ON TABLE canvas_node_connections IS 'Node-to-node connections in Studio canvas';

-- Add RLS policies
ALTER TABLE canvas_node_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their canvas connections"
  ON canvas_node_connections
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = canvas_node_connections.project_id
      AND p.user_id = auth.uid()
    )
  );

-- ============================================================================
-- PART 7: REALTIME SUBSCRIPTIONS
-- ============================================================================

-- Enable realtime for new tables
ALTER TABLE character_scene_appearances REPLICA IDENTITY FULL;
ALTER TABLE scene_objects REPLICA IDENTITY FULL;
ALTER TABLE scene_audio REPLICA IDENTITY FULL;
ALTER TABLE canvas_node_connections REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE character_scene_appearances;
ALTER PUBLICATION supabase_realtime ADD TABLE scene_objects;
ALTER PUBLICATION supabase_realtime ADD TABLE scene_audio;
ALTER PUBLICATION supabase_realtime ADD TABLE canvas_node_connections;

-- ============================================================================
-- PART 8: HELPER FUNCTIONS
-- ============================================================================

-- Function to build location prompt context
CREATE OR REPLACE FUNCTION build_location_prompt_context(scene_id_param UUID)
RETURNS TEXT AS $$
DECLARE
  location_data JSONB;
  prompt_parts TEXT[];
  result TEXT;
BEGIN
  SELECT location_details INTO location_data
  FROM scenes
  WHERE id = scene_id_param;

  IF location_data IS NULL OR location_data = '{}'::jsonb THEN
    RETURN NULL;
  END IF;

  prompt_parts := ARRAY[]::TEXT[];

  IF location_data->>'name' IS NOT NULL THEN
    prompt_parts := array_append(prompt_parts, location_data->>'name');
  END IF;

  IF location_data->>'time_of_day' IS NOT NULL THEN
    prompt_parts := array_append(prompt_parts, (location_data->>'time_of_day') || ' lighting');
  END IF;

  IF location_data->>'weather' IS NOT NULL THEN
    prompt_parts := array_append(prompt_parts, (location_data->>'weather') || ' weather');
  END IF;

  IF location_data->>'atmosphere' IS NOT NULL THEN
    prompt_parts := array_append(prompt_parts, location_data->>'atmosphere');
  END IF;

  result := array_to_string(prompt_parts, ', ');

  -- Update the scene with generated context
  UPDATE scenes
  SET location_prompt_context = result
  WHERE id = scene_id_param;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION build_location_prompt_context IS 'Generates prompt context from location_details JSON';

-- ============================================================================
-- PART 9: TRIGGERS FOR AUTO-UPDATES
-- ============================================================================

-- Trigger to auto-generate location prompt context when location_details changes
CREATE OR REPLACE FUNCTION update_location_prompt_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.location_details IS DISTINCT FROM OLD.location_details THEN
    NEW.location_prompt_context := build_location_prompt_context(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_location_prompt ON scenes;
CREATE TRIGGER trigger_update_location_prompt
  BEFORE UPDATE ON scenes
  FOR EACH ROW
  EXECUTE FUNCTION update_location_prompt_trigger();

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_character_scene_appearances_updated_at ON character_scene_appearances;
CREATE TRIGGER trigger_character_scene_appearances_updated_at
  BEFORE UPDATE ON character_scene_appearances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_scene_objects_updated_at ON scene_objects;
CREATE TRIGGER trigger_scene_objects_updated_at
  BEFORE UPDATE ON scene_objects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_scene_audio_updated_at ON scene_audio;
CREATE TRIGGER trigger_scene_audio_updated_at
  BEFORE UPDATE ON scene_audio
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
