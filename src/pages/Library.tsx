import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Grid, List, Heart, Music, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/contexts/WalletContext";
import { Track, usePlayer } from "@/contexts/PlayerContext";
import { MiniPlayer } from "@/components/MiniPlayer";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ThemeToggle } from "@/components/ThemeToggle";

type FilterTab = "all" | "playlists" | "artists" | "albums";

interface LibraryItem {
  id: string;
  type: "liked" | "artist" | "album" | "track";
  title: string;
  subtitle?: string;
  image?: string;
  isCircle?: boolean;
}

export default function Library() {
  const navigate = useNavigate();
  const { address } = useWallet();
  const { playTrack, setQueue } = usePlayer();
  
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [purchasedTracks, setPurchasedTracks] = useState<Track[]>([]);

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "playlists", label: "Playlists" },
    { id: "artists", label: "Artists" },
    { id: "albums", label: "Albums" },
  ];

  useEffect(() => {
    const fetchLibrary = async () => {
      // Fetch all tracks
      const { data: allTracks } = await supabase
        .from("music_tracks")
        .select("*")
        .order("created_at", { ascending: false });

      if (allTracks) {
        setTracks(allTracks as Track[]);
      }

      // Fetch purchased tracks for connected wallet
      if (address) {
        const { data: streams } = await supabase
          .from("music_streams")
          .select("track_id")
          .eq("user_wallet", address);

        if (streams && streams.length > 0) {
          const trackIds = streams.map((s: any) => s.track_id).filter(Boolean);
          const { data: purchasedData } = await supabase
            .from("music_tracks")
            .select("*")
            .in("id", trackIds);

          if (purchasedData) {
            setPurchasedTracks(purchasedData);
          }
        }
      }
    };

    fetchLibrary();
  }, [address]);

  // Get unique artists from tracks
  const artists = [...new Set(tracks.map(t => t.artist))].slice(0, 10);

  const handlePlayLikedSongs = () => {
    if (purchasedTracks.length > 0) {
      setQueue(purchasedTracks);
      playTrack(purchasedTracks[0]);
    }
  };

  const getLibraryItems = (): LibraryItem[] => {
    const items: LibraryItem[] = [];

    // Liked Songs (purchased)
    if (activeTab === "all" || activeTab === "playlists") {
      items.push({
        id: "liked",
        type: "liked",
        title: "Liked Songs",
        subtitle: `${purchasedTracks.length} songs`,
      });
    }

    // Artists
    if (activeTab === "all" || activeTab === "artists") {
      artists.forEach((artist, idx) => {
        items.push({
          id: `artist-${idx}`,
          type: "artist",
          title: artist,
          subtitle: "Artist",
          isCircle: true,
        });
      });
    }

    // Recent tracks (as albums placeholder)
    if (activeTab === "all" || activeTab === "albums") {
      tracks.slice(0, 5).forEach(track => {
        const coverUrl = track.cover_path
          ? `https://mttpdwowikfzcdpehlrd.supabase.co/storage/v1/object/public/covers/${track.cover_path}`
          : undefined;
        items.push({
          id: `track-${track.id}`,
          type: "track",
          title: track.title,
          subtitle: track.artist,
          image: coverUrl,
        });
      });
    }

    return items;
  };

  const libraryItems = getLibraryItems();

  return (
    <div className="min-h-screen bg-background pb-36">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm px-4 py-4 safe-top">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Your Library</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-foreground">
              <Search className="h-6 w-6" />
            </button>
            <ThemeToggle />
            <button onClick={() => navigate("/upload")} className="p-2 text-foreground">
              <Plus className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Sort & View Toggle */}
      <div className="flex items-center justify-between px-4 py-3">
        <button className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Recently played</span>
        </button>
        <button
          onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
          className="p-2 text-muted-foreground"
        >
          {viewMode === "list" ? <Grid className="h-5 w-5" /> : <List className="h-5 w-5" />}
        </button>
      </div>

      {/* Library Content */}
      <div className={viewMode === "grid" ? "grid grid-cols-2 gap-4 px-4" : "px-4"}>
        {libraryItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              if (item.type === "liked") {
                handlePlayLikedSongs();
              }
            }}
            className={`w-full text-left ${
              viewMode === "list"
                ? "flex items-center gap-3 py-3 hover:bg-secondary/30 rounded-md transition-colors"
                : "p-2"
            }`}
          >
            {/* Image */}
            <div
              className={`flex-shrink-0 overflow-hidden ${
                viewMode === "list" ? "w-14 h-14" : "w-full aspect-square mb-2"
              } ${item.isCircle ? "rounded-full" : "rounded-md"} ${
                item.type === "liked" ? "bg-gradient-to-br from-primary to-primary/50" : "bg-secondary"
              }`}
            >
              {item.type === "liked" ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-primary-foreground fill-current" />
                </div>
              ) : item.image ? (
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className={`font-medium text-foreground truncate ${viewMode === "grid" ? "text-sm" : ""}`}>
                {item.title}
              </p>
              {item.subtitle && (
                <p className={`text-muted-foreground truncate ${viewMode === "grid" ? "text-xs" : "text-sm"}`}>
                  {item.subtitle}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      {libraryItems.length === 0 && (
        <div className="text-center py-20">
          <Music className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Your library is empty</p>
          <button
            onClick={() => navigate("/home")}
            className="mt-4 text-primary font-medium"
          >
            Start exploring
          </button>
        </div>
      )}

      <MiniPlayer />
      <BottomNavigation />
    </div>
  );
}
