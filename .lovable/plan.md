
# Fix Authentication Flow - Remove Onboarding & Add Studio Route

## Problem Summary

The authentication is broken because:
1. **`/auth` route uses the wrong file** - It uses `Auth.tsx` which is the old Mog "Welcome" page with `/onboarding` redirect on line 46
2. **`/studio` route is missing** - The creative workspace page exists (`StudioPage.tsx`) but has no route
3. **`Login.tsx` is unused** - A properly themed WZRD.STUDIO auth page exists but isn't wired up
4. **Legacy Mog routes clutter the app** - Routes like `/listen`, `/read`, `/artist` are leftover from the old streaming app

## Solution

### Phase 1: Fix the Auth Route

**Replace `Auth.tsx` with `Login.tsx` content** (or use `Login.tsx` directly)

The `Login.tsx` file already has:
- WZRD.STUDIO branding with animated logo
- Cosmic dark theme with purple gradients
- Thirdweb ConnectEmbed for wallet authentication
- Proper redirect logic (just needs to point to `/studio` instead of `/home`)

**Change in `src/App.tsx`:**
```
Current:  import Auth from "./pages/Auth";
Change:   import Auth from "./pages/Login";  // Use the themed login page
```

**Change in `src/pages/Login.tsx` (line 33):**
```
Current:  navigate('/home');
Change:   navigate('/studio');
```

### Phase 2: Add Studio Route

**Add to `src/App.tsx`:**
```typescript
import StudioPage from "./pages/StudioPage";

// Add routes:
<Route path="/studio" element={<StudioPage />} />
<Route path="/studio/:projectId" element={<StudioPage />} />
```

### Phase 3: Clean Up Legacy Routes

**Remove unused Mog routes from `App.tsx`:**
- `/listen` → Listen.tsx (music streaming)
- `/read` → Read.tsx
- `/artist` → Artist.tsx  
- `/upload` → Upload.tsx
- `/search` → Search.tsx
- `/now-playing` → NowPlaying.tsx
- `/album/:id` → Album.tsx
- `/library` → Library.tsx
- `/watch` → WatchHome.tsx
- `/watch/:id` → Watch.tsx
- `/embed/track/:trackId` → EmbedPlayer.tsx
- `/agent-actions` → MoltbookAgentActions.tsx

**Keep essential routes:**
- `/` → Intro (cinematic intro animation)
- `/landing` → Landing (marketing page)
- `/auth` → Login (themed auth page)
- `/studio` → StudioPage (main workspace)
- `/studio/:projectId` → StudioPage (project-specific workspace)
- `/storyboard` → Storyboard (if needed for WZRD.STUDIO)
- `*` → NotFound (404 page)

### Phase 4: Remove Unused Providers (Optional)

The `App.tsx` wraps with Mog-specific providers that may no longer be needed:
- `PlayerProvider` - for music player
- `MoltbookProvider` - for AI agent auth

These can remain for now if they don't cause issues, or be removed later.

---

## Files to Modify

| File | Action |
|------|--------|
| `src/App.tsx` | Import Login instead of Auth, add /studio routes, remove legacy routes |
| `src/pages/Login.tsx` | Change redirect from `/home` to `/studio` |

## Files to Delete (Optional - Can Be Done Later)

These files are no longer needed after route cleanup:
- `src/pages/Auth.tsx` (replaced by Login.tsx)
- `src/pages/Listen.tsx`
- `src/pages/Read.tsx`
- `src/pages/Artist.tsx`
- `src/pages/Upload.tsx`
- `src/pages/Search.tsx`
- `src/pages/NowPlaying.tsx`
- `src/pages/Album.tsx`
- `src/pages/Library.tsx`
- `src/pages/Watch.tsx`
- `src/pages/WatchHome.tsx`
- `src/pages/EmbedPlayer.tsx`
- `src/pages/MoltbookAgentActions.tsx`

---

## Expected Flow After Fix

```
User visits / 
  → Sees cinematic intro animation
  → Auto-navigates to /landing

User clicks "Start Creating Free" or "Sign In"
  → Goes to /auth (themed WZRD.STUDIO login)
  → Connects wallet via Thirdweb
  → AuthProvider detects login
  → Redirects to /studio (creative workspace)

User is authenticated
  → Can access /studio and /studio/:projectId
  → Protected routes work correctly
```

---

## Visual Flow

```text
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│     /       │────▶│  /landing   │────▶│    /auth    │
│  (Intro)    │     │ (Marketing) │     │ (WZRD Login)│
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                    Wallet Connected
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │   /studio   │
                                        │ (Workspace) │
                                        └─────────────┘
```
