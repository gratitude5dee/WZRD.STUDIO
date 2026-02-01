
# Sign in with Moltbook Integration

## Overview
This plan implements "Sign in with Moltbook" authentication for AI agents in the Mog app. Moltbook provides universal identity for AI agents, allowing bots to authenticate with verified identity, reputation data (karma), and owner information.

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    AI Agent with Moltbook Identity                               │
│                    (sends X-Moltbook-Identity header)                            │
└───────────────────────────────────────┬─────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    verify-moltbook-identity Edge Function                        │
│                    - Extracts X-Moltbook-Identity header                         │
│                    - Calls Moltbook API to verify token                          │
│                    - Returns verified agent profile                              │
└───────────────────────────────────────┬─────────────────────────────────────────┘
                                        │
                   ┌────────────────────┴────────────────────┐
                   ▼                                          ▼
┌────────────────────────────────────┐     ┌────────────────────────────────────┐
│  Moltbook Verify API               │     │  Verified Agent Profile            │
│  POST /api/v1/agents/verify-identity│     │  - id, name, karma                 │
│  X-Moltbook-App-Key: <app key>     │     │  - avatar_url, is_claimed          │
│  Body: {"token": "...", "audience"}│     │  - owner: {x_handle, x_verified}   │
└────────────────────────────────────┘     └────────────────────────────────────┘
```

---

## Implementation Steps

### Step 1: Store Moltbook App API Key

Add the `MOLTBOOK_APP_KEY` secret to Supabase Edge Functions.

**Secret to Add:**
- **Name:** `MOLTBOOK_APP_KEY`
- **Value:** `moltbook_sk_bujliVoeImDMFwYAyqkw66c548d_gJ5G`

This secret will be used by the Edge Function to authenticate with the Moltbook API.

---

### Step 2: Create verify-moltbook-identity Edge Function

Create a new Edge Function that verifies Moltbook identity tokens.

**New File:** `supabase/functions/verify-moltbook-identity/index.ts`

**Functionality:**
1. Extract `X-Moltbook-Identity` header from incoming request
2. Call Moltbook's verification endpoint with:
   - Header: `X-Moltbook-App-Key` (from env)
   - Body: `{ token, audience }`
3. Return verified agent profile or appropriate error

**Request/Response:**
```typescript
// Input headers:
// X-Moltbook-Identity: <identity_token>

// Output on success:
{
  "success": true,
  "valid": true,
  "agent": {
    "id": "uuid",
    "name": "BotName",
    "karma": 420,
    "avatar_url": "https://...",
    "is_claimed": true,
    "follower_count": 42,
    "following_count": 10,
    "stats": { "posts": 156, "comments": 892 },
    "owner": {
      "x_handle": "human_owner",
      "x_verified": true,
      "x_follower_count": 10000
    }
  }
}

// Output on error:
{
  "success": false,
  "valid": false,
  "error": "identity_token_expired" | "invalid_token" | "invalid_app_key"
}
```

**Error Handling:**
- 401: No identity token provided
- 401: Invalid or expired token (with specific error code)
- 500: Failed to verify identity (Moltbook API unreachable)

---

### Step 3: Create MoltbookContext for Frontend

Create a context to manage Moltbook agent state in the React app.

**New File:** `src/contexts/MoltbookContext.tsx`

**Features:**
- Store authenticated Moltbook agent profile
- `verifyAgent(token)` - Verify an identity token
- `clearAgent()` - Clear agent authentication
- Expose agent data: id, name, karma, avatar, owner info
- Persist agent to localStorage for session continuity

**TypeScript Interface:**
```typescript
interface MoltbookAgent {
  id: string;
  name: string;
  karma: number;
  avatar_url: string | null;
  is_claimed: boolean;
  follower_count: number;
  following_count: number;
  stats: {
    posts: number;
    comments: number;
  };
  owner: {
    x_handle: string;
    x_name: string;
    x_avatar: string;
    x_verified: boolean;
    x_follower_count: number;
  } | null;
}
```

---

### Step 4: Create Moltbook Auth Hook

Create a reusable hook for components that need to verify Moltbook identity.

**New File:** `src/hooks/useMoltbookAuth.ts`

**Features:**
- `verifyIdentity(token)` - Call the Edge Function to verify a token
- `isVerifying` - Loading state
- `error` - Error message if verification fails
- Integration with MoltbookContext

---

### Step 5: Update Auth Page with Moltbook Sign-in Option

Add "Sign in with Moltbook" button to the existing Auth page.

**File:** `src/pages/Auth.tsx`

**Changes:**
- Add Moltbook icon/button to social login options
- Handle token from URL query param (for OAuth-style redirects)
- Call verification Edge Function on Moltbook sign-in
- Navigate to home on successful verification

**New UI Element:**
```text
┌───────────────────────────────────────┐
│  🤖 Continue with Moltbook           │
│     For AI agents                     │
└───────────────────────────────────────┘
```

---

### Step 6: Create Moltbook Verification Helper

Create a shared utility for other Edge Functions to verify Moltbook identity.

**New File:** `supabase/functions/_shared/moltbook-verify.ts`

**Functionality:**
- Reusable function: `verifyMoltbookIdentity(identityToken: string)`
- Used by other Edge Functions that need to authenticate Moltbook agents
- Returns typed agent profile or error

**Usage in other Edge Functions:**
```typescript
import { verifyMoltbookIdentity } from "../_shared/moltbook-verify.ts";

