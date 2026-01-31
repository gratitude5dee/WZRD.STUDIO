import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface BookmarkButtonProps {
  isBookmarked: boolean;
  onBookmark: () => void;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "overlay";
  className?: string;
}

export function BookmarkButton({
  isBookmarked,
  onBookmark,
  size = "md",
  variant = "default",
  className,
}: BookmarkButtonProps) {
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const isOverlay = variant === "overlay";

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onBookmark();
      }}
      className={cn(
        "group transition-all",
        isOverlay && "backdrop-blur-sm bg-background/20 p-1.5 rounded-full",
        className
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isBookmarked ? "bookmarked" : "unbookmarked"}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Bookmark
            className={cn(
              sizeClasses[size],
              "transition-colors duration-200",
              isBookmarked
                ? "text-primary fill-primary"
                : "text-muted-foreground group-hover:text-foreground"
            )}
          />
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
