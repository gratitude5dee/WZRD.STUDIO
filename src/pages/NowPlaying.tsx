import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  ChevronDown, 
  MoreHorizontal, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat,
  Heart,
  Clock,
  Music,
  Wallet,
  Share2,
  ListMusic,
  Bluetooth,
  ChevronUp
} from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { useWallet } from "@/contexts/WalletContext";
import { postTrackEvent } from "@/lib/transactions";
import { useToast } from "@/hooks/use-toast";
import { BuyWidget } from "@/components/BuyWidget";
import { ShareSheet } from "@/components/ShareSheet";
import { TrackOptionsSheet } from "@/components/TrackOptionsSheet";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

export default function NowPlaying() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    currentTrack,
    isPlaying,
    isLocked,
    togglePlay,
    nextTrack,
    prevTrack,
    currentTime,
    duration,
    seek,
    activeSession,
    setActiveSession,
  } = usePlayer();
  const { address } = useWallet();

  const [showBuyWidget, setShowBuyWidget] = useState(false);
  const { toast } = useToast();
  const [showShare, setShowShare] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [shuffleActive, setShuffleActive] = useState(false);
  const [repeatActive, setRepeatActive] = useState(false);

  // Auto-open buy modal when coming from Listen unlock action
  useEffect(() => {
    if (searchParams.get("unlock") === "1" && isLocked) {
      setShowBuyWidget(true);
    }
  }, [searchParams, isLocked]);

  // Restore active session from gateway/Supabase when locked
  useEffect(() => {
    const restoreSession = async () => {
      if (!currentTrack || !address || !isLocked) return;

      try {
        const gatewayUrl = import.meta.env.VITE_X402_GATEWAY_URL || "http://localhost:4020";
        const res = await fetch(
          `${gatewayUrl}/api/session/active?trackId=${currentTrack.id}&walletAddress=${address}`
        );

        if (!res.ok) return;

        const data = await res.json();
        if (data?.success && data?.stream) {
          setActiveSession({
            id: data.stream.id,
            stream_id: data.stream.stream_id,
            track_id: data.stream.track_id,
            access_token: data.stream.access_token,
            expires_at: data.stream.expires_at,
          });
          toast({
            title: "Session restored",
            description: "Your stream is still active.",
          });
        }
      } catch (error) {
        console.warn("Failed to restore session", error);
      }
    };

    restoreSession();
  }, [currentTrack, address, isLocked, setActiveSession]);

  // Session timer
  useEffect(() => {
    if (!activeSession) {
      setTimeLeft(null);
      return;
    }

    const checkExpiry = () => {
      const now = new Date();
      const expires = new Date(activeSession.expires_at);
      const diff = Math.floor((expires.getTime() - now.getTime()) / 1000);

      if (diff <= 0) {
        setTimeLeft(0);
      } else {
        setTimeLeft(diff);
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  // Handle session expiry
  useEffect(() => {
    if (!activeSession || timeLeft === null) return;
    if (timeLeft === 0) {
      setActiveSession(null);
      toast({
        title: "Session expired",
        description: "Re-unlock to continue listening.",
        variant: "destructive",
      });
      if (currentTrack) {
        postTrackEvent({
          trackId: currentTrack.id,
          walletAddress: address,
          artistWallet: currentTrack.artist_wallet,
          eventType: "session_expired",
          streamSessionId: activeSession.id,
          streamId: activeSession.stream_id,
        });
      }
    }
  }, [timeLeft, activeSession, currentTrack, address, setActiveSession]);

  if (!currentTrack) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Music className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No track selected</p>
          <Button variant="ghost" onClick={() => navigate("/home")} className="mt-4">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  const coverUrl = currentTrack.cover_path
    ? `https://mttpdwowikfzcdpehlrd.supabase.co/storage/v1/object/public/covers/${currentTrack.cover_path}`
    : null;

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (isLocked) {
      setShowBuyWidget(true);
    } else {
      togglePlay();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/30 via-background to-background flex flex-col safe-top safe-bottom">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4">
        <button onClick={() => navigate(-1)} className="p-2">
          <ChevronDown className="h-6 w-6 text-foreground" />
        </button>
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Playing from</p>
          <p className="text-sm font-medium text-foreground">Monad Music</p>
        </div>
        <button onClick={() => setShowOptions(true)} className="p-2">
          <MoreHorizontal className="h-6 w-6 text-foreground" />
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Album Art */}
        <div className="w-full max-w-sm aspect-square rounded-lg shadow-2xl overflow-hidden mb-8 relative">
          {coverUrl ? (
            <img src={coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <Music className="h-24 w-24 text-muted-foreground" />
            </div>
          )}
          {/* Glow effect */}
          <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
        </div>

        {/* Track Info */}
        <div className="w-full max-w-sm flex items-center justify-between mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-foreground truncate">{currentTrack.title}</h1>
            <p className="text-muted-foreground truncate">{currentTrack.artist}</p>
          </div>
          <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
            <Heart className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-sm mb-4">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={(value) => seek(value[0])}
            disabled={isLocked}
            className="w-full"
          />
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(duration - currentTime)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-sm flex items-center justify-between mb-6">
          <button 
            onClick={() => setShuffleActive(!shuffleActive)}
            className={`transition-colors ${shuffleActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Shuffle className="h-5 w-5" />
          </button>
          <button onClick={prevTrack} className="text-foreground active:scale-95 transition-transform">
            <SkipBack className="h-8 w-8 fill-current" />
          </button>
          <button
            onClick={handlePlayPause}
            className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          >
            {isLocked ? (
              <Wallet className="h-7 w-7 text-background" />
            ) : isPlaying ? (
              <Pause className="h-7 w-7 text-background fill-current" />
            ) : (
              <Play className="h-7 w-7 text-background fill-current ml-1" />
            )}
          </button>
          <button onClick={nextTrack} className="text-foreground active:scale-95 transition-transform">
            <SkipForward className="h-8 w-8 fill-current" />
          </button>
          <button 
            onClick={() => setRepeatActive(!repeatActive)}
            className={`transition-colors ${repeatActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Repeat className="h-5 w-5" />
          </button>
        </div>

        {/* Bottom Row - Device & Actions */}
        <div className="w-full max-w-sm flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Bluetooth className="h-4 w-4" />
            <span className="text-xs">iPhone</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowShare(true)} className="p-2 text-muted-foreground hover:text-foreground">
              <Share2 className="h-5 w-5" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground">
              <ListMusic className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Session Timer or Unlock Button */}
        {isLocked ? (
          <Button
            onClick={() => setShowBuyWidget(true)}
            className="w-full max-w-sm h-12"
          >
            <Wallet className="h-5 w-5 mr-2" />
            Unlock with ApeCoin (${currentTrack.price.toFixed(3)})
          </Button>
        ) : (
          activeSession && timeLeft !== null && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border">
              <Clock className={`h-4 w-4 ${timeLeft < 60 ? "text-destructive animate-pulse" : "text-primary"}`} />
              <span className={`text-sm font-mono ${timeLeft < 60 ? "text-destructive" : "text-foreground"}`}>
                Session expires in {formatCountdown(timeLeft)}
              </span>
            </div>
          )
        )}
      </div>

      {/* Lyrics Section (Collapsible) */}
      <div className="px-6 pb-6">
        <button
          onClick={() => setShowLyrics(!showLyrics)}
          className="w-full flex items-center justify-between py-4 text-foreground"
        >
          <span className="font-medium">Lyrics</span>
          <ChevronUp className={`h-5 w-5 transition-transform ${showLyrics ? "" : "rotate-180"}`} />
        </button>
        {showLyrics && (
          <div className="bg-secondary/50 rounded-lg p-4 animate-fade-in">
            <p className="text-muted-foreground text-sm italic">
              Lyrics not available for this track.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showBuyWidget && (
        <BuyWidget
          track={currentTrack}
          onClose={() => setShowBuyWidget(false)}
          onSuccess={() => setShowBuyWidget(false)}
        />
      )}

      <ShareSheet
        track={currentTrack}
        open={showShare}
        onOpenChange={setShowShare}
      />

      <TrackOptionsSheet
        track={currentTrack}
        open={showOptions}
        onOpenChange={setShowOptions}
      />
    </div>
  );
}
