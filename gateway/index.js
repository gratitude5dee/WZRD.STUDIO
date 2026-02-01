import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { z } from "zod";
import crypto from "crypto";
import { settlePayment } from "thirdweb/x402";
import { getFacilitator, getNetwork } from "./lib/thirdweb.js";

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

app.post("/api/pay/:trackId", async (req, res) => {
  try {
    const { trackId } = req.params;
    const parsed = payRequestSchema.safeParse(req.body);

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

    const session = createSession({
      trackId,
      payerWallet: parsed.data.walletAddress.toLowerCase(),
    });

    return res.json({
      success: true,
      stream: session,
      txHash: result.paymentReceipt?.transaction,
    });
  } catch (error) {
    console.error("Payment error:", error);
    return res.status(500).json({ error: error.message || "Payment failed" });
  }
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
