import { Play, Pause, Music, MoreHorizontal } from "lucide-react";
import { Track, usePlayer } from "@/contexts/PlayerContext";
import { useState } from "react";
import { TrackOptionsSheet } from "./TrackOptionsSheet";

interface TrackRowProps {
  track: Track;
  index: number;
  showCover?: boolean;
  showOptions?: boolean;
}

export function TrackRow({ track, index, showCover = true, showOptions = false }: TrackRowProps) {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);

  const coverUrl = track.cover_path
    ? `https://mttpdwowikfzcdpehlrd.supabase.co/storage/v1/object/public/covers/${track.cover_path}`
    : null;

  const isCurrentTrack = currentTrack?.id === track.id;
  const isCurrentPlaying = isCurrentTrack && isPlaying;

  const handleClick = () => {
    if (isCurrentTrack) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className="group grid grid-cols-[32px_1fr_auto] gap-3 px-3 py-2 hover:bg-secondary/50 rounded-md cursor-pointer items-center transition-colors"
      >
        {/* Index / Play Button / Equalizer */}
        <div className="flex items-center justify-center">
          <span className={`text-sm ${isCurrentTrack ? "text-primary" : "text-muted-foreground"} group-hover:hidden`}>
            {isCurrentPlaying ? (
              <div className="flex items-end gap-0.5 h-4">
                <span className="w-1 bg-primary animate-[equalizer_0.5s_ease-in-out_infinite]" style={{ height: "60%" }} />
                <span className="w-1 bg-primary animate-[equalizer_0.5s_ease-in-out_infinite_0.1s]" style={{ height: "100%" }} />
                <span className="w-1 bg-primary animate-[equalizer_0.5s_ease-in-out_infinite_0.2s]" style={{ height: "40%" }} />
              </div>
            ) : (
              index + 1
            )}
          </span>
          <span className="hidden group-hover:block text-foreground">
            {isCurrentPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current" />
            )}
          </span>
        </div>

        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-0">
          {showCover && (
            <div className="w-10 h-10 rounded bg-muted flex-shrink-0 overflow-hidden">
              {coverUrl ? (
                <img src={coverUrl} alt={track.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          )}
          <div className="min-w-0">
            <p className={`text-sm font-medium truncate ${isCurrentTrack ? "text-primary" : "text-foreground"}`}>
              {track.title}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {track.artist}
            </p>
          </div>
        </div>

        {/* Price & Options */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            ${track.price.toFixed(3)}
          </span>
          {showOptions && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowOptionsSheet(true);
              }}
              className="p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {showOptions && (
        <TrackOptionsSheet
          track={track}
          open={showOptionsSheet}
          onOpenChange={setShowOptionsSheet}
        />
      )}
    </>
  );
}
