

# $5DEE Token Creator Payout System via Thirdweb x402 Protocol

## Executive Summary

Implement a Web3-native creator economy where every engagement action triggers automatic $5DEE token micropayments to content creators on a testnet. This transforms passive social interactions into direct creator compensation, powered by Thirdweb's x402 payment protocol on the Monad chain.

---

## Payout Economics

| Action | $5DEE Amount | Rationale |
|--------|-------------|-----------|
| **View** | 1 $5DEE | Low-friction passive engagement; highest volume |
| **Like/Love** | 5 $5DEE | Active endorsement signal; moderate volume |
| **Comment** | 10 $5DEE | High-value engagement; lower volume |
| **Share** | 3 $5DEE | Distribution amplification |
| **Bookmark** | 2 $5DEE | Content curation signal |

---

## Technical Architecture

### System Flow

```text
User Action (View/Like/Comment)
        |
        v
+------------------+
| useContentPayout |  (Frontend Hook)
+------------------+
        |
        v
+------------------+
| engagement-pay   |  (Edge Function)
+------------------+
        |
    +---+---+
    |       |
    v       v
+------+  +-------------+
| DB   |  | Thirdweb    |
| Log  |  | Transfer    |
+------+  +-------------+
              |
              v
        [Testnet Chain]
        $5DEE -> Creator
```

---

## Implementation Plan

### Phase 1: Database Schema for Payouts

#### New Table: `engagement_payouts`

Records all payout transactions with blockchain verification:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| content_type | text | 'track', 'video', 'article' |
| content_id | uuid | Reference to content |
| action_type | text | 'view', 'like', 'comment', 'share', 'bookmark' |
| payer_wallet | text | User who triggered the action |
| creator_wallet | text | Content creator receiving payout |
| amount | numeric | $5DEE amount |
| tx_hash | text | Blockchain transaction hash |
| status | text | 'pending', 'confirmed', 'failed' |
| created_at | timestamp | When action occurred |
| confirmed_at | timestamp | When blockchain confirmed |

#### New Table: `creator_balances`

Aggregated earnings for dashboard display:

| Column | Type | Description |
|--------|------|-------------|
| wallet_address | text | Creator's wallet (primary key) |
| total_earned | numeric | Lifetime $5DEE earned |
| pending_payout | numeric | Awaiting confirmation |
| views_earned | numeric | From view actions |
| likes_earned | numeric | From like actions |
| comments_earned | numeric | From comment actions |
| shares_earned | numeric | From share actions |
| last_payout_at | timestamp | Most recent payout |

#### New Table: `token_config`

Configurable payout rates:

| Column | Type | Description |
|--------|------|-------------|
| action_type | text | Primary key |
| payout_amount | numeric | $5DEE per action |
| is_enabled | boolean | Toggle payouts |
| daily_cap_per_user | integer | Rate limiting |
| updated_at | timestamp | Last config change |

---

### Phase 2: Thirdweb Token Integration

#### Token Contract Setup

Deploy $5DEE as an ERC-20 token on testnet:

```typescript
// src/lib/fiveDeeToken.ts
import { getContract } from "thirdweb";
import { thirdwebClient, chain } from "./thirdweb";

export const FIVE_DEE_CONTRACT_ADDRESS = "0x..."; // Testnet deployment

export const fiveDeeContract = getContract({
  client: thirdwebClient,
  chain,
  address: FIVE_DEE_CONTRACT_ADDRESS,
});

// Payout configuration
export const PAYOUT_RATES = {
  view: 1,
  like: 5,
  comment: 10,
  share: 3,
  bookmark: 2,
} as const;
```

#### Server Wallet for Payouts

Use Thirdweb Engine or server wallet for gasless payouts:

