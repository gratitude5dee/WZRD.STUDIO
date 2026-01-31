import { 
  Heart, 
  User, 
  Share2, 
  ListPlus, 
  Plus, 
  Radio, 
  Disc, 
  Info, 
  Clock, 
  EyeOff,
  X,
  Music
} from "lucide-react";
import { Track } from "@/contexts/PlayerContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";
import { ShareSheet } from "./ShareSheet";

interface TrackOptionsSheetProps {
  track: Track | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TrackOptionsSheet({ track, open, onOpenChange }: TrackOptionsSheetProps) {
  const [showShare, setShowShare] = useState(false);

  if (!track) return null;

  const coverUrl = track.cover_path
    ? `https://mttpdwowikfzcdpehlrd.supabase.co/storage/v1/object/public/covers/${track.cover_path}`
    : null;

  const options = [
    { icon: Heart, label: "Like", action: () => {} },
    { icon: User, label: "View artist", action: () => {} },
    { icon: Share2, label: "Share", action: () => { onOpenChange(false); setShowShare(true); } },
    { icon: Heart, label: "Like all songs", action: () => {} },
    { icon: ListPlus, label: "Add to playlist", action: () => {} },
    { icon: Plus, label: "Add to queue", action: () => {} },
    { icon: Radio, label: "Go to radio", action: () => {} },
    { icon: Disc, label: "View album", action: () => {} },
    { icon: Info, label: "Song credits", action: () => {} },
    { icon: Clock, label: "Sleep timer", action: () => {} },
    { icon: EyeOff, label: "Hide song", action: () => {} },
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl bg-card border-t border-border p-0">
          {/* Track Info Header */}
          <SheetHeader className="p-6 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded bg-muted overflow-hidden flex-shrink-0">
                {coverUrl ? (
                  <img src={coverUrl} alt={track.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-left text-foreground truncate">{track.title}</SheetTitle>
                <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
              </div>
            </div>
          </SheetHeader>

          {/* Options List */}
          <div className="flex-1 overflow-y-auto px-2 pb-6">
            {options.map((option, idx) => (
              <button
                key={idx}
                onClick={option.action}
                className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-secondary/50 rounded-md transition-colors"
              >
                <option.icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground text-sm">{option.label}</span>
              </button>
            ))}
          </div>

          {/* Close Button */}
          <div className="p-4 border-t border-border">
            <button
              onClick={() => onOpenChange(false)}
              className="w-full py-3 text-center text-muted-foreground text-sm font-medium hover:text-foreground transition-colors"
            >
              Close
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <ShareSheet 
        track={track} 
        open={showShare} 
        onOpenChange={setShowShare} 
      />
    </>
  );
}
