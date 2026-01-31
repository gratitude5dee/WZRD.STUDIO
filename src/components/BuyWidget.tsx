import { useState } from "react";
import { X, Clock, Wallet, Loader2 } from "lucide-react";
import { Track, usePlayer } from "@/contexts/PlayerContext";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BuyWidgetProps {
  track: Track;
  onClose: () => void;
  onSuccess: () => void;
}

export function BuyWidget({ track, onClose, onSuccess }: BuyWidgetProps) {
  const { address } = useWallet();
  const { setActiveSession, play } = usePlayer();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const coverUrl = track.cover_path
    ? `https://mttpdwowikfzcdpehlrd.supabase.co/storage/v1/object/public/covers/${track.cover_path}`
    : null;

  const handlePurchase = async () => {
    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to purchase",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log('[BuyWidget] Processing payment for track:', track.id);

      // Call pay-stream edge function
      const { data, error } = await supabase.functions.invoke('pay-stream', {
        body: {
          track_id: track.id,
          payer_wallet: address.toLowerCase(),
          amount: track.price
        }
      });

      if (error) {
        console.error('[BuyWidget] Edge function error:', error);
        throw new Error(error.message || 'Payment processing failed');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Payment failed');
      }

      console.log('[BuyWidget] Payment successful:', data);

      // Set active session in player context
      setActiveSession({
        id: data.stream.id,
        stream_id: data.stream.stream_id,
        track_id: track.id,
        access_token: data.stream.access_token,
        expires_at: data.stream.expires_at,
      });

      // Start playing
      play();

      toast({
        title: "Payment successful!",
        description: "Enjoy your 10-minute stream session",
      });

      onSuccess();
    } catch (error: any) {
      console.error("[BuyWidget] Payment error:", error);
      toast({
        title: "Payment failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          {/* Track Info */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-24 h-24 rounded-lg bg-muted overflow-hidden shadow-lg flex-shrink-0">
              {coverUrl ? (
                <img src={coverUrl} alt={track.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <Wallet className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">{track.title}</h2>
              <p className="text-muted-foreground text-sm mb-2">{track.artist}</p>
              <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                Premium Track
              </div>
            </div>
          </div>

          {/* Price Details */}
          <div className="bg-secondary/50 rounded-lg p-4 mb-6 border border-border">
            <div className="flex justify-between items-center mb-3">
              <span className="text-muted-foreground text-sm">Price</span>
              <span className="text-foreground font-mono font-bold text-lg">
                ${track.price.toFixed(3)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Access Duration</span>
              <div className="flex items-center text-foreground text-sm">
                <Clock className="h-4 w-4 mr-1.5" />
                10 Minutes
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-6 text-center">
            Payment streams directly to the artist via x402 protocol.
          </p>

          {/* Purchase Button */}
          <Button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="w-full h-12 text-base font-semibold"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Wallet className="h-5 w-5 mr-2" />
                Pay to Play
              </>
            )}
          </Button>
        </div>

        {/* Footer - Partner Logos */}
        <div className="bg-secondary/30 py-2 px-6 border-t border-border">
          <div className="flex items-center justify-center gap-4 opacity-80">
            <span className="font-mono tracking-tighter text-[10px] text-muted-foreground">Espresso</span>
            <span className="font-bold text-blue-500 text-[10px]">ApeChain ⛓️</span>
            <span className="text-[10px] text-muted-foreground">thirdweb</span>
          </div>
        </div>
      </div>
    </div>
  );
}
