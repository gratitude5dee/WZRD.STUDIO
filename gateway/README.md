# Mog x402 Gateway (Phase 2)

Minimal placeholder gateway for x402 streaming payouts.

## Run
```bash
cd gateway
npm install
npm run dev
```

## Endpoints
- `POST /api/pay/:trackId` → x402 challenge then stream session
- `POST /api/event` → store track event (view/listen/stream)
- `GET /api/session/active?trackId=...&walletAddress=...` → latest valid session
- `GET /health`

## Env
- `PORT` (default 4020)
- `THIRDWEB_SECRET_KEY`
- `THIRDWEB_SERVER_WALLET_ADDRESS`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `X402_CHAIN_ID` (default 3313939)
- `X402_RPC_URL` (default https://apechain-tnet.rpc.caldera.xyz/http)
