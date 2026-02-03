-- Add falai_jobs table for tracking Fal.AI executions
CREATE TABLE IF NOT EXISTS public.falai_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  project_id UUID REFERENCES public.projects(id),
  request_id TEXT UNIQUE,
  model_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  inputs JSONB NOT NULL,
  output JSONB,
  error TEXT,
  source TEXT CHECK (source IN ('node-editor', 'storyboard', 'timeline')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Add falai_job_updates table for real-time updates
CREATE TABLE IF NOT EXISTS public.falai_job_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id TEXT NOT NULL,
  status TEXT NOT NULL,
  output JSONB,
  error TEXT,
  progress INTEGER CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on falai tables
ALTER TABLE public.falai_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.falai_job_updates ENABLE ROW LEVEL SECURITY;

-- RLS policies for falai_jobs
CREATE POLICY "Users can view their own fal.ai jobs" ON public.falai_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own fal.ai jobs" ON public.falai_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fal.ai jobs" ON public.falai_jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for falai_job_updates  
CREATE POLICY "Users can view their fal.ai job updates" ON public.falai_job_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.falai_jobs 
      WHERE falai_jobs.request_id = falai_job_updates.request_id 
      AND falai_jobs.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_falai_jobs_user_id ON public.falai_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_falai_jobs_request_id ON public.falai_jobs(request_id);
CREATE INDEX IF NOT EXISTS idx_falai_jobs_status ON public.falai_jobs(status);
CREATE INDEX IF NOT EXISTS idx_falai_job_updates_request_id ON public.falai_job_updates(request_id);