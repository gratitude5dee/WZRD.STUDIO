-- ============================================================================
-- MIGRATION: Asset Management RLS Policies
-- VERSION: 1.0
-- DATE: 2025-11-16
-- PURPOSE: Row Level Security policies for asset management system
-- ============================================================================

-- ============================================================================
-- RLS ACTIVATION
-- ============================================================================

ALTER TABLE public.project_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_queue ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: project_assets
-- SECURITY MODEL: Users own their assets, can share via project/public visibility
-- ============================================================================

-- Policy 1: Users can view their own assets
CREATE POLICY "users_view_own_assets"
  ON public.project_assets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Users can view project assets they have access to
CREATE POLICY "users_view_project_assets"
  ON public.project_assets
  FOR SELECT
  USING (
    visibility = 'project'
    AND project_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_assets.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Policy 3: Anyone can view public assets
CREATE POLICY "anyone_view_public_assets"
  ON public.project_assets
  FOR SELECT
  USING (visibility = 'public');

-- Policy 4: Users can insert their own assets
CREATE POLICY "users_insert_own_assets"
  ON public.project_assets
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      project_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = project_id
        AND projects.user_id = auth.uid()
      )
    )
  );

-- Policy 5: Users can update their own assets
CREATE POLICY "users_update_own_assets"
  ON public.project_assets
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 6: Users can delete their own assets
CREATE POLICY "users_delete_own_assets"
  ON public.project_assets
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy 7: Service role has full access (for background jobs)
CREATE POLICY "service_role_full_access"
  ON public.project_assets
  FOR ALL
  USING (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  )
  WITH CHECK (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  );

-- ============================================================================
-- RLS POLICIES: asset_usage
-- SECURITY MODEL: Usage records follow asset ownership
-- ============================================================================

CREATE POLICY "users_manage_own_asset_usage"
  ON public.asset_usage
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.project_assets
      WHERE project_assets.id = asset_usage.asset_id
      AND project_assets.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_assets
      WHERE project_assets.id = asset_usage.asset_id
      AND project_assets.user_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: asset_collections
-- SECURITY MODEL: Users can only manage their own collections
-- ============================================================================

CREATE POLICY "users_manage_own_collections"
  ON public.asset_collections
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: asset_collection_items
-- SECURITY MODEL: Users can manage items in their own collections
-- ============================================================================

CREATE POLICY "users_manage_collection_items"
  ON public.asset_collection_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.asset_collections
      WHERE asset_collections.id = asset_collection_items.collection_id
      AND asset_collections.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.asset_collections
      WHERE asset_collections.id = asset_collection_items.collection_id
      AND asset_collections.user_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: processing_queue
-- SECURITY MODEL: Users can view their jobs, service role can manage all
-- ============================================================================

-- Users can view processing status for their own assets
CREATE POLICY "users_view_own_processing_queue"
  ON public.processing_queue
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_assets
      WHERE project_assets.id = processing_queue.asset_id
      AND project_assets.user_id = auth.uid()
    )
  );

-- Service role can manage all processing queue items
CREATE POLICY "service_role_manage_processing_queue"
  ON public.processing_queue
  FOR ALL
  USING (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  )
  WITH CHECK (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  );

-- ============================================================================
-- GRANTS: Ensure authenticated users have proper permissions
-- ============================================================================

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_assets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.asset_usage TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.asset_collections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.asset_collection_items TO authenticated;
GRANT SELECT ON public.processing_queue TO authenticated;

-- Grant permissions on materialized view
GRANT SELECT ON public.asset_stats TO authenticated;

-- Service role needs all permissions
GRANT ALL ON public.project_assets TO service_role;
GRANT ALL ON public.asset_usage TO service_role;
GRANT ALL ON public.asset_collections TO service_role;
GRANT ALL ON public.asset_collection_items TO service_role;
GRANT ALL ON public.processing_queue TO service_role;
GRANT ALL ON public.asset_stats TO service_role;
