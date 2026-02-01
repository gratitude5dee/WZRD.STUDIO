# PRD — ApeCoin Streaming Payouts via x402 in Mog (using ApeGate)

## Goals
- Enable **streaming ApeCoin payouts** (continuous, low‑latency) in Mog using **x402 payment headers**.
- Reuse ApeGate’s cross‑chain payment + minting architecture and frontend patterns.
- Provide a production‑ready rollout with CI/CD, security, observability, and DevOps controls.

## Scope
**In scope**
- New x402 payment service (gateway) that streams ApeCoin to creators.
- Smart‑contract extensions to support streaming receipt + on‑chain proof.
- Mog app UI/UX updates for streaming purchase, status, and receipts.
- DevOps deployment for relayers, RPCs, metrics, and logs.

**Out of scope**
- Full Mog app redesign.
- New chain integrations beyond ApeChain + source chain used by ApeGate.
- Replacing Hyperlane/Espresso stack (still used for cross‑chain validation).

## Requirements

### Functional
1. **x402 Payment Flow**
   - Mog app requests stream via x402 (HTTP 402) to gateway.
   - Gateway returns **streaming terms** and **ApeCoin token address**.
2. **Streaming Payout Execution**
   - User initiates stream; gateway coordinates on‑chain transfer or stream creation.
3. **On‑chain Receipt**
   - Once stream is active, a receipt is minted or recorded (for auditability).
4. **Cross‑Chain Compatibility**
   - Use ApeGate’s pattern: source payment → Hyperlane dispatch → destination mint/record.
   - Reuse structure from:
     - `src/ApeGatePayment.sol` (EspHypNative)
     - `src/ApeGateRouter.sol` (EspHypERC20)
5. **Mog App UI**
   - Show “Start Stream”, “Streaming Active”, “Stream Ended”.
   - Provide receipt link & status.
6. **Admin Controls**
   - Pause streaming, change rate, revoke streams.

### Non‑Functional
- **Low latency** (<5s to acknowledge x402 / <60s to start stream).
- **Availability**: 99.9% for gateway + relayer services.
- **Security**: audited contracts; key management with HSM or Vault.
- **Observability**: metrics for stream creation, failures, relayer lag.
- **Scalability**: 10k concurrent streaming sessions.

## Architecture / Integration Plan

### Reuse & Extend ApeGate Components
- **Source chain payment contract**
  - Extend `src/ApeGatePayment.sol` (EspHypNative) to accept **ApeCoin** instead of native token and encode streaming params in the Hyperlane message.
- **Destination router**
  - Extend `src/ApeGateRouter.sol` to decode stream parameters and invoke a new **StreamingReceipt** or **StreamManager** contract.
- **Receipt NFT**
  - Reuse/extend `src/ApeGateTicketNFT.sol` for stream receipts (rename to “StreamReceiptNFT” or add new contract).

### Mog App Integration
- Use frontend pattern in `frontend/pages/buy.jsx` (wallet connect, tx status, polling) as template for streaming UI.
- New env vars similar to ApeGate’s `.env.local`:
  - `NEXT_PUBLIC_STREAMING_CONTRACT_ADDRESS`
  - `NEXT_PUBLIC_APECHAIN_RPC`
  - `NEXT_PUBLIC_X402_GATEWAY_URL`
- UI states parallel to `buy.jsx`: **dispatchId**, **processId**, stream status.

### x402 Gateway Flow
1. Mog calls `/stream` → gateway returns x402 payment challenge.
2. Mog signs/authorizes wallet → gateway creates stream on‑chain.
3. Gateway emits receipt (Hyperlane message → destination).
4. Mog polls for receipt (similar to ApeGate polling in `buy.jsx`).

## DevOps Plan

### CI/CD
- **Contracts**
  - Forge tests (`forge test`) per README.
  - Run on PR; deploy only on tagged release.
- **Frontend**
  - Build pipeline using `npm run build` (as in `frontend/package.json`).
- **Gateway**
  - Containerize x402 service with Docker; deploy on staging + prod.

### Infrastructure
- **RPC endpoints** for ApeChain + source chain (HA provider).
- **Hyperlane relayer + Espresso Caff nodes** monitored (ApeGate README troubleshooting notes).
- Use IaC (Terraform) for:
  - Cloud load balancer
  - ECS/Kubernetes service for gateway
  - Secrets manager

### Observability
- Metrics: stream creation rate, relayer lag, failure counts.
- Logs: structured JSON for gateway + contracts (event indexing).
- Alerts: failure rate >1%, relayer delay >2 min.

## Security / Compliance
- Contract audits (esp. stream handling + ERC20 allowances).
- Rate‑limit x402 gateway to prevent abuse.
- Use **allowlist** for ERC20 ApeCoin address to prevent spoofing.
- Key management: Vault/HSM, rotate relayer keys.
- GDPR: minimal user PII; wallet address only.

## Milestones / TODOs (with Acceptance Criteria)

### M1 — Spec & Design (1 week)
- Draft stream data model + x402 flow spec.
- **Acceptance**: signed‑off architecture diagram + API schema.

### M2 — Smart Contracts (2–3 weeks)
- Extend `ApeGatePayment.sol` for ApeCoin streaming params.
- Add `StreamManager.sol` + `StreamReceiptNFT.sol`.
- **Acceptance**: tests pass; event emitted with streamId; receipts minted.

### M3 — Gateway & API (2 weeks)
- x402 gateway service deployed in staging.
- **Acceptance**: Mog can receive x402 challenge & initiate stream.

### M4 — Mog Frontend Integration (2 weeks)
- Add stream UX based on `frontend/pages/buy.jsx`.
- **Acceptance**: user can start, view, and stop stream.

### M5 — Production Hardening (1–2 weeks)
- Monitoring dashboards + alerts.
- Load test 1k concurrent streams.
- **Acceptance**: SLA met, errors <1%.

## Risks
- **Relayer lag** could delay receipt minting.
- **ApeCoin liquidity** or RPC outages.
- **Complexity** of streaming payment compatibility with x402.
- **Security risk** if x402 gateway not hardened.

## Open Questions
1. Which chain hosts **ApeCoin** for streaming (ApeChain or mainnet)?
2. Does Mog require **real‑time stream updates** or only start/end events?
3. Will streaming receipts be **NFTs** (like ApeGate) or simple events?
4. Who owns/operates the x402 gateway (Mog vs ApeGate)?
5. Is there a defined **refund/cancel** policy for streams?

## Key ApeGate References Used
- `src/ApeGatePayment.sol` (EspHypNative payment flow)
- `src/ApeGateRouter.sol` (Hyperlane message validation + mint)
- `src/ApeGateTicketNFT.sol` (ERC‑721 receipt pattern)
- `frontend/pages/buy.jsx` (wallet connect + polling UX)
- `frontend/package.json` (build scripts)
- `README.md` (deployment + Hyperlane/Espresso flow)
