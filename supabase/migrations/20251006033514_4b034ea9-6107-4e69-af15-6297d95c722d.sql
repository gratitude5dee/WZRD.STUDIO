-- Create studio_blocks table for persisting canvas blocks
CREATE TABLE public.studio_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  block_type TEXT NOT NULL CHECK (block_type IN ('text', 'image', 'video')),
  position_x NUMERIC NOT NULL,
  position_y NUMERIC NOT NULL,
  prompt TEXT,
  generated_output_url TEXT,
  generation_metadata JSONB DEFAULT '{}'::jsonb,
  selected_model TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create canvas_state table for persisting viewport and settings
CREATE TABLE public.canvas_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  viewport_data JSONB DEFAULT '{"x": 0, "y": 0, "zoom": 1}'::jsonb,
  canvas_settings JSONB DEFAULT '{"showGrid": true}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.studio_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canvas_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies for studio_blocks
CREATE POLICY "Users can view their own studio blocks"
  ON public.studio_blocks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own studio blocks"
  ON public.studio_blocks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own studio blocks"
  ON public.studio_blocks
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own studio blocks"
  ON public.studio_blocks
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for canvas_state
CREATE POLICY "Users can view their own canvas state"
  ON public.canvas_state
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own canvas state"
  ON public.canvas_state
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own canvas state"
  ON public.canvas_state
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own canvas state"
  ON public.canvas_state
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_studio_blocks_project_id ON public.studio_blocks(project_id);
CREATE INDEX idx_studio_blocks_user_id ON public.studio_blocks(user_id);
CREATE INDEX idx_canvas_state_project_id ON public.canvas_state(project_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_studio_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_studio_blocks_timestamp
  BEFORE UPDATE ON public.studio_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_studio_timestamp();

CREATE TRIGGER update_canvas_state_timestamp
  BEFORE UPDATE ON public.canvas_state
  FOR EACH ROW
  EXECUTE FUNCTION public.update_studio_timestamp();