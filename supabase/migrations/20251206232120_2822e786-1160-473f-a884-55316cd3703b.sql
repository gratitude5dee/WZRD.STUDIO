-- Create videos table for video and livestream content
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  description TEXT,
  thumbnail_path TEXT,
  video_path TEXT NOT NULL,
  artist_wallet TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0.001,
  duration INTEGER,
  is_livestream BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for videos
CREATE POLICY "Anyone can read videos" 
ON public.videos 
FOR SELECT 
USING (true);

CREATE POLICY "Artists can insert videos" 
ON public.videos 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Artists can update their own videos" 
ON public.videos 
FOR UPDATE 
USING (true);

CREATE POLICY "Artists can delete their own videos" 
ON public.videos 
FOR DELETE 
USING (true);

-- Create video_streams table for pay-per-stream sessions
CREATE TABLE public.video_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID REFERENCES public.videos(id),
  payer_wallet TEXT,
  access_token TEXT NOT NULL,
  stream_id TEXT NOT NULL UNIQUE,
  tx_hash TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for video_streams
ALTER TABLE public.video_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read video_streams" 
ON public.video_streams 
FOR SELECT 
USING (true);

CREATE POLICY "Allow insert video_streams" 
ON public.video_streams 
FOR INSERT 
WITH CHECK (true);

-- Create video_transactions table
CREATE TABLE public.video_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID REFERENCES public.videos(id),
  stream_id TEXT REFERENCES public.video_streams(stream_id),
  payer_wallet TEXT,
  tx_hash TEXT,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for video_transactions
ALTER TABLE public.video_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read video_transactions" 
ON public.video_transactions 
FOR SELECT 
USING (true);

CREATE POLICY "Allow insert video_transactions" 
ON public.video_transactions 
FOR INSERT 
WITH CHECK (true);

-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', false);

-- Storage policies for videos bucket
CREATE POLICY "Anyone can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Videos are readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Users can delete videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'videos');