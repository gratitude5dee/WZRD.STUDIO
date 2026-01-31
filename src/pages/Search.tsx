import { useState, useEffect } from "react";
import { Search as SearchIcon, Music } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Track, usePlayer } from "@/contexts/PlayerContext";
import { TrackRow } from "@/components/TrackRow";
import { BottomNavigation } from "@/components/BottomNavigation";
import { MiniPlayer } from "@/components/MiniPlayer";
import { ThemeToggle } from "@/components/ThemeToggle";

const GENRES = [
  { name: "Pop", color: "hsl(262 83% 58%)" },
  { name: "Hip-Hop", color: "hsl(25 95% 53%)" },
  { name: "Indie", color: "hsl(142 76% 36%)" },
  { name: "Rock", color: "hsl(0 84% 60%)" },
  { name: "Electronic", color: "hsl(200 95% 50%)" },
  { name: "Jazz", color: "hsl(38 92% 50%)" },
  { name: "Classical", color: "hsl(280 70% 50%)" },
  { name: "Focus", color: "hsl(180 60% 45%)" },
];

export default function Search() {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const { setQueue, currentTrack } = usePlayer();

  useEffect(() => {
    async function fetchAllTracks() {
      const { data } = await supabase
        .from("music_tracks")
        .select("id, title, artist, cover_path, audio_path, price, artist_wallet")
        .order("created_at", { ascending: false });

      if (data) {
        setAllTracks(data);
        setQueue(data);
      }
    }
    fetchAllTracks();
  }, [setQueue]);

  useEffect(() => {
    if (!query.trim()) {
      setTracks([]);
      return;
    }

    setLoading(true);
    const filtered = allTracks.filter(
      (track) =>
        track.title.toLowerCase().includes(query.toLowerCase()) ||
        track.artist.toLowerCase().includes(query.toLowerCase())
    );
    setTracks(filtered);
    setLoading(false);
  }, [query, allTracks]);

  return (
    <div className="min-h-screen bg-background flex flex-col safe-top">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Search</h1>
          <ThemeToggle />
        </div>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Artists, songs, or podcasts"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-11 h-12 bg-secondary border-0 text-foreground placeholder:text-muted-foreground rounded-md"
          />
        </div>
      </header>

      {/* Content */}
      <main className={`flex-1 px-4 ${currentTrack ? "pb-36" : "pb-20"}`}>
        {query.trim() ? (
          // Search Results
          <div className="space-y-1">
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Searching...</p>
            ) : tracks.length === 0 ? (
              <div className="text-center py-12">
                <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No results found for "{query}"</p>
              </div>
            ) : (
              tracks.map((track, index) => (
                <TrackRow key={track.id} track={track} index={index} />
              ))
            )}
          </div>
        ) : (
          // Browse Categories
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Browse All</h2>
            <div className="grid grid-cols-2 gap-4">
              {GENRES.map((genre) => (
                <div
                  key={genre.name}
                  className="relative h-24 rounded-lg overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
                  style={{ backgroundColor: genre.color }}
                >
                  <span className="absolute top-3 left-3 text-lg font-bold text-foreground">
                    {genre.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <MiniPlayer />
      <BottomNavigation />
    </div>
  );
}
