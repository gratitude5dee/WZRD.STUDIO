import { usePlayer } from "@/contexts/PlayerContext";
import { Play, Pause, Lock, Music, Bluetooth, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

export function MiniPlayer() {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, isLocked, togglePlay, currentTime, duration, activeSession } = usePlayer();
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  // Calculate session countdown
  useEffect(() => {
    if (!activeSession?.expires_at) {
      setTimeLeft(null);
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const expires = new Date(activeSession.expires_at).getTime();
      const remaining = expires - now;

      if (remaining <= 0) {
        setTimeLeft(null);
        return;
      }

      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [activeSession?.expires_at]);

  if (!currentTrack) return null;

  const coverUrl = currentTrack.cover_path
    ? `https://mttpdwowikfzcdpehlrd.supabase.co/storage/v1/object/public/covers/${currentTrack.cover_path}`
    : null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isPaidTrack = currentTrack.price > 0;

  return (
    <div className="fixed bottom-[60px] left-0 right-0 z-30 safe-bottom">
      {/* Progress bar */}
      <Progress value={progress} className="h-1 rounded-none bg-muted" />
      
      <div 
        className="bg-card border-t border-border px-3 py-2 flex items-center gap-3 cursor-pointer active:bg-secondary/50 transition-colors"
        onClick={() => navigate("/now-playing")}
      >
        {/* Album Art */}
        <div className="w-12 h-12 rounded bg-muted flex-shrink-0 overflow-hidden shadow-lg">
          {coverUrl ? (
            <img src={coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{currentTrack.title}</p>
          <div className="flex items-center gap-2">
            {isLocked && isPaidTrack ? (
              <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-medium bg-primary/10 text-primary border-primary/30">
                {currentTrack.price} ETH
              </Badge>
            ) : timeLeft ? (
              <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border-emerald-500/30 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeLeft}
              </Badge>
            ) : (
              <Bluetooth className="h-3 w-3 text-primary" />
            )}
            <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isLocked) {
              navigate("/now-playing");
            } else {
              togglePlay();
            }
          }}
          className="w-10 h-10 flex items-center justify-center text-foreground active:scale-95 transition-transform"
        >
          {isLocked ? (
            <Lock className="h-5 w-5" />
          ) : isPlaying ? (
            <Pause className="h-6 w-6 fill-current" />
          ) : (
            <Play className="h-6 w-6 fill-current" />
          )}
        </button>
      </div>
    </div>
  );
}
