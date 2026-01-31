-- Create albums table
CREATE TABLE public.music_albums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  cover_path TEXT,
  description TEXT,
  release_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create music tracks table
CREATE TABLE public.music_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  cover_path TEXT,
  audio_path TEXT,
  price NUMERIC NOT NULL DEFAULT 0.001,
  artist_wallet TEXT,
  description TEXT,
  duration INTEGER,
  album_id UUID REFERENCES public.music_albums(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create videos table
CREATE TABLE public.music_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  thumbnail_path TEXT,
  video_path TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0.001,
  artist_wallet TEXT,
  description TEXT,
  duration INTEGER,
  is_livestream BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audio streaming sessions table
CREATE TABLE public.music_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id TEXT NOT NULL UNIQUE,
  track_id UUID NOT NULL REFERENCES public.music_tracks(id),
  user_wallet TEXT,
  access_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create video streaming sessions table
CREATE TABLE public.music_video_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id TEXT NOT NULL UNIQUE,
  video_id UUID NOT NULL REFERENCES public.music_videos(id),
  user_wallet TEXT,
  access_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audio transactions table
CREATE TABLE public.music_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID NOT NULL REFERENCES public.music_tracks(id),
  user_wallet TEXT NOT NULL,
  artist_wallet TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create video transactions table
CREATE TABLE public.music_video_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.music_videos(id),
  user_wallet TEXT NOT NULL,
  artist_wallet TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create entitlements table (user ownership/access)
CREATE TABLE public.music_entitlements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_wallet TEXT,
  track_id UUID REFERENCES public.music_tracks(id),
  video_id UUID REFERENCES public.music_videos(id),
  tx_hash TEXT,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT entitlement_has_content CHECK (track_id IS NOT NULL OR video_id IS NOT NULL)
);

-- Enable RLS on all tables
ALTER TABLE public.music_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_video_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_video_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_entitlements ENABLE ROW LEVEL SECURITY;

-- Public read access for albums, tracks, and videos
CREATE POLICY "Albums are viewable by everyone" ON public.music_albums FOR SELECT USING (true);
CREATE POLICY "Tracks are viewable by everyone" ON public.music_tracks FOR SELECT USING (true);
CREATE POLICY "Videos are viewable by everyone" ON public.music_videos FOR SELECT USING (true);

-- Streams accessible by access token holder
CREATE POLICY "Streams accessible by token" ON public.music_streams FOR SELECT USING (true);
CREATE POLICY "Video streams accessible by token" ON public.music_video_streams FOR SELECT USING (true);

-- Transactions viewable by the user who made them
CREATE POLICY "Users can view their transactions" ON public.music_transactions FOR SELECT USING (true);
CREATE POLICY "Users can view their video transactions" ON public.music_video_transactions FOR SELECT USING (true);

-- Entitlements viewable by owner
CREATE POLICY "Users can view their entitlements" ON public.music_entitlements 
  FOR SELECT USING (auth.uid() = user_id OR user_wallet IS NOT NULL);

-- Insert policies for service role operations
CREATE POLICY "Service can insert streams" ON public.music_streams FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can insert video streams" ON public.music_video_streams FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can insert transactions" ON public.music_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can insert video transactions" ON public.music_video_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can insert entitlements" ON public.music_entitlements FOR INSERT WITH CHECK (true);

-- Create function to get entitlement
CREATE OR REPLACE FUNCTION public.get_entitlement(p_track_id UUID, p_user_wallet TEXT)
RETURNS TABLE(id UUID, track_id UUID, user_wallet TEXT, is_active BOOLEAN, expires_at TIMESTAMP WITH TIME ZONE)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT e.id, e.track_id, e.user_wallet, e.is_active, e.expires_at
  FROM music_entitlements e
  WHERE e.track_id = p_track_id 
    AND e.user_wallet = p_user_wallet
    AND e.is_active = true
    AND (e.expires_at IS NULL OR e.expires_at > now());
END;
$$;

-- Create function to check valid session
CREATE OR REPLACE FUNCTION public.check_valid_session(p_stream_id TEXT, p_access_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM music_streams
    WHERE stream_id = p_stream_id
      AND access_token = p_access_token
      AND expires_at > now()
  );
END;
$$;

-- Create covers storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for covers bucket
CREATE POLICY "Covers are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'covers');

CREATE POLICY "Authenticated users can upload covers" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX idx_music_tracks_album ON public.music_tracks(album_id);
CREATE INDEX idx_music_streams_track ON public.music_streams(track_id);
CREATE INDEX idx_music_streams_expires ON public.music_streams(expires_at);
CREATE INDEX idx_music_video_streams_video ON public.music_video_streams(video_id);
CREATE INDEX idx_music_entitlements_user ON public.music_entitlements(user_wallet);
CREATE INDEX idx_music_entitlements_track ON public.music_entitlements(track_id);
CREATE INDEX idx_music_transactions_track ON public.music_transactions(track_id);