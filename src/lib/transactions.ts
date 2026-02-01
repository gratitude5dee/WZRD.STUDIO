type TrackEventPayload = {
  trackId: string;
  walletAddress?: string | null;
  artistWallet: string;
  eventType: "view" | "listen_start" | "stream_30s" | "listen_complete" | "session_expired";
  streamSessionId?: string | null;
  streamId?: string | null;
  txHash?: string | null;
};

export async function postTrackEvent(payload: TrackEventPayload) {
  try {
    const gatewayUrl = import.meta.env.VITE_X402_GATEWAY_URL || "http://localhost:4020";

    const res = await fetch(`${gatewayUrl}/api/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trackId: payload.trackId,
        walletAddress: payload.walletAddress,
        artistWallet: payload.artistWallet,
        eventType: payload.eventType,
        streamSessionId: payload.streamSessionId,
        streamId: payload.streamId,
        txHash: payload.txHash,
      }),
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.warn("track event failed", error);
    return null;
  }
}
