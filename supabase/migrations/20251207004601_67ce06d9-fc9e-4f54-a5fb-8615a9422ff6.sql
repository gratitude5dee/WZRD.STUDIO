-- Create entitlements table
CREATE TABLE public.entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL,
  wallet_address TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  access_token TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(track_id, wallet_address, tx_hash)
);

-- Create play_events table for analytics
CREATE TABLE public.play_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entitlement_id UUID REFERENCES public.entitlements(id) ON DELETE SET NULL,
  track_id UUID NOT NULL,
  wallet_address TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  duration_seconds INTEGER,
  access_token TEXT
);

-- Enable RLS
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.play_events ENABLE ROW LEVEL SECURITY;

-- Entitlements RLS policies
CREATE POLICY "Anyone can read entitlements"
ON public.entitlements
FOR SELECT
USING (true);

CREATE POLICY "Allow insert entitlements"
ON public.entitlements
FOR INSERT
WITH CHECK (true);

-- Play events RLS policies
CREATE POLICY "Anyone can read play_events"
ON public.play_events
FOR SELECT
USING (true);

CREATE POLICY "Allow insert play_events"
ON public.play_events
FOR INSERT
WITH CHECK (true);

-- Create get_entitlement RPC function
CREATE OR REPLACE FUNCTION public.get_entitlement(
  p_track_id UUID,
  p_wallet_address TEXT
)
RETURNS TABLE (
  has_entitlement BOOLEAN,
  entitlement_id UUID,
  expires_at TIMESTAMPTZ,
  access_token TEXT,
  tx_hash TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    true as has_entitlement,
    e.id as entitlement_id,
    e.expires_at,
    e.access_token,
    e.tx_hash
  FROM public.entitlements e
  WHERE e.track_id = p_track_id 
    AND LOWER(e.wallet_address) = LOWER(p_wallet_address)
    AND e.expires_at > now()
    AND e.is_active = true
  ORDER BY e.expires_at DESC
  LIMIT 1
$$;