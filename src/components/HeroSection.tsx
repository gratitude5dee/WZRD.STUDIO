import { Play, Plus, Info } from "lucide-react";
import { Track, usePlayer } from "@/contexts/PlayerContext";
import { Video } from "@/types/video";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BuyWidget } from "./BuyWidget";
import { BuyVideoWidget } from "./BuyVideoWidget";
import { getCoverUrl, getThumbnailUrl } from "@/lib/media-utils";

interface HeroSectionProps {
  featuredTrack?: Track | null;
  featuredVideo?: Video | null;
  mode: "listen" | "watch";
}

export function HeroSection({ featuredTrack, featuredVideo, mode }: HeroSectionProps) {
  const { playTrack } = usePlayer();
  const [showBuyWidget, setShowBuyWidget] = useState(false);
  const [showVideoBuyWidget, setShowVideoBuyWidget] = useState(false);

  if (mode === "listen" && featuredTrack) {
    const coverUrl = getCoverUrl(featuredTrack.cover_path);

    return (
      <>
        <div className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={featuredTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 to-background" />
            )}
          </div>

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
            {/* Top Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl font-bold text-primary">#1</span>
              <span className="text-sm text-muted-foreground">on Monad Music</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 max-w-lg">
              {featuredTrack.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">{featuredTrack.artist}</p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowBuyWidget(true)}
                className="bg-foreground text-background hover:bg-foreground/90 font-semibold px-8"
                size="lg"
              >
                <Play className="h-5 w-5 mr-2 fill-current" />
                Play
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-muted-foreground/50 text-foreground hover:bg-muted/50"
              >
                <Plus className="h-5 w-5 mr-2" />
                My List
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full border border-muted-foreground/50 text-foreground hover:bg-muted/50"
              >
                <Info className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {showBuyWidget && (
          <BuyWidget
            track={featuredTrack}
            onClose={() => setShowBuyWidget(false)}
            onSuccess={() => setShowBuyWidget(false)}
          />
        )}
      </>
    );
  }

  if (mode === "watch" && featuredVideo) {
    const thumbnailUrl = getThumbnailUrl(featuredVideo.thumbnail_path);

    return (
      <>
        <div className="relative h-[75vh] min-h-[550px] w-full overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={featuredVideo.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 to-background" />
            )}
          </div>

          {/* Gradient Overlays - Enhanced for Netflix look */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

          {/* Live Badge */}
          {featuredVideo.is_livestream && (
            <div className="absolute top-20 left-6">
              <span className="bg-destructive text-destructive-foreground text-sm font-semibold px-3 py-1 rounded animate-pulse">
                LIVE
              </span>
            </div>
          )}

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 pb-12">
            {/* Netflix-style Ranking Badge */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                <span className="text-sm font-bold text-destructive tracking-wider">N</span>
                <span className="text-xs text-muted-foreground ml-2 uppercase tracking-wide">Series</span>
              </div>
            </div>

            {/* Top 10 Badge */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center bg-destructive/90 px-2 py-1 rounded">
                <span className="text-xs font-bold text-destructive-foreground">TOP</span>
                <span className="text-lg font-black text-destructive-foreground ml-1">10</span>
              </div>
              <span className="text-sm text-foreground">#1 in Videos Today</span>
            </div>

            {/* Title - Larger and bolder */}
            <h1 className="text-5xl md:text-6xl font-black text-foreground mb-2 max-w-xl leading-tight tracking-tight">
              {featuredVideo.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">{featuredVideo.artist}</p>

            {/* Action Buttons - Netflix Layout */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowVideoBuyWidget(true)}
                className="bg-foreground text-background hover:bg-foreground/90 font-semibold px-8 py-6 text-base"
                size="lg"
              >
                <Play className="h-6 w-6 mr-2 fill-current" />
                Play
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="bg-secondary/80 hover:bg-secondary text-foreground font-semibold px-6 py-6"
              >
                <Info className="h-5 w-5 mr-2" />
                More Info
              </Button>
            </div>

            {/* Price indicator */}
            <p className="text-sm text-muted-foreground mt-4">
              Stream for <span className="text-primary font-semibold">${featuredVideo.price.toFixed(3)}</span>
            </p>
          </div>
        </div>

        <BuyVideoWidget
          video={featuredVideo}
          isOpen={showVideoBuyWidget}
          onClose={() => setShowVideoBuyWidget(false)}
        />
      </>
    );
  }

  // Empty state
  return (
    <div className="relative h-[50vh] min-h-[300px] w-full bg-gradient-to-b from-primary/20 to-background flex items-end p-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {mode === "listen" ? "Discover Music" : "Watch Videos"}
        </h1>
        <p className="text-muted-foreground">
          {mode === "listen" ? "No tracks available yet" : "No videos available yet"}
        </p>
      </div>
    </div>
  );
}
