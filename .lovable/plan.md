
# Unify Engagement Data from Mog UI to Watch/Listen/Read Pages

## Executive Summary

This plan creates a unified engagement system that brings the social interaction features from the Mog vertical feed (likes, comments, shares, views) into the Watch, Listen, and Read pages. It also includes significant design improvements to create a cohesive, modern user experience across all content sections.

---

## Current State Analysis

### Data Architecture Gap

| Page | Current Data | Missing Engagement |
|------|--------------|-------------------|
| **Mog (Home)** | `mog_posts` with `likes_count`, `comments_count`, `views_count`, `shares_count` | N/A - Already complete |
| **Watch** | `music_videos` - basic metadata only | No likes, comments, views, shares |
| **Listen** | `music_tracks` - basic metadata only | No likes, comments, views, shares |
| **Read** | `articles` - basic metadata only | No likes, comments, views, shares |

### UI Component Gap

| Mog Components | Watch/Listen/Read Equivalent |
|----------------|------------------------------|
| Like button with count | Not present |
| Comment sheet with count | Not present |
| Share functionality | Not present |
| View count display | Not present |
| Bookmark functionality | Not present |
| User interaction state (liked/bookmarked) | Not present |

---

## Solution Architecture

### Approach: Polymorphic Engagement Tables

Create a unified engagement system that works across all content types using a `content_type` discriminator pattern.

```text
+------------------+       +----------------------+
| music_tracks     |       | content_likes        |
| music_videos     | <---> | content_bookmarks    |
| articles         |       | content_comments     |
+------------------+       +----------------------+
                               |
                        content_type +
                        content_id
```

---

## Implementation Plan

### Phase 1: Database Schema Changes

#### 1.1 Add Engagement Columns to Existing Tables

Add denormalized count columns for performance (same pattern as `mog_posts`):

**music_tracks:**
- `likes_count` (integer, default 0)
- `comments_count` (integer, default 0)
- `shares_count` (integer, default 0)
- `views_count` (integer, default 0)

**music_videos:**
- `likes_count` (integer, default 0)
- `comments_count` (integer, default 0)
- `shares_count` (integer, default 0)
- `views_count` (integer, default 0)

**articles:**
- `likes_count` (integer, default 0)
- `comments_count` (integer, default 0)
- `shares_count` (integer, default 0)
- `views_count` (integer, default 0)

#### 1.2 Create Unified Engagement Tables

**content_likes:**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| content_type | text | 'track', 'video', 'article' |
| content_id | uuid | Reference to content |
| user_wallet | text | User identifier |
| created_at | timestamp | When liked |

**content_bookmarks:**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| content_type | text | 'track', 'video', 'article' |
| content_id | uuid | Reference to content |
| user_wallet | text | User identifier |
| created_at | timestamp | When bookmarked |

**content_comments:**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| content_type | text | 'track', 'video', 'article' |
| content_id | uuid | Reference to content |
| user_wallet | text | Commenter wallet |
| user_name | text | Display name |
| user_avatar | text | Avatar URL |
| content | text | Comment text |
| likes_count | integer | Comment likes |
| parent_comment_id | uuid | For replies |
| created_at | timestamp | When posted |

#### 1.3 Seed Initial Engagement Data

Populate the new columns with realistic BAYC-themed engagement numbers matching the existing seed data.

---

### Phase 2: Shared UI Components

#### 2.1 Create `EngagementBar` Component

A reusable horizontal engagement bar for cards:

```text
+------------------------------------------+
|  [Heart] 12.4K  [Comment] 234  [Share]   |
+------------------------------------------+
```

Features:
- Compact display with formatted numbers (12.4K, 1.2M)
- Animated interactions (heart fill on like)
- Works with any content type

#### 2.2 Create `EngagementOverlay` Component

A floating overlay for hover states on cards:

```text
+-----------------------------------+
|                      [+] [Heart]  |
|                                   |
|   [Play]                          |
|   Title                    [...]  |
|   [Heart] 12K  [Comment] 45       |
+-----------------------------------+
```

#### 2.3 Create `ContentCommentsSheet` Component

Reuse the pattern from `MogCommentsSheet` for all content types:

```text
+----------------------------------+
|        234 Comments        [X]   |
+----------------------------------+
| [Avatar] User1                   |
| Great track!           [Heart]   |
|                                  |
| [Avatar] User2                   |
| Fire!                  [Heart]   |
+----------------------------------+
|  [Add a comment...]     [Send]   |
+----------------------------------+
```

#### 2.4 Create `useContentEngagement` Hook

A reusable hook for managing engagement state:

```typescript
const {
  isLiked,
  isBookmarked,
  likesCount,
  commentsCount,
  handleLike,
  handleBookmark,
  handleShare,
} = useContentEngagement({
  contentType: 'video',
  contentId: video.id,
  initialLikes: video.likes_count,
  initialComments: video.comments_count,
});
```

---

### Phase 3: Update Content Cards

#### 3.1 Enhanced `NetflixVideoCard`

Add engagement overlay and stats:

```text
Before:                    After:
+------------+             +------------+
| Thumbnail  |             | Thumbnail  |
|            |             |   [Heart]  |
| $0.005     |             | $0.005     |
+------------+             +------------+
| Title      |             | Title      |
| Artist     |             | [H] 12K [C] 45
+------------+             +------------+
```

#### 3.2 Enhanced `TrackCard`

Add engagement indicators:

```text
Before:                    After:
+------------+             +------------+
|  [Cover]   |             |  [Cover]   |
| [Play]     |             | [Play] [H] |
+------------+             +------------+
| Title      |             | Title      |
| Artist     |             | [H] 8.2K   |
+------------+             +------------+
```

