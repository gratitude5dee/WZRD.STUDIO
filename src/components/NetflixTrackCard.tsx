import { Play, Music, MoreVertical, Info } from "lucide-react";
import { Track, usePlayer } from "@/contexts/PlayerContext";
import { useState } from "react";
import { BuyWidget } from "./BuyWidget";
import { getCoverUrl } from "@/lib/media-utils";

interface NetflixTrackCardProps {
  track: Track;
  ranking?: number;
}

export function NetflixTrackCard({ track, ranking }: NetflixTrackCardProps) {
  const { currentTrack, isPlaying } = usePlayer();
  const [showBuyWidget, setShowBuyWidget] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const coverUrl = getCoverUrl(track.cover_path);

  const isCurrentTrack = currentTrack?.id === track.id;

  return (
    <>
      <div
        onClick={() => setShowBuyWidget(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex-shrink-0 w-32 md:w-40 cursor-pointer group"
      >
        {/* Ranking Number (if provided) */}
        {ranking && (
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-10">
            <span 
              className="text-6xl md:text-7xl font-bold"
              style={{
                WebkitTextStroke: '2px hsl(var(--muted-foreground))',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {ranking}
            </span>
          </div>
        )}

        {/* Card */}
        <div className={`relative aspect-square rounded-md overflow-hidden bg-muted transition-all duration-300 ${
          isHovered ? "scale-105 shadow-xl z-10" : ""
        }`}>
          {/* Cover Image */}
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={track.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <Music className="h-10 w-10 text-muted-foreground" />
            </div>
          )}

          {/* Hover Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}>
            {/* Action Buttons */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <button className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center hover:scale-110 transition-transform">
                <Play className="h-5 w-5 text-background fill-current ml-0.5" />
              </button>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-full border border-muted-foreground/50 flex items-center justify-center hover:border-foreground transition-colors">
                  <Info className="h-4 w-4 text-foreground" />
                </button>
                <button className="w-8 h-8 rounded-full border border-muted-foreground/50 flex items-center justify-center hover:border-foreground transition-colors">
                  <MoreVertical className="h-4 w-4 text-foreground" />
                </button>
              </div>
            </div>
          </div>

          {/* Price Badge */}
          <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground text-xs font-medium px-2 py-0.5 rounded">
            ${track.price.toFixed(3)}
          </div>

          {/* Playing Indicator */}
          {isCurrentTrack && isPlaying && (
            <div className="absolute top-2 left-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-0.5 bg-primary rounded-full animate-pulse"
                    style={{
                      height: `${8 + i * 4}px`,
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="mt-2">
          <h3 className="text-sm font-medium text-foreground truncate">{track.title}</h3>
          <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
        </div>
      </div>

      {showBuyWidget && (
        <BuyWidget
          track={track}
          onClose={() => setShowBuyWidget(false)}
          onSuccess={() => setShowBuyWidget(false)}
        />
      )}
    </>
  );
}
