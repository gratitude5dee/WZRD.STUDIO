-- Enhanced database schema for comprehensive multimedia system

-- Generation Jobs table for job queue management
CREATE TABLE IF NOT EXISTS public.generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('image', 'video', 'stitch', 'process')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  config JSONB NOT NULL DEFAULT '{}',
  result_url TEXT,
  error_message TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  worker_id TEXT
);

-- Timelines table for video composition
CREATE TABLE IF NOT EXISTS public.timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  composition_data JSONB NOT NULL DEFAULT '{"tracks": [], "effects": [], "transitions": []}',
  duration_ms INTEGER DEFAULT 0,
  resolution TEXT DEFAULT '1920x1080',
  frame_rate INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Render Queue table for background processing
CREATE TABLE IF NOT EXISTS public.render_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timeline_id UUID REFERENCES public.timelines(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  priority INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  worker_id TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  started_at TIMESTAMPTZ,
  estimated_completion TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  result_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.render_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for generation_jobs
CREATE POLICY "Users can create their own generation jobs" 
ON public.generation_jobs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own generation jobs" 
ON public.generation_jobs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own generation jobs" 
ON public.generation_jobs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all generation jobs" 
ON public.generation_jobs 
FOR ALL 
USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- RLS Policies for timelines
CREATE POLICY "Users can create their own timelines" 
ON public.timelines 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own timelines" 
ON public.timelines 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own timelines" 
ON public.timelines 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timelines" 
ON public.timelines 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for render_queue
CREATE POLICY "Users can create their own render jobs" 
ON public.render_queue 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own render jobs" 
ON public.render_queue 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all render jobs" 
ON public.render_queue 
FOR ALL 
USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_generation_jobs_user_id ON public.generation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_status ON public.generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_created_at ON public.generation_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_timelines_user_id ON public.timelines(user_id);
CREATE INDEX IF NOT EXISTS idx_timelines_project_id ON public.timelines(project_id);
CREATE INDEX IF NOT EXISTS idx_render_queue_status ON public.render_queue(status);
CREATE INDEX IF NOT EXISTS idx_render_queue_priority ON public.render_queue(priority DESC);

-- Trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_timeline_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_timelines_updated_at
  BEFORE UPDATE ON public.timelines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timeline_timestamp();