```typescript
// supabase/functions/_shared/thirdweb-server.ts
import { createThirdwebClient, prepareContractCall, sendTransaction } from "thirdweb";
import { privateKeyToAccount } from "thirdweb/wallets";

const serverAccount = privateKeyToAccount({
  client: thirdwebClient,
  privateKey: Deno.env.get("PAYOUT_WALLET_PRIVATE_KEY")!,
});

export async function transferFiveDee(
  toAddress: string,
  amount: bigint
): Promise<string> {
  const tx = prepareContractCall({
    contract: fiveDeeContract,
    method: "transfer",
    params: [toAddress, amount],
  });
  
  const result = await sendTransaction({
    account: serverAccount,
    transaction: tx,
  });
  
  return result.transactionHash;
}
```

---

### Phase 3: Edge Function - Engagement Payout

Create `supabase/functions/engagement-pay/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// Import Thirdweb for token transfer

const PAYOUT_RATES = {
  view: 1n * 10n ** 18n,    // 1 $5DEE
  like: 5n * 10n ** 18n,    // 5 $5DEE
  comment: 10n * 10n ** 18n, // 10 $5DEE
  share: 3n * 10n ** 18n,
  bookmark: 2n * 10n ** 18n,
};

serve(async (req) => {
  const { 
    content_type,
    content_id, 
    action_type,
    payer_wallet 
  } = await req.json();
  
  // 1. Get creator wallet from content table
  const tableName = content_type === 'track' ? 'music_tracks' 
    : content_type === 'video' ? 'music_videos' 
    : 'articles';
  
  const { data: content } = await supabase
    .from(tableName)
    .select('artist_wallet, author_wallet')
    .eq('id', content_id)
    .single();
  
  const creatorWallet = content.artist_wallet || content.author_wallet;
  
  // 2. Check rate limits (prevent spam)
  // 3. Process token transfer via Thirdweb
  // 4. Log transaction in engagement_payouts
  // 5. Update creator_balances aggregate
  
  return Response.json({ 
    success: true, 
    tx_hash: txHash,
    amount: payoutAmount 
  });
});
```

---

### Phase 4: Frontend Integration

#### Update `useContentEngagement` Hook

Add payout trigger to existing engagement actions:

```typescript
// src/hooks/useContentEngagement.ts

const triggerPayout = useCallback(async (actionType: string) => {
  if (!address) return;
  
  try {
    await supabase.functions.invoke('engagement-pay', {
      body: {
        content_type: contentType,
        content_id: contentId,
        action_type: actionType,
        payer_wallet: address.toLowerCase()
      }
    });
  } catch (error) {
    console.error('Payout failed:', error);
    // Non-blocking - don't prevent engagement action
  }
}, [address, contentType, contentId]);

// Integrate into handleLike
const handleLike = useCallback(async () => {
  // ... existing like logic
  if (newLikedState) {
    triggerPayout('like'); // Fire and forget
  }
}, [/* deps */]);
```

#### View Tracking for Payouts

Add view payout on content mount:

```typescript
// src/hooks/useViewPayout.ts
export function useViewPayout(contentType: ContentType, contentId: string) {
  const { address } = useWallet();
  const hasTrackedRef = useRef(false);
  
  useEffect(() => {
    if (!address || hasTrackedRef.current) return;
    
    const timer = setTimeout(async () => {
      hasTrackedRef.current = true;
      
      await supabase.functions.invoke('engagement-pay', {
        body: {
          content_type: contentType,
          content_id: contentId,
          action_type: 'view',
          payer_wallet: address.toLowerCase()
        }
      });
    }, 5000); // 5 second minimum view time
    
    return () => clearTimeout(timer);
  }, [address, contentType, contentId]);
}
```

---

### Phase 5: Creator Dashboard

#### Earnings Overview Component

```typescript
// src/components/creator/EarningsOverview.tsx
interface CreatorEarnings {
  total_earned: number;
  views_earned: number;
  likes_earned: number;
  comments_earned: number;
  recent_payouts: PayoutRecord[];
}

export function EarningsOverview() {
  // Fetch from creator_balances table
  // Display breakdown by action type
  // Show transaction history with tx hashes
}
```

---

## Cross-Chain Functionality Ideas

### Near-Term Enhancements

