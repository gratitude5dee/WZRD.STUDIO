import { Play, Radio, MoreVertical, Info } from "lucide-react";
import { Video } from "@/types/video";
import { useState } from "react";
import { BuyVideoWidget } from "./BuyVideoWidget";
import { getThumbnailUrl } from "@/lib/media-utils";

interface NetflixVideoCardProps {
  video: Video;
  ranking?: number;
  size?: "default" | "large";
}

export function NetflixVideoCard({ video, ranking, size = "default" }: NetflixVideoCardProps) {
  const [showBuyWidget, setShowBuyWidget] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
                <button className="w-8 h-8 rounded-full border border-muted-foreground/50 flex items-center justify-center hover:border-foreground transition-colors">
                  <Info className="h-4 w-4 text-foreground" />
                </button>
                <button className="w-8 h-8 rounded-full border border-muted-foreground/50 flex items-center justify-center hover:border-foreground transition-colors">
                  <MoreVertical className="h-4 w-4 text-foreground" />
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

        {/* Video Info */}
        <div className="mt-2">
          <h3 className="text-sm font-medium text-foreground truncate">{video.title}</h3>
          <p className="text-xs text-muted-foreground truncate">{video.artist}</p>
        </div>
      </div>

      <BuyVideoWidget
        video={video}
        isOpen={showBuyWidget}
        onClose={() => setShowBuyWidget(false)}
      />
    </>
  );
}
