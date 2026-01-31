import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MusicTrack } from "@/types/track";
import { Play, Pause, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmbedPlayer() {
  const { trackId } = useParams<{ trackId: string }>();
  const [track, setTrack] = useState<MusicTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const fetchTrack = async () => {
      if (!trackId) return;
      
      const { data, error } = await supabase
        .from("music_tracks")
        .select("*")
        .eq("id", trackId)
        .single();
      
      if (!error && data) {
        setTrack(data as MusicTrack);
      }
      setLoading(false);
    };

    fetchTrack();
  }, [trackId]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Track not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50">
          {/* Cover Art */}
          <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {track.cover_path ? (
              <img 
                src={track.cover_path} 
                alt={track.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-primary/20">
                <Play className="h-8 w-8 text-primary" />
              </div>
            )}
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-foreground truncate">{track.title}</h1>
            <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-primary font-medium text-sm">{track.price} ETH</span>
              <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted/50 rounded-full">
                Monad
              </span>
            </div>
          </div>

          {/* Play Button */}
          <Button 
            size="icon"
            className="h-12 w-12 rounded-full flex-shrink-0"
            onClick={() => setPlaying(!playing)}
          >
            {playing ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>
        </div>

        {/* Powered By */}
        <div className="mt-3 text-center">
          <a 
            href={window.location.origin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Powered by <span className="text-primary font-medium">Monad Music</span>
          </a>
        </div>
      </div>
    </div>
  );
}
