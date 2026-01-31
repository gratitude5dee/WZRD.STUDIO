-- Create mog_posts table for TikTok-style content
CREATE TABLE IF NOT EXISTS mog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Content
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'image', 'article')),
  media_url TEXT,
  thumbnail_url TEXT,
  title TEXT,
  description TEXT,
  hashtags TEXT[] DEFAULT '{}',
  
  -- Creator info
  creator_wallet TEXT NOT NULL,
  creator_name TEXT,
  creator_avatar TEXT,
  creator_type TEXT NOT NULL DEFAULT 'human' CHECK (creator_type IN ('human', 'agent')),
  
  -- Engagement metrics
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  -- Audio/music reference (optional)
  audio_id UUID REFERENCES music_tracks(id) ON DELETE SET NULL,
  audio_name TEXT,
  
  -- Visibility
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false
);

-- Create mog_likes table
CREATE TABLE IF NOT EXISTS mog_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES mog_posts(id) ON DELETE CASCADE,
  user_wallet TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_wallet)
);

-- Create mog_comments table
CREATE TABLE IF NOT EXISTS mog_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES mog_posts(id) ON DELETE CASCADE,
  user_wallet TEXT NOT NULL,
  user_name TEXT,
  user_avatar TEXT,
  user_type TEXT DEFAULT 'human' CHECK (user_type IN ('human', 'agent')),
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  parent_comment_id UUID REFERENCES mog_comments(id) ON DELETE CASCADE
);

-- Create mog_bookmarks table
CREATE TABLE IF NOT EXISTS mog_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES mog_posts(id) ON DELETE CASCADE,
  user_wallet TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_wallet)
);

-- Create mog_follows table for Following feed
CREATE TABLE IF NOT EXISTS mog_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_wallet TEXT NOT NULL,
  following_wallet TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_wallet, following_wallet)
);

-- Enable RLS
ALTER TABLE mog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE mog_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mog_follows ENABLE ROW LEVEL SECURITY;

-- Public read policies for posts and comments
CREATE POLICY "Anyone can view published posts" ON mog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view comments" ON mog_comments FOR SELECT USING (true);
CREATE POLICY "Anyone can view likes" ON mog_likes FOR SELECT USING (true);
CREATE POLICY "Anyone can view follows" ON mog_follows FOR SELECT USING (true);
CREATE POLICY "Anyone can view bookmarks count" ON mog_bookmarks FOR SELECT USING (true);

-- Insert policies (wallet-based, no auth required for now)
CREATE POLICY "Anyone can create posts" ON mog_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can like posts" ON mog_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can comment" ON mog_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can bookmark" ON mog_bookmarks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can follow" ON mog_follows FOR INSERT WITH CHECK (true);

-- Delete policies
CREATE POLICY "Users can delete own likes" ON mog_likes FOR DELETE USING (true);
CREATE POLICY "Users can delete own bookmarks" ON mog_bookmarks FOR DELETE USING (true);
CREATE POLICY "Users can unfollow" ON mog_follows FOR DELETE USING (true);
CREATE POLICY "Creators can delete own posts" ON mog_posts FOR DELETE USING (true);
CREATE POLICY "Users can delete own comments" ON mog_comments FOR DELETE USING (true);

-- Update policies
CREATE POLICY "Creators can update own posts" ON mog_posts FOR UPDATE USING (true);
CREATE POLICY "Update comment likes" ON mog_comments FOR UPDATE USING (true);

-- Indexes for performance
CREATE INDEX idx_mog_posts_creator ON mog_posts(creator_wallet);
CREATE INDEX idx_mog_posts_created ON mog_posts(created_at DESC);
CREATE INDEX idx_mog_posts_featured ON mog_posts(is_featured, created_at DESC);
CREATE INDEX idx_mog_likes_post ON mog_likes(post_id);
CREATE INDEX idx_mog_likes_user ON mog_likes(user_wallet);
CREATE INDEX idx_mog_comments_post ON mog_comments(post_id, created_at);
CREATE INDEX idx_mog_bookmarks_user ON mog_bookmarks(user_wallet);
CREATE INDEX idx_mog_follows_follower ON mog_follows(follower_wallet);
CREATE INDEX idx_mog_follows_following ON mog_follows(following_wallet);

-- Create trigger for updated_at
CREATE TRIGGER update_mog_posts_updated_at
  BEFORE UPDATE ON mog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for mog media
INSERT INTO storage.buckets (id, name, public) VALUES ('mog-media', 'mog-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for mog-media bucket
CREATE POLICY "Anyone can view mog media" ON storage.objects FOR SELECT USING (bucket_id = 'mog-media');
CREATE POLICY "Anyone can upload mog media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'mog-media');
CREATE POLICY "Anyone can update mog media" ON storage.objects FOR UPDATE USING (bucket_id = 'mog-media');
CREATE POLICY "Anyone can delete mog media" ON storage.objects FOR DELETE USING (bucket_id = 'mog-media');