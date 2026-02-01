
# $5DEE Token Notifications & ApeChain Blockchain Integration

## Overview
Implement a complete real-time $5DEE token notification system with true blockchain payouts on ApeChain. This includes:
1. **NotificationContext** for in-app notifications
2. **ApeChain configuration** for Thirdweb
3. **distribute-rewards Edge Function** with server-side signing
4. **Wallet UI updates** to display $5DEE balance and earnings
5. **Mog engagement integration** for $5DEE payouts

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           User Engagement (like/comment/bookmark/share)          │
└───────────────────────────────────┬─────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    MogPostCard / useContentEngagement                            │
│                         triggers payout & notification                           │
└───────────────────────────────────┬─────────────────────────────────────────────┘
                                    │
              ┌─────────────────────┴─────────────────────┐
              ▼                                           ▼
┌──────────────────────────────┐           ┌──────────────────────────────────────┐
│  distribute-rewards          │           │  NotificationContext                 │
│  Edge Function               │           │  - Stores notifications              │
│  - Server-side signing       │           │  - Persists to localStorage          │
│  - Thirdweb + ApeChain       │           │  - Shows toast + dropdown            │
│  - Admin wallet pays gas     │           └──────────────────────────────────────┘
└──────────────────────────────┘
              │
              ▼
┌──────────────────────────────┐
│  $5DEE ERC-20 Contract       │
│  on ApeChain                 │
│  Token transferred to        │
│  creator wallet              │
└──────────────────────────────┘
```

---

## Implementation Steps

### Step 1: Configure Thirdweb for ApeChain

Update the Thirdweb configuration to use ApeChain instead of Monad.

**File:** `src/lib/thirdweb.ts`

**Changes:**
- Import `defineChain` from thirdweb
- Define ApeChain (Curtis Testnet ID: 33111, Mainnet: 33139)
- Export `FIVE_DEE_TOKEN_ADDRESS` constant
- Export `tokenContract` for frontend reference

```typescript
import { createThirdwebClient, defineChain, getContract } from "thirdweb";

export const apeChain = defineChain({
  id: 33111, // Curtis Testnet (use 33139 for Mainnet)
  name: "ApeChain Curtis",
  rpc: "https://rpc.curtis.apechain.com",
  nativeCurrency: {
    name: "ApeCoin",
    symbol: "APE",
    decimals: 18,
  },
});

export const FIVE_DEE_TOKEN_ADDRESS = "0x954fA8cfb797a26D4878ee212004889a2C9D7624";

