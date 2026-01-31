import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/contexts/WalletContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { WalletButton } from "@/components/WalletButton";
import { supabase } from "@/integrations/supabase/client";
import { Video, Play, Info, Plus, BookOpen, Headphones } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { BottomNavigation } from "@/components/BottomNavigation";
import { MiniPlayer } from "@/components/MiniPlayer";
import { Skeleton } from "@/components/ui/skeleton";
import { Video as VideoType } from "@/types/video";
import { ContentRow } from "@/components/ContentRow";
import { NetflixVideoCard } from "@/components/NetflixVideoCard";
import { ContinueWatchingCard } from "@/components/ContinueWatchingCard";
import { Top10Card } from "@/components/Top10Card";
import { CircularPreview } from "@/components/CircularPreview";
import { Button } from "@/components/ui/button";

export default function WatchHome() {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const { currentTrack } = usePlayer();
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Music Videos", "Documentaries", "Live", "Trending"];

  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected, navigate]);

  useEffect(() => {
    async function fetchVideos() {
      setLoading(true);
      const { data, error } = await supabase
        .from("music_videos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) {
        console.error("Error fetching videos:", error);
      } else {
        setVideos(data || []);
      }
      setLoading(false);
    }
    fetchVideos();
  }, []);

  const livestreams = videos.filter(v => v.is_livestream);
  const regularVideos = videos.filter(v => !v.is_livestream);
  const featuredVideo = videos[0] || null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Netflix-style Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-background via-background/80 to-transparent">
        <div className="flex items-center justify-between px-4 py-3 safe-top">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">eartone</span>
          </div>

          {/* Center - Tab Switch */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
            <button
              onClick={() => navigate("/read")}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Read
            </button>
            <button
              onClick={() => navigate("/home")}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Headphones className="h-4 w-4" />
              Listen
            </button>
            <button
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border border-primary text-foreground"
            >
              <Video className="h-4 w-4" />
              Watch
            </button>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            <NotificationsDropdown />
            <ThemeToggle />
            <WalletButton />
          </div>
        </div>

        {/* Categories - Secondary row */}
        <div className="px-4 pb-2 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 ${currentTrack ? "pb-36" : "pb-20"}`}>
        {/* Hero Section - Featured Video */}
        {featuredVideo && (
          <div className="relative h-[70vh] min-h-[500px]">
            {/* Background Image/Video */}
            <div className="absolute inset-0">
              {featuredVideo.thumbnail_path ? (
                <img
                  src={featuredVideo.thumbnail_path}
                  alt={featuredVideo.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-background" />
              )}
              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
            </div>

            {/* Hero Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pb-16 space-y-4">
              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-bold text-foreground max-w-xl">
                {featuredVideo.title}
              </h1>

              {/* Metadata */}
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="text-primary font-medium">98% Match</span>
                <span>2024</span>
                <span className="px-1 border border-muted-foreground/50 text-xs">HD</span>
                {featuredVideo.duration && (
                  <span>{Math.floor(featuredVideo.duration / 60)}m</span>
                )}
              </div>

              {/* Description */}
              {featuredVideo.description && (
                <p className="text-sm text-muted-foreground max-w-lg line-clamp-2">
                  {featuredVideo.description}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => navigate(`/watch/${featuredVideo.id}`)}
                  className="gap-2 bg-foreground text-background hover:bg-foreground/90"
                >
                  <Play className="h-5 w-5 fill-current" />
                  Play
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 border-muted-foreground/50 bg-muted/50"
                  onClick={() => navigate(`/watch/${featuredVideo.id}`)}
                >
                  <Info className="h-5 w-5" />
                  More Info
                </Button>
                <button className="ml-2 p-2 rounded-full border border-muted-foreground/50 hover:border-foreground transition-colors">
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Rows */}
        <div className={featuredVideo ? "-mt-10 relative z-10" : "pt-20"}>
          {loading ? (
            <div className="px-4 space-y-8">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-6 w-32 mb-3" />
                  <div className="flex gap-3 overflow-x-auto">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="w-44 flex-shrink-0">
                        <Skeleton className="aspect-video rounded-md mb-2" />
                        <Skeleton className="h-4 w-3/4 mb-1" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No videos yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to upload a video!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Previews - Circular Netflix-style */}
              {(livestreams.length > 0 || videos.length > 0) && (
                <ContentRow title="Previews" variant="previews">
                  {[...livestreams, ...videos.slice(0, 8)].slice(0, 10).map((video) => (
                    <CircularPreview key={video.id} video={video} />
                  ))}
                </ContentRow>
              )}

              {/* Continue Watching */}
              {regularVideos.length > 0 && (
                <ContentRow title="Continue Watching">
                  {regularVideos.slice(0, 6).map((video) => (
                    <ContinueWatchingCard
                      key={video.id}
                      video={video}
                      progress={Math.floor(Math.random() * 80) + 10}
                    />
                  ))}
                </ContentRow>
              )}

              {/* Top 10 Today */}
              {regularVideos.length >= 3 && (
                <ContentRow title="Top 10 Videos Today" variant="top10">
                  {regularVideos.slice(0, 10).map((video, index) => (
                    <Top10Card key={video.id} video={video} ranking={index + 1} />
                  ))}
                </ContentRow>
              )}

              {/* Live Now */}
              {livestreams.length > 0 && (
                <ContentRow title="🔴 Live Now">
                  {livestreams.map((video) => (
                    <NetflixVideoCard key={video.id} video={video} size="large" />
                  ))}
                </ContentRow>
              )}

              {/* Popular */}
              <ContentRow title="Popular on EARTONE">
                {regularVideos.map((video) => (
                  <NetflixVideoCard key={video.id} video={video} />
                ))}
              </ContentRow>

              {/* New Releases */}
              {regularVideos.length > 3 && (
                <ContentRow title="New Releases">
                  {[...regularVideos].reverse().slice(0, 8).map((video) => (
                    <NetflixVideoCard key={video.id} video={video} />
                  ))}
                </ContentRow>
              )}

              {/* Trending Now */}
              {regularVideos.length > 5 && (
                <ContentRow title="Trending Now">
                  {regularVideos.slice(2, 10).map((video) => (
                    <NetflixVideoCard key={video.id} video={video} size="large" />
                  ))}
                </ContentRow>
              )}

              {/* Music Videos */}
              <ContentRow title="Music Videos">
                {regularVideos.slice(0, 8).map((video) => (
                  <NetflixVideoCard key={video.id} video={video} />
                ))}
              </ContentRow>
            </div>
          )}
        </div>
      </main>

      <MiniPlayer />
      <BottomNavigation />
    </div>
  );
}
