import { X, Copy, MessageCircle, Twitter, Send, Music } from "lucide-react";
import { Track } from "@/contexts/PlayerContext";
import { useToast } from "@/hooks/use-toast";

interface ShareSheetProps {
  track: Track | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareSheet({ track, open, onOpenChange }: ShareSheetProps) {
  const { toast } = useToast();

  if (!open || !track) return null;

  const coverUrl = track.cover_path
    ? `https://mttpdwowikfzcdpehlrd.supabase.co/storage/v1/object/public/covers/${track.cover_path}`
    : null;

  const shareUrl = `${window.location.origin}/track/${track.id}`;

  const shareOptions = [
    { 
      icon: Copy, 
      label: "Copy Link", 
      action: () => {
        navigator.clipboard.writeText(shareUrl);
        toast({ title: "Link copied!" });
        onOpenChange(false);
      }
    },
    { icon: MessageCircle, label: "WhatsApp", action: () => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out ${track.title} by ${track.artist}: ${shareUrl}`)}`) },
    { icon: Twitter, label: "Twitter", action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Listening to ${track.title} by ${track.artist} on Monad Music 🎵`)}&url=${encodeURIComponent(shareUrl)}`) },
    { icon: Send, label: "Messages", action: () => {} },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-fade-in"
      onClick={() => onOpenChange(false)}
    >
      <button 
        onClick={() => onOpenChange(false)}
        className="absolute top-4 left-4 p-2 text-foreground z-10"
      >
        <X className="h-6 w-6" />
      </button>

      <div 
        className="flex flex-col items-center px-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Album Art */}
        <div className="w-48 h-48 rounded-lg shadow-2xl overflow-hidden mb-6">
          {coverUrl ? (
            <img src={coverUrl} alt={track.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <Music className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Track Info */}
        <h2 className="text-xl font-bold text-foreground mb-1">{track.title}</h2>
        <p className="text-muted-foreground mb-8">{track.artist}</p>

        {/* Share Options */}
        <div className="flex gap-6">
          {shareOptions.map((option, idx) => (
            <button
              key={idx}
              onClick={option.action}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                <option.icon className="h-6 w-6 text-foreground" />
              </div>
              <span className="text-xs text-muted-foreground">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
