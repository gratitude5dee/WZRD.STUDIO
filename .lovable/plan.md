

# Unify Upload Button & MogUpload with Thirdweb Integration

## Overview

This plan updates the "+" upload button in the Library header and the MogUpload page to use thirdweb's wallet connection system instead of the current manual `window.ethereum` approach. This provides a more robust, user-friendly wallet connection experience with support for multiple wallets.

## Current State

- The "+" button on Library page (line 148) navigates directly to `/upload`
- MogUpload uses the custom `WalletContext` which relies on `window.ethereum`
- Thirdweb is installed (`v5.115.3`) but not actively used for connection
- The thirdweb client is configured in `src/lib/thirdweb.ts` with Monad chain

## Changes Required

### 1. Add ThirdwebProvider to App

Wrap the application with thirdweb's provider to enable its hooks throughout the app.

**File: `src/App.tsx`**
- Import `ThirdwebProvider` from `thirdweb/react`
- Wrap existing providers with `ThirdwebProvider`

### 2. Update WalletContext to Use Thirdweb

Modify the WalletContext to use thirdweb's hooks internally, maintaining the same interface for backward compatibility.

**File: `src/contexts/WalletContext.tsx`**
- Import `useActiveAccount`, `useActiveWallet`, `useConnect`, `useDisconnect` from thirdweb
- Replace `window.ethereum` logic with thirdweb hooks
- Keep the same exported interface (`address`, `isConnected`, `connect`, `disconnect`)

### 3. Update Library Upload Button

Make the "+" button smart about wallet connection - if not connected, trigger wallet connection first.

**File: `src/pages/Library.tsx`**
- Update the "+" button click handler to check wallet connection
- If not connected, open wallet connection modal
- If connected, navigate to `/mog/upload` (unified with Mog)

### 4. Update MogUpload Submit Button

Use thirdweb's ConnectButton or custom integration for the submit button when wallet is not connected.

**File: `src/pages/MogUpload.tsx`**
- Import thirdweb's `ConnectButton` component
- When `!address`, render thirdweb ConnectButton instead of disabled "Connect Wallet" button
- Use consistent styling with the rest of the app

### 5. Create Unified ThirdwebConnectButton Component

Create a reusable component that wraps thirdweb's ConnectButton with app-consistent styling.

**New File: `src/components/ThirdwebConnectButton.tsx`**
- Import thirdweb client and chain config
- Customize button appearance to match app theme
- Support both inline and full-width variants

## Detailed Component Changes

### App.tsx Changes

```typescript
import { ThirdwebProvider } from "thirdweb/react";
import { thirdwebClient } from "@/lib/thirdweb";

// Wrap with ThirdwebProvider
<ThirdwebProvider>
  <QueryClientProvider client={queryClient}>
    {/* existing providers */}
  </QueryClientProvider>
</ThirdwebProvider>
```

### WalletContext.tsx Integration

```typescript
import { useActiveAccount, useConnect, useDisconnect } from "thirdweb/react";
import { thirdwebClient, chain } from "@/lib/thirdweb";

// Replace window.ethereum logic with:
const account = useActiveAccount();
const { connect: thirdwebConnect } = useConnect();
const { disconnect: thirdwebDisconnect } = useDisconnect();

// Derive state from thirdweb
const address = account?.address ?? null;
const isConnected = !!account;
```

### Library.tsx Button Update

```typescript
const handleUploadClick = () => {
  if (!address) {
    // Trigger wallet connection
    connect();
  } else {
    navigate("/mog/upload");
  }
};

// Or show wallet modal if not connected
<button onClick={handleUploadClick}>
  <Plus className="h-6 w-6" />
</button>
```

### MogUpload.tsx Submit Section

```typescript
import { ConnectButton } from "thirdweb/react";
import { thirdwebClient, chain } from "@/lib/thirdweb";

// In render, replace the submit button section:
{!address ? (
  <ConnectButton
    client={thirdwebClient}
    chain={chain}
    connectButton={{
      label: "Connect Wallet to Post",
      className: "w-full py-6 text-lg",
    }}
  />
) : (
  <Button
    onClick={handleSubmit}
    disabled={uploading}
    className="w-full py-6 text-lg"
  >
    {uploading ? 'Creating...' : 'Post Mog'}
  </Button>
)}
```

## File Summary

| File | Action | Description |
|------|--------|-------------|
| `src/App.tsx` | Modify | Add ThirdwebProvider wrapper |
| `src/contexts/WalletContext.tsx` | Modify | Integrate thirdweb hooks |
| `src/components/ThirdwebConnectButton.tsx` | Create | Reusable styled connect button |
| `src/pages/Library.tsx` | Modify | Smart upload button with wallet check |
| `src/pages/MogUpload.tsx` | Modify | Use thirdweb ConnectButton for auth |

## Benefits

1. **Multi-wallet support**: Thirdweb supports 500+ wallets out of the box
2. **Better UX**: Built-in connection flow, chain switching, account management
3. **Consistency**: Same wallet experience across all upload flows
4. **Future-proof**: Ready for on-chain payments via x402 Protocol
5. **Mobile-friendly**: Optimized for mobile wallet connections

## Technical Notes

- Thirdweb v5 uses a different API than v4 - uses `useActiveAccount` instead of `useAddress`
- The thirdweb client ID must be set in `VITE_THIRDWEB_CLIENT_ID` environment variable
- Monad chain is pre-configured in `src/lib/thirdweb.ts`

