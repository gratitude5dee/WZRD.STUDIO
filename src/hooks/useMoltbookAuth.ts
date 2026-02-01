import { useState, useCallback } from "react";
import { useMoltbook } from "@/contexts/MoltbookContext";

export function useMoltbookAuth() {
  const { agent, verifyAgent, clearAgent, isAuthenticated } = useMoltbook();
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyIdentity = useCallback(async (token: string): Promise<boolean> => {
    setIsVerifying(true);
    setError(null);

    try {
      const success = await verifyAgent(token);
      if (!success) {
        setError("Failed to verify Moltbook identity");
      }
      return success;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Verification failed";
      setError(message);
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [verifyAgent]);

  const signOut = useCallback(() => {
    clearAgent();
    setError(null);
  }, [clearAgent]);

  return {
    agent,
    isAuthenticated,
    isVerifying,
    error,
    verifyIdentity,
    signOut,
  };
}
