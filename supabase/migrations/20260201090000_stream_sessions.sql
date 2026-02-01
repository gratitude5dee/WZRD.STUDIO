-- Stream sessions table for x402 pay-per-stream
create table if not exists public.stream_sessions (
  id uuid primary key default gen_random_uuid(),
  stream_id text not null,
  track_id uuid not null,
  payer_wallet text not null,
  artist_wallet text not null,
  access_token text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  tx_hash text
);

create index if not exists stream_sessions_track_id_idx on public.stream_sessions (track_id);
create index if not exists stream_sessions_payer_wallet_idx on public.stream_sessions (payer_wallet);
create index if not exists stream_sessions_expires_at_idx on public.stream_sessions (expires_at);

-- RPC to insert a stream session (server-side only)
create or replace function public.create_stream_session(
  p_stream_id text,
  p_track_id uuid,
  p_payer_wallet text,
  p_artist_wallet text,
  p_access_token text,
  p_expires_at timestamptz,
  p_tx_hash text default null
) returns uuid
language plpgsql
security definer
as $$
declare
  v_id uuid;
begin
  insert into public.stream_sessions (
    stream_id,
    track_id,
    payer_wallet,
    artist_wallet,
    access_token,
    expires_at,
    tx_hash
  ) values (
    p_stream_id,
    p_track_id,
    lower(p_payer_wallet),
    lower(p_artist_wallet),
    p_access_token,
    p_expires_at,
    p_tx_hash
  ) returning id into v_id;

  return v_id;
end;
$$;

-- RLS
alter table public.stream_sessions enable row level security;

-- Only service role should write/read by default. Client reads go through edge functions.
create policy "service_role_all" on public.stream_sessions
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