// In any Edge Function:
const identityToken = req.headers.get('X-Moltbook-Identity');
if (identityToken) {
  const result = await verifyMoltbookIdentity(identityToken);
  if (result.valid) {
    // Agent is authenticated, use result.agent
  }
}
```

---

### Step 7: Update Engagement Pay for Agent Support

Modify the engagement-pay Edge Function to support Moltbook agent authentication.

**File:** `supabase/functions/engagement-pay/index.ts`

**Changes:**
- Check for `X-Moltbook-Identity` header
- If present, verify with Moltbook API
- Allow agents to trigger engagements on behalf of their owner
- Log agent ID in payout metadata for attribution

---

### Step 8: Update App Provider Hierarchy

Add MoltbookProvider to the app's provider tree.

**File:** `src/App.tsx`

**Changes:**
- Import and add `MoltbookProvider`
- Place inside WalletProvider (agents can also have wallets)

---

## Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/verify-moltbook-identity/index.ts` | Create | Main verification Edge Function |
| `supabase/functions/_shared/moltbook-verify.ts` | Create | Reusable verification helper |
| `src/contexts/MoltbookContext.tsx` | Create | Frontend agent state management |
| `src/hooks/useMoltbookAuth.ts` | Create | Verification hook for components |
| `src/types/moltbook.ts` | Create | TypeScript interfaces for Moltbook |
| `src/pages/Auth.tsx` | Modify | Add Moltbook sign-in button |
| `supabase/functions/engagement-pay/index.ts` | Modify | Support agent authentication |
| `src/App.tsx` | Modify | Add MoltbookProvider |

---

## Secret Requirements

| Secret Name | Value | Purpose |
|-------------|-------|---------|
| `MOLTBOOK_APP_KEY` | `moltbook_sk_bujliVoeImDMFwYAyqkw66c548d_gJ5G` | Authenticate with Moltbook API for token verification |

---

## Edge Function Configuration

Update `supabase/config.toml` to disable JWT verification for the new function (it uses its own Moltbook-based auth):

```toml
[functions.verify-moltbook-identity]
verify_jwt = false
```

---

## Technical Details

### Token Verification Flow

1. Agent calls your endpoint with `X-Moltbook-Identity: <token>`
2. Your Edge Function extracts the token
3. Edge Function calls Moltbook API:
   ```
   POST https://moltbook.com/api/v1/agents/verify-identity
   X-Moltbook-App-Key: moltbook_sk_bujliVoeImDMFwYAyqkw66c548d_gJ5G
   Content-Type: application/json
   
   {"token": "<token>", "audience": "mog.lovable.app"}
   ```
4. Moltbook returns agent profile if valid
5. Edge Function attaches agent to request context

### Error Codes

| Error | Meaning | HTTP Status |
|-------|---------|-------------|
| `identity_token_expired` | Token has expired (1 hour default) | 401 |
| `invalid_token` | Token is malformed or revoked | 401 |
| `invalid_app_key` | Your app key is invalid | 500 |
| `audience_mismatch` | Token was issued for different service | 401 |

---

## Testing Strategy

1. Deploy the verify-moltbook-identity Edge Function
2. Test with a sample Moltbook identity token (if available)
3. Verify error handling for expired/invalid tokens
4. Test the Auth page "Sign in with Moltbook" flow
5. Verify agent data displays correctly in the UI
6. Test engagement-pay with agent authentication header

---

## Security Considerations

1. **Never expose MOLTBOOK_APP_KEY** - Only used server-side in Edge Functions
2. **Audience verification** - Always pass your domain as audience to prevent token reuse
3. **Token expiry** - Tokens expire after 1 hour by default; handle gracefully
4. **Rate limiting** - Moltbook may rate limit verification requests; implement caching if needed
