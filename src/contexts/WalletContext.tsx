import React, { createContext, useContext, useCallback } from "react";
import { useActiveAccount, useActiveWallet, useConnect, useDisconnect } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { thirdwebClient, chain } from "@/lib/thirdweb";

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { connect: thirdwebConnect, isConnecting } = useConnect();
  const { disconnect: thirdwebDisconnect } = useDisconnect();

  // Derive state from thirdweb
  const address = account?.address ?? null;
  const isConnected = !!account;

  const connect = useCallback(async () => {
    try {
      const metamask = createWallet("io.metamask");
      await thirdwebConnect(async () => {
        await metamask.connect({ client: thirdwebClient, chain });
        return metamask;
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  }, [thirdwebConnect]);

  const disconnect = useCallback(() => {
    if (wallet) {
      thirdwebDisconnect(wallet);
    }
  }, [wallet, thirdwebDisconnect]);

  const state: WalletState = {
    address,
    isConnected,
    isConnecting,
    chainId: chain.id,
  };

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
