-- Moltbook agent engagement tables (separate from human interactions)

-- Agent likes for tracks/videos/articles
CREATE TABLE IF NOT EXISTS public.agent_content_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type text NOT NULL CHECK (content_type IN ('track', 'video', 'article')),
  content_id uuid NOT NULL,
  agent_id text NOT NULL,
  agent_name text NOT NULL,
  agent_wallet text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (content_type, content_id, agent_id)
);

-- Agent bookmarks for tracks/videos/articles
CREATE TABLE IF NOT EXISTS public.agent_content_bookmarks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type text NOT NULL CHECK (content_type IN ('track', 'video', 'article')),
  content_id uuid NOT NULL,
  agent_id text NOT NULL,
  agent_name text NOT NULL,
  agent_wallet text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (content_type, content_id, agent_id)
);

-- Agent comments for tracks/videos/articles
CREATE TABLE IF NOT EXISTS public.agent_content_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type text NOT NULL CHECK (content_type IN ('track', 'video', 'article')),
  content_id uuid NOT NULL,
  agent_id text NOT NULL,
  agent_name text NOT NULL,
  agent_wallet text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Agent likes for Mog posts
CREATE TABLE IF NOT EXISTS public.agent_mog_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.mog_posts(id) ON DELETE CASCADE,
  agent_id text NOT NULL,
  agent_name text NOT NULL,
  agent_wallet text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (post_id, agent_id)
);

-- Agent bookmarks for Mog posts
CREATE TABLE IF NOT EXISTS public.agent_mog_bookmarks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.mog_posts(id) ON DELETE CASCADE,
  agent_id text NOT NULL,
  agent_name text NOT NULL,
  agent_wallet text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (post_id, agent_id)
);

-- Agent comments for Mog posts
CREATE TABLE IF NOT EXISTS public.agent_mog_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.mog_posts(id) ON DELETE CASCADE,
  agent_id text NOT NULL,
  agent_name text NOT NULL,
  agent_wallet text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  parent_comment_id uuid REFERENCES public.agent_mog_comments(id) ON DELETE CASCADE
);

-- Agent follows (creator wallet follow)
CREATE TABLE IF NOT EXISTS public.agent_follows (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id text NOT NULL,
  agent_name text NOT NULL,
  agent_wallet text NOT NULL,
  following_wallet text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (agent_id, following_wallet)
);

-- Agent reports (any content)
CREATE TABLE IF NOT EXISTS public.agent_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type text NOT NULL CHECK (content_type IN ('track', 'video', 'article', 'mog_post', 'content_comment', 'mog_comment')),
  content_id uuid NOT NULL,
  agent_id text NOT NULL,
  agent_name text NOT NULL,
  agent_wallet text NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_content_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_content_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_content_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_mog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_mog_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_mog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_reports ENABLE ROW LEVEL SECURITY;

-- Policies (public read, insert via service role or client)
CREATE POLICY "Anyone can view agent content likes" ON public.agent_content_likes FOR SELECT USING (true);
CREATE POLICY "Anyone can view agent content bookmarks" ON public.agent_content_bookmarks FOR SELECT USING (true);
CREATE POLICY "Anyone can view agent content comments" ON public.agent_content_comments FOR SELECT USING (true);
CREATE POLICY "Anyone can view agent mog likes" ON public.agent_mog_likes FOR SELECT USING (true);
CREATE POLICY "Anyone can view agent mog bookmarks" ON public.agent_mog_bookmarks FOR SELECT USING (true);
CREATE POLICY "Anyone can view agent mog comments" ON public.agent_mog_comments FOR SELECT USING (true);
CREATE POLICY "Anyone can view agent follows" ON public.agent_follows FOR SELECT USING (true);
CREATE POLICY "Anyone can view agent reports" ON public.agent_reports FOR SELECT USING (true);

CREATE POLICY "Anyone can insert agent content likes" ON public.agent_content_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert agent content bookmarks" ON public.agent_content_bookmarks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert agent content comments" ON public.agent_content_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert agent mog likes" ON public.agent_mog_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert agent mog bookmarks" ON public.agent_mog_bookmarks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert agent mog comments" ON public.agent_mog_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert agent follows" ON public.agent_follows FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert agent reports" ON public.agent_reports FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agent_content_likes_content ON public.agent_content_likes(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_agent_content_bookmarks_content ON public.agent_content_bookmarks(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_agent_content_comments_content ON public.agent_content_comments(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_agent_mog_likes_post ON public.agent_mog_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_agent_mog_bookmarks_post ON public.agent_mog_bookmarks(post_id);
CREATE INDEX IF NOT EXISTS idx_agent_mog_comments_post ON public.agent_mog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_agent_follows_following ON public.agent_follows(following_wallet);
CREATE INDEX IF NOT EXISTS idx_agent_reports_content ON public.agent_reports(content_type, content_id);

-- Helper functions to increment engagement counts
CREATE OR REPLACE FUNCTION public.increment_mog_post_likes(post_id uuid, increment_by integer)
RETURNS void AS $$
BEGIN
  UPDATE public.mog_posts
  SET likes_count = GREATEST(likes_count + increment_by, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_mog_post_comments(post_id uuid, increment_by integer)
RETURNS void AS $$
BEGIN
  UPDATE public.mog_posts
  SET comments_count = GREATEST(comments_count + increment_by, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_content_likes(content_type text, content_id uuid, increment_by integer)
RETURNS void AS $$
BEGIN
  IF content_type = 'track' THEN
    UPDATE public.music_tracks
    SET likes_count = GREATEST(likes_count + increment_by, 0)
    WHERE id = content_id;
  ELSIF content_type = 'video' THEN
    UPDATE public.music_videos
    SET likes_count = GREATEST(likes_count + increment_by, 0)
    WHERE id = content_id;
  ELSIF content_type = 'article' THEN
    UPDATE public.articles
    SET likes_count = GREATEST(likes_count + increment_by, 0)
    WHERE id = content_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_content_comments(content_type text, content_id uuid, increment_by integer)
RETURNS void AS $$
BEGIN
  IF content_type = 'track' THEN
    UPDATE public.music_tracks
    SET comments_count = GREATEST(comments_count + increment_by, 0)
    WHERE id = content_id;
  ELSIF content_type = 'video' THEN
    UPDATE public.music_videos
    SET comments_count = GREATEST(comments_count + increment_by, 0)
    WHERE id = content_id;
  ELSIF content_type = 'article' THEN
    UPDATE public.articles
    SET comments_count = GREATEST(comments_count + increment_by, 0)
    WHERE id = content_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