| Feature | Description | Complexity |
|---------|-------------|------------|
| **Multi-chain wallet display** | Show $5DEE balance across chains | Low |
| **Testnet faucet** | Let users claim test $5DEE | Low |
| **Payout receipts** | NFT receipts for major earnings milestones | Medium |
| **Gasless transactions** | Thirdweb Engine for zero-gas payouts | Medium |

### Future Cross-Chain Features

| Feature | Description | Technical Approach |
|---------|-------------|-------------------|
| **Bridge to mainnet** | Convert testnet earnings to real tokens | Thirdweb Cross-chain |
| **Multi-chain payouts** | Creators choose payout chain | Chain abstraction layer |
| **Content NFTs** | Mint popular content as collectibles | ERC-1155 with royalties |
| **Staking rewards** | Stake $5DEE for premium features | Staking contract |
| **DAO governance** | Token holders vote on platform features | Governor contract |

---

## File Changes Summary

### New Files

| File | Purpose |
|------|---------|
| `supabase/functions/engagement-pay/index.ts` | Payout processing edge function |
| `supabase/functions/_shared/thirdweb-server.ts` | Server-side Thirdweb utilities |
| `src/lib/fiveDeeToken.ts` | Token contract configuration |
| `src/hooks/useViewPayout.ts` | View tracking with payout |
| `src/hooks/useCreatorEarnings.ts` | Fetch creator earnings |
| `src/components/creator/EarningsOverview.tsx` | Earnings dashboard UI |
| `src/components/creator/PayoutHistory.tsx` | Transaction history |

### Modified Files

| File | Changes |
|------|---------|
| `src/hooks/useContentEngagement.ts` | Add payout triggers |
| `src/components/engagement/LikeButton.tsx` | Fire payout on like |
| `src/components/engagement/ContentCommentsSheet.tsx` | Fire payout on comment |
| `src/pages/WatchHome.tsx` | Add view payout hook |
| `src/pages/Listen.tsx` | Add view payout hook |
| `src/pages/Read.tsx` | Add view payout hook |

### Database Migration

```sql
-- Create payout tracking tables
CREATE TABLE engagement_payouts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  action_type text NOT NULL,
  payer_wallet text NOT NULL,
  creator_wallet text NOT NULL,
  amount numeric NOT NULL,
  tx_hash text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  UNIQUE(content_type, content_id, action_type, payer_wallet)
);

CREATE TABLE creator_balances (
  wallet_address text PRIMARY KEY,
  total_earned numeric DEFAULT 0,
  pending_payout numeric DEFAULT 0,
  views_earned numeric DEFAULT 0,
  likes_earned numeric DEFAULT 0,
  comments_earned numeric DEFAULT 0,
  shares_earned numeric DEFAULT 0,
  last_payout_at timestamptz
);

CREATE TABLE token_config (
  action_type text PRIMARY KEY,
  payout_amount numeric NOT NULL,
  is_enabled boolean DEFAULT true,
  daily_cap_per_user integer DEFAULT 100,
  updated_at timestamptz DEFAULT now()
);

-- Seed default payout rates
INSERT INTO token_config (action_type, payout_amount) VALUES
  ('view', 1),
  ('like', 5),
  ('comment', 10),
  ('share', 3),
  ('bookmark', 2);
```

---

## Required Secrets

| Secret Name | Purpose |
|-------------|---------|
| `PAYOUT_WALLET_PRIVATE_KEY` | Server wallet for sending payouts |
| `FIVE_DEE_CONTRACT_ADDRESS` | Deployed token contract |

---

## Anti-Abuse Measures

| Measure | Implementation |
|---------|----------------|
| Rate limiting | Max 100 payouts per user per day |
| View minimum | 5 second view time before payout |
| Duplicate prevention | Unique constraint on action+content+user |
| Self-interaction block | Cannot earn from own content |
| Velocity checks | Flag unusual activity patterns |

---

## Testing Strategy

1. Deploy $5DEE token to Monad testnet
2. Fund server wallet with testnet tokens
3. Test each action type triggers correct payout
4. Verify transaction hashes on block explorer
5. Confirm creator balance aggregation
6. Load test rate limiting

