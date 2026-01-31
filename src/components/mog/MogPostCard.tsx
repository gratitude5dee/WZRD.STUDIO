import { useState, useRef, useEffect } from "react";
import { 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Music, 
  Volume2, 
  VolumeX,
  Play
} from "lucide-react";
import { MogPost } from "@/types/mog";
import { MogVerificationBadge } from "./MogVerificationBadge";
import { MogCommentsSheet } from "./MogCommentsSheet";
import { formatNumber } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";

interface MogPostCardProps {
  post: MogPost;
  isActive: boolean;
  onProfileClick: () => void;
}

export function MogPostCard({ post, isActive, onProfileClick }: MogPostCardProps) {
  const { address } = useWallet();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);

  // Check if user has liked/bookmarked
  useEffect(() => {
    if (address) {
      checkUserInteractions();
    }
  }, [address, post.id]);

  const checkUserInteractions = async () => {
    if (!address) return;
    
    const [likeResult, bookmarkResult] = await Promise.all([
      supabase
        .from('mog_likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_wallet', address.toLowerCase())
        .maybeSingle(),
      supabase
        .from('mog_bookmarks')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_wallet', address.toLowerCase())
        .maybeSingle()
    ]);

    setIsLiked(!!likeResult.data);
    setIsBookmarked(!!bookmarkResult.data);
  };

  // Auto-play when active
  useEffect(() => {
    if (post.content_type === 'video' && videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    }
  }, [isActive, post.content_type]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLike = async () => {
    if (!address) {
      toast.error('Connect wallet to like');
      return;
    }

    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);

    try {
      if (newLikedState) {
        await supabase.from('mog_likes').insert({
          post_id: post.id,
          user_wallet: address.toLowerCase()
        });
      } else {
        await supabase.from('mog_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_wallet', address.toLowerCase());
      }
    } catch (error) {
      // Revert on error
      setIsLiked(!newLikedState);
      setLikesCount(prev => newLikedState ? prev - 1 : prev + 1);
    }
  };

  const handleBookmark = async () => {
    if (!address) {
      toast.error('Connect wallet to bookmark');
      return;
    }

    const newBookmarkedState = !isBookmarked;
    setIsBookmarked(newBookmarkedState);

    try {
      if (newBookmarkedState) {
        await supabase.from('mog_bookmarks').insert({
          post_id: post.id,
          user_wallet: address.toLowerCase()
        });
        toast.success('Saved to bookmarks');
      } else {
        await supabase.from('mog_bookmarks')
          .delete()
          .eq('post_id', post.id)
          .eq('user_wallet', address.toLowerCase());
        toast.success('Removed from bookmarks');
      }
    } catch (error) {
      setIsBookmarked(!newBookmarkedState);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: post.title || 'Check out this Mog',
        url: `${window.location.origin}/mog/post/${post.id}`
      });
    } catch {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${window.location.origin}/mog/post/${post.id}`);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="relative h-screen w-full snap-start bg-background overflow-hidden">
      {/* Content Layer */}
      <div className="absolute inset-0" onClick={post.content_type === 'video' ? togglePlay : undefined}>
        {post.content_type === 'video' ? (
          <video
            ref={videoRef}
            src={post.media_url || ''}
            className="h-full w-full object-cover"
            loop
            muted={isMuted}
            playsInline
            preload="auto"
          />
        ) : post.content_type === 'image' ? (
          <img
            src={post.media_url || ''}
            alt={post.title || 'Mog post'}
            className="h-full w-full object-cover"
          />
        ) : (
          // Article preview
          <div className="h-full w-full bg-gradient-to-b from-primary/20 to-background flex items-center justify-center p-8">
            <div className="max-w-md text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">{post.title}</h2>
              <p className="text-muted-foreground line-clamp-6">{post.description}</p>
            </div>
          </div>
        )}

        {/* Play/Pause Overlay for Videos */}
        {post.content_type === 'video' && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/20">
            <div className="h-20 w-20 rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center">
              <Play className="h-10 w-10 text-foreground fill-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar Actions */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-10">
        {/* Profile Avatar */}
        <button onClick={onProfileClick} className="relative">
          <Avatar className="h-12 w-12 ring-2 ring-background">
            <AvatarImage src={post.creator_avatar || undefined} />
            <AvatarFallback className="bg-muted">
              {post.creator_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            +
          </div>
        </button>

        {/* Like - Lobster */}
        <button onClick={handleLike} className="flex flex-col items-center gap-1">
          <div className={`h-11 w-11 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center text-2xl transition-all duration-300 ${
            isLiked ? 'grayscale-0 scale-110 drop-shadow-lg' : 'grayscale opacity-50'
          }`}>
            🦞
          </div>
          <span className="text-xs font-medium text-foreground">{formatNumber(likesCount)}</span>
        </button>

        {/* Comments */}
        <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1">
          <div className="h-11 w-11 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-foreground" />
          </div>
          <span className="text-xs font-medium text-foreground">{formatNumber(post.comments_count)}</span>
        </button>

        {/* Bookmark */}
        <button onClick={handleBookmark} className="flex flex-col items-center gap-1">
          <div className="h-11 w-11 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center">
            <Bookmark className={`h-6 w-6 ${isBookmarked ? 'text-primary fill-primary' : 'text-foreground'}`} />
          </div>
        </button>

        {/* Share */}
        <button onClick={handleShare} className="flex flex-col items-center gap-1">
          <div className="h-11 w-11 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center">
            <Share2 className="h-6 w-6 text-foreground" />
          </div>
          <span className="text-xs font-medium text-foreground">Share</span>
        </button>

        {/* Audio Disc (if has audio) */}
        {post.audio_name && (
          <div className="h-12 w-12 rounded-full bg-background/80 border-2 border-muted animate-spin-slow overflow-hidden">
            <div className="h-full w-full rounded-full bg-muted flex items-center justify-center">
              <Music className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Info */}
      <div className="absolute left-4 right-20 bottom-24 z-10">
        {/* Creator Info */}
        <button onClick={onProfileClick} className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-white drop-shadow-md">@{post.creator_name || 'anonymous'}</span>
          <MogVerificationBadge type={post.creator_type} size="sm" />
        </button>

        {/* Description */}
        {post.description && (
          <p className="text-sm text-white/90 line-clamp-2 mb-2 drop-shadow-md">{post.description}</p>
        )}

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {post.hashtags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-sm font-medium text-white drop-shadow-md">#{tag}</span>
            ))}
          </div>
        )}

        {/* Audio Info */}
        {post.audio_name && (
          <div className="flex items-center gap-2 text-sm text-white/80 drop-shadow-md">
            <Music className="h-4 w-4" />
            <span className="truncate">{post.audio_name}</span>
          </div>
        )}
      </div>

      {/* Volume Control for Videos */}
      {post.content_type === 'video' && (
        <button
          onClick={toggleMute}
          className="absolute top-24 right-4 h-10 w-10 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center z-10"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-foreground" />
          ) : (
            <Volume2 className="h-5 w-5 text-foreground" />
          )}
        </button>
      )}

      {/* Comments Sheet */}
      <MogCommentsSheet
        postId={post.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </div>
  );
}
