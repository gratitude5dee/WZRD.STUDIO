

## Problem Summary

Your app isn't working because it was built for a different database structure than what exists in the connected Supabase project (`wzrdstudio`). The code expects specific tables for a music/video streaming platform, but the database has tables for a different application (a project editor/timeline tool).

## What's Missing

The app needs these database tables that don't exist in the connected database:

| Required Table | Purpose |
|---------------|---------|
| `tracks` | Music tracks with title, artist, cover_path, audio_path, price, artist_wallet |
| `videos` | Video content with title, artist, thumbnail_path, video_path, price |
| `streams` | Audio streaming sessions with access tokens and expiry |
| `video_streams` | Video streaming sessions |
| `transactions` | Track payment records |
| `video_transactions` | Video payment records |
| `entitlements` | User ownership/access records |
| `albums` | Album collections |

The connected database has a `tracks` table, but it's for project timelines (with columns like `project_id`, `position`, `label`, `type`) - completely different from what this music app needs.

## Solution Plan

I'll create the required database tables with proper structure:

### Step 1: Create Music Tracks Table
```text
+------------------+-----------------------+
| tracks           |                       |
+------------------+-----------------------+
| id               | UUID (primary key)    |
| title            | TEXT                  |
| artist           | TEXT                  |
| cover_path       | TEXT                  |
| audio_path       | TEXT                  |
| price            | NUMERIC               |
| artist_wallet    | TEXT                  |
| description      | TEXT                  |
| duration         | INTEGER               |
| album_id         | UUID                  |
| created_at       | TIMESTAMP             |
+------------------+-----------------------+
```

### Step 2: Create Videos Table
```text
+------------------+-----------------------+
| videos           |                       |
+------------------+-----------------------+
| id               | UUID (primary key)    |
| title            | TEXT                  |
| artist           | TEXT                  |
| thumbnail_path   | TEXT                  |
| video_path       | TEXT                  |
| price            | NUMERIC               |
| artist_wallet    | TEXT                  |
| description      | TEXT                  |
| duration         | INTEGER               |
| is_livestream    | BOOLEAN               |
| created_at       | TIMESTAMP             |
+------------------+-----------------------+
```

### Step 3: Create Streaming Session Tables
- `streams` - for audio streaming access tokens
- `video_streams` - for video streaming access tokens

### Step 4: Create Transaction Tables
- `transactions` (renamed to avoid conflict with existing table)
- `video_transactions` - for video payment records

### Step 5: Create Supporting Tables
- `entitlements` - track user ownership/purchases
- `albums` - album collections

### Step 6: Create Required Functions
- `get_entitlement` - check if user owns a track
- `check_valid_session` - verify streaming access

### Step 7: Create Storage Buckets
- Ensure `audio` and `covers` buckets exist

### Step 8: Enable Row Level Security
- Add appropriate RLS policies for all tables

## Technical Notes

- The existing `tracks` table in the database won't be modified (it belongs to a different feature)
- New tables will use a naming scheme to avoid conflicts: `music_tracks`, `music_videos`, `music_streams`, etc.
- Or alternatively, create the exact tables the code expects and update the code to reference them properly

## Recommended Approach

**Option A: Create new tables with expected names** (simpler - less code changes)
- Create `tracks`, `videos`, etc. as the code expects
- This may conflict if the existing `tracks` table is important

**Option B: Create namespaced tables** (safer - more code changes)
- Create `music_tracks`, `music_videos`, etc.
- Update all frontend code to use new table names

I recommend **Option A** since the existing `tracks` table serves a different purpose and can be renamed if needed.

