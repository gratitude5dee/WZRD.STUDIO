# Implementation Checklist — ApeChain x402 Streaming Payouts

## 1) Smart Contracts (Phase 1)
**Design**
- [ ] Define streaming data model (rate, recipient, duration, start/end).
- [ ] Decide receipt format: NFT vs event‑only (default: NFT for auditability).

**Contracts**
- [ ] Create `StreamManager.sol` (create/stop/query stream).
- [ ] Create `StreamReceiptNFT.sol` (mint on stream start).
- [ ] Extend ApeGate‑style payment contract to accept ApeCoin + stream params.
- [ ] Extend ApeGate‑style router to decode stream params and call StreamManager.

**Testing**
- [ ] Forge tests: create stream, stop stream, receipt mint, failure cases.
- [ ] Verify event emissions + state changes.

---

## 2) x402 Gateway (Phase 2)
**API**
- [ ] Define `/stream` flow (402 challenge → signed payment → stream create).
- [ ] Implement signature validation & rate limits.
- [ ] Call StreamManager on success.

**Infra**
- [ ] Minimal Dockerfile + env config.
- [ ] Logging + metrics (requests, failures, stream IDs).

**Tests**
- [ ] Happy path + invalid payment tests.

---

## 3) Frontend (Phase 3)
**UI**
- [ ] Add “Start Stream” card/button (modeled on ApeGate `buy.jsx` flow).
- [ ] Display states: pending → active → ended.
- [ ] Receipt link + stream status.

**Integration**
- [ ] Call gateway `/stream`, handle 402 + payment.
- [ ] Poll for receipt + update UI.
