-- Drop existing table if it exists
DROP TABLE IF EXISTS public.generations CASCADE;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_generation_timestamps() CASCADE;

-- Create generations table for tracking AI generation history
CREATE TABLE public.generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  canvas_id TEXT,
  object_id TEXT,
  
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  model TEXT NOT NULL,
  lora_url TEXT,
  
  input_image_url TEXT,
  output_image_url TEXT,
  
  settings JSONB DEFAULT '{}'::jsonb,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error TEXT,
  
  generation_time_ms INTEGER,
  cost_credits NUMERIC(10, 2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_generations_user_id ON public.generations(user_id);
CREATE INDEX idx_generations_canvas_id ON public.generations(canvas_id);
CREATE INDEX idx_generations_status ON public.generations(status);
CREATE INDEX idx_generations_created_at ON public.generations(created_at DESC);

-- Enable RLS
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own generations"
  ON public.generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generations"
  ON public.generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generations"
  ON public.generations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generations"
  ON public.generations FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE FUNCTION update_generation_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER update_generations_timestamp
  BEFORE UPDATE ON public.generations
  FOR EACH ROW
  EXECUTE FUNCTION update_generation_timestamps();