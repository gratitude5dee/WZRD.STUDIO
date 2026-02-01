import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { MoltbookAgent, MoltbookContextType, MoltbookVerifyResponse } from "@/types/moltbook";

const STORAGE_KEY = "moltbook_agent";
const SUPABASE_URL = "https://ixkkrousepsiorwlaycp.supabase.co";

const MoltbookContext = createContext<MoltbookContextType | undefined>(undefined);

export function MoltbookProvider({ children }: { children: React.ReactNode }) {
  const [agent, setAgent] = useState<MoltbookAgent | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load persisted agent on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as MoltbookAgent;
        setAgent(parsed);
      }
    } catch (e) {
      console.error("Failed to load Moltbook agent from storage:", e);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const verifyAgent = useCallback(async (token: string): Promise<boolean> => {
    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-moltbook-identity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Moltbook-Identity": token,
        },
        body: JSON.stringify({ token }),
      });

      const data: MoltbookVerifyResponse = await response.json();

      if (data.success && data.valid) {
        setAgent(data.agent);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.agent));
        return true;
      } else if (!data.success && 'error' in data) {
        const errorMessage = getErrorMessage(data.error);
        setError(errorMessage);
        return false;
      }

      return false;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Verification failed";
      setError(message);
      console.error("Moltbook verification error:", e);
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const clearAgent = useCallback(() => {
    setAgent(null);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value: MoltbookContextType = {
    agent,
    isVerifying,
    error,
    verifyAgent,
    clearAgent,
    isAuthenticated: agent !== null,
  };

  return (
    <MoltbookContext.Provider value={value}>
      {children}
    </MoltbookContext.Provider>
  );
}

export function useMoltbook(): MoltbookContextType {
  const context = useContext(MoltbookContext);
  if (context === undefined) {
    throw new Error("useMoltbook must be used within a MoltbookProvider");
  }
  return context;
}

function getErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "identity_token_expired":
      return "Your Moltbook session has expired. Please sign in again.";
    case "invalid_token":
      return "Invalid Moltbook token. Please try again.";
    case "invalid_app_key":
      return "App configuration error. Please contact support.";
    case "audience_mismatch":
      return "Token was issued for a different service.";
    case "missing_identity_token":
      return "No identity token provided.";
    default:
      return `Authentication failed: ${errorCode}`;
  }
}
