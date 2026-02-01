
# Fix Pre-existing Build Errors

## Overview
These build errors are **not GitHub sync issues** - they are mismatches between the code and the current thirdweb SDK version plus database schema. I'll fix all 6 errors.

---

## Error Fixes

### Fix 1: ThirdwebConnectButton.tsx (line 2)
**Issue:** Imports `chain` but the export is named `apeChain`

**Solution:** Change the import from `chain` to `apeChain`
```typescript
// Before
import { thirdwebClient, chain } from "@/lib/thirdweb";

// After
import { thirdwebClient, apeChain } from "@/lib/thirdweb";
```
Also update the usage from `chain={chain}` to `chain={apeChain}`

---

### Fix 2: MogPostCard.tsx (line 158)
**Issue:** TypeScript complains `'clipboard' does not exist on type 'never'`

**Solution:** The `if (!("share" in navigator))` narrows the type incorrectly. Fix by checking clipboard existence properly:
```typescript
// Before
if (!("share" in navigator)) {
  await navigator.clipboard.writeText(shareUrl);
  ...
}

// After
if (!("share" in navigator) && navigator.clipboard) {
  await navigator.clipboard.writeText(shareUrl);
  ...
}
```

---

### Fix 3: WalletContext.tsx (line 58)
**Issue:** thirdweb's `Account` type doesn't have a `chainId` property

**Solution:** Remove the `account.chainId` check since we're already using `apeChain.id` as the target:
```typescript
// Before
if (wallet && account && account.chainId !== apeChain.id && "switchChain" in wallet) {

// After  
if (wallet && account && "switchChain" in wallet) {
```

---

### Fix 4: x402.ts (line 12)
**Issue:** thirdweb's `wrapFetchWithPayment` API changed - expects options object, not bigint

**Solution:** Update the function signature to pass an options object:
```typescript
// Before
return wrapFetchWithPayment(fetch, thirdwebClient, wallet, maxValue);

// After
return wrapFetchWithPayment(fetch, thirdwebClient, wallet, { maxValue });
```

---

### Fix 5: MogLibrary.tsx (line 51)
**Issue:** Type mismatch when mapping Supabase response - `content_type` is `string` but MogPost expects `"article" | "image" | "video"`

**Solution:** The current code already has proper null filtering. The issue is the inline type annotation. Remove it and let TypeScript infer:
```typescript
// Before
.map((row: { mog_posts: MogPost }) => row.mog_posts)

// After (already in file, just needs the null check)
.map((row: { mog_posts: MogPost | null }) => row.mog_posts)
.filter(Boolean) as MogPost[];
```
This is actually already correct in the file. The issue is the Supabase types - need to cast properly.

---

### Fix 6: Read.tsx (line 214/223)
**Issue:** The `articles` table doesn't have an `author_wallet` column in the database

**Solution:** Remove `author_wallet` from the select query and the Article interface, OR check if the column exists first:

**Option A (Remove if column doesn't exist):**
```typescript
// Remove from select query
.select("id, title, author, excerpt, image_url, tags, topics, published_at, likes_count, comments_count, shares_count, views_count")

// Remove from interface
interface Article {
  // ... remove author_wallet
}
```

**Option B (Keep but make nullable with fallback):**
Since the code uses `author_wallet` for engagement tracking, we should keep it but handle the case where it might not exist yet.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/ThirdwebConnectButton.tsx` | Fix import `chain` to `apeChain` |
| `src/components/mog/MogPostCard.tsx` | Fix clipboard access type narrowing |
| `src/contexts/WalletContext.tsx` | Remove `account.chainId` check |
| `src/lib/x402.ts` | Update to use options object `{ maxValue }` |
| `src/pages/MogLibrary.tsx` | Add proper type casting for Supabase response |
| `src/pages/Read.tsx` | Remove `author_wallet` from query or add column to DB |

---

## Technical Notes

These errors indicate:
1. **thirdweb SDK was updated** - API signatures changed
2. **Database schema drift** - Code references a column (`author_wallet`) that doesn't exist

The Moltbook integration I just implemented is **separate from these issues** and should work once these pre-existing errors are fixed.
