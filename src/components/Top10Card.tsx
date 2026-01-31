import { Play, Info, Heart } from "lucide-react";
import { Video } from "@/types/video";
import { useState } from "react";
import { BuyVideoWidget } from "./BuyVideoWidget";
import { getThumbnailUrl } from "@/lib/media-utils";
import { useContentEngagement } from "@/hooks/useContentEngagement";
import { formatNumber } from "@/lib/utils";

interface Top10CardProps {
  video: Video;
  ranking: number;
}

export function Top10Card({ video, ranking }: Top10CardProps) {
  const [showBuyWidget, setShowBuyWidget] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const {
    isLiked,
    likesCount,
    handleLike,
  } = useContentEngagement({
    contentType: 'video',
    contentId: video.id,
    initialLikes: video.likes_count,
    initialComments: video.comments_count,
  });

  const thumbnailUrl = getThumbnailUrl(video.thumbnail_path);

  return (
    <>
      <div
        onClick={() => setShowBuyWidget(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex-shrink-0 flex items-end cursor-pointer group"
      >
        {/* Large Ranking Number */}
        <div className="relative z-10 mr-[-20px]">
          <span
            className="text-[100px] md:text-[120px] font-black leading-none select-none"
            style={{
              WebkitTextStroke: '3px hsl(var(--muted-foreground))',
              WebkitTextFillColor: 'hsl(var(--background))',
              textShadow: '4px 4px 8px hsl(var(--background) / 0.5)',
            }}
          >
            {ranking}
          </span>
        </div>

        {/* Card */}
        <div className={`relative w-28 md:w-32 aspect-[2/3] rounded-md overflow-hidden bg-muted transition-all duration-300 ${
          isHovered ? "scale-105 shadow-xl" : ""
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
          <div className={`absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}>
            <div className="absolute bottom-2 left-2 right-2">
              <div className="flex items-center justify-center gap-2">
                <button className="w-9 h-9 rounded-full bg-foreground flex items-center justify-center hover:scale-110 transition-transform">
                  <Play className="h-4 w-4 text-background fill-current ml-0.5" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike();
                  }}
                  className="w-7 h-7 rounded-full border border-muted-foreground/50 flex items-center justify-center hover:border-foreground transition-colors"
                >
                  <Heart className={`h-3.5 w-3.5 ${isLiked ? 'text-red-500 fill-red-500' : 'text-foreground'}`} />
                </button>
                <button className="w-7 h-7 rounded-full border border-muted-foreground/50 flex items-center justify-center hover:border-foreground transition-colors">
                  <Info className="h-3.5 w-3.5 text-foreground" />
                </button>
              </div>
            </div>
          </div>

          {/* Engagement Badge */}
          <div className="absolute top-2 left-2 bg-background/60 backdrop-blur-sm text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <Heart className={`h-2.5 w-2.5 ${isLiked ? 'text-red-500 fill-red-500' : 'text-foreground'}`} />
            {formatNumber(likesCount)}
          </div>

          {/* Price Badge */}
          <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-medium px-1.5 py-0.5 rounded">
            ${video.price.toFixed(3)}
          </div>
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
