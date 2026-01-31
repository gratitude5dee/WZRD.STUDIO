import { Play, Info } from "lucide-react";
import { Video } from "@/types/video";
import { useState } from "react";
import { BuyVideoWidget } from "./BuyVideoWidget";
import { getThumbnailUrl } from "@/lib/media-utils";

interface ContinueWatchingCardProps {
  video: Video;
  progress?: number; // 0-100 percentage
}

export function ContinueWatchingCard({ video, progress = 0 }: ContinueWatchingCardProps) {
  const [showBuyWidget, setShowBuyWidget] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const thumbnailUrl = getThumbnailUrl(video.thumbnail_path);

  return (
    <>
      <div
        onClick={() => setShowBuyWidget(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex-shrink-0 w-32 md:w-40 cursor-pointer group"
      >
        {/* Card */}
        <div className={`relative aspect-video rounded-md overflow-hidden bg-muted transition-all duration-300 ${
          isHovered ? "scale-105 shadow-xl ring-1 ring-foreground/20" : ""
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
              <Play className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          {/* Hover Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-background/90 to-transparent transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}>
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <button className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center hover:scale-110 transition-transform">
                <Play className="h-4 w-4 text-background fill-current ml-0.5" />
              </button>
              <button className="w-7 h-7 rounded-full border border-muted-foreground/50 flex items-center justify-center hover:border-foreground transition-colors">
                <Info className="h-3.5 w-3.5 text-foreground" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted-foreground/30">
            <div 
              className="h-full bg-destructive transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Video Info */}
        <div className="mt-2">
          <h3 className="text-xs font-medium text-foreground truncate">{video.title}</h3>
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
