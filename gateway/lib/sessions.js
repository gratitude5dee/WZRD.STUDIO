export async function fetchActiveSession(supabase, { trackId, walletAddress }) {
  const { data, error } = await supabase
    .from("stream_sessions")
    .select("id, stream_id, track_id, access_token, expires_at, created_at")
    .eq("track_id", trackId)
    .eq("payer_wallet", walletAddress.toLowerCase())
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    throw error;
  }

  return data?.[0] || null;
}
