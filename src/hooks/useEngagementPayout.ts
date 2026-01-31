import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/contexts/WalletContext";
import { ContentType } from "@/types/engagement";
import { PayoutActionType } from "@/lib/fiveDeeToken";

interface UseEngagementPayoutOptions {
  contentType: ContentType;
  contentId: string;
}

export function useEngagementPayout({ contentType, contentId }: UseEngagementPayoutOptions) {
  const { address } = useWallet();

  const triggerPayout = useCallback(async (actionType: PayoutActionType) => {
    if (!address || !contentId) return null;

    try {
      const response = await supabase.functions.invoke('engagement-pay', {
        body: {
          content_type: contentType,
          content_id: contentId,
          action_type: actionType,
          payer_wallet: address.toLowerCase()
        }
      });

      if (response.data?.success) {
        console.log(`[Payout] ${actionType}: ${response.data.amount} $5DEE`, {
          simulation: response.data.simulation,
          tx_hash: response.data.tx_hash
        });
        return response.data;
      } else if (response.data?.error) {
        console.log(`[Payout] ${actionType} skipped:`, response.data.error);
      }
      
      return null;
    } catch (error) {
      console.error(`[Payout] ${actionType} error:`, error);
      return null;
    }
  }, [address, contentType, contentId]);

  return { triggerPayout };
}
