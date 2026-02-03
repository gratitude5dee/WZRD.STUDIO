-- ============================================================================
-- MIGRATION: Create Asset Management System
-- VERSION: 1.0
-- DATE: 2025-11-16
-- PURPOSE: Create comprehensive asset management tables for Studio/Editor
-- ============================================================================

-- ============================================================================
-- TABLE: project_assets
-- PURPOSE: Unified asset tracking for all project-related media
-- NOTES: Single source of truth for all uploaded files across Studio/Editor
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.project_assets (
  -- Identity & Ownership
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,

  -- File Metadata
  file_name TEXT NOT NULL,
  original_file_name TEXT NOT NULL, -- Preserve original name for UX
  mime_type TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),

  -- Asset Classification
  asset_type TEXT NOT NULL CHECK (
    asset_type IN ('image', 'video', 'audio', 'document', 'model', 'font', 'other')
  ),
  asset_category TEXT NOT NULL CHECK (
    asset_category IN ('upload', 'generated', 'system', 'template')
  ),

  -- Storage Configuration
  storage_provider TEXT NOT NULL DEFAULT 'supabase' CHECK (
    storage_provider IN ('supabase', 'cloudflare', 's3', 'custom')
  ),
  storage_bucket TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- Full path within bucket
  cdn_url TEXT, -- Optimized CDN URL if available

  -- Media-Specific Metadata (JSONB for flexibility)
  media_metadata JSONB DEFAULT '{}'::jsonb,
  -- Example structure:
  -- {
  --   "width": 1920,
  --   "height": 1080,
  --   "duration_ms": 30000,
  --   "fps": 30,
  --   "codec": "h264",
  --   "bitrate": 5000000,
  --   "channels": 2,
  --   "sample_rate": 48000,
  --   "color_space": "sRGB",
  --   "has_alpha": false
  -- }

  -- Processing Status
  processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    processing_status IN ('pending', 'processing', 'completed', 'failed', 'quarantined')
  ),
  processing_error TEXT, -- Error message if processing failed

  -- Thumbnail & Preview
  thumbnail_bucket TEXT,
  thumbnail_path TEXT,
  thumbnail_url TEXT,
  preview_bucket TEXT, -- For video previews (low-res proxy)
  preview_path TEXT,
  preview_url TEXT,

  -- Usage Context
  used_in_pages TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['studio', 'editor', 'kanvas']
  usage_count INTEGER DEFAULT 0, -- Track how many times asset is referenced

  -- Access Control
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (
    visibility IN ('private', 'project', 'public')
  ),
  is_archived BOOLEAN DEFAULT FALSE,

  -- Audit & Lifecycle
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_accessed_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT unique_storage_path UNIQUE (storage_bucket, storage_path),
  CONSTRAINT valid_cdn_url CHECK (cdn_url IS NULL OR cdn_url ~* '^https?://'),
  CONSTRAINT valid_thumbnail_pair CHECK (
    (thumbnail_bucket IS NULL AND thumbnail_path IS NULL) OR
    (thumbnail_bucket IS NOT NULL AND thumbnail_path IS NOT NULL)
  )
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_project_assets_user_id ON public.project_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_project_assets_project_id ON public.project_assets(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_project_assets_asset_type ON public.project_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_project_assets_status ON public.project_assets(processing_status);
CREATE INDEX IF NOT EXISTS idx_project_assets_created_at ON public.project_assets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_assets_visibility ON public.project_assets(visibility);
CREATE INDEX IF NOT EXISTS idx_project_assets_archived ON public.project_assets(is_archived) WHERE is_archived = TRUE;

-- GIN index for JSONB metadata queries
CREATE INDEX IF NOT EXISTS idx_project_assets_metadata ON public.project_assets USING GIN (media_metadata);

-- GIN index for array queries (used_in_pages)
CREATE INDEX IF NOT EXISTS idx_project_assets_pages ON public.project_assets USING GIN (used_in_pages);

-- Full-text search index on file names
CREATE INDEX IF NOT EXISTS idx_project_assets_search ON public.project_assets USING GIN (
  to_tsvector('english', original_file_name || ' ' || COALESCE(file_name, ''))
);

-- Add comment
COMMENT ON TABLE public.project_assets IS 'Unified asset management table for all media files across Studio, Editor, and Kanvas';

-- ============================================================================
-- TABLE: asset_usage
-- PURPOSE: Track where and how assets are used across the application
-- NOTES: Enables dependency tracking, garbage collection, and analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.asset_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.project_assets(id) ON DELETE CASCADE,

  -- Usage Context
  used_in_table TEXT NOT NULL, -- 'studio_blocks', 'video_clips', 'canvas_objects', etc.
  used_in_record_id UUID NOT NULL,
  used_in_field TEXT, -- Field name where asset is referenced

  -- Metadata
  usage_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_usage UNIQUE (asset_id, used_in_table, used_in_record_id, used_in_field)
);