export const tokenContract = getContract({
  client: thirdwebClient,
  chain: apeChain,
  address: FIVE_DEE_TOKEN_ADDRESS,
});
```

---

### Step 2: Create NotificationContext

Create a context to manage in-app notifications with persistence and toast integration.

**New File:** `src/contexts/NotificationContext.tsx`

**Features:**
- Store notifications with type, amount, action, timestamp
- `addNotification()` - add new notification and show toast
- `markAllAsRead()` - clear unread status
- `clearNotifications()` - remove all notifications
- Persist to localStorage for session continuity
- Max 50 notifications retained

**Notification Types:**
- `payout` - $5DEE token earnings (green/gold styling)
- `upload` - New content uploaded
- `transaction` - General blockchain transactions
- `system` - Platform notifications

---

### Step 3: Create distribute-rewards Edge Function

Create a new Edge Function that handles server-side token transfers using an Admin wallet.

**New File:** `supabase/functions/distribute-rewards/index.ts`

**Secret Required:** `ADMIN_PRIVATE_KEY` - The private key of the platform's admin wallet that holds $5DEE tokens and pays gas fees.

**Logic Flow:**
1. Accept JSON body: `{ creatorWallet, amount, actionType, contentId }`
2. Initialize Thirdweb client with `THIRDWEB_SECRET_KEY`
3. Create Admin Account from `ADMIN_PRIVATE_KEY`
4. Connect to $5DEE ERC-20 contract on ApeChain
5. Prepare transfer: `transfer(to: creatorWallet, amount: amount * 10^18)`
6. Send transaction signed by Admin wallet
7. Return `{ success: true, txHash, amount }`

**Error Handling:**
- Return 400 for missing fields
- Return 500 if transaction fails with descriptive error
- Log all transactions for debugging

---

### Step 4: Update engagement-pay Edge Function

Modify the existing `engagement-pay` function to call `distribute-rewards` for real blockchain payouts.

**File:** `supabase/functions/engagement-pay/index.ts`

**Changes:**
- After validation and anti-abuse checks, call `distribute-rewards` internally
- Store the real `tx_hash` from blockchain response
- Update `engagement_payouts` table with confirmed transaction
- Return payout details including action type for notifications

---

### Step 5: Update useEngagementPayout Hook

Add notification triggering when payouts succeed.

**File:** `src/hooks/useEngagementPayout.ts`

**Changes:**
- Import NotificationContext
- On successful payout response, call `addNotification()`
- Include action type and amount in notification

```typescript
if (response.data?.success) {
  addNotification({
    type: 'payout',
    title: `+${response.data.amount} $5DEE`,
    description: `You earned tokens for your ${actionType}!`,
    amount: response.data.amount,
    actionType: actionType,
  });
}
```

---

### Step 6: Integrate $5DEE Payouts into MogPostCard

Update the Mog engagement handlers to trigger $5DEE payouts.

**File:** `src/components/mog/MogPostCard.tsx`

**Changes:**
- Import and use `useEngagementPayout` hook with `contentType: 'mog'`
- Call `triggerPayout('like')` in `handleLike`
- Call `triggerPayout('bookmark')` in `handleBookmark`
- Call `triggerPayout('share')` in `handleShare`
- Add comment payout in `MogCommentsSheet` when user posts a comment

---

### Step 7: Update NotificationsDropdown

Replace mock data with real notifications from context.

**File:** `src/components/NotificationsDropdown.tsx`

**Changes:**
- Import and use NotificationContext
- Add new `payout` notification type with coin icon (🪙)
- Display $5DEE amount in green/gold color
- Show action type (like, comment, share, bookmark)
- Add "Mark all as read" button
- Add "Clear all" option
- Dynamic unread count badge

**Payout Notification Styling:**
```text
┌───────────────────────────────────────┐
│ 🪙  +5 $5DEE                    • new │
│     You earned for your like!         │
│     2 min ago                         │
└───────────────────────────────────────┘
```

---

### Step 8: Update WalletModal with $5DEE Balance

Display the user's earned $5DEE balance and breakdown.

**File:** `src/components/WalletModal.tsx`

**Changes:**
- Fetch `creator_balances` from Supabase on open
- Display `$5DEE Earnings` section below wallet address
- Show total earned with token icon
- Display breakdown by action type:
  - 👁 Views: X
  - 🦞 Likes: X  
  - 💬 Comments: X
  - 🔗 Shares: X
  - 🔖 Bookmarks: X

**New Section Layout:**
```text
┌────────────────────────────────────────┐
│  🪙 $5DEE Earnings                     │
│  ─────────────────────                 │
│  Total: 247 $5DEE                      │
│                                        │
│  👁 120  🦞 85  💬 30  🔗 12           │
└────────────────────────────────────────┘
```

---

### Step 9: Update WalletContext for ApeChain

Ensure wallet connection enforces ApeChain network.

**File:** `src/contexts/WalletContext.tsx`

**Changes:**
- Import `apeChain` from thirdweb config
- Use ApeChain as the required network
- Pass chain to wallet connect

---

### Step 10: Wrap App with NotificationProvider

Add the notification context to the app tree.

**File:** `src/App.tsx`

**Changes:**
- Import `NotificationProvider`
- Wrap inside `WalletProvider`

---

## Database Changes Required

Update `engagement_payouts` table to support Mog content type:

**Migration:** Add 'mog' as valid content_type in existing check constraint (if any) or handle in code.

---

## Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/thirdweb.ts` | Modify | Configure ApeChain, export token contract |
| `src/contexts/NotificationContext.tsx` | Create | Manage in-app notifications |
| `supabase/functions/distribute-rewards/index.ts` | Create | Server-side token transfers |
| `supabase/functions/engagement-pay/index.ts` | Modify | Integrate with distribute-rewards |
| `src/hooks/useEngagementPayout.ts` | Modify | Add notification on success |
| `src/components/mog/MogPostCard.tsx` | Modify | Add $5DEE payouts to Mog engagement |
| `src/components/NotificationsDropdown.tsx` | Modify | Use real notifications, add payout type |
| `src/components/WalletModal.tsx` | Modify | Display $5DEE balance |
| `src/contexts/WalletContext.tsx` | Modify | Use ApeChain |
| `src/App.tsx` | Modify | Add NotificationProvider |

---

## Secret Requirements

A new secret is required:

| Secret Name | Purpose |
|-------------|---------|
| `ADMIN_PRIVATE_KEY` | Private key of platform wallet that holds $5DEE and pays gas fees for creator payouts |

Existing secrets already configured:
- `THIRDWEB_SECRET_KEY` - For server-side Thirdweb SDK
- `THIRDWEB_CLIENT_ID` - For frontend client

---

## Testing Strategy

1. Connect wallet and switch to ApeChain network
2. Like a Mog post
3. Verify toast notification appears: "+5 $5DEE"
4. Check NotificationsDropdown shows the payout
5. Open WalletModal and verify $5DEE balance displays
6. Check `engagement_payouts` table for new record
7. Verify `creator_balances` updates for the creator

---

## Edge Cases Handled

1. **Self-interaction blocked** - No payout or notification
2. **Daily limit reached** - No payout, no notification
3. **Already rewarded** - No duplicate payout
4. **No wallet connected** - Toast prompts connection
5. **Transaction failure** - Error logged, graceful fallback
6. **Creator balance doesn't exist** - Show "0 $5DEE" with graceful fallback
7. **Wrong network** - Wallet prompts switch to ApeChain
