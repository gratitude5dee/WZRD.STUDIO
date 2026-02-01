import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { z } from "zod";
import crypto from "crypto";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4020;
const STREAM_TTL_SECONDS = 10 * 60; // 10 minutes

const payRequestSchema = z.object({
  payer_wallet: z.string().min(1),
  amount: z.number().nonnegative(),
  recipient: z.string().optional(),
});

const sessions = new Map();

function createSession({ trackId, payerWallet }) {
  const id = crypto.randomUUID();
  const accessToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + STREAM_TTL_SECONDS * 1000).toISOString();

  const session = {
    id,
    stream_id: `stream_${id}`,
    track_id: trackId,
    access_token: accessToken,
    expires_at: expiresAt,
    payer_wallet: payerWallet,
  };

  sessions.set(id, session);
  return session;
}

// x402-style payment flow: first request returns 402 challenge; second request with x402 header creates session
app.post("/api/pay/:trackId", (req, res) => {
  const { trackId } = req.params;
  const parsed = payRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_request", details: parsed.error.flatten() });
  }

  const paymentHeader = req.header("x402-payment");

  if (!paymentHeader) {
    return res.status(402).json({
      error: "payment_required",
      challenge: {
        scheme: "x402",
        token: "APE",
        amount: parsed.data.amount,
        description: "ApeCoin streaming payout",
      },
    });
  }

  const session = createSession({ trackId, payerWallet: parsed.data.payer_wallet });

  return res.json({
    success: true,
    stream: session,
  });
});

app.get("/api/stream/check/:streamId", (req, res) => {
  const session = sessions.get(req.params.streamId);
  if (!session) {
    return res.status(404).json({ valid: false, error: "not_found" });
  }

  const expiresAt = new Date(session.expires_at).getTime();
  const isValid = Date.now() < expiresAt;

  return res.json({ valid: isValid, expires_at: session.expires_at });
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`[x402-gateway] listening on :${PORT}`);
});