CREATE INDEX IF NOT EXISTS idx_asset_usage_asset_id ON public.asset_usage(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_usage_record ON public.asset_usage(used_in_table, used_in_record_id);

COMMENT ON TABLE public.asset_usage IS 'Tracks asset usage across different parts of the application';

-- ============================================================================
-- TABLE: asset_collections
-- PURPOSE: Allow users to organize assets into folders/collections
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.asset_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  color TEXT, -- Hex color for UI
  icon TEXT, -- Icon identifier

  parent_collection_id UUID REFERENCES public.asset_collections(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT no_circular_reference CHECK (parent_collection_id != id)
);

CREATE INDEX IF NOT EXISTS idx_asset_collections_user_id ON public.asset_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_collections_project_id ON public.asset_collections(project_id);
CREATE INDEX IF NOT EXISTS idx_asset_collections_parent ON public.asset_collections(parent_collection_id);

COMMENT ON TABLE public.asset_collections IS 'Organizational structure for grouping assets into collections/folders';

-- Junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.asset_collection_items (
  collection_id UUID NOT NULL REFERENCES public.asset_collections(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.project_assets(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (collection_id, asset_id)
);

CREATE INDEX IF NOT EXISTS idx_collection_items_asset ON public.asset_collection_items(asset_id);

COMMENT ON TABLE public.asset_collection_items IS 'Junction table linking assets to collections';

-- ============================================================================
-- TABLE: processing_queue (for background jobs)
-- PURPOSE: Queue for processing uploaded assets
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.processing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.project_assets(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'completed', 'failed')
  ),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_processing_queue_status ON public.processing_queue(status, priority DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_processing_queue_asset_id ON public.processing_queue(asset_id);

COMMENT ON TABLE public.processing_queue IS 'Background job queue for asset processing';

-- ============================================================================
-- TRIGGERS: Automated timestamp and cascade updates
-- ============================================================================

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to project_assets
DROP TRIGGER IF EXISTS project_assets_updated_at ON public.project_assets;
CREATE TRIGGER project_assets_updated_at
  BEFORE UPDATE ON public.project_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Apply to asset_collections
DROP TRIGGER IF EXISTS asset_collections_updated_at ON public.asset_collections;
CREATE TRIGGER asset_collections_updated_at
  BEFORE UPDATE ON public.asset_collections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update usage_count when asset_usage changes
CREATE OR REPLACE FUNCTION public.update_asset_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.project_assets
    SET usage_count = usage_count + 1
    WHERE id = NEW.asset_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.project_assets
    SET usage_count = GREATEST(usage_count - 1, 0)
    WHERE id = OLD.asset_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS asset_usage_count_trigger ON public.asset_usage;
CREATE TRIGGER asset_usage_count_trigger
  AFTER INSERT OR DELETE ON public.asset_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_asset_usage_count();

-- ============================================================================
-- PERFORMANCE OPTIMIZATION: Materialized View
-- ============================================================================

-- Materialized view for fast stats
CREATE MATERIALIZED VIEW IF NOT EXISTS public.asset_stats AS
SELECT
  user_id,
  asset_type,
  COUNT(*) as count,
  SUM(file_size_bytes) as total_size,
  AVG(file_size_bytes) as avg_size
FROM public.project_assets
WHERE is_archived = FALSE
GROUP BY user_id, asset_type;

-- Index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_asset_stats ON public.asset_stats(user_id, asset_type);

-- Function to refresh stats
CREATE OR REPLACE FUNCTION public.refresh_asset_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.asset_stats;
END;
$$ LANGUAGE plpgsql;

COMMENT ON MATERIALIZED VIEW public.asset_stats IS 'Aggregated statistics for asset storage by user and type';
