import { Play, Radio, Info, MessageCircle } from "lucide-react";
import { Video } from "@/types/video";
import { useState } from "react";
import { BuyVideoWidget } from "./BuyVideoWidget";
import { getThumbnailUrl } from "@/lib/media-utils";
import { useContentEngagement } from "@/hooks/useContentEngagement";
import { ContentCommentsSheet } from "./engagement/ContentCommentsSheet";
import { formatNumber } from "@/lib/utils";

interface NetflixVideoCardProps {
  video: Video;
  ranking?: number;
  size?: "default" | "large";
}

export function NetflixVideoCard({ video, ranking, size = "default" }: NetflixVideoCardProps) {
  const [showBuyWidget, setShowBuyWidget] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const {
    isLiked,
    likesCount,
    commentsCount,
    handleLike,
  } = useContentEngagement({
    contentType: 'video',
    contentId: video.id,
    initialLikes: video.likes_count,
    initialComments: video.comments_count,
  });

  const thumbnailUrl = getThumbnailUrl(video.thumbnail_path);
  const cardWidth = size === "large" ? "w-64 md:w-80" : "w-44 md:w-56";

  return (
    <>
      <div
        onClick={() => setShowBuyWidget(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative flex-shrink-0 ${cardWidth} cursor-pointer group`}
      >
        {/* Ranking Number */}
        {ranking && (
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 z-10">
            <span
              className="text-7xl md:text-8xl font-bold"
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
        <div className={`relative aspect-video rounded-md overflow-hidden bg-muted transition-all duration-300 ${
          isHovered ? "scale-105 shadow-xl z-10" : ""
        }`}>
          {/* Thumbnail */}
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              {video.is_livestream ? (
                <Radio className="h-10 w-10 text-muted-foreground" />
              ) : (
                <Play className="h-10 w-10 text-muted-foreground" />
              )}
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
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike();
                  }}
                  className={`w-8 h-8 rounded-full border border-muted-foreground/50 flex items-center justify-center hover:border-foreground transition-all duration-300 ${
                    isLiked ? 'grayscale-0 scale-110' : 'grayscale opacity-70 hover:grayscale-0 hover:opacity-100'
                  }`}
                >
                  <span className="text-sm">🦞</span>
                </button>
                <button className="w-8 h-8 rounded-full border border-muted-foreground/50 flex items-center justify-center hover:border-foreground transition-colors">
                  <Info className="h-4 w-4 text-foreground" />
                </button>
              </div>
            </div>
          </div>

          {/* Live Badge */}
          {video.is_livestream && (
            <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-semibold px-2 py-0.5 rounded animate-pulse">
              LIVE
            </div>
          )}

          {/* Price Badge */}
          <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground text-xs font-medium px-2 py-0.5 rounded">
            ${video.price.toFixed(3)}
          </div>
        </div>

        {/* Video Info with Engagement */}
        <div className="mt-2">
          <h3 className="text-sm font-medium text-foreground truncate">{video.title}</h3>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xs text-muted-foreground truncate flex-1">{video.artist}</p>
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
      </div>

      <BuyVideoWidget
        video={video}
        isOpen={showBuyWidget}
        onClose={() => setShowBuyWidget(false)}
      />

      <ContentCommentsSheet
        contentType="video"
        contentId={video.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </>
  );
}
