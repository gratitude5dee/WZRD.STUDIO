import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { z } from "zod";
import crypto from "crypto";
import { settlePayment } from "thirdweb/x402";
import { getFacilitator, getNetwork } from "./lib/thirdweb.js";
import { getSupabaseAdmin } from "./lib/supabase.js";
import { fetchActiveSession } from "./lib/sessions.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4020;
const STREAM_TTL_SECONDS = 10 * 60; // 10 minutes

const payRequestSchema = z.object({
  walletAddress: z.string().min(1),
  amount: z.number().nonnegative(),
  recipient: z.string().min(1),
  trackId: z.string().min(1),
});

app.post("/api/pay/:trackId", async (req, res) => {
  try {
    const { trackId } = req.params;
    const parsed = payRequestSchema.safeParse({ ...req.body, trackId });

    if (!parsed.success) {
      return res.status(400).json({ error: "invalid_request", details: parsed.error.flatten() });
    }

    const paymentData = req.headers["x-payment"];
    const facilitator = getFacilitator();
    const network = getNetwork();

    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers.host;
    const resourceUrl = `${protocol}://${host}/api/pay/${trackId}`;

    const result = await settlePayment({
      resourceUrl,
      method: "POST",
      paymentData: paymentData || undefined,
      payTo: parsed.data.recipient,
      network,
      price: `$${parsed.data.amount.toFixed(2)}`,
      facilitator,
      routeConfig: {
        description: `Access to stream: ${trackId}`,
        mimeType: "application/json",
        maxTimeoutSeconds: STREAM_TTL_SECONDS,
      },
    });

    if (result.status !== 200) {
      if (result.responseHeaders) {
        Object.entries(result.responseHeaders).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
      }
      return res.status(result.status).json(result.responseBody);
    }

    const sessionId = crypto.randomUUID();
    const accessToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + STREAM_TTL_SECONDS * 1000).toISOString();

    const supabase = getSupabaseAdmin();
    const { data: sessionRow, error: sessionError } = await supabase.rpc("create_stream_session", {
      p_stream_id: `stream_${sessionId}`,
      p_track_id: parsed.data.trackId,
      p_payer_wallet: parsed.data.walletAddress,
      p_artist_wallet: parsed.data.recipient,
      p_access_token: accessToken,
      p_expires_at: expiresAt,
      p_tx_hash: result.paymentReceipt?.transaction || null,
    });

    if (sessionError) {
      console.error("Supabase RPC error:", sessionError);
      return res.status(500).json({ error: "failed_to_store_session" });
    }

    return res.json({
      success: true,
      stream: {
        id: sessionRow,
        stream_id: `stream_${sessionId}`,
        track_id: parsed.data.trackId,
        access_token: accessToken,
        expires_at: expiresAt,
      },
      txHash: result.paymentReceipt?.transaction,
    });
  } catch (error) {
    console.error("Payment error:", error);
    return res.status(500).json({ error: error.message || "Payment failed" });
  }
});

app.post("/api/event", async (req, res) => {
  try {
    const eventSchema = z.object({
      trackId: z.string().min(1),
      walletAddress: z.string().optional(),
      artistWallet: z.string().min(1),
      eventType: z.enum(["view", "listen_start", "stream_30s", "listen_complete", "session_expired"]),
      streamSessionId: z.string().optional(),
      streamId: z.string().optional(),
      txHash: z.string().optional(),
    });

    const parsed = eventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "invalid_request", details: parsed.error.flatten() });
    }

    const supabase = getSupabaseAdmin();
    const { data: eventId, error } = await supabase.rpc("create_track_event", {
      p_track_id: parsed.data.trackId,
      p_payer_wallet: parsed.data.walletAddress || null,
      p_artist_wallet: parsed.data.artistWallet,
      p_event_type: parsed.data.eventType,
      p_stream_session_id: parsed.data.streamSessionId || null,
      p_stream_id: parsed.data.streamId || null,
      p_tx_hash: parsed.data.txHash || null,
    });

    if (error) {
      console.error("Track event RPC error:", error);
      return res.status(500).json({ error: "event_store_failed" });
    }

    return res.json({ success: true, id: eventId });
  } catch (error) {
    console.error("Track event error:", error);
    return res.status(500).json({ error: "event_store_failed" });
  }
});

app.get("/api/session/active", async (req, res) => {
  try {
    const trackId = req.query.trackId;
    const walletAddress = req.query.walletAddress;

    if (!trackId || !walletAddress) {
      return res.status(400).json({ error: "missing_params" });
    }

    const supabase = getSupabaseAdmin();
    const session = await fetchActiveSession(supabase, { trackId, walletAddress });

    if (!session) {
      return res.status(404).json({ error: "not_found" });
    }

    return res.json({
      success: true,
      stream: session,
    });
  } catch (error) {
    console.error("Session lookup error:", error);
    return res.status(500).json({ error: "session_lookup_failed" });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`[x402-gateway] listening on :${PORT}`);
});
