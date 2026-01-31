import { cn } from "@/lib/utils";

interface PlayingIndicatorProps {
  isPlaying: boolean;
  className?: string;
}

export function PlayingIndicator({ isPlaying, className }: PlayingIndicatorProps) {
  return (
    <div className={cn("flex items-end gap-0.5 h-4", className)}>
      {[1, 2, 3].map((bar) => (
        <div
          key={bar}
          className={cn(
            "w-1 bg-primary rounded-full transition-all",
            isPlaying ? "animate-equalizer" : "h-1"
          )}
          style={{
            animationDelay: isPlaying ? `${bar * 0.15}s` : "0s",
          }}
        />
      ))}
    </div>
  );
}
