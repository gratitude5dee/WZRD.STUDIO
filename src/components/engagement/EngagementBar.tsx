import { Heart, MessageCircle, Share2, Eye } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface EngagementBarProps {
  likesCount: number;
  commentsCount?: number;
  sharesCount?: number;
  viewsCount?: number;
  isLiked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  variant?: "default" | "compact" | "minimal";
  showViews?: boolean;
  className?: string;
}

export function EngagementBar({
  likesCount,
  commentsCount = 0,
  sharesCount = 0,
  viewsCount = 0,
  isLiked = false,
  onLike,
  onComment,
  onShare,
  variant = "default",
  showViews = false,
  className,
}: EngagementBarProps) {
  const isCompact = variant === "compact";
  const isMinimal = variant === "minimal";

  const iconSize = isCompact || isMinimal ? "h-3.5 w-3.5" : "h-4 w-4";
  const textSize = isCompact || isMinimal ? "text-[10px]" : "text-xs";
  const gap = isCompact || isMinimal ? "gap-3" : "gap-4";

  return (
    <div className={cn("flex items-center", gap, className)}>
      {/* Likes */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onLike?.();
        }}
        className="flex items-center gap-1 group"
      >
        <Heart
          className={cn(
            iconSize,
            "transition-all duration-200",
            isLiked
              ? "text-red-500 fill-red-500 scale-110"
              : "text-muted-foreground group-hover:text-red-500"
          )}
        />
        <span
          className={cn(
            textSize,
            "font-medium transition-colors",
            isLiked ? "text-red-500" : "text-muted-foreground group-hover:text-foreground"
          )}
        >
          {formatNumber(likesCount)}
        </span>
      </button>

      {/* Comments */}
      {!isMinimal && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComment?.();
          }}
          className="flex items-center gap-1 group"
        >
          <MessageCircle
            className={cn(
              iconSize,
              "text-muted-foreground group-hover:text-foreground transition-colors"
            )}
          />
          <span
            className={cn(
              textSize,
              "font-medium text-muted-foreground group-hover:text-foreground transition-colors"
            )}
          >
            {formatNumber(commentsCount)}
          </span>
        </button>
      )}

      {/* Share */}
      {!isMinimal && onShare && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare();
          }}
          className="flex items-center gap-1 group"
        >
          <Share2
            className={cn(
              iconSize,
              "text-muted-foreground group-hover:text-foreground transition-colors"
            )}
          />
          {sharesCount > 0 && (
            <span
              className={cn(
                textSize,
                "font-medium text-muted-foreground group-hover:text-foreground transition-colors"
              )}
            >
              {formatNumber(sharesCount)}
            </span>
          )}
        </button>
      )}

      {/* Views */}
      {showViews && viewsCount > 0 && (
        <div className="flex items-center gap-1 ml-auto">
          <Eye className={cn(iconSize, "text-muted-foreground")} />
          <span className={cn(textSize, "text-muted-foreground font-medium")}>
            {formatNumber(viewsCount)}
          </span>
        </div>
      )}
    </div>
  );
}
