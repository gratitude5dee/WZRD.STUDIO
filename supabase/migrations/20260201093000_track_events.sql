-- Track event log for view/listen/stream transactions
create table if not exists public.track_events (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null,
  payer_wallet text,
  artist_wallet text not null,
  event_type text not null,
  stream_session_id uuid,
  stream_id text,
  tx_hash text,
  created_at timestamptz not null default now()
);

create index if not exists track_events_track_id_idx on public.track_events (track_id);
create index if not exists track_events_payer_wallet_idx on public.track_events (payer_wallet);
create index if not exists track_events_event_type_idx on public.track_events (event_type);

-- RPC to insert a track event (server-side only)
create or replace function public.create_track_event(
  p_track_id uuid,
  p_payer_wallet text,
  p_artist_wallet text,
  p_event_type text,
  p_stream_session_id uuid default null,
  p_stream_id text default null,
  p_tx_hash text default null
) returns uuid
language plpgsql
security definer
as $$
declare
  v_id uuid;
begin
  insert into public.track_events (
    track_id,
    payer_wallet,
    artist_wallet,
    event_type,
    stream_session_id,
    stream_id,
    tx_hash
  ) values (
    p_track_id,
    lower(p_payer_wallet),
    lower(p_artist_wallet),
    p_event_type,
    p_stream_session_id,
    p_stream_id,
    p_tx_hash
  ) returning id into v_id;

  return v_id;
end;
$$;

-- RLS
alter table public.track_events enable row level security;

create policy "service_role_all" on public.track_events
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
