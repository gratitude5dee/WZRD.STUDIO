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
  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const countTextSizeClasses = {
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
          className={cn(
            textSizeClasses[size],
            "leading-none transition-all duration-300",
            isLiked 
              ? "grayscale-0 scale-110 drop-shadow-lg" 
              : "grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100"
          )}
        >
          🦞
        </motion.div>
      </AnimatePresence>
      {showCount && (
        <span
          className={cn(
            countTextSizeClasses[size],
            "font-medium transition-colors",
            isLiked
              ? "text-foreground"
              : "text-muted-foreground group-hover:text-foreground"
          )}
        >
          {formatNumber(likesCount)}
        </span>
      )}
    </button>
  );
}
