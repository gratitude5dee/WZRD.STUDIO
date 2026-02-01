import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMoltbook } from "@/contexts/MoltbookContext";

export type MoltbookAgent = {
  id: string;
  name: string;
  karma: number;
  avatar_url: string | null;
  is_claimed: boolean;
  owner?: {
    x_handle?: string | null;
    x_verified?: boolean | null;
  } | null;
};

export type MoltbookVerifyResult =
  | { valid: true; agent: MoltbookAgent }
  | { valid: false; error: string };

export async function verifyMoltbookIdentity(token: string): Promise<MoltbookVerifyResult> {
  const { data, error } = await supabase.functions.invoke("moltbook-auth", {
    headers: { "X-Moltbook-Identity": token },
  });

  if (error) {
    return { valid: false, error: error.message };
  }

  if (!data?.valid) {
    return { valid: false, error: data?.error || "invalid_token" };
  }

  return { valid: true, agent: data.agent as MoltbookAgent };
}

export function useMoltbookAuth() {
  const { agent, verifyAgent, clearAgent, isAuthenticated } = useMoltbook();
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyIdentity = useCallback(
    async (token: string): Promise<boolean> => {
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
    },
    [verifyAgent]
  );

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
