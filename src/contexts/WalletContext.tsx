import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

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

const STORAGE_KEY = "monad_wallet_address";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    chainId: null,
  });

  // Check for existing connection on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem(STORAGE_KEY);
    if (savedAddress && window.ethereum) {
      // Verify the wallet is still connected
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0 && accounts[0].toLowerCase() === savedAddress.toLowerCase()) {
            setState({
              address: accounts[0],
              isConnected: true,
              isConnecting: false,
              chainId: null,
            });
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        })
        .catch(() => {
          localStorage.removeItem(STORAGE_KEY);
        });
    }
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[] | string) => {
      const accountList = Array.isArray(accounts) ? accounts : [accounts];
      if (accountList.length === 0) {
        // User disconnected
        setState({
          address: null,
          isConnected: false,
          isConnecting: false,
          chainId: null,
        });
        localStorage.removeItem(STORAGE_KEY);
      } else {
        setState((prev) => ({
          ...prev,
          address: accountList[0],
          isConnected: true,
        }));
        localStorage.setItem(STORAGE_KEY, accountList[0]);
      }
    };

    const handleChainChanged = (chainId: string[] | string) => {
      const id = Array.isArray(chainId) ? chainId[0] : chainId;
      setState((prev) => ({
        ...prev,
        chainId: parseInt(id, 16),
      }));
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      // Open MetaMask download page
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true }));

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setState({
          address: accounts[0],
          isConnected: true,
          isConnecting: false,
          chainId: null,
        });
        localStorage.setItem(STORAGE_KEY, accounts[0]);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setState((prev) => ({ ...prev, isConnecting: false }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      isConnected: false,
      isConnecting: false,
      chainId: null,
    });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

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

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<string[]>;
      on: (event: string, callback: (args: string[] | string) => void) => void;
      removeListener: (event: string, callback: (args: string[] | string) => void) => void;
    };
  }
}
