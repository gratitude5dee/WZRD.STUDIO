import { Heart } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface LikeButtonProps {
  isLiked: boolean;
  likesCount: number;
  onLike: () => void;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  variant?: "default" | "overlay" | "minimal";
  className?: string;
}

export function LikeButton({
  isLiked,
  likesCount,
  onLike,
  size = "md",
  showCount = true,
  variant = "default",
  className,
}: LikeButtonProps) {
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizeClasses = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  const isOverlay = variant === "overlay";

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onLike();
      }}
      className={cn(
        "flex items-center gap-1 group transition-all",
        isOverlay && "backdrop-blur-sm bg-background/20 px-2 py-1 rounded-full",
        className
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isLiked ? "liked" : "unliked"}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Heart
            className={cn(
              sizeClasses[size],
              "transition-colors duration-200",
              isLiked
                ? "text-red-500 fill-red-500"
                : "text-muted-foreground group-hover:text-red-400"
            )}
          />
        </motion.div>
      </AnimatePresence>
      {showCount && (
        <span
          className={cn(
            textSizeClasses[size],
            "font-medium transition-colors",
            isLiked
              ? "text-red-500"
              : "text-muted-foreground group-hover:text-foreground"
          )}
        >
          {formatNumber(likesCount)}
        </span>
      )}
    </button>
  );
}
