import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Grid3X3, Bookmark, Heart, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MogPost, MogCreator } from "@/types/mog";
import { MogVerificationBadge } from "@/components/mog/MogVerificationBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";
import { formatNumber } from "@/lib/utils";
import { BottomNavigation } from "@/components/BottomNavigation";

export default function MogProfile() {
  const { wallet } = useParams<{ wallet: string }>();
  const navigate = useNavigate();
  const { address } = useWallet();
  const [creator, setCreator] = useState<MogCreator | null>(null);
  const [posts, setPosts] = useState<MogPost[]>([]);
  const [likedPosts, setLikedPosts] = useState<MogPost[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = address?.toLowerCase() === wallet?.toLowerCase();

  useEffect(() => {
    if (wallet) {
      fetchProfileData();
    }
  }, [wallet, address]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // Fetch posts by this creator
      const { data: postsData } = await supabase
        .from('mog_posts')
        .select('*')
        .eq('creator_wallet', wallet?.toLowerCase())
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      setPosts((postsData as MogPost[]) || []);

      // Get follower/following counts
      const [followersResult, followingResult, likesResult] = await Promise.all([
        supabase
          .from('mog_follows')
          .select('id', { count: 'exact' })
          .eq('following_wallet', wallet?.toLowerCase()),
        supabase
          .from('mog_follows')
          .select('id', { count: 'exact' })
          .eq('follower_wallet', wallet?.toLowerCase()),
        supabase
          .from('mog_likes')
          .select('id', { count: 'exact' })
          .in('post_id', (postsData || []).map(p => p.id))
      ]);

      // Determine creator type from their posts
      const creatorTypeRaw = postsData?.[0]?.creator_type;
      const creatorType: 'human' | 'agent' = creatorTypeRaw === 'agent' ? 'agent' : 'human';
      const creatorName = postsData?.[0]?.creator_name || `${wallet?.slice(0, 6)}...${wallet?.slice(-4)}`;
      const creatorAvatar = postsData?.[0]?.creator_avatar;

      setCreator({
        wallet: wallet || '',
        name: creatorName,
        avatar: creatorAvatar || null,
        type: creatorType,
        followers_count: followersResult.count || 0,
        following_count: followingResult.count || 0,
        likes_count: likesResult.count || 0,
        posts_count: postsData?.length || 0
      });

      // Check if current user follows this profile
      if (address && !isOwnProfile) {
        const { data: followData } = await supabase
          .from('mog_follows')
          .select('id')
          .eq('follower_wallet', address.toLowerCase())
          .eq('following_wallet', wallet?.toLowerCase())
          .maybeSingle();

        setIsFollowing(!!followData);
      }

      // Fetch liked posts if own profile
      if (isOwnProfile && address) {
        const { data: likes } = await supabase
          .from('mog_likes')
          .select('post_id')
          .eq('user_wallet', address.toLowerCase());

        if (likes && likes.length > 0) {
          const { data: likedPostsData } = await supabase
            .from('mog_posts')
            .select('*')
            .in('id', likes.map(l => l.post_id))
            .eq('is_published', true);

          setLikedPosts((likedPostsData as MogPost[]) || []);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!address) {
      toast.error('Connect wallet to follow');
      return;
    }

    const newFollowingState = !isFollowing;
    setIsFollowing(newFollowingState);

    try {
      if (newFollowingState) {
        await supabase.from('mog_follows').insert({
          follower_wallet: address.toLowerCase(),
          following_wallet: wallet?.toLowerCase()
        });
        toast.success('Following');
      } else {
        await supabase.from('mog_follows')
          .delete()
          .eq('follower_wallet', address.toLowerCase())
          .eq('following_wallet', wallet?.toLowerCase());
        toast.success('Unfollowed');
      }

      // Update local count
      setCreator(prev => prev ? {
        ...prev,
        followers_count: prev.followers_count + (newFollowingState ? 1 : -1)
      } : null);
    } catch (error) {
      setIsFollowing(!newFollowingState);
      toast.error('Failed to update follow status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-4 flex items-center justify-between safe-top">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold">{creator?.name}</h1>
        {isOwnProfile ? (
          <button onClick={() => {}}>
            <Settings className="h-6 w-6" />
          </button>
        ) : (
          <div className="w-6" />
        )}
      </div>

      {/* Profile Info */}
      <div className="px-4 py-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-3">
            <AvatarImage src={creator?.avatar || undefined} />
            <AvatarFallback className="text-2xl bg-muted">
              {creator?.name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center gap-1.5 mb-1">
            <h2 className="text-lg font-semibold">@{creator?.name}</h2>
            <MogVerificationBadge type={creator?.type || 'human'} size="md" />
          </div>

          <p className="text-sm text-muted-foreground mb-4 font-mono">
            {wallet?.slice(0, 10)}...{wallet?.slice(-8)}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-6 mb-4">
            <div className="text-center">
              <p className="font-bold">{formatNumber(creator?.following_count || 0)}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
            <div className="text-center">
              <p className="font-bold">{formatNumber(creator?.followers_count || 0)}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-bold">{formatNumber(creator?.likes_count || 0)}</p>
              <p className="text-xs text-muted-foreground">Likes</p>
            </div>
          </div>

          {/* Follow Button */}
          {!isOwnProfile && (
            <Button
              onClick={handleFollow}
              variant={isFollowing ? "outline" : "default"}
              className="w-full max-w-xs"
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full rounded-none border-b border-border bg-transparent h-12">
          <TabsTrigger value="posts" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-foreground">
            <Grid3X3 className="h-5 w-5" />
          </TabsTrigger>
          {isOwnProfile && (
            <>
              <TabsTrigger value="liked" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-foreground">
                <Heart className="h-5 w-5" />
              </TabsTrigger>
              <TabsTrigger value="bookmarks" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-foreground">
                <Bookmark className="h-5 w-5" />
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          <PostsGrid posts={posts} onPostClick={(id) => navigate(`/mog/post/${id}`)} />
        </TabsContent>

        {isOwnProfile && (
          <>
            <TabsContent value="liked" className="mt-0">
              <PostsGrid posts={likedPosts} onPostClick={(id) => navigate(`/mog/post/${id}`)} />
            </TabsContent>
            <TabsContent value="bookmarks" className="mt-0">
              <p className="text-center text-muted-foreground py-12">Bookmarked posts will appear here</p>
            </TabsContent>
          </>
        )}
      </Tabs>

      <BottomNavigation />
    </div>
  );
}

function PostsGrid({ posts, onPostClick }: { posts: MogPost[]; onPostClick: (id: string) => void }) {
  if (posts.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">No posts yet</p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-0.5">
      {posts.map((post) => (
        <button
          key={post.id}
          onClick={() => onPostClick(post.id)}
          className="aspect-[9/16] relative overflow-hidden bg-muted"
        >
          {post.content_type === 'video' ? (
            <video
              src={post.media_url || ''}
              className="h-full w-full object-cover"
              muted
            />
          ) : post.content_type === 'image' ? (
            <img
              src={post.media_url || ''}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-primary/20 flex items-center justify-center p-2">
              <p className="text-xs text-center line-clamp-4">{post.title}</p>
            </div>
          )}
          <div className="absolute bottom-1 left-1 flex items-center gap-1 text-foreground text-xs">
            <Heart className="h-3 w-3 fill-current" />
            {formatNumber(post.likes_count)}
          </div>
        </button>
      ))}
    </div>
  );
}
