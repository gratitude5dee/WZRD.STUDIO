-- Moltbook profile linkage to wallets
CREATE TABLE IF NOT EXISTS public.moltbook_profiles (
  wallet_address TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  agent_avatar TEXT,
  verified_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.moltbook_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view moltbook profiles" ON public.moltbook_profiles
  FOR SELECT USING (true);

CREATE POLICY "Anyone can upsert moltbook profiles" ON public.moltbook_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update moltbook profiles" ON public.moltbook_profiles
  FOR UPDATE USING (true);

CREATE OR REPLACE FUNCTION public.update_moltbook_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_moltbook_profiles_updated_at
  BEFORE UPDATE ON public.moltbook_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_moltbook_profiles_updated_at();
