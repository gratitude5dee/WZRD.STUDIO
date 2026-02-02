
# Fix Notification System - Complete Overhaul

## Problem Summary

The notification system is not showing earnings because of three interconnected issues:

1. **Notifications only track creator earnings** - but you're a consumer (payer), not a creator
2. **Realtime subscription is broken** - `engagement_payouts` table is not published for realtime
3. **No initial data load** - Historical payouts are never fetched from the database

---

## Solution Architecture

### Option A: Show Earnings for Creators Only (Current Intent)
Keep the system as-is but:
- Add the table to realtime publication
- Fetch initial data on mount
- You'll see notifications when **someone engages with YOUR content**

### Option B: Show All Engagement Activity (Better UX for Testing)
Expand notifications to show:
- Your earnings when you're a creator (someone liked YOUR video)
- Your spending when you're a payer (you liked SOMEONE's video)

I recommend **Option B** for now since it provides immediate visual feedback.

---

## Implementation Steps

### Step 1: Database Migration - Enable Realtime
Add `engagement_payouts` table to the Supabase realtime publication so subscriptions work.

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.engagement_payouts;
```

---

### Step 2: Update NotificationContext
Modify to:
1. **Fetch initial payouts** from database on mount
2. **Track both creator AND payer activities** for better testing visibility
3. **Add polling fallback** in case realtime fails

```typescript
// Key changes:
// 1. Add initial fetch useEffect
useEffect(() => {
  if (!address) return;
  
  const fetchInitialPayouts = async () => {
    const { data } = await supabase
      .from("engagement_payouts")
      .select("*")
      .or(`creator_wallet.eq.${address},payer_wallet.eq.${address}`)
      .order("created_at", { ascending: false })
      .limit(MAX_NOTIFICATIONS);
    
    if (data) {
      // Map and merge with localStorage
      const mapped = data.map(payout => ({
        id: payout.id,
        type: "payout",
        isCreator: payout.creator_wallet === address,
        actionType: payout.action_type,
        contentType: payout.content_type,
        contentId: payout.content_id,
        amount: payout.amount,
        txHash: payout.tx_hash,
        createdAt: payout.created_at,
        read: false,
      }));
      
      setNotifications(prev => mergeAndDedupe(prev, mapped));
    }
  };
  
  fetchInitialPayouts();
}, [address]);

// 2. Subscribe to BOTH creator and payer events
// Update realtime filter to OR condition
```

---

### Step 3: Update NotificationsDropdown UI
Add visual distinction between:
- **Earned** (when you're the creator): "❤️ +5 $5DEE - Someone liked your video"
- **Spent** (when you're the payer): "❤️ -5 $5DEE - You liked a video" (or just confirmation)

---

### Step 4: Update TransactionsSheet
Similar change - show both:
- Earnings tab: payouts where you're the creator
- Activity tab: all your engagement actions (payer + creator)

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/migrations/*` | Add `engagement_payouts` to realtime publication |
| `src/contexts/NotificationContext.tsx` | Add initial fetch, expand filter, add deduplication |
| `src/components/NotificationsDropdown.tsx` | Add earned vs spent visual distinction |
| `src/components/TransactionsSheet.tsx` | Update query to also show payer activity |

---

## Technical Details

### PayoutNotification Type Update
```typescript
export interface PayoutNotification {
  id: string;
  type: "payout";
  isCreator: boolean;  // NEW: true if you earned, false if you spent
  actionType: PayoutActionType;
  contentType: string;
  contentId: string;
  amount: number;
  txHash: string | null;
  createdAt: string;
  read: boolean;
}
```

### Realtime Subscription Update
Since Supabase realtime filter doesn't support OR conditions, we'll:
1. Subscribe without a wallet filter
2. Filter client-side for relevant payouts (where user is creator OR payer)

```typescript
const channel = supabase
  .channel("payout-notifications")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "engagement_payouts",
    },
    (payload) => {
      const payout = payload.new;
      // Check if this payout is relevant to current user
      if (payout.creator_wallet !== address && payout.payer_wallet !== address) {
        return; // Not relevant
      }
      
      const isCreator = payout.creator_wallet === address;
      // Show appropriate notification...
    }
  )
  .subscribe();
```

---

## Expected Behavior After Fix

1. **When you LIKE a video:**
   - Toast: "❤️ Liked! Creator earned 5 $5DEE"
   - Your Activity shows: "You liked a video"
   
2. **When someone LIKES YOUR video:**
   - Toast: "❤️ +5 $5DEE earned!"
   - Earnings shows: "+5 $5DEE from like"
   - Bell icon shows unread count

3. **TransactionsSheet > Earnings tab:**
   - Shows all payouts where you are the creator

4. **TransactionsSheet > Activity tab (new):**
   - Shows all your engagement actions

---

## Testing Steps

After implementation:
1. Connect wallet
2. Go to `/watch` page
3. Like a video you haven't liked before
4. Verify toast appears: "Liked! Creator earned 5 $5DEE"
5. Check bell dropdown - should show the activity
6. Open Transactions Sheet > Activity tab - should show the like
