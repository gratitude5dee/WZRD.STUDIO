import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/contexts/WalletContext";
import { MogPost, FeedType } from "@/types/mog";
import { MogPostCard } from "@/components/mog/MogPostCard";
import { MogHeader } from "@/components/mog/MogHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Loader2 } from "lucide-react";

export default function Mog() {
  const navigate = useNavigate();
  const { address } = useWallet();
  const [feedType, setFeedType] = useState<FeedType>('foryou');
  const [posts, setPosts] = useState<MogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch posts based on feed type
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('mog_posts')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (feedType === 'following' && address) {
        // Get following list first
        const { data: following } = await supabase
          .from('mog_follows')
          .select('following_wallet')
          .eq('follower_wallet', address.toLowerCase());

        if (following && following.length > 0) {
          const followingWallets = following.map(f => f.following_wallet);
          query = supabase
            .from('mog_posts')
            .select('*')
            .eq('is_published', true)
            .in('creator_wallet', followingWallets)
            .order('created_at', { ascending: false })
            .limit(20);
        } else {
          // No following, show empty state
          setPosts([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      setPosts((data as MogPost[]) || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [feedType, address]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Handle vertical scroll snap
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const itemHeight = window.innerHeight;
    const newIndex = Math.round(scrollTop / itemHeight);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < posts.length) {
      setCurrentIndex(newIndex);
    }
  }, [currentIndex, posts.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && currentIndex < posts.length - 1) {
        e.preventDefault();
        containerRef.current?.scrollTo({
          top: (currentIndex + 1) * window.innerHeight,
          behavior: 'smooth'
        });
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault();
        containerRef.current?.scrollTo({
          top: (currentIndex - 1) * window.innerHeight,
          behavior: 'smooth'
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, posts.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Following/For You tabs */}
      <MogHeader
        feedType={feedType}
        onFeedTypeChange={setFeedType}
        onSearch={() => navigate('/mog/search')}
        onUpload={() => navigate('/mog/upload')}
      />

      {/* Vertical scrolling container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {posts.map((post, index) => (
          <MogPostCard
            key={post.id}
            post={post}
            isActive={index === currentIndex}
            onProfileClick={() => navigate(`/mog/profile/${post.creator_wallet}`)}
          />
        ))}

        {posts.length === 0 && (
          <div className="h-screen flex flex-col items-center justify-center gap-4 px-8 text-center">
            <p className="text-xl font-medium text-foreground">
              {feedType === 'following' ? 'No posts from people you follow' : 'No posts yet'}
            </p>
            <p className="text-muted-foreground">
              {feedType === 'following' 
                ? 'Follow creators to see their content here' 
                : 'Be the first to share something!'}
            </p>
            <button
              onClick={() => navigate('/mog/upload')}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium mt-4"
            >
              Create a Mog
            </button>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
