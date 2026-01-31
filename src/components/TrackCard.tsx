import { Play, Music, Lock, Check, MessageCircle } from "lucide-react";
import { Track, usePlayer } from "@/contexts/PlayerContext";
import { getCoverUrl } from "@/lib/media-utils";
import { useWallet } from "@/contexts/WalletContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useContentEngagement } from "@/hooks/useContentEngagement";
import { ContentCommentsSheet } from "./engagement/ContentCommentsSheet";
import { formatNumber } from "@/lib/utils";

interface TrackCardProps {
  track: Track;
}

export function TrackCard({ track }: TrackCardProps) {
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const { address } = useWallet();
  const [hasEntitlement, setHasEntitlement] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const {
    isLiked,
    likesCount,
    commentsCount,
    handleLike,
  } = useContentEngagement({
    contentType: 'track',
    contentId: track.id,
    initialLikes: track.likes_count || 0,
    initialComments: track.comments_count || 0,
  });

  const coverUrl = getCoverUrl(track.cover_path);
  const isCurrentTrack = currentTrack?.id === track.id;
  const isPaidTrack = track.price > 0;

  // Check if user owns this track
  useEffect(() => {
    if (!address || !isPaidTrack) {
      setHasEntitlement(false);
      return;
    }

    const checkOwnership = async () => {
      try {
        const { data } = await supabase.rpc('get_entitlement', {
          p_track_id: track.id,
          p_user_wallet: address
        });
        setHasEntitlement(data && Array.isArray(data) && data.length > 0);
      } catch (err) {
        console.error('Error checking entitlement:', err);
      }
    };

    checkOwnership();
  }, [track.id, address, isPaidTrack]);

  return (
    <>
      <div
        onClick={() => playTrack(track)}
        className="group p-3 rounded-lg bg-card hover:bg-secondary/50 transition-all duration-300 cursor-pointer"
      >
        {/* Cover Image */}
        <div className="relative mb-3">
          <div className="aspect-square rounded-md bg-muted overflow-hidden shadow-lg">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={track.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary">
                <Music className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
          
          {/* Price/Ownership Badge */}
          {isPaidTrack && (
            <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${
              hasEntitlement 
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                : "bg-primary/20 text-primary border border-primary/30"
            }`}>
              {hasEntitlement ? (
                <>
                  <Check className="h-3 w-3" />
                  OWNED
                </>
              ) : (
                `${track.price} ETH`
              )}
            </div>
          )}

          {/* Like Button Overlay */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
            className={`absolute top-2 right-2 w-7 h-7 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
              isLiked ? "opacity-100 grayscale-0 scale-110" : "opacity-0 group-hover:opacity-100 grayscale"
            }`}
          >
            <span className="text-sm">🦞</span>
          </button>
          
          {/* Play Button Overlay */}
          <button
            className={`absolute bottom-2 right-2 w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
              isPaidTrack && !hasEntitlement
                ? "bg-secondary border border-border"
                : "bg-primary"
            } ${
              isCurrentTrack && isPlaying
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
            } hover:scale-105 active:scale-95`}
          >
            {isPaidTrack && !hasEntitlement ? (
              <Lock className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Play className="h-5 w-5 text-primary-foreground fill-current ml-0.5" />
            )}
          </button>
        </div>

        {/* Track Info */}
        <h3 className="font-semibold text-sm text-foreground truncate mb-1">
          {track.title}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground truncate flex-1">
            {track.artist}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className={`flex items-center gap-0.5 transition-all duration-300 ${isLiked ? 'grayscale-0' : 'grayscale opacity-70'}`}>
              <span className="text-xs">🦞</span>
              {formatNumber(likesCount)}
            </span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(true);
              }}
              className="flex items-center gap-0.5 hover:text-foreground transition-colors"
            >
              <MessageCircle className="h-3 w-3" />
              {formatNumber(commentsCount)}
            </button>
          </div>
        </div>
      </div>

      <ContentCommentsSheet
        contentType="track"
        contentId={track.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </>
  );
}
