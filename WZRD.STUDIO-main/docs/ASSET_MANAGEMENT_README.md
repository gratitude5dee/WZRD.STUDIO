# Asset Management System

## 🎯 Overview

Enterprise-grade asset management system for handling multi-format file uploads (images, videos, audio, documents) across the Studio, Editor, and Kanvas pages.

## ✨ Features

### Core Features

- ✅ **Multi-format Upload**: Images, videos, audio, documents, 3D models, fonts
- ✅ **Drag & Drop**: Intuitive file upload with preview
- ✅ **Automatic Processing**: Thumbnail generation and metadata extraction
- ✅ **Smart Organization**: Collections, folders, and tagging
- ✅ **Advanced Search**: Full-text search across file names
- ✅ **Usage Tracking**: Know where assets are used across your projects
- ✅ **Storage Quotas**: Monitor and manage storage usage
- ✅ **CDN Integration**: Fast delivery via CDN
- ✅ **Row Level Security**: Enterprise-grade access control

### Technical Features

- 📦 Type-safe APIs with TypeScript
- 🔐 Row Level Security (RLS) for data isolation
- 🚀 Edge Functions for serverless processing
- 💾 Supabase Storage with CDN
- 📊 Real-time usage analytics
- 🎨 React components with shadcn/ui
- 🔄 TanStack Query for caching
- 📱 Responsive design

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ AssetUploader│  │ AssetLibrary │  │  Components  │       │
│  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                │                  │                │
│         └────────────────┴──────────────────┘                │
│                          │                                   │
│                    ┌─────▼─────┐                            │
│                    │   Hooks    │                            │
│                    │ (useAssets)│                            │
│                    └─────┬──────┘                            │
│                          │                                   │
│                    ┌─────▼─────┐                            │
│                    │  Services  │                            │
│                    └─────┬──────┘                            │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      Backend                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │ Edge Functions │  │   Database     │  │    Storage    │ │
│  │ - asset-upload │  │ - project_assets│  │ - Buckets     │ │
│  │ - processor    │  │ - asset_usage  │  │ - CDN         │ │
│  └────────────────┘  └────────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📚 Usage

### Basic Upload

```typescript
import { AssetUploader } from "@/components/assets";

function MyComponent() {
  return (
    <AssetUploader
      projectId="project-123"
      assetType="image"
      visibility="project"
      onUploadComplete={(assetIds) => {
        console.log("Uploaded:", assetIds);
      }}
    />
  );
}
```

### Asset Library

```typescript
import { AssetLibrary } from "@/components/assets";

function MyLibrary() {
  return (
    <AssetLibrary
      projectId="project-123"
      selectable={true}
      multiSelect={true}
      onSelect={(assets) => {
        console.log("Selected:", assets);
      }}
    />
  );
}
```

### Using Hooks

```typescript
import { useAssets, useAssetUpload } from "@/hooks/useAssets";

function MyComponent() {
  const { data: assets, isLoading } = useAssets({
    projectId: "project-123",
    assetType: ["image", "video"],
  });

  const uploadMutation = useAssetUpload();

  const handleUpload = async (file: File) => {
    const base64 = await assetService.fileToBase64(file);
    await uploadMutation.mutateAsync({
      assetType: "image",
      assetCategory: "upload",
      visibility: "private",
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
        base64,
      },
    });
  };

  return (
    <div>
      {assets?.map((asset) => (
        <div key={asset.id}>{asset.original_file_name}</div>
      ))}
    </div>
  );
}
```

### Tracking Asset Usage

```typescript
import { useAssetUsageTracking } from "@/hooks/useAssets";

function VideoEditor() {
  const trackUsage = useAssetUsageTracking();

  const addAssetToTimeline = (assetId: string, clipId: string) => {
    trackUsage.mutate({
      assetId,
      usedInTable: "video_clips",
      usedInRecordId: clipId,
      usedInField: "media_url",
      metadata: { position: 0, duration: 30 },
    });
  };
}
```

### Asset Playground Page

Navigate to `/assets` inside the app to exercise the uploader and library components together. The page wires the two components to the same project so you can iterate on the full lifecycle in one place.

## 🧪 Testing Asset Flows

- `npm test src/components/assets` &mdash; Runs the Vitest suites that cover the uploader, library filtering, and service deletion logic.
- `npm run test:e2e` &mdash; Launches Playwright against the `/assets` page to sign in, upload multiple file formats, verify processing updates, and archive/restore/delete assets end-to-end.

### Test-Friendly Environment Flags

