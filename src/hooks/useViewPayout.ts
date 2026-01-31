import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/contexts/WalletContext";
import { ContentType } from "@/types/engagement";

const VIEW_THRESHOLD_MS = 5000; // 5 seconds minimum view time

export function useViewPayout(contentType: ContentType, contentId: string) {
  const { address } = useWallet();
  const hasTrackedRef = useRef(false);
  const contentRef = useRef({ contentType, contentId });

  // Update ref when content changes
  useEffect(() => {
    contentRef.current = { contentType, contentId };
    hasTrackedRef.current = false;
  }, [contentType, contentId]);

  useEffect(() => {
    if (!address || !contentId || hasTrackedRef.current) return;

    const timer = setTimeout(async () => {
      // Double-check we haven't already tracked
      if (hasTrackedRef.current) return;
      hasTrackedRef.current = true;

      try {
        const response = await supabase.functions.invoke('engagement-pay', {
          body: {
            content_type: contentRef.current.contentType,
            content_id: contentRef.current.contentId,
            action_type: 'view',
            payer_wallet: address.toLowerCase()
          }
        });

        if (response.data?.success) {
          console.log(`[View Payout] ${response.data.amount} $5DEE to creator`, {
            simulation: response.data.simulation,
            tx_hash: response.data.tx_hash
          });
        } else if (response.data?.skipped) {
          console.log('[View Payout] Skipped:', response.data.error);
        }
      } catch (error) {
        console.error('[View Payout] Error:', error);
        // Non-blocking - don't disrupt user experience
      }
    }, VIEW_THRESHOLD_MS);

    return () => clearTimeout(timer);
  }, [address, contentId]);
}
