import { Video } from "@/types/video";
import { Play, Radio, Wallet } from "lucide-react";
import { useState } from "react";
import { BuyVideoWidget } from "./BuyVideoWidget";
import { getThumbnailUrl } from "@/lib/media-utils";

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const [showBuyWidget, setShowBuyWidget] = useState(false);

  const thumbnailUrl = getThumbnailUrl(video.thumbnail_path);

  const handleClick = () => {
    setShowBuyWidget(true);
  };

  return (
    <>
      <div
        onClick={handleClick}
        className="group cursor-pointer"
      >
        {/* Thumbnail */}
        <div className="aspect-video bg-muted rounded-lg overflow-hidden relative mb-2">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>

          {/* Livestream badge */}
          {video.is_livestream && (
            <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-semibold px-2 py-1 rounded">
              LIVE
            </div>
          )}

          {/* Price badge */}
          <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm text-foreground text-xs font-medium px-2 py-1 rounded">
            ${video.price.toFixed(3)}
          </div>
        </div>

        {/* Info */}
        <h3 className="font-semibold text-foreground truncate">{video.title}</h3>
        <p className="text-sm text-muted-foreground truncate">{video.artist}</p>
      </div>

      <BuyVideoWidget
        video={video}
        isOpen={showBuyWidget}
        onClose={() => setShowBuyWidget(false)}
      />
    </>
  );
}
