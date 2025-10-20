-- Create execution_runs table to track workflow executions
CREATE TABLE IF NOT EXISTS public.execution_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'failed', 'canceled')),
  total_nodes INTEGER NOT NULL DEFAULT 0,
  completed_nodes INTEGER NOT NULL DEFAULT 0,
  execution_order JSONB,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finished_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create execution_node_status table to track individual node execution
CREATE TABLE IF NOT EXISTS public.execution_node_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.execution_runs(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('idle', 'queued', 'generating', 'complete', 'error')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  outputs JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(run_id, node_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_execution_runs_project ON public.execution_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_execution_runs_status ON public.execution_runs(status);
CREATE INDEX IF NOT EXISTS idx_execution_node_status_run ON public.execution_node_status(run_id);
CREATE INDEX IF NOT EXISTS idx_execution_node_status_node ON public.execution_node_status(node_id);

-- Enable RLS
ALTER TABLE public.execution_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_node_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for execution_runs
CREATE POLICY "Users can view their own execution runs"
  ON public.execution_runs
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create execution runs"
  ON public.execution_runs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update execution runs"
  ON public.execution_runs
  FOR UPDATE
  USING (true);

-- RLS Policies for execution_node_status
CREATE POLICY "Users can view node execution status"
  ON public.execution_node_status
  FOR SELECT
  USING (true);

CREATE POLICY "System can manage node execution status"
  ON public.execution_node_status
  FOR ALL
  USING (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_execution_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_execution_runs_timestamp
  BEFORE UPDATE ON public.execution_runs
  FOR EACH ROW
  EXECUTE FUNCTION update_execution_timestamp();

CREATE TRIGGER update_execution_node_status_timestamp
  BEFORE UPDATE ON public.execution_node_status
  FOR EACH ROW
  EXECUTE FUNCTION update_execution_timestamp();