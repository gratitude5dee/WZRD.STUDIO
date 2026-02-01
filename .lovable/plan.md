
# Sign in with Moltbook Integration (Mocked Version)

## Overview
This updated plan implements "Sign in with Moltbook" authentication with **mocked verification logic** that can be easily swapped for the real Moltbook API once you receive the API key.

---

## Implementation Steps

### Step 1: Create Moltbook Types
**New File:** `src/types/moltbook.ts`

TypeScript interfaces for the Moltbook agent profile and verification responses.

---

### Step 2: Create Shared Verification Helper (Mocked)
**New File:** `supabase/functions/_shared/moltbook-verify.ts`

- Contains mock agent data for testing
- Supports special test tokens: `mock_agent_1`, `mock_agent_2`, `test_token`
- Simulates error cases: `expired_token`, `invalid_token`
- Any other token creates a dynamic mock agent
- **Commented-out real API code** ready to enable when API key arrives

---

### Step 3: Create verify-moltbook-identity Edge Function
**New File:** `supabase/functions/verify-moltbook-identity/index.ts`

- Extracts `X-Moltbook-Identity` header
- Calls the mocked verification helper
- Returns agent profile or error responses

**Update:** `supabase/config.toml`
```toml
[functions.verify-moltbook-identity]
verify_jwt = false
```

---

### Step 4: Create MoltbookContext
**New File:** `src/contexts/MoltbookContext.tsx`

- Stores verified agent profile
- Persists to localStorage for session continuity
- Provides `verifyAgent(token)` and `clearAgent()` methods

---

### Step 5: Create useMoltbookAuth Hook
**New File:** `src/hooks/useMoltbookAuth.ts`

- Reusable hook for components
- Handles loading and error states

---

### Step 6: Update Auth Page
**Modify:** `src/pages/Auth.tsx`

- Add "Sign in with Moltbook" button (robot icon 🤖)
- Add token input dialog for testing
- Check URL for `moltbook_token` query param
- Navigate to home on successful verification

---

### Step 7: Update App Providers
**Modify:** `src/App.tsx`

- Import and add `MoltbookProvider` to provider tree

---

### Step 8: Update Engagement Pay (Optional)
**Modify:** `supabase/functions/engagement-pay/index.ts`

- Check for `X-Moltbook-Identity` header
- Verify agent and log in payout metadata

---

## Test Tokens for Development

| Token | Behavior |
|-------|----------|
| `mock_agent_1` | Returns "MogBot" with karma 420, verified owner |
| `mock_agent_2` | Returns "StreamerBot" with karma 150, no owner |
| `test_token` | Returns "TestAgent" with karma 100, unverified owner |
| `expired_token` | Returns error: `identity_token_expired` |
| `invalid_token` | Returns error: `invalid_token` |
| Any other string | Creates a dynamic mock agent |

---

## When API Key Arrives

1. Add `MOLTBOOK_APP_KEY` secret to Supabase
2. Uncomment the real API code in `_shared/moltbook-verify.ts`
3. Remove or reduce mock logic
4. Test with real Moltbook tokens

---

## Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/types/moltbook.ts` | Create | TypeScript interfaces |
| `supabase/functions/_shared/moltbook-verify.ts` | Create | Mocked verification helper |
| `supabase/functions/verify-moltbook-identity/index.ts` | Create | Main verification Edge Function |
| `supabase/config.toml` | Modify | Add JWT config for new function |
| `src/contexts/MoltbookContext.tsx` | Create | Frontend agent state |
| `src/hooks/useMoltbookAuth.ts` | Create | Verification hook |
| `src/pages/Auth.tsx` | Modify | Add Moltbook sign-in button |
| `src/App.tsx` | Modify | Add MoltbookProvider |
