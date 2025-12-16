-- Create wallet_users table to link wallet addresses to Supabase users
CREATE TABLE public.wallet_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast wallet lookups
CREATE INDEX idx_wallet_users_wallet_address ON public.wallet_users(wallet_address);
CREATE INDEX idx_wallet_users_user_id ON public.wallet_users(user_id);

-- Enable RLS
ALTER TABLE public.wallet_users ENABLE ROW LEVEL SECURITY;

-- Users can view their own wallet link
CREATE POLICY "Users can view their own wallet link"
ON public.wallet_users
FOR SELECT
USING (auth.uid() = user_id);

-- Service role can manage wallet users (for the edge function)
CREATE POLICY "Service role can manage wallet users"
ON public.wallet_users
FOR ALL
USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text);