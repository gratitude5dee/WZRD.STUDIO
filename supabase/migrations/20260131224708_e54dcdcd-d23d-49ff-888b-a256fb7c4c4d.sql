-- ================================================
-- PHASE 1: Add engagement columns to existing tables
-- ================================================

-- Add engagement columns to music_tracks
ALTER TABLE public.music_tracks
ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS comments_count integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS shares_count integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0 NOT NULL;

-- Add engagement columns to music_videos
ALTER TABLE public.music_videos
ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS comments_count integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS shares_count integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0 NOT NULL;

-- Add engagement columns to articles
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS comments_count integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS shares_count integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0 NOT NULL;

-- ================================================
-- PHASE 2: Create unified engagement tables
-- ================================================

-- Create content_likes table
CREATE TABLE IF NOT EXISTS public.content_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type text NOT NULL CHECK (content_type IN ('track', 'video', 'article')),
  content_id uuid NOT NULL,
  user_wallet text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (content_type, content_id, user_wallet)
);

-- Create content_bookmarks table
CREATE TABLE IF NOT EXISTS public.content_bookmarks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type text NOT NULL CHECK (content_type IN ('track', 'video', 'article')),
  content_id uuid NOT NULL,
  user_wallet text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (content_type, content_id, user_wallet)
);

-- Create content_comments table
CREATE TABLE IF NOT EXISTS public.content_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type text NOT NULL CHECK (content_type IN ('track', 'video', 'article')),
  content_id uuid NOT NULL,
  user_wallet text NOT NULL,
  user_name text,
  user_avatar text,
  content text NOT NULL,
  likes_count integer DEFAULT 0 NOT NULL,
  parent_comment_id uuid REFERENCES public.content_comments(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on new tables
ALTER TABLE public.content_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_likes
CREATE POLICY "Anyone can view content likes"
  ON public.content_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like content"
  ON public.content_likes FOR INSERT
  WITH CHECK (user_wallet IS NOT NULL AND user_wallet != '');

CREATE POLICY "Users can remove their own likes"
  ON public.content_likes FOR DELETE
  USING (user_wallet = user_wallet);

-- RLS Policies for content_bookmarks
CREATE POLICY "Users can view their own bookmarks"
  ON public.content_bookmarks FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can bookmark content"
  ON public.content_bookmarks FOR INSERT
  WITH CHECK (user_wallet IS NOT NULL AND user_wallet != '');

CREATE POLICY "Users can remove their own bookmarks"
  ON public.content_bookmarks FOR DELETE
  USING (user_wallet = user_wallet);

-- RLS Policies for content_comments
CREATE POLICY "Anyone can view content comments"
  ON public.content_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add comments"
  ON public.content_comments FOR INSERT
  WITH CHECK (user_wallet IS NOT NULL AND user_wallet != '');

CREATE POLICY "Users can delete their own comments"
  ON public.content_comments FOR DELETE
  USING (user_wallet = user_wallet);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_likes_content ON public.content_likes (content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_likes_user ON public.content_likes (user_wallet);
CREATE INDEX IF NOT EXISTS idx_content_bookmarks_content ON public.content_bookmarks (content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_bookmarks_user ON public.content_bookmarks (user_wallet);
CREATE INDEX IF NOT EXISTS idx_content_comments_content ON public.content_comments (content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_parent ON public.content_comments (parent_comment_id);

-- ================================================
-- PHASE 3: Seed engagement data for existing content
-- ================================================

-- Update music_tracks with BAYC-themed engagement
UPDATE public.music_tracks SET
  likes_count = FLOOR(RANDOM() * 15000 + 1000)::integer,
  comments_count = FLOOR(RANDOM() * 500 + 50)::integer,
  shares_count = FLOOR(RANDOM() * 2000 + 100)::integer,
  views_count = FLOOR(RANDOM() * 50000 + 5000)::integer;

-- Update music_videos with BAYC-themed engagement
UPDATE public.music_videos SET
  likes_count = FLOOR(RANDOM() * 25000 + 2000)::integer,
  comments_count = FLOOR(RANDOM() * 800 + 100)::integer,
  shares_count = FLOOR(RANDOM() * 5000 + 500)::integer,
  views_count = FLOOR(RANDOM() * 100000 + 10000)::integer;

-- Update articles with engagement
UPDATE public.articles SET
  likes_count = FLOOR(RANDOM() * 10000 + 500)::integer,
  comments_count = FLOOR(RANDOM() * 300 + 20)::integer,
  shares_count = FLOOR(RANDOM() * 1500 + 100)::integer,
  views_count = FLOOR(RANDOM() * 30000 + 3000)::integer;