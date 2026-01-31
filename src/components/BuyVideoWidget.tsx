import { Video, VideoSession } from "@/types/video";
import { useWallet } from "@/contexts/WalletContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Play, Radio, Wallet } from "lucide-react";
import { getThumbnailUrl } from "@/lib/media-utils";

interface BuyVideoWidgetProps {
  video: Video;
  isOpen: boolean;
  onClose: () => void;
}

export function BuyVideoWidget({ video, isOpen, onClose }: BuyVideoWidgetProps) {
  const navigate = useNavigate();
  const { address } = useWallet();
  const [loading, setLoading] = useState(false);

  const thumbnailUrl = getThumbnailUrl(video.thumbnail_path);

  const handlePurchase = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    setLoading(true);

    try {
      console.log("Processing video payment for:", video.title);

      const { data, error } = await supabase.functions.invoke('pay-video-stream', {
        body: {
          video_id: video.id,
          payer_wallet: address,
          amount: video.price,
        },
      });

      if (error) {
        console.error("Payment error:", error);
        toast.error("Payment failed. Please try again.");
        return;
      }

      if (data?.success) {
        toast.success(`Access granted to "${video.title}"!`);
        
        // Navigate to video player with session info
        navigate(`/watch/${video.id}`, {
          state: {
            video,
            session: {
              id: data.stream.id,
              stream_id: data.stream.stream_id,
              video_id: video.id,
              access_token: data.stream.access_token,
              expires_at: data.stream.expires_at,
            } as VideoSession,
          },
        });
        
        onClose();
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {video.is_livestream ? "Join Livestream" : "Watch Video"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Pay to stream this content for 10 minutes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Video preview */}
          <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary">
                {video.is_livestream ? (
                  <Radio className="h-12 w-12 text-muted-foreground" />
                ) : (
                  <Play className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
            )}
            {video.is_livestream && (
              <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-semibold px-2 py-1 rounded">
                LIVE
              </div>
            )}
          </div>

          {/* Video info */}
          <div>
            <h3 className="font-semibold text-foreground">{video.title}</h3>
            <p className="text-sm text-muted-foreground">{video.artist}</p>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
            <span className="text-muted-foreground">Price per stream</span>
            <span className="font-bold text-foreground">${video.price.toFixed(3)}</span>
          </div>

          {/* Purchase button */}
          <Button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full h-12"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <Wallet className="h-5 w-5 mr-2" />
                Pay ${video.price.toFixed(3)} to Watch
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
