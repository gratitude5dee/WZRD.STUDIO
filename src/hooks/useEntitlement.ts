import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Entitlement {
  has_entitlement: boolean;
  entitlement_id?: string;
  access_token?: string;
  expires_at?: string;
  tx_hash?: string;
  audio_url?: string;
  price?: number;
  track?: {
    id?: string;
    title: string;
    artist: string;
    artist_wallet?: string;
    cover_path?: string;
  };
}

export function useEntitlement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkEntitlement = useCallback(async (
    trackId: string,
    walletAddress: string
  ): Promise<Entitlement | null> => {
    if (!trackId || !walletAddress) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('request-play', {
        body: { track_id: trackId, wallet_address: walletAddress }
      });

      if (fnError) {
        console.error('[useEntitlement] Error:', fnError);
        setError(fnError.message);
        return null;
      }

      return {
        has_entitlement: data.allowed && data.has_entitlement,
        entitlement_id: data.entitlement_id,
        access_token: data.access_token,
        expires_at: data.expires_at,
        tx_hash: data.tx_hash,
        audio_url: data.audio_url,
        price: data.price,
        track: data.track
      };
    } catch (err) {
      console.error('[useEntitlement] Unexpected error:', err);
      setError('Failed to check entitlement');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyPayment = useCallback(async (
    trackId: string,
    walletAddress: string,
    txHash: string
  ): Promise<Entitlement | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('verify-payment', {
        body: { 
          track_id: trackId, 
          wallet_address: walletAddress,
          tx_hash: txHash
        }
      });

      if (fnError) {
        console.error('[useEntitlement] Verify error:', fnError);
        setError(fnError.message);
        return null;
      }

      if (!data.success) {
        setError(data.error || 'Payment verification failed');
        return null;
      }

      return {
        has_entitlement: true,
        entitlement_id: data.entitlement_id,
        access_token: data.access_token,
        expires_at: data.expires_at,
        audio_url: data.audio_url,
        track: data.track
      };
    } catch (err) {
      console.error('[useEntitlement] Verify unexpected error:', err);
      setError('Failed to verify payment');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    checkEntitlement,
    verifyPayment,
    loading,
    error
  };
}
