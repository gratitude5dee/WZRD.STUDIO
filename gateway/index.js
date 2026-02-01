import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4020;

const streamRequestSchema = z.object({
  recipient: z.string().min(1),
  token: z.string().min(1),
  startTime: z.number().int().nonnegative(),
  endTime: z.number().int().nonnegative(),
  ratePerSecond: z.string().min(1),
});

// Phase 2 placeholder: returns 402 challenge for x402 payment
app.post("/stream", (req, res) => {
  const parsed = streamRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_request", details: parsed.error.flatten() });
  }

  return res.status(402).json({
    error: "payment_required",
    challenge: {
      scheme: "x402",
      token: parsed.data.token,
      amount: parsed.data.ratePerSecond,
      description: "ApeCoin streaming payout",
    },
  });
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`[x402-gateway] listening on :${PORT}`);
});
