-- Migration: Create Final Project Assets table
-- Description: Stores curated assets for final video export with shot card ordering

-- Create the final_project_assets table
CREATE TABLE IF NOT EXISTS public.final_project_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL DEFAULT auth.uid(),
    asset_type TEXT NOT NULL CHECK (asset_type IN ('image', 'video', 'audio')),
    asset_subtype TEXT CHECK (asset_subtype IN ('voiceover', 'sfx', 'music', 'visual')),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_ms INTEGER,
    order_index INTEGER NOT NULL DEFAULT 0,
    shot_card_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_final_project_assets_project_id
    ON public.final_project_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_final_project_assets_order
    ON public.final_project_assets(project_id, order_index);
CREATE INDEX IF NOT EXISTS idx_final_project_assets_type
    ON public.final_project_assets(project_id, asset_type);

-- Enable Row Level Security
ALTER TABLE public.final_project_assets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own final project assets"
    ON public.final_project_assets
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own final project assets"
    ON public.final_project_assets
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own final project assets"
    ON public.final_project_assets
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own final project assets"
    ON public.final_project_assets
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_final_project_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_final_project_assets_updated_at
    BEFORE UPDATE ON public.final_project_assets
    FOR EACH ROW
    EXECUTE FUNCTION update_final_project_assets_updated_at();

-- Create export_jobs table for tracking FFMPEG export status
CREATE TABLE IF NOT EXISTS public.export_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL DEFAULT auth.uid(),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    progress INTEGER DEFAULT 0,
    output_url TEXT,
    output_bucket TEXT,
    output_path TEXT,
    error_message TEXT,
    settings JSONB DEFAULT '{}',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for export_jobs
CREATE INDEX IF NOT EXISTS idx_export_jobs_project_id
    ON public.export_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_status
    ON public.export_jobs(status);

-- Enable RLS for export_jobs
ALTER TABLE public.export_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for export_jobs
CREATE POLICY "Users can view their own export jobs"
    ON public.export_jobs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own export jobs"
    ON public.export_jobs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own export jobs"
    ON public.export_jobs
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.final_project_assets TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.export_jobs TO authenticated;
