import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/contexts/WalletContext";
import { usePlayer, Track } from "@/contexts/PlayerContext";
import { supabase } from "@/integrations/supabase/client";
import { WalletButton } from "@/components/WalletButton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNavigation } from "@/components/BottomNavigation";
import { MiniPlayer } from "@/components/MiniPlayer";
import { ArtistTrackCard } from "@/components/ArtistTrackCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Upload, Music, TrendingUp, DollarSign, Disc, User, Settings, RefreshCw, BarChart3, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { MusicTrack } from "@/types/track";

interface Stats {
  totalTracks: number;
  totalStreams: number;
  totalEarnings: number;
}

interface RecentTransaction {
  id: string;
  amount: number;
  created_at: string;
  track_title: string;
  track_artist: string;
  payer_wallet: string;
}

export default function Artist() {
  const navigate = useNavigate();
  const { isConnected, address } = useWallet();
  const { setQueue, currentTrack } = usePlayer();
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [stats, setStats] = useState<Stats>({ totalTracks: 0, totalStreams: 0, totalEarnings: 0 });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isConnected) navigate("/");
  }, [isConnected, navigate]);

  const fetchArtistData = useCallback(async (showRefreshing = false) => {
    if (!address) return;
    
    if (showRefreshing) setRefreshing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('artist-stats', {
        body: { wallet_address: address.toLowerCase() }
      });

      if (error) {
        console.error('Error fetching artist stats:', error);
        return;
      }

      const typedTracks = data.tracks || [];
      setTracks(typedTracks);
      setQueue(typedTracks as Track[]);
      setStats({
        totalTracks: data.stats?.total_tracks || 0,
        totalStreams: data.stats?.total_streams || 0,
        totalEarnings: data.stats?.total_earnings || 0,
      });
      setRecentTransactions(data.recent_transactions || []);
    } catch (err) {
      console.error('Error calling artist-stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [address, setQueue]);

  useEffect(() => {
    fetchArtistData();
  }, [fetchArtistData]);

  const handleRefresh = () => {
    fetchArtistData(true);
  };

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  return (
    <div className="min-h-screen bg-background flex flex-col safe-top">
      <div className="bg-gradient-to-b from-primary/30 via-background to-background">
        <header className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Artist Dashboard</p>
              <p className="text-xs text-muted-foreground">{shortAddress}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                <DropdownMenuItem onClick={handleRefresh} disabled={refreshing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh Stats'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <WalletButton />
          </div>
        </header>
        <div className="px-4 pb-6 grid grid-cols-3 gap-3">
          <StatCard icon={<Disc className="h-4 w-4" />} label="Tracks" value={stats.totalTracks.toString()} loading={loading} />
          <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Streams" value={stats.totalStreams.toString()} loading={loading} />
          <StatCard icon={<DollarSign className="h-4 w-4" />} label="Earned" value={`$${stats.totalEarnings.toFixed(2)}`} loading={loading} />
        </div>
      </div>
      <div className="px-4 mb-4">
        <Button onClick={() => navigate("/upload")} className="w-full h-12" size="lg">
          <Upload className="h-5 w-5 mr-2" />Upload New Track
        </Button>
      </div>

      {/* Recent Activity Section */}
      {recentTransactions.length > 0 && (
        <section className="px-4 mb-4">
          <h2 className="text-lg font-bold text-foreground mb-3">Recent Activity</h2>
          <div className="bg-card border border-border rounded-lg divide-y divide-border">
            {recentTransactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
                  <Music className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    "{tx.track_title}" earned ${tx.amount.toFixed(3)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    from {tx.payer_wallet?.slice(0, 6)}...{tx.payer_wallet?.slice(-4)} • {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <main className={`flex-1 px-4 ${currentTrack ? "pb-36" : "pb-20"}`}>
        <h2 className="text-lg font-bold text-foreground mb-3">Your Tracks</h2>
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <TrackCardSkeleton key={i} />)}</div>
        ) : tracks.length === 0 ? (
          <div className="text-center py-12">
            <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No tracks uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3">{tracks.map((track) => <ArtistTrackCard key={track.id} track={track} />)}</div>
        )}
      </main>
      <MiniPlayer />
      <BottomNavigation />
    </div>
  );
}

function StatCard({ icon, label, value, loading }: { icon: React.ReactNode; label: string; value: string; loading: boolean }) {
  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">{icon}<span className="text-xs">{label}</span></div>
      {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-lg font-bold text-foreground">{value}</p>}
    </div>
  );
}

function TrackCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border/50 p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
    </div>
  );
}
