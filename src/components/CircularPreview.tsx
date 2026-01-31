import { Video } from "@/types/video";
import { Radio, Play } from "lucide-react";
import { useState } from "react";
import { BuyVideoWidget } from "./BuyVideoWidget";
import { getThumbnailUrl } from "@/lib/media-utils";

interface CircularPreviewProps {
  video: Video;
}

export function CircularPreview({ video }: CircularPreviewProps) {
  const [showBuyWidget, setShowBuyWidget] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const thumbnailUrl = getThumbnailUrl(video.thumbnail_path);

  return (
    <>
      <div
        onClick={() => setShowBuyWidget(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex flex-col items-center cursor-pointer group"
      >
        {/* Circular Thumbnail with Animated Ring */}
        <div className="relative mb-2">
          {/* Animated gradient ring on hover */}
          <div className={`w-24 h-24 md:w-28 md:h-28 rounded-full p-[3px] transition-all duration-300 ${
            isHovered 
              ? "bg-gradient-to-br from-primary via-destructive to-primary animate-pulse shadow-lg shadow-primary/30" 
              : "bg-gradient-to-br from-muted-foreground/50 via-muted-foreground/30 to-muted-foreground/50"
          }`}>
            <div className="w-full h-full rounded-full overflow-hidden bg-background relative">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={video.title}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    isHovered ? "scale-110" : "scale-100"
                  }`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <Radio className="h-10 w-10 text-muted-foreground" />
                </div>
              )}

              {/* Play icon overlay on hover */}
              <div className={`absolute inset-0 flex items-center justify-center bg-background/40 transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}>
                <div className="w-10 h-10 rounded-full bg-foreground/90 flex items-center justify-center">
                  <Play className="h-5 w-5 text-background fill-current ml-0.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Live indicator */}
          {video.is_livestream && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">
              LIVE
            </div>
          )}
        </div>

        {/* Title - Show video title instead of artist */}
        <span className={`text-xs text-center max-w-[90px] truncate transition-colors duration-200 ${
          isHovered ? "text-foreground" : "text-muted-foreground"
        }`}>
          {video.title}
        </span>
      </div>

      <BuyVideoWidget
        video={video}
        isOpen={showBuyWidget}
        onClose={() => setShowBuyWidget(false)}
      />
    </>
  );
}
