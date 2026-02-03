# Asset Management System - Deployment Guide

## 📋 Overview

This guide provides step-by-step instructions for deploying the enterprise-grade asset management system to production.

## 🎯 Prerequisites

Before deploying, ensure you have:

- ✅ Supabase project set up
- ✅ Database access (PostgreSQL)
- ✅ Storage bucket permissions
- ✅ Edge Functions deployment access
- ✅ Environment variables configured

## 🚀 Deployment Steps

### Step 1: Database Migrations

Run the migrations in order:

```bash
# Connect to your Supabase project
supabase link --project-ref <your-project-ref>

# Run migrations
supabase db push

# Or run migrations individually:
psql $DATABASE_URL -f supabase/migrations/20251116210000_create_asset_management_system.sql
psql $DATABASE_URL -f supabase/migrations/20251116210100_asset_management_rls_policies.sql
psql $DATABASE_URL -f supabase/migrations/20251116210200_storage_buckets_setup.sql
```

### Step 2: Verify Database Setup

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'project_assets',
  'asset_usage',
  'asset_collections',
  'asset_collection_items',
  'processing_queue'
);

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE '%asset%';

-- Check storage buckets exist
SELECT id, name, public
FROM storage.buckets
WHERE id IN ('project-assets', 'asset-thumbnails', 'asset-previews');
```

### Step 3: Deploy Edge Functions

```bash
# Deploy asset-upload function
supabase functions deploy asset-upload

# Deploy asset-processor function
supabase functions deploy asset-processor

# Verify deployment
supabase functions list
```

### Step 4: Set Up Cron Job for Asset Processing

In Supabase Dashboard → Database → Cron Jobs:

```sql
-- Schedule asset processor to run every 5 minutes
SELECT cron.schedule(
  'process-assets',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/asset-processor',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
```

### Step 5: Refresh Materialized Views

Set up a cron job to refresh statistics:

```sql
-- Refresh asset stats every hour
SELECT cron.schedule(
  'refresh-asset-stats',
  '0 * * * *', -- Every hour
  $$
  SELECT refresh_asset_stats();
  $$
);
```

### Step 6: Frontend Environment Variables

Ensure these environment variables are set in your frontend deployment (Vercel, Netlify, etc.):

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 7: Deploy Frontend

```bash
# Build the frontend
npm run build

# Deploy to your hosting provider
# For Vercel:
vercel --prod

# For Netlify:
netlify deploy --prod
```

## 🧪 Post-Deployment Testing

### Test 1: Upload an Asset

```typescript
// Test in browser console
const response = await fetch('https://YOUR_PROJECT.supabase.co/functions/v1/asset-upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_USER_TOKEN',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    assetType: 'image',
    assetCategory: 'upload',
    visibility: 'private',
    file: {
      name: 'test.png',
      type: 'image/png',
      size: 1024,
      base64: 'base64-data-here',
    },
  }),
});
const data = await response.json();
console.log(data);
```

### Test 2: List Assets

```sql
-- In Supabase SQL Editor
SELECT
  id,
  original_file_name,
  asset_type,
  processing_status,
  created_at
FROM project_assets
ORDER BY created_at DESC
LIMIT 10;
```

### Test 3: Verify RLS

```sql
-- Should return only user's assets
SET request.jwt.claims = '{"sub": "USER_ID"}';
SELECT * FROM project_assets;
```

### Test 4: Check Processing Queue

```sql
SELECT
  pq.id,
  pq.status,
  pq.attempts,
  pa.original_file_name
