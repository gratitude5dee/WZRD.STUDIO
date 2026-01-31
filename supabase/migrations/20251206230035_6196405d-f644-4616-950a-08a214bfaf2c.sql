-- Create audio bucket (private - requires signed URLs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', false);

-- Create covers bucket (public - visible everywhere)
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true);

-- RLS policies for audio bucket
CREATE POLICY "Anyone can upload audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'audio');

CREATE POLICY "Anyone can read audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio');

CREATE POLICY "Users can delete their own audio"
ON storage.objects FOR DELETE
USING (bucket_id = 'audio');

-- RLS policies for covers bucket
CREATE POLICY "Anyone can upload covers"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'covers');

CREATE POLICY "Public can view covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'covers');

CREATE POLICY "Users can delete their own covers"
ON storage.objects FOR DELETE
USING (bucket_id = 'covers');

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_tracks_artist_wallet ON public.tracks(artist_wallet);
CREATE INDEX IF NOT EXISTS idx_streams_track_expires ON public.streams(track_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_transactions_payer ON public.transactions(payer_wallet);

-- Create helper function to check valid stream session
CREATE OR REPLACE FUNCTION public.check_valid_session(p_track_id uuid, p_access_token text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.streams
    WHERE track_id = p_track_id
      AND access_token = p_access_token
      AND expires_at > now()
  )
$$;