| Variable | Purpose |
| --- | --- |
| `VITE_USE_MOCK_ASSETS` | Routes `assetService` and hooks to an in-memory store so tests never touch Supabase. |
| `VITE_BYPASS_AUTH_FOR_TESTS` | Provides a mock user session and bypasses Supabase auth to keep Playwright fast and deterministic. |

Both flags are set automatically for the `npm run test:e2e` script, but you can also export them locally while iterating on the `/assets` experience.

## 🗂️ File Structure

```
src/
├── components/
│   └── assets/
│       ├── AssetUploader.tsx      # Upload component
│       ├── AssetLibrary.tsx       # Library grid view
│       └── index.ts               # Exports
├── hooks/
│   └── useAssets.ts               # React Query hooks
├── services/
│   └── assetService.ts            # API service layer
└── types/
    └── assets.ts                  # TypeScript types

supabase/
├── functions/
│   ├── asset-upload/              # Upload handler
│   └── asset-processor/           # Background processor
└── migrations/
    ├── 20251116210000_create_asset_management_system.sql
    ├── 20251116210100_asset_management_rls_policies.sql
    └── 20251116210200_storage_buckets_setup.sql
```

## 🔧 Configuration

### File Size Limits

Default limits (can be customized):
- Images: 50MB
- Videos: 500MB
- Audio: 100MB
- Documents: 25MB
- Models: 100MB
- Fonts: 10MB

### Supported Formats

**Images:** JPEG, PNG, GIF, WebP, SVG
**Videos:** MP4, MOV, AVI, WebM
**Audio:** MP3, WAV, OGG, WebM, AAC
**Documents:** PDF, JSON
**Models:** GLTF, GLB
**Fonts:** TTF, OTF, WOFF, WOFF2

## 🔐 Security

### Row Level Security (RLS)

All tables have RLS enabled with these policies:

1. **Users can view their own assets**
2. **Users can view project assets they have access to**
3. **Anyone can view public assets**
4. **Users can only modify their own assets**
5. **Service role has full access for background jobs**

### Storage Security

- Files are stored in user-specific folders: `{userId}/{projectId}/{assetType}/{filename}`
- Private assets require authentication
- Public assets served via CDN
- Signed URLs for temporary access

## 📊 Database Schema

### project_assets

Main table for asset metadata:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner |
| project_id | UUID | Optional project |
| file_name | TEXT | Stored filename |
| original_file_name | TEXT | Original upload name |
| mime_type | TEXT | File MIME type |
| file_size_bytes | BIGINT | File size |
| asset_type | ENUM | image/video/audio/etc |
| storage_path | TEXT | Path in bucket |
| cdn_url | TEXT | CDN URL |
| media_metadata | JSONB | Extra metadata |
| processing_status | ENUM | pending/processing/completed/failed |

### asset_usage

Tracks where assets are used:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| asset_id | UUID | Reference to asset |
| used_in_table | TEXT | Table name |
| used_in_record_id | UUID | Record ID |
| used_in_field | TEXT | Field name |

## 🚀 Performance

### Caching Strategy

- **Asset List**: 30 second stale time
- **Asset Detail**: 1 minute stale time
- **Storage Stats**: 1 minute stale time
- **Download URLs**: 1 hour (matches signed URL expiry)

### Optimizations

1. **Indexes**: Strategic indexes on frequently queried columns
2. **Materialized Views**: Pre-computed stats for fast dashboards
3. **CDN**: Public assets served via CDN
4. **Pagination**: Limit queries to 20-50 items
5. **Lazy Loading**: Infinite scroll for large libraries

## 🧪 Testing

```bash
# Run unit tests
npm test src/services/assetService.test.ts

# Run component tests
npm test src/components/assets

# Run E2E tests
npm run test:e2e
```

## 📈 Monitoring

### Key Metrics

1. **Upload Success Rate**: % of successful uploads
2. **Processing Time**: Average time to process assets
3. **Storage Usage**: Total bytes used per user
4. **Error Rate**: Failed uploads/processing
5. **CDN Hit Rate**: Cache hit percentage

### Queries

```sql
-- Get top users by storage
SELECT user_id, SUM(file_size_bytes) / (1024*1024*1024) as gb
FROM project_assets
GROUP BY user_id
ORDER BY gb DESC
LIMIT 10;

-- Get failed uploads
SELECT * FROM project_assets
WHERE processing_status = 'failed'
ORDER BY created_at DESC;
```

## 🤝 Contributing

1. Follow existing code patterns
2. Add TypeScript types for all new code
3. Write tests for new features
4. Update documentation
5. Follow commit message conventions

## 📝 License

Proprietary - WZRD.STUDIO

---

**Last Updated:** 2025-11-16
**Version:** 1.0
