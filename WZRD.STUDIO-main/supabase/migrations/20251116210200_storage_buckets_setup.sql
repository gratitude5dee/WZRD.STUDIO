-- ============================================================================
-- MIGRATION: Storage Buckets Setup
-- VERSION: 1.0
-- DATE: 2025-11-16
-- PURPOSE: Create and configure storage buckets for asset management
-- ============================================================================

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Primary assets bucket (private by default)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-assets',
  'project-assets',
  false, -- Private bucket
  524288000, -- 500MB limit
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm',
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/aac',
    'application/pdf', 'application/json',
    'model/gltf-binary', 'model/gltf+json',
    'font/ttf', 'font/otf', 'font/woff', 'font/woff2'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Thumbnails bucket (public for CDN)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'asset-thumbnails',
  'asset-thumbnails',
  true, -- Public bucket for CDN
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Preview/proxy bucket for low-res video previews
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'asset-previews',
  'asset-previews',
  true,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================================
-- STORAGE RLS POLICIES
-- ============================================================================

-- Project Assets Bucket: Users can upload to their own folder
CREATE POLICY "users_upload_own_assets"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'project-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can read their own assets
CREATE POLICY "users_read_own_assets"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'project-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own assets
CREATE POLICY "users_update_own_assets_storage"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'project-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'project-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own assets
CREATE POLICY "users_delete_own_assets_storage"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'project-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Thumbnails Bucket: Public read, user write
CREATE POLICY "public_read_thumbnails"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'asset-thumbnails');

CREATE POLICY "users_upload_thumbnails"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'asset-thumbnails'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "users_delete_thumbnails"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'asset-thumbnails'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Previews Bucket: Same as thumbnails
CREATE POLICY "public_read_previews"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'asset-previews');

CREATE POLICY "users_upload_previews"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'asset-previews'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "users_delete_previews"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'asset-previews'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Service role has full access to all buckets
CREATE POLICY "service_role_all_buckets"
  ON storage.objects
  FOR ALL
  USING (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  )
  WITH CHECK (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  );
