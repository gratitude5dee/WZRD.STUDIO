

# Remove All Mog-Related Pages and Components

## Overview

Remove the entire "Mog" social media feed feature from the project, including pages, components, types, routes, and related references. The `/home` route will be redirected to the main Studio or landing page.

---

## Files to Delete

### Pages (6 files)
- `src/pages/Mog.tsx` - Main feed page
- `src/pages/MogUpload.tsx` - Content upload page
- `src/pages/MogProfile.tsx` - Creator profile page
- `src/pages/MogPost.tsx` - Individual post view
- `src/pages/MogSearch.tsx` - Search interface
- `src/pages/MogLibrary.tsx` - User's saved content

### Components (entire directory + 1 file)
- `src/components/mog/` - Delete entire directory containing:
  - `MogPostCard.tsx`
  - `MogHeader.tsx`
  - `MogVerificationBadge.tsx`
  - `MogComments.tsx`
  - `MogInteractions.tsx`
  - And other mog-related components
- `src/components/MogIntro.tsx` - Intro component

### Types (1 file)
- `src/types/mog.ts` - Mog data types (MogPost, MogComment, MogLike, etc.)

---

## Files to Update

### 1. `src/App.tsx` - Remove Mog Routes

Remove these route definitions:
```text
Routes to remove:
├── /home (currently points to Mog.tsx)
├── /mog/upload
├── /mog/profile/:wallet
├── /mog/post/:id
├── /mog/search
└── /mog/library
```

Update `/home` to redirect to `/studio` or `/` instead.

### 2. `src/components/BottomNavigation.tsx`

Remove any navigation items pointing to Mog pages (home feed, library, etc.)

### 3. `src/components/PageHeader.tsx`

Remove any Mog-related navigation links if present.

### 4. `index.html`

Update metadata:
- Change title from "Mog - The Content Economy" to "WZRD.STUDIO"
- Update meta description to focus on the AI workflow platform

### 5. Onboarding References

Check and remove "mog_onboarding_complete" references in:
- `src/pages/Onboarding.tsx`
- `src/pages/Auth.tsx`
- `src/pages/Intro.tsx`

---

## Route Redirect Strategy

After removal:
- `/home` → Redirect to `/studio` (main canvas)
- `/mog/*` routes → Show 404 or redirect to `/studio`

---

## Files NOT Being Removed (Backend)

The following Supabase resources will remain (can be cleaned up separately if needed):
- Database tables: `mog_posts`, `mog_likes`, `mog_comments`, etc.
- Storage bucket: `mog-media`
- Edge functions with mog logic
- Migration files

These are not critical to remove for the frontend cleanup.

---

## Summary

| Category | Action | Count |
|----------|--------|-------|
| Pages | Delete | 6 files |
| Components | Delete | ~10 files (1 directory) |
| Types | Delete | 1 file |
| Routes | Remove | 6 routes |
| Navigation | Update | 2 files |
| Metadata | Update | 1 file |