#### 3.3 Enhanced `Top10Card` and `ContinueWatchingCard`

Add subtle engagement metrics display.

#### 3.4 Enhanced `ArticleCard`

Add engagement footer:

```text
+---------------------------+
| [Image]                   |
| CATEGORY                  |
| Title of the Article      |
| Author - 5 min read       |
| [Heart] 1.2K  [Comment] 89|
+---------------------------+
```

---

### Phase 4: Update Page Layouts

#### 4.1 Watch Page Improvements

- Hero section with engagement stats (views, likes)
- Video detail panel with full engagement bar
- Comment section accessible from hero
- "Most Liked" content row
- Trending based on engagement velocity

#### 4.2 Listen Page Improvements

- Track cards with like counts
- Album sections with aggregate engagement
- "Top Liked Tracks" section
- Quick-like functionality without opening detail

#### 4.3 Read Page Improvements

- Article cards with engagement footer
- Reading time + engagement stats
- Comment preview in article list
- "Most Discussed" trending section
- Bookmark collection feature

---

### Phase 5: Design System Enhancements

#### 5.1 Consistent Engagement Icons

Standardize icon usage across all pages:
- Heart (likes) - red fill when active
- MessageCircle (comments) - opens sheet
- Share2 (share) - native share API
- Bookmark (save) - primary fill when active

#### 5.2 Animation System

- Like animation: Scale bounce + heart fill
- Comment notification: Slide-up toast
- Bookmark: Check animation
- View count: Increment animation on load

#### 5.3 Typography and Spacing

- Consistent stat formatting using `formatNumber()`
- 4px spacing between icon and count
- Muted foreground for inactive, foreground for active

---

## File Changes Summary

### New Files

| File | Purpose |
|------|---------|
| `src/hooks/useContentEngagement.ts` | Unified engagement state hook |
| `src/components/engagement/EngagementBar.tsx` | Horizontal engagement stats |
| `src/components/engagement/EngagementOverlay.tsx` | Card hover overlay |
| `src/components/engagement/ContentCommentsSheet.tsx` | Comments sheet for all content |
| `src/components/engagement/LikeButton.tsx` | Animated like button |
| `src/components/engagement/BookmarkButton.tsx` | Bookmark toggle |
| `src/components/engagement/ShareButton.tsx` | Share functionality |
| `src/types/engagement.ts` | Shared engagement types |

### Modified Files

| File | Changes |
|------|---------|
| `src/components/NetflixVideoCard.tsx` | Add engagement overlay and stats |
| `src/components/TrackCard.tsx` | Add like button and count |
| `src/components/Top10Card.tsx` | Add engagement metrics |
| `src/components/ContinueWatchingCard.tsx` | Add engagement on hover |
| `src/pages/WatchHome.tsx` | Hero engagement, new sections |
| `src/pages/Listen.tsx` | Track engagement, new sections |
| `src/pages/Read.tsx` | Article engagement footer |
| `src/types/video.ts` | Add engagement fields |
| `src/types/track.ts` | Add engagement fields |

### Database Migration

| Migration | Purpose |
|-----------|---------|
| `add_engagement_columns.sql` | Add count columns to content tables |
| `create_engagement_tables.sql` | Create likes, bookmarks, comments tables |
| `seed_engagement_data.sql` | Populate initial engagement counts |

---

## Type Definitions

### Engagement Types

```typescript
// src/types/engagement.ts
export type ContentType = 'track' | 'video' | 'article';

export interface EngagementCounts {
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
}

export interface ContentLike {
  id: string;
  content_type: ContentType;
  content_id: string;
  user_wallet: string;
  created_at: string;
}

export interface ContentComment {
  id: string;
  content_type: ContentType;
  content_id: string;
  user_wallet: string;
  user_name: string | null;
  user_avatar: string | null;
  content: string;
  likes_count: number;
  parent_comment_id: string | null;
  created_at: string;
  replies?: ContentComment[];
}
```

---

## Updated Video Type

```typescript
// src/types/video.ts
export interface Video {
  id: string;
  title: string;
  artist: string;
  description: string | null;
  thumbnail_path: string | null;
  video_path: string;
  artist_wallet: string | null;
  price: number;
  duration: number | null;
  is_livestream: boolean;
  created_at: string;
  // New engagement fields
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
}
```

---

## Security Considerations

### RLS Policies for New Tables

**content_likes:**
- SELECT: Public read for all likes
- INSERT: Authenticated users can like (wallet required)
- DELETE: Users can only unlike their own likes

**content_bookmarks:**
- SELECT: Users can only see their own bookmarks
- INSERT: Authenticated users (wallet required)
- DELETE: Users can only remove their own bookmarks

**content_comments:**
- SELECT: Public read for all comments
- INSERT: Authenticated users (wallet required)
- DELETE: Users can only delete their own comments

---

## Expected Outcomes

### User Experience

1. **Unified social layer** - Same engagement patterns across all content types
2. **Increased engagement** - Visible social proof encourages interaction
3. **Better content discovery** - Trending/popular sections based on real engagement
4. **Familiar patterns** - Mog UI conventions applied consistently

### Visual Improvements

1. **Richer cards** - Engagement stats add visual interest
2. **Interactive hover states** - Quick actions without navigation
3. **Animated feedback** - Delightful micro-interactions
4. **Consistent iconography** - Unified design language

### Data Benefits

1. **Engagement analytics** - Track what content resonates
2. **Personalization potential** - Recommend based on engagement patterns
3. **Creator insights** - Artists can see their content performance
