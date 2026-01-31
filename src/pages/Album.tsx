import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Heart, MoreHorizontal, Play, Shuffle, Music, Pause, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Track, usePlayer } from "@/contexts/PlayerContext";
import { TrackRow } from "@/components/TrackRow";
import { TrackOptionsSheet } from "@/components/TrackOptionsSheet";
import { MiniPlayer } from "@/components/MiniPlayer";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useColorExtraction } from "@/hooks/useColorExtraction";
import { PlayingIndicator } from "@/components/PlayingIndicator";
import { cn } from "@/lib/utils";

interface Album {
  id: string;
  title: string;
  artist: string;
  cover_path: string | null;
}

export default function AlbumPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playTrack, setQueue, currentTrack, isPlaying, togglePlay } = usePlayer();
  
  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const coverUrl = album?.cover_path
    ? `https://mttpdwowikfzcdpehlrd.supabase.co/storage/v1/object/public/covers/${album.cover_path}`
    : null;

  const { dominant, vibrant } = useColorExtraction(coverUrl);
  
  const isAlbumPlaying = tracks.some(t => t.id === currentTrack?.id) && isPlaying;
  const headerCollapsed = scrollY > 200;

  useEffect(() => {
    const fetchAlbum = async () => {
      if (!id) return;

      const { data: albumData } = await supabase
        .from("albums")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (albumData) {
        setAlbum(albumData);

        const { data: tracksData } = await supabase
          .from("tracks")
          .select("*")
          .eq("album_id", id)
          .order("created_at", { ascending: true });

        if (tracksData) {
          setTracks(tracksData);
        }
      }
      setLoading(false);
    };

    fetchAlbum();
  }, [id]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollY(container.scrollTop);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const handlePlayAll = () => {
    if (isAlbumPlaying) {
      togglePlay();
    } else if (tracks.length > 0) {
      setQueue(tracks);
      playTrack(tracks[0]);
    }
  };

  const handleShuffle = () => {
    if (tracks.length > 0) {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
      playTrack(shuffled[0]);
    }
  };

  const totalDuration = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const formatTotalDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return mins > 60 ? `${Math.floor(mins / 60)} hr ${mins % 60} min` : `${mins} min`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Music className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Album not found</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="min-h-screen bg-background pb-36 overflow-y-auto">
      {/* Dynamic Gradient Background */}
      <div 
        className="absolute inset-x-0 top-0 h-[450px] transition-opacity duration-500"
        style={{
          background: `linear-gradient(180deg, ${dominant} 0%, ${vibrant}40 40%, transparent 100%)`,
          opacity: 0.6,
        }}
      />

      {/* Collapsible Sticky Header */}
      <header 
        className={cn(
          "sticky top-0 z-50 flex items-center justify-between px-4 py-3 safe-top transition-all duration-300",
          headerCollapsed ? "bg-background/95 backdrop-blur-lg border-b border-border" : "bg-transparent"
        )}
      >
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/40 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          
          {/* Collapsed title */}
          <div className={cn(
            "flex items-center gap-3 transition-all duration-300",
            headerCollapsed ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
          )}>
            {coverUrl && (
              <img src={coverUrl} alt={album.title} className="w-10 h-10 rounded shadow-md" />
            )}
            <div>
              <h2 className="font-semibold text-foreground text-sm line-clamp-1">{album.title}</h2>
              <p className="text-xs text-muted-foreground">{album.artist}</p>
            </div>
          </div>
        </div>
        
        <button className="p-2 rounded-full hover:bg-background/20 transition-colors">
          <MoreHorizontal className="h-5 w-5 text-foreground" />
        </button>
      </header>

      {/* Album Art & Info */}
      <div className={cn(
        "relative px-6 pt-2 pb-6 transition-all duration-300",
        headerCollapsed ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
      )}>
        {/* Enhanced Album Art with Shadow */}
        <div className="relative w-52 h-52 mx-auto mb-6">
          <div 
            className="absolute inset-0 rounded-lg blur-2xl opacity-60 scale-90"
            style={{ background: dominant }}
          />
          <div className="relative w-full h-full rounded-lg shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
            {coverUrl ? (
              <img src={coverUrl} alt={album.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary">
                <Music className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground text-center">{album.title}</h1>
        <p className="text-muted-foreground text-center mt-1 font-medium">{album.artist}</p>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Album • {new Date().getFullYear()} • {tracks.length} songs • {formatTotalDuration(totalDuration)}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="relative flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className={cn(
              "transition-all duration-200 active:scale-90",
              isLiked ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart className={cn("h-7 w-7", isLiked && "fill-current")} />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Download className="h-6 w-6" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <MoreHorizontal className="h-6 w-6" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleShuffle}
            className="text-primary hover:text-primary/80 transition-colors active:scale-90"
          >
            <Shuffle className="h-6 w-6" />
          </button>
          <button
            onClick={handlePlayAll}
            className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 hover:shadow-xl hover:shadow-primary/40 active:scale-95 transition-all duration-200"
          >
            {isAlbumPlaying ? (
              <Pause className="h-7 w-7 text-primary-foreground fill-current" />
            ) : (
              <Play className="h-7 w-7 text-primary-foreground fill-current ml-1" />
            )}
          </button>
        </div>
      </div>

      {/* Track List */}
      <div className="relative px-2">
        {tracks.map((track, index) => {
          const isCurrentTrack = currentTrack?.id === track.id;
          const isTrackPlaying = isCurrentTrack && isPlaying;

          return (
            <div 
              key={track.id} 
              className={cn(
                "relative group rounded-lg transition-colors",
                isCurrentTrack && "bg-primary/10"
              )}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Track Number or Playing Indicator */}
                <div className="w-6 text-center">
                  {isTrackPlaying ? (
                    <PlayingIndicator isPlaying={true} />
                  ) : (
                    <span className={cn(
                      "text-sm",
                      isCurrentTrack ? "text-primary font-semibold" : "text-muted-foreground"
                    )}>
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Track Info */}
                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => {
                    setQueue(tracks);
                    playTrack(track);
                  }}
                >
                  <p className={cn(
                    "font-medium truncate",
                    isCurrentTrack ? "text-primary" : "text-foreground"
                  )}>
                    {track.title}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                </div>

                {/* Duration */}
                <span className="text-sm text-muted-foreground">
                  {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : '--:--'}
                </span>

                {/* Options Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTrack(track);
                    setShowOptions(true);
                  }}
                  className="p-2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <TrackOptionsSheet
        track={selectedTrack}
        open={showOptions}
        onOpenChange={setShowOptions}
      />

      <MiniPlayer />
      <BottomNavigation />
    </div>
  );
}
