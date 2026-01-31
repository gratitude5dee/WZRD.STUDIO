
# Fix: get-stream Edge Function 500 Error

## Problem Identified

The `get-stream` edge function crashes with a 500 error when trying to generate a signed URL for audio files. The error from the logs is:

```
TypeError: Cannot read properties of null (reading 'replace')
at M.createSignedUrl (https://esm.sh/@supabase/storage-js@2.93.3/es2022/storage-js.mjs:3:8942)
```

## Root Cause

**The `audio_path` field is `null` for all tracks in the database.** When the edge function passes `null` to `createSignedUrl()`, the Supabase storage library internally calls `.replace()` on the path, which fails on `null`.

Database evidence:
```
Track: "Swamp Club (Mutant Mix)"
ID: e57551eb-db7d-4644-8b76-20dd16de5c48
audio_path: NULL  ← This is the problem
```

All 10 tracks checked have `audio_path: null`.

---

## Solution: Two-Part Fix

### Part 1: Add Null Check in Edge Function

Update `get-stream` to validate that `audio_path` exists before attempting to create a signed URL. This prevents the crash and returns a meaningful error.

**File:** `supabase/functions/get-stream/index.ts`

**Changes:**
1. Modernize the import (remove legacy `serve` import, use `Deno.serve`)
2. Add validation check after fetching the track to ensure `audio_path` is not null
3. Return a proper 404 error with a descriptive message if audio is missing

```typescript
// After fetching track (line 69), add this check:
if (trackError || !track) {
  // existing error handling...
}

// NEW: Check if audio_path exists
if (!track.audio_path) {
  console.error('[get-stream] Track has no audio file:', track_id);
  return new Response(
    JSON.stringify({ 
      error: 'Audio file not available', 
      code: 'AUDIO_NOT_FOUND' 
    }),
    { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

### Part 2: Handle Error Gracefully in Frontend

Update the PlayerContext to handle the `AUDIO_NOT_FOUND` error and show a user-friendly message.

**File:** `src/contexts/PlayerContext.tsx`

**Changes:**
- Check for the specific error code and display a toast notification

---

## Technical Details

### Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/get-stream/index.ts` | Add null check for `audio_path`, modernize to use `Deno.serve` |
| `src/contexts/PlayerContext.tsx` | Handle `AUDIO_NOT_FOUND` error with toast notification |

### Edge Function Changes (get-stream/index.ts)

1. **Line 1**: Remove legacy import `import { serve } from "https://deno.land/std@0.168.0/http/server.ts";`
2. **Line 9**: Change `serve(async (req) => {` to `Deno.serve(async (req) => {`
3. **After line 75**: Add null check for `track.audio_path` with proper error response

### Frontend Changes (PlayerContext.tsx)

Add error handling in the `loadAudio` function to check for the audio not found error code and display a toast message to inform the user.

---

## Data Issue Note

All tracks in the `music_tracks` table currently have `audio_path: null`. After deploying this fix:
- The 500 error will be replaced with a proper 404 "Audio file not available" error
- Users will see a friendly message instead of a blank screen
- To fully resolve playback, actual audio files need to be uploaded and the `audio_path` column updated with the correct storage paths
