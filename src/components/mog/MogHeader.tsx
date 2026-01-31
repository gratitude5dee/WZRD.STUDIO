import { Search, Plus } from "lucide-react";
import { FeedType } from "@/types/mog";

interface MogHeaderProps {
  feedType: FeedType;
  onFeedTypeChange: (type: FeedType) => void;
  onSearch: () => void;
  onUpload: () => void;
}

export function MogHeader({ feedType, onFeedTypeChange, onSearch, onUpload }: MogHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="bg-gradient-to-b from-background/80 via-background/40 to-transparent pt-safe-top pb-8">
        <div className="flex items-center justify-center px-4 pt-4 pointer-events-auto">
          {/* Spacer for symmetry */}
          <div className="h-10 w-10" />

          {/* Feed Type Tabs */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onFeedTypeChange('following')}
              className={`text-base font-semibold transition-colors ${
                feedType === 'following' 
                  ? 'text-foreground' 
                  : 'text-foreground/60 hover:text-foreground/80'
              }`}
            >
              Following
            </button>
            <span className="text-foreground/40">|</span>
            <button
              onClick={() => onFeedTypeChange('foryou')}
              className={`text-base font-semibold transition-colors ${
                feedType === 'foryou' 
                  ? 'text-foreground' 
                  : 'text-foreground/60 hover:text-foreground/80'
              }`}
            >
              For You
            </button>
          </div>

          {/* Spacer to balance the layout */}
          <div className="h-10 w-10" />
        </div>
      </div>
    </div>
  );
}
