import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Music, Video, Receipt, Zap, ExternalLink, Heart, Eye, MessageCircle, Share2, Bookmark, Coins } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCoverUrl, getThumbnailUrl } from "@/lib/media-utils";
import { formatDistanceToNow } from "date-fns";
import { formatFiveDee, PayoutActionType } from "@/lib/fiveDeeToken";

interface TransactionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress: string;
}

interface CombinedTransaction {
  id: string;
  type: "track" | "video";
  title: string;
  artist: string;
  coverUrl: string | null;
  amount: number;
  txHash: string | null;
  createdAt: string;
  status: "active" | "paid" | "expired";
  expiresAt: string | null;
}

interface EngagementPayout {
  id: string;
  actionType: PayoutActionType;
  contentType: string;
  contentId: string;
  amount: number;
  txHash: string | null;
  createdAt: string;
  status: string;
  isCreator: boolean;
}

const getActionIcon = (actionType: PayoutActionType) => {
  switch (actionType) {
    case "view":
      return <Eye className="h-4 w-4" />;
    case "like":
      return <Heart className="h-4 w-4" />;
    case "comment":
      return <MessageCircle className="h-4 w-4" />;
    case "share":
      return <Share2 className="h-4 w-4" />;
    case "bookmark":
      return <Bookmark className="h-4 w-4" />;
    default:
      return <Coins className="h-4 w-4" />;
  }
};

const getActionColor = (actionType: PayoutActionType) => {
  switch (actionType) {
    case "view":
      return "bg-blue-500/20 text-blue-400";
    case "like":
      return "bg-pink-500/20 text-pink-400";
    case "comment":
      return "bg-purple-500/20 text-purple-400";
    case "share":
      return "bg-cyan-500/20 text-cyan-400";
    case "bookmark":
      return "bg-amber-500/20 text-amber-400";
    default:
      return "bg-primary/20 text-primary";
  }
};

