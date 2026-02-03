-- Enable RLS on idempotency_keys table (policies already exist but RLS was not enabled)
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

-- Enable RLS on columns table (policies exist but RLS was not enabled)
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;