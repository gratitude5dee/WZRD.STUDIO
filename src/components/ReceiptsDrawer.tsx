import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Music, ExternalLink, Receipt, Clock, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCoverUrl } from "@/lib/media-utils";
import { formatDistanceToNow, format } from "date-fns";

interface ReceiptsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress: string;
}

interface EntitlementReceipt {
  id: string;
  trackId: string;
  title: string;
  artist: string;
  coverUrl: string | null;
  txHash: string;
  grantedAt: string;
  expiresAt: string;
  isActive: boolean;
}

export function ReceiptsDrawer({
  open,
  onOpenChange,
  walletAddress,
}: ReceiptsDrawerProps) {
  const [receipts, setReceipts] = useState<EntitlementReceipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && walletAddress) {
      fetchReceipts();
    }
  }, [open, walletAddress]);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      // Fetch entitlements with track info
      const { data: entitlements, error } = await supabase
        .from("music_entitlements")
        .select(`
          id,
          track_id,
          tx_hash,
          granted_at,
          expires_at,
          is_active
        `)
        .ilike("user_wallet", walletAddress)
        .order("granted_at", { ascending: false });

      if (error) {
        console.error("Error fetching entitlements:", error);
        return;
      }

      if (!entitlements || entitlements.length === 0) {
        setReceipts([]);
        return;
      }

      // Fetch track info for each entitlement
      const trackIds = [...new Set(entitlements.map((e: any) => e.track_id).filter(Boolean))];
      const { data: tracks } = await supabase
        .from("music_tracks")
        .select("id, title, artist, cover_path")
        .in("id", trackIds);

      const trackMap = new Map((tracks as any[] || []).map((t: any) => [t.id, t]));
      const now = new Date();

      const formattedReceipts: EntitlementReceipt[] = entitlements.map((ent: any) => {
        const track = trackMap.get(ent.track_id);
        const expiresAt = ent.expires_at ? new Date(ent.expires_at) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        
        return {
          id: ent.id,
          trackId: ent.track_id,
          title: track?.title || "Unknown Track",
          artist: track?.artist || "Unknown Artist",
          coverUrl: track?.cover_path ? getCoverUrl(track.cover_path) : null,
          txHash: ent.tx_hash || "",
          grantedAt: ent.granted_at,
          expiresAt: ent.expires_at || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: ent.is_active && expiresAt > now
        };
      });

      setReceipts(formattedReceipts);
    } catch (error) {
      console.error("Error fetching receipts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMonadExplorerUrl = (txHash: string) => {
    return `https://explorer.monad.xyz/tx/${txHash}`;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="rounded-t-3xl border-t border-border/30 bg-gradient-to-b from-background via-background to-background/95 h-[85vh] backdrop-blur-xl"
      >
        {/* Header */}
        <SheetHeader className="pb-4 border-b border-border/20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenChange(false)}
              className="p-2.5 -ml-2 rounded-full bg-muted/30 hover:bg-muted/50 transition-all active:scale-95"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <SheetTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Receipts
            </SheetTitle>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(85vh-100px)] mt-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/10">
                  <Skeleton className="h-14 w-14 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-7 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : receipts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 border border-primary/10">
                <Receipt className="h-10 w-10 text-primary/60" />
              </div>
              <p className="text-xl font-semibold text-foreground mb-2">No receipts yet</p>
              <p className="text-sm text-muted-foreground max-w-[200px]">
                Purchase tracks to see your receipts and entitlements here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {receipts.map((receipt) => (
                <div
                  key={receipt.id}
                  className="p-4 rounded-2xl bg-gradient-to-r from-muted/20 to-muted/5 border border-border/10 hover:border-border/20 transition-all"
                >
                  <div className="flex items-center gap-4">
                    {/* Cover Art */}
                    <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-muted/30 flex-shrink-0 shadow-lg">
                      {receipt.coverUrl ? (
                        <img
                          src={receipt.coverUrl}
                          alt={receipt.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-primary/10">
                          <Music className="h-6 w-6 text-primary" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate leading-tight">{receipt.title}</p>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">{receipt.artist}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(receipt.grantedAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      {receipt.isActive ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          ACTIVE
                        </Badge>
                      ) : (
                        <Badge className="bg-muted/30 text-muted-foreground border border-border/30 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          EXPIRED
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Details Row */}
                  <div className="mt-3 pt-3 border-t border-border/10 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Expires: {format(new Date(receipt.expiresAt), "MMM d, yyyy h:mm a")}</span>
                    </div>
                    
                    {receipt.txHash && (
                      <a
                        href={getMonadExplorerUrl(receipt.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        View on Explorer
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