export function TransactionsSheet({
  open,
  onOpenChange,
  walletAddress,
}: TransactionsSheetProps) {
  const [transactions, setTransactions] = useState<CombinedTransaction[]>([]);
  const [payouts, setPayouts] = useState<EngagementPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("purchases");

  useEffect(() => {
    if (open && walletAddress) {
      fetchTransactions();
      fetchPayouts();
    }
  }, [open, walletAddress]);

  const fetchPayouts = async () => {
    try {
      // Fetch payouts where user is creator (earnings)
      const { data: creatorPayouts, error: creatorError } = await supabase
        .from("engagement_payouts")
        .select("*")
        .eq("creator_wallet", walletAddress)
        .order("created_at", { ascending: false })
        .limit(50);

      if (creatorError) throw creatorError;

      // Fetch payouts where user is payer (activity)
      const { data: payerPayouts, error: payerError } = await supabase
        .from("engagement_payouts")
        .select("*")
        .eq("payer_wallet", walletAddress)
        .order("created_at", { ascending: false })
        .limit(50);

      if (payerError) throw payerError;

      const mapPayout = (p: any, isCreator: boolean): EngagementPayout => ({
        id: p.id,
        actionType: p.action_type as PayoutActionType,
        contentType: p.content_type,
        contentId: p.content_id,
        amount: p.amount,
        txHash: p.tx_hash,
        createdAt: p.created_at,
        status: p.status,
        isCreator,
      });

      const creatorMapped = (creatorPayouts || []).map((p: any) => mapPayout(p, true));
      const payerMapped = (payerPayouts || []).map((p: any) => mapPayout(p, false));

      // Combine and dedupe (in case user is both creator and payer for same content)
      const allPayouts = [...creatorMapped, ...payerMapped];
      const uniquePayouts = allPayouts.filter(
        (payout, index, self) => index === self.findIndex((p) => p.id === payout.id)
      );

      setPayouts(uniquePayouts);
    } catch (error) {
      console.error("Error fetching payouts:", error);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Fetch track transactions
      const { data: trackTxs } = await supabase
        .from("music_transactions")
        .select("*")
        .eq("user_wallet", walletAddress)
        .order("created_at", { ascending: false });

      // Fetch video transactions
      const { data: videoTxs } = await supabase
        .from("music_video_transactions")
        .select("*")
        .eq("user_wallet", walletAddress)
        .order("created_at", { ascending: false });

      // Fetch track details for track transactions
      const trackIds = [...new Set((trackTxs || []).map((tx: any) => tx.track_id))];
      const { data: tracks } = trackIds.length > 0
        ? await supabase.from("music_tracks").select("id, title, artist, cover_path").in("id", trackIds)
        : { data: [] };
      
      const trackMap = new Map((tracks as any[] || []).map((t: any) => [t.id, t]));

      // Fetch video details for video transactions
      const videoIds = [...new Set((videoTxs || []).map((tx: any) => tx.video_id))];
      const { data: videos } = videoIds.length > 0
        ? await supabase.from("music_videos").select("id, title, artist, thumbnail_path").in("id", videoIds)
        : { data: [] };
      
      const videoMap = new Map((videos as any[] || []).map((v: any) => [v.id, v]));

      // Transform track transactions
      const trackTransactions: CombinedTransaction[] = (trackTxs || []).map((tx: any) => {
        const track = trackMap.get(tx.track_id);
        
        return {
          id: tx.id,
          type: "track" as const,
          title: track?.title || "Unknown Track",
          artist: track?.artist || "Unknown Artist",
          coverUrl: track?.cover_path ? getCoverUrl(track.cover_path) : null,
          amount: tx.amount,
          txHash: tx.tx_hash,
          createdAt: tx.created_at,
          status: tx.status === "completed" ? "paid" : "paid",
          expiresAt: null,
        };
      });

      // Transform video transactions
      const videoTransactions: CombinedTransaction[] = (videoTxs || []).map((tx: any) => {
        const video = videoMap.get(tx.video_id);
        
        return {
          id: tx.id,
          type: "video" as const,
          title: video?.title || "Unknown Video",
          artist: video?.artist || "Unknown Creator",
          coverUrl: video?.thumbnail_path ? getThumbnailUrl(video.thumbnail_path) : null,
          amount: tx.amount,
          txHash: tx.tx_hash,
          createdAt: tx.created_at,
          status: tx.status === "completed" ? "paid" : "paid",
          expiresAt: null,
        };
      });

      // Combine and sort by date
      const combined = [...trackTransactions, ...videoTransactions].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setTransactions(combined);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: CombinedTransaction["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
            <Zap className="h-3 w-3 mr-1" />
            ACTIVE
          </Badge>
        );
      case "paid":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            PAID
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30">
            EXPIRED
          </Badge>
        );
    }
  };

  const creatorPayouts = payouts.filter(p => p.isCreator);
  const activityPayouts = payouts.filter(p => !p.isCreator);
  const totalEarnings = creatorPayouts.reduce((sum, p) => sum + p.amount, 0);

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
              Transactions
            </SheetTitle>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="purchases" className="gap-2">
              <Receipt className="h-4 w-4" />
              Purchases
            </TabsTrigger>
            <TabsTrigger value="earnings" className="gap-2">
              <Coins className="h-4 w-4" />
              Earnings
              {totalEarnings > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {totalEarnings}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Zap className="h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="purchases">
            <ScrollArea className="h-[calc(85vh-180px)]">
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
              ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 border border-primary/10">
                    <Receipt className="h-10 w-10 text-primary/60" />
                  </div>
                  <p className="text-xl font-semibold text-foreground mb-2">No purchases yet</p>
                  <p className="text-sm text-muted-foreground max-w-[200px]">
                    Start streaming music or videos to see your payment history here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 rounded-2xl bg-gradient-to-r from-muted/20 to-muted/5 hover:from-muted/30 hover:to-muted/10 transition-all border border-border/10 hover:border-border/20"
                    >
                      <div className="flex items-center gap-4">
                        {/* Cover Art */}
                        <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-muted/30 flex-shrink-0 shadow-lg">
                          {tx.coverUrl ? (
                            <img
                              src={tx.coverUrl}
                              alt={tx.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-primary/10">
                              {tx.type === "track" ? (
                                <Music className="h-6 w-6 text-primary" />
                              ) : (
                                <Video className="h-6 w-6 text-primary" />
                              )}
                            </div>
                          )}
                          {/* Type indicator badge */}
                          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-background/90 backdrop-blur flex items-center justify-center border border-border/30 shadow-sm">
                            {tx.type === "track" ? (
                              <Music className="h-3 w-3 text-primary" />
                            ) : (
                              <Video className="h-3 w-3 text-cyan-400" />
                            )}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate leading-tight">{tx.title}</p>
                          <p className="text-sm text-muted-foreground truncate mt-0.5">{tx.artist}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs font-medium text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">
                              {tx.amount} ETH
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex-shrink-0">
                          {getStatusBadge(tx.status)}
                        </div>
                      </div>
                      
                      {/* Explorer Link */}
                      {tx.txHash && (
                        <div className="mt-3 pt-3 border-t border-border/10">
                          <a
                            href={`https://explorer.monad.xyz/tx/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                          >
                            View on Explorer
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="earnings">
            <ScrollArea className="h-[calc(85vh-180px)]">
              {creatorPayouts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 border border-primary/10">
                    <Coins className="h-10 w-10 text-primary/60" />
                  </div>
                  <p className="text-xl font-semibold text-foreground mb-2">No earnings yet</p>
                  <p className="text-sm text-muted-foreground max-w-[220px]">
                    Create content and get views, likes, and comments to earn $5DEE tokens
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Summary Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20">
                    <p className="text-sm text-muted-foreground">Total Earned</p>
                    <p className="text-2xl font-bold text-foreground">{formatFiveDee(totalEarnings)}</p>
                  </div>

                  {creatorPayouts.map((payout) => (
                    <div
                      key={payout.id}
                      className="p-4 rounded-2xl bg-gradient-to-r from-muted/20 to-muted/5 hover:from-muted/30 hover:to-muted/10 transition-all border border-border/10 hover:border-border/20"
                    >
                      <div className="flex items-center gap-4">
                        {/* Action Icon */}
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${getActionColor(payout.actionType)}`}>
                          {getActionIcon(payout.actionType)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground">
                            +{formatFiveDee(payout.amount)}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {payout.actionType} on {payout.contentType}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            {formatDistanceToNow(new Date(payout.createdAt), { addSuffix: true })}
                          </p>
                        </div>

                        {/* Status */}
                        <Badge 
                          className={
                            payout.status === "confirmed" 
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }
                        >
                          {payout.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      {/* Explorer Link */}
                      {payout.txHash && (
                        <div className="mt-3 pt-3 border-t border-border/10">
                          <a
                            href={`https://apescan.io/tx/${payout.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                          >
                            View on ApeScan
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Activity Tab - Your Engagement Actions */}
          <TabsContent value="activity">
            <ScrollArea className="h-[calc(85vh-180px)]">
              {activityPayouts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 border border-primary/10">
                    <Zap className="h-10 w-10 text-primary/60" />
                  </div>
                  <p className="text-xl font-semibold text-foreground mb-2">No activity yet</p>
                  <p className="text-sm text-muted-foreground max-w-[220px]">
                    Like, comment, or share content to see your engagement history
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityPayouts.map((payout) => (
                    <div
                      key={payout.id}
                      className="p-4 rounded-2xl bg-gradient-to-r from-muted/20 to-muted/5 hover:from-muted/30 hover:to-muted/10 transition-all border border-border/10 hover:border-border/20"
                    >
                      <div className="flex items-center gap-4">
                        {/* Action Icon */}
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${getActionColor(payout.actionType)}`}>
                          {getActionIcon(payout.actionType)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground capitalize">
                            {payout.actionType}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            You {payout.actionType}d a {payout.contentType}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            Creator earned {formatFiveDee(payout.amount)} • {formatDistanceToNow(new Date(payout.createdAt), { addSuffix: true })}
                          </p>
                        </div>

                        {/* Status */}
                        <Badge 
                          className={
                            payout.status === "confirmed" 
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }
                        >
                          {payout.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      {/* Explorer Link */}
                      {payout.txHash && (
                        <div className="mt-3 pt-3 border-t border-border/10">
                          <a
                            href={`https://apescan.io/tx/${payout.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                          >
                            View on ApeScan
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
