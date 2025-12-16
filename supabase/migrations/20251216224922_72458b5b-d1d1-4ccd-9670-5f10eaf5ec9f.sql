-- Node definitions table
CREATE TABLE IF NOT EXISTS public.compute_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Node identity
  kind TEXT NOT NULL CHECK (kind IN ('Image', 'Text', 'Video', 'Prompt', 'Model', 'Transform', 'Output', 'Gateway')),
  label TEXT NOT NULL DEFAULT 'Untitled Node',
  version TEXT NOT NULL DEFAULT '1.0.0',
  
  -- Position & size
  position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0}'::jsonb,
  size JSONB DEFAULT '{"w": 420, "h": 300}'::jsonb,
  
  -- Port definitions
  inputs JSONB NOT NULL DEFAULT '[]'::jsonb,
  outputs JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Parameters & state
  params JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  preview JSONB DEFAULT NULL,
  
  -- Execution state
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'queued', 'running', 'succeeded', 'failed', 'canceled', 'dirty')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  error TEXT DEFAULT NULL,
  is_dirty BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Edge definitions table
CREATE TABLE IF NOT EXISTS public.compute_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  
  -- Connection definition
  source_node_id UUID NOT NULL REFERENCES public.compute_nodes(id) ON DELETE CASCADE,
  source_port_id TEXT NOT NULL,
  target_node_id UUID NOT NULL REFERENCES public.compute_nodes(id) ON DELETE CASCADE,
  target_port_id TEXT NOT NULL,
  
  -- Data type for validation
  data_type TEXT NOT NULL DEFAULT 'any' CHECK (data_type IN ('image', 'text', 'video', 'tensor', 'json', 'audio', 'any')),
  
  -- Edge state
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'running', 'succeeded', 'error')),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate connections
  UNIQUE(source_node_id, source_port_id, target_node_id, target_port_id)
);

-- Workflow execution runs
CREATE TABLE IF NOT EXISTS public.compute_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Run state
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'canceled')),
  execution_order JSONB DEFAULT '[]'::jsonb,
  
  -- Timing
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  
  -- Results
  outputs JSONB DEFAULT '{}'::jsonb,
  logs JSONB DEFAULT '[]'::jsonb,
  error TEXT DEFAULT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Run events for real-time updates
CREATE TABLE IF NOT EXISTS public.compute_run_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.compute_runs(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES public.compute_nodes(id) ON DELETE CASCADE,
  
  status TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  message TEXT,
  artifacts JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_compute_nodes_project ON public.compute_nodes(project_id);
CREATE INDEX IF NOT EXISTS idx_compute_nodes_status ON public.compute_nodes(status);
CREATE INDEX IF NOT EXISTS idx_compute_edges_project ON public.compute_edges(project_id);
CREATE INDEX IF NOT EXISTS idx_compute_edges_source ON public.compute_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_compute_edges_target ON public.compute_edges(target_node_id);
CREATE INDEX IF NOT EXISTS idx_compute_runs_project ON public.compute_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_compute_runs_status ON public.compute_runs(status);

-- Enable RLS
ALTER TABLE public.compute_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compute_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compute_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compute_run_events ENABLE ROW LEVEL SECURITY;

-- Compute nodes policies
CREATE POLICY "Users can view own nodes" ON public.compute_nodes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create nodes" ON public.compute_nodes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nodes" ON public.compute_nodes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nodes" ON public.compute_nodes
  FOR DELETE USING (auth.uid() = user_id);

-- Compute edges policies
CREATE POLICY "Users can manage edges in own projects" ON public.compute_edges
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

-- Compute runs policies
CREATE POLICY "Users can manage own runs" ON public.compute_runs
  FOR ALL USING (auth.uid() = user_id);

-- Run events policies
CREATE POLICY "Users can view run events" ON public.compute_run_events
  FOR SELECT USING (
    run_id IN (SELECT id FROM public.compute_runs WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create run events" ON public.compute_run_events
  FOR INSERT WITH CHECK (
    run_id IN (SELECT id FROM public.compute_runs WHERE user_id = auth.uid())
  );

-- Updated_at triggers
CREATE TRIGGER update_compute_nodes_updated_at
  BEFORE UPDATE ON public.compute_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compute_edges_updated_at
  BEFORE UPDATE ON public.compute_edges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();