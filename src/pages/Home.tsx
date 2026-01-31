import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useWallet } from "@/contexts/WalletContext";
import { usePlayer, Track } from "@/contexts/PlayerContext";
import { WalletButton } from "@/components/WalletButton";
import { supabase } from "@/integrations/supabase/client";
import { Headphones, Video, BookOpen } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { getCoverUrl } from "@/lib/media-utils";
import { BottomNavigation } from "@/components/BottomNavigation";
import { MiniPlayer } from "@/components/MiniPlayer";
import { Skeleton } from "@/components/ui/skeleton";
import { Video as VideoType } from "@/types/video";
import { HeroSection } from "@/components/HeroSection";
import { CircularPreview } from "@/components/CircularPreview";
import { ContentRow } from "@/components/ContentRow";
import { TrackCard } from "@/components/TrackCard";
import { NetflixVideoCard } from "@/components/NetflixVideoCard";
import { ContinueWatchingCard } from "@/components/ContinueWatchingCard";
import { Top10Card } from "@/components/Top10Card";
type ContentTab = "listen" | "watch";
export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    isConnected
  } = useWallet();
  const {
    setQueue,
    currentTrack
  } = usePlayer();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [activeTab, setActiveTab] = useState<ContentTab>(() => {
    const tab = searchParams.get("tab");
    return tab === "watch" ? "watch" : "listen";
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected, navigate]);
  useEffect(() => {
    async function fetchContent() {
      setLoading(true);
      const [tracksResult, videosResult] = await Promise.all([supabase.from("music_tracks").select("id, title, artist, cover_path, audio_path, price, artist_wallet").order("created_at", {
        ascending: false
      }).limit(20), supabase.from("music_videos").select("*").order("created_at", {
        ascending: false
      }).limit(20)]);
      if (tracksResult.error) {
        console.error("Error fetching tracks:", tracksResult.error);
      } else {
        const typedData = tracksResult.data || [];
        setTracks(typedData);
        setQueue(typedData);
      }
      if (videosResult.error) {
        console.error("Error fetching videos:", videosResult.error);
      } else {
        setVideos(videosResult.data || []);
      }
      setLoading(false);
    }
    fetchContent();
  }, [setQueue]);
  const livestreams = videos.filter(v => v.is_livestream);
  const regularVideos = videos.filter(v => !v.is_livestream);
  const featuredVideo = videos[0] || null;

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  return <div className="min-h-screen bg-background flex flex-col">
      {/* Header - Conditional styling based on tab */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${activeTab === "watch" ? "bg-gradient-to-b from-background/80 to-transparent backdrop-blur-sm" : "bg-background/95 backdrop-blur-sm border-b border-border/50"}`}>
        <div className="flex items-center justify-between px-4 py-3 safe-top">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-xl font-bold gradient-text">eartone
          </span>
          </div>

          {/* Center - Read/Listen/Watch Tab Switch */}
          <div className="absolute left-1/2 -translate-x-1/2 mt-2.5 flex items-center gap-1">
            <button onClick={() => navigate("/read")} className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground">
              <BookOpen className="h-4 w-4" />
              Read
            </button>
            <button onClick={() => setActiveTab("listen")} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === "listen" ? "border border-primary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <Headphones className="h-4 w-4" />
              Listen
            </button>
            <button onClick={() => setActiveTab("watch")} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === "watch" ? "border border-primary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
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
      </header>

      {/* Main Content */}
      <main className={`flex-1 ${currentTrack ? "pb-36" : "pb-20"}`}>
        {activeTab === "listen" ? (/* ============ SPOTIFY-STYLE LISTEN TAB ============ */
      <div className="pt-16">
            {/* Greeting Header with gradient */}
            <div className="px-4 pt-6 pb-4 bg-gradient-to-b from-primary/20 to-background">
              <h1 className="text-2xl font-bold text-foreground">{getGreeting()}</h1>
            </div>

            {loading ? <div className="px-4 space-y-6">
                {/* Recent Tracks Grid Skeleton */}
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(6)].map((_, i) => <div key={i} className="flex items-center gap-3 bg-secondary/50 rounded-md overflow-hidden">
                      <Skeleton className="w-14 h-14" />
                      <Skeleton className="h-4 w-20" />
                    </div>)}
                </div>
                {/* Horizontal Scroll Skeleton */}
                {[...Array(2)].map((_, i) => <div key={i}>
                    <Skeleton className="h-6 w-32 mb-3" />
                    <div className="flex gap-4 overflow-x-auto">
                      {[...Array(4)].map((_, j) => <div key={j} className="w-36 flex-shrink-0">
                          <Skeleton className="aspect-square rounded-md mb-2" />
                          <Skeleton className="h-4 w-3/4 mb-1" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>)}
                    </div>
                  </div>)}
              </div> : tracks.length === 0 ? <div className="text-center py-12 px-4">
                <Headphones className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No tracks yet</p>
                <p className="text-sm text-muted-foreground mt-1">Be the first to upload music!</p>
              </div> : <div className="space-y-6">
                {/* Quick Access Grid - Spotify style compact cards */}
                <div className="px-4">
                  <div className="grid grid-cols-2 gap-3">
                {tracks.slice(0, 6).map(track => <QuickAccessCard key={track.id} track={track} />)}
                  </div>
                </div>

                {/* New Releases - Horizontal Scroll */}
                <section className="py-2">
                  <h2 className="text-lg font-bold px-4 mb-4 text-foreground">New Releases</h2>
                  <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
                    {tracks.slice(0, 8).map(track => <div key={track.id} className="w-36 flex-shrink-0">
                        <TrackCard track={track} />
                      </div>)}
                  </div>
                </section>

                {/* Popular Tracks - Horizontal Scroll */}
                <section className="py-2">
                  <h2 className="text-lg font-bold px-4 mb-4 text-foreground">Popular Tracks</h2>
                  <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
                    {tracks.map(track => <div key={track.id} className="w-36 flex-shrink-0">
                        <TrackCard track={track} />
                      </div>)}
                  </div>
                </section>

                {/* Made For You - Horizontal Scroll */}
                <section className="py-2">
                  <h2 className="text-lg font-bold px-4 mb-4 text-foreground">Made For You</h2>
                  <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
                    {[...tracks].reverse().map(track => <div key={track.id} className="w-36 flex-shrink-0">
                        <TrackCard track={track} />
                      </div>)}
                  </div>
                </section>
              </div>}
          </div>) : (/* ============ NETFLIX-STYLE WATCH TAB ============ */
      <>
            {/* Hero Section */}
            <HeroSection featuredTrack={null} featuredVideo={featuredVideo} mode="watch" />

            <div className="-mt-16 relative z-10">
              {loading ? <div className="px-4 space-y-8">
                  {[...Array(2)].map((_, i) => <div key={i}>
                      <Skeleton className="h-6 w-32 mb-3" />
                      <div className="flex gap-3 overflow-x-auto">
                        {[...Array(4)].map((_, j) => <div key={j} className="w-44 flex-shrink-0">
                            <Skeleton className="aspect-video rounded-md mb-2" />
                            <Skeleton className="h-4 w-3/4 mb-1" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>)}
                      </div>
                    </div>)}
                </div> : videos.length === 0 ? <div className="text-center py-12 px-4">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No videos yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Be the first to upload a video!</p>
                </div> : <>
                  {/* Previews - Circular cards section */}
                  {(livestreams.length > 0 || videos.length > 0) && <ContentRow title="Previews" variant="previews">
                      {[...livestreams, ...videos.slice(0, 8)].slice(0, 10).map(video => <CircularPreview key={video.id} video={video} />)}
                    </ContentRow>}

                  {/* Continue Watching - with progress bars */}
                  {regularVideos.length > 0 && <ContentRow title="Continue Watching">
                      {regularVideos.slice(0, 6).map((video, index) => <ContinueWatchingCard key={video.id} video={video} progress={Math.floor(Math.random() * 80) + 10} // Simulated progress
              />)}
                    </ContentRow>}

                  {/* Top 10 in Videos Today */}
                  {regularVideos.length >= 3 && <ContentRow title="Top 10 Videos Today" variant="top10">
                      {regularVideos.slice(0, 10).map((video, index) => <Top10Card key={video.id} video={video} ranking={index + 1} />)}
                    </ContentRow>}

                  {/* Live Now */}
                  {livestreams.length > 0 && <ContentRow title="🔴 Live Now">
                      {livestreams.map(video => <NetflixVideoCard key={video.id} video={video} size="large" />)}
                    </ContentRow>}

                  {/* Popular on Monad */}
                  <ContentRow title="Popular on Monad">
                    {regularVideos.map(video => <NetflixVideoCard key={video.id} video={video} />)}
                  </ContentRow>

                  {/* New Releases */}
                  {regularVideos.length > 3 && <ContentRow title="New Releases">
                      {[...regularVideos].reverse().slice(0, 8).map(video => <NetflixVideoCard key={video.id} video={video} />)}
                    </ContentRow>}

                  {/* Trending Now */}
                  {regularVideos.length > 5 && <ContentRow title="Trending Now">
                      {regularVideos.slice(2, 10).map(video => <NetflixVideoCard key={video.id} video={video} size="large" />)}
                    </ContentRow>}
                </>}
            </div>
          </>)}
      </main>

      <MiniPlayer />
      <BottomNavigation />
    </div>;
}

// Quick Access Card Component for Spotify-style compact cards
function QuickAccessCard({
  track
}: {
  track: Track;
}) {
  const {
    playTrack
  } = usePlayer();
  const coverUrl = getCoverUrl(track.cover_path);
  return <div className="flex items-center gap-3 bg-secondary/50 hover:bg-secondary/80 rounded-md overflow-hidden cursor-pointer transition-colors" onClick={() => playTrack(track)}>
      {coverUrl ? <img src={coverUrl} alt={track.title} className="w-14 h-14 object-cover" /> : <div className="w-14 h-14 bg-muted flex items-center justify-center">
          <Headphones className="h-6 w-6 text-muted-foreground" />
        </div>}
      <span className="text-sm font-medium text-foreground truncate pr-3">
        {track.title}
      </span>
    </div>;
}