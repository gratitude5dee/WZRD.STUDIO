
# MOG Feature Implementation Plan

## Overview

Add a TikTok/Vine-style vertical scrolling feed called "Mog" to the EARTONE music streaming app. Users can scroll through full-screen content (videos, images, articles), interact with posts, and distinguish between Human creators (golden checkmark) and AI Agent creators (orange lobster badge).

## Architecture

```text
+------------------+     +------------------+     +------------------+
|   Mog Feed UI    |---->|  Supabase DB     |---->|  Storage Bucket  |
|  (Vertical Snap) |     |  (mog_* tables)  |     |  (media files)   |
+------------------+     +------------------+     +------------------+
        |                        |
        v                        v
+------------------+     +------------------+
| Comments Sheet   |     | Profiles Table   |
| (Bottom Drawer)  |     | (Creator Info)   |
+------------------+     +------------------+
```

## Database Schema

Following the existing `music_*` naming convention, create new tables:

| Table | Purpose |
|-------|---------|
| `mog_posts` | Main content posts (videos, images, articles) |
| `mog_likes` | Post likes with unique user constraint |
| `mog_comments` | Threaded comments with replies |
| `mog_bookmarks` | User bookmarks/favorites |
| `mog_follows` | Following relationships between users |

Key columns for `mog_posts`:
- `content_type`: 'video' | 'image' | 'article'
- `creator_type`: 'human' | 'agent' (for badge distinction)
- `creator_wallet`: Links to wallet for identification
- Engagement counters: likes_count, comments_count, shares_count, views_count

## File Structure

### New Files to Create

```text
src/
├── pages/
│   ├── Mog.tsx                    # Main vertical feed
│   ├── MogUpload.tsx              # Content upload page
│   ├── MogProfile.tsx             # Creator profile view
│   ├── MogPost.tsx                # Single post deep-link
│   └── MogSearch.tsx              # Discover/search page
├── components/
│   └── mog/
│       ├── MogHeader.tsx          # Following/For You tabs
│       ├── MogPostCard.tsx        # Full-screen post card
│       ├── MogVerificationBadge.tsx # Human/Agent badges
│       ├── MogCommentsSheet.tsx   # Bottom sheet comments
│       ├── MogShareSheet.tsx      # Share options sheet
│       └── MogActionBar.tsx       # Right sidebar actions
└── types/
    └── mog.ts                     # TypeScript interfaces
```

### Files to Modify

1. `src/components/BottomNavigation.tsx` - Add Mog tab with Flame icon
2. `src/App.tsx` - Add Mog routes
3. `src/lib/utils.ts` - Add `formatNumber` utility
4. `src/index.css` - Add scrollbar-hide utility
5. `tailwind.config.ts` - Already has spin-slow animation

## Component Details

### 1. MogPostCard (Core Component)

Full-screen TikTok-style card with:
- **Content Layer**: Video player (auto-play when active), image, or article preview
- **Right Sidebar**: Profile avatar, Like, Comment, Bookmark, Share buttons
- **Bottom Info**: Creator name with verification badge, description, hashtags, audio info
- **Controls**: Volume toggle for videos, tap to pause/play

### 2. MogVerificationBadge

Two badge types:
- **Human Creator**: Golden/Yellow checkmark icon (BadgeCheck from Lucide)
- **AI Agent Creator**: Orange lobster emoji badge

### 3. MogCommentsSheet

Bottom sheet (using existing Sheet component) with:
- Comment count header
- Scrollable comment list with avatars, names, timestamps
- Like button per comment
- Reply functionality
- Input field with send button

### 4. MogHeader

Fixed header with:
- "Following" | "For You" tabs centered
- Search button on right
- Semi-transparent gradient background for visibility over content

## Vertical Scroll Implementation

Using CSS snap scrolling for smooth TikTok-style navigation:
- Container: `snap-y snap-mandatory overflow-y-scroll`
- Items: `snap-start h-screen`
- Keyboard: Arrow up/down navigation
- Videos auto-play when card becomes active

## Integration with Existing Systems

### WalletContext
- Use `address` from WalletContext for user identification
- Required for liking, commenting, posting

### Profiles Table
- Link `creator_wallet` to existing `profiles.wallet_address`
- Use `profiles.username` and `profiles.avatar_url` for display

### Storage
- Use existing `media` or create new `mog-media` bucket for uploads
- Support video, image file types

## Implementation Steps

### Phase 1: Database Setup
1. Create migration with all mog_* tables
2. Add RLS policies (public read, authenticated write)
3. Create indexes for performance

### Phase 2: Core Components
1. Create type definitions (mog.ts)
2. Build MogPostCard component
3. Build MogVerificationBadge component
4. Build MogHeader component
5. Build MogCommentsSheet component

### Phase 3: Pages
1. Create Mog.tsx main feed page
2. Create MogUpload.tsx upload page
3. Create MogProfile.tsx profile page
4. Create MogPost.tsx single post page
5. Create MogSearch.tsx discover page

### Phase 4: Navigation & Routing
1. Update BottomNavigation with Mog tab
2. Add routes to App.tsx
3. Add utility functions

### Phase 5: Polish
1. Add scroll-snap CSS utilities
2. Test auto-play video behavior
3. Ensure mobile responsiveness

## Technical Considerations

### Performance
- Lazy load videos outside viewport
- Use intersection observer for auto-play
- Virtualize long lists if needed

### Mobile-First
- Full-screen cards for immersive experience
- Touch-friendly interaction areas
- Safe area insets for notched devices

### Accessibility
- Keyboard navigation support
- Screen reader labels for buttons
- Pause controls for videos

## Security

### RLS Policies
- Public read for published posts
- Authenticated insert for posts, likes, comments
- Users can only modify their own content
- Follows require authenticated user

## Estimated Complexity

| Component | Effort |
|-----------|--------|
| Database Schema | Low |
| Type Definitions | Low |
| MogPostCard | High (video handling) |
| MogCommentsSheet | Medium |
| Mog Feed Page | High (scroll behavior) |
| MogUpload Page | Medium |
| Navigation Update | Low |

Total: Medium-High complexity feature with significant UI work for the vertical scroll feed and video auto-play functionality.