FROM processing_queue pq
JOIN project_assets pa ON pa.id = pq.asset_id
ORDER BY pq.created_at DESC
LIMIT 10;
```

## 📊 Monitoring

### Key Metrics to Monitor

1. **Upload Success Rate**
   ```sql
   SELECT
     COUNT(*) FILTER (WHERE processing_status = 'completed') * 100.0 / COUNT(*) as success_rate
   FROM project_assets
   WHERE created_at > now() - interval '24 hours';
   ```

2. **Storage Usage**
   ```sql
   SELECT
     user_id,
     SUM(file_size_bytes) / (1024.0 * 1024.0 * 1024.0) as gb_used
   FROM project_assets
   WHERE is_archived = false
   GROUP BY user_id
   ORDER BY gb_used DESC
   LIMIT 10;
   ```

3. **Processing Queue Health**
   ```sql
   SELECT
     status,
     COUNT(*) as count,
     AVG(attempts) as avg_attempts
   FROM processing_queue
   GROUP BY status;
   ```

4. **Failed Uploads**
   ```sql
   SELECT
     id,
     original_file_name,
     processing_error,
     created_at
   FROM project_assets
   WHERE processing_status = 'failed'
   ORDER BY created_at DESC
   LIMIT 20;
   ```

## 🔧 Troubleshooting

### Issue: Assets Not Processing

**Symptoms:** Assets stuck in "pending" status

**Solutions:**
1. Check cron job is running: `SELECT * FROM cron.job;`
2. Manually trigger processor: `SELECT net.http_post(...)`
3. Check error logs in Supabase Dashboard

### Issue: Upload Fails with 413 Error

**Cause:** File size exceeds limit

**Solution:** Update storage bucket file size limit:
```sql
UPDATE storage.buckets
SET file_size_limit = 1073741824 -- 1GB
WHERE id = 'project-assets';
```

### Issue: RLS Blocking Valid Requests

**Debug:**
```sql
-- Enable RLS debug logging
SET log_statement = 'all';
SET client_min_messages = 'debug';

-- Test query
SELECT * FROM project_assets WHERE id = 'asset-id';
```

### Issue: CORS Errors

**Solution:** Update edge function CORS headers:
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://your-domain.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

## 🔒 Security Checklist

- [ ] RLS enabled on all tables
- [ ] Storage policies enforce user folder structure
- [ ] Service role key kept secure (not in frontend)
- [ ] File size limits enforced
- [ ] MIME type validation working
- [ ] No public access to private assets
- [ ] Signed URLs expire appropriately

## 📈 Performance Optimization

### 1. Enable Query Caching

In your frontend:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      cacheTime: 300000, // 5 minutes
    },
  },
});
```

### 2. Use CDN for Public Assets

```sql
-- Update CDN URLs for public assets
UPDATE project_assets
SET cdn_url = 'https://cdn.your-domain.com/' || storage_path
WHERE visibility = 'public' AND cdn_url IS NULL;
```

### 3. Clean Up Old Processing Jobs

```sql
-- Delete completed jobs older than 30 days
DELETE FROM processing_queue
WHERE status = 'completed'
AND completed_at < now() - interval '30 days';
```

### 4. Vacuum Tables Regularly

```sql
-- Run in maintenance window
VACUUM ANALYZE project_assets;
VACUUM ANALYZE asset_usage;
VACUUM ANALYZE processing_queue;
```

## 🔄 Rollback Plan

If deployment fails:

1. **Rollback Database:**
   ```bash
   supabase db reset
   # Then restore from backup
   ```

2. **Rollback Edge Functions:**
   ```bash
   # Redeploy previous version
   git checkout <previous-commit>
   supabase functions deploy asset-upload
   supabase functions deploy asset-processor
   ```

3. **Rollback Frontend:**
   ```bash
   # Revert to previous deployment
   vercel rollback
   ```

## 📞 Support

For issues or questions:
- Check logs in Supabase Dashboard
- Review error messages in browser console
- Contact dev team via Slack #asset-management

## 🎉 Success Criteria

Deployment is successful when:

- ✅ All migrations run without errors
- ✅ Edge functions return 200 status
- ✅ Test upload completes successfully
- ✅ Assets appear in library
- ✅ Processing queue processes files
- ✅ RLS policies block unauthorized access
- ✅ Storage stats show correct values
- ✅ No errors in production logs

---

**Last Updated:** 2025-11-16
**Version:** 1.0
**Author:** Enterprise Asset Management Team
