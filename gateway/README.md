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
- `GET /api/stream/check/:streamId` → validate session
- `GET /health`

## Env
- `PORT` (default 4020)
