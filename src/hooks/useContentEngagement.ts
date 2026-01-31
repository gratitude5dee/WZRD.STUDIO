import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";
import { ContentType } from "@/types/engagement";
import { useEngagementPayout } from "@/hooks/useEngagementPayout";
interface UseContentEngagementOptions {
  contentType: ContentType;
  contentId: string;
  initialLikes?: number;
  initialComments?: number;
  initialShares?: number;
  initialViews?: number;
}

export function useContentEngagement({
  contentType,
  contentId,
  initialLikes = 0,
  initialComments = 0,
  initialShares = 0,
  initialViews = 0,
}: UseContentEngagementOptions) {
  const { address } = useWallet();
  const { triggerPayout } = useEngagementPayout({ contentType, contentId });
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [commentsCount, setCommentsCount] = useState(initialComments);
  const [sharesCount, setSharesCount] = useState(initialShares);
  const [viewsCount, setViewsCount] = useState(initialViews);
  const [isLoading, setIsLoading] = useState(false);

  // Check user's interaction status
  useEffect(() => {
    if (address && contentId) {
      checkUserInteractions();
    } else {
      setIsLiked(false);
      setIsBookmarked(false);
    }
  }, [address, contentId, contentType]);

  const checkUserInteractions = async () => {
    if (!address) return;
    
    try {
      const [likeResult, bookmarkResult] = await Promise.all([
        supabase
          .from('content_likes')
          .select('id')
          .eq('content_type', contentType)
          .eq('content_id', contentId)
          .eq('user_wallet', address.toLowerCase())
          .maybeSingle(),
        supabase
          .from('content_bookmarks')
          .select('id')
          .eq('content_type', contentType)
          .eq('content_id', contentId)
          .eq('user_wallet', address.toLowerCase())
          .maybeSingle()
      ]);

      setIsLiked(!!likeResult.data);
      setIsBookmarked(!!bookmarkResult.data);
    } catch (error) {
      console.error('Error checking interactions:', error);
    }
  };

  const handleLike = useCallback(async () => {
    if (!address) {
      toast.error('Connect wallet to like');
      return;
    }

    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);

    try {
      if (newLikedState) {
        await supabase.from('content_likes').insert({
          content_type: contentType,
          content_id: contentId,
          user_wallet: address.toLowerCase()
        });
        
        // Trigger $5DEE payout for like (fire and forget)
        triggerPayout('like');
      } else {
        await supabase.from('content_likes')
          .delete()
          .eq('content_type', contentType)
          .eq('content_id', contentId)
          .eq('user_wallet', address.toLowerCase());
      }

      // Update the count in the source table
      const tableName = contentType === 'track' ? 'music_tracks' 
        : contentType === 'video' ? 'music_videos' 
        : 'articles';
      
      await supabase
        .from(tableName)
        .update({ likes_count: newLikedState ? likesCount + 1 : likesCount - 1 })
        .eq('id', contentId);

    } catch (error) {
      // Revert on error
      setIsLiked(!newLikedState);
      setLikesCount(prev => newLikedState ? prev - 1 : prev + 1);
      console.error('Error toggling like:', error);
    }
  }, [address, contentType, contentId, isLiked, likesCount, triggerPayout]);

  const handleBookmark = useCallback(async () => {
    if (!address) {
      toast.error('Connect wallet to bookmark');
      return;
    }

    const newBookmarkedState = !isBookmarked;
    setIsBookmarked(newBookmarkedState);

    try {
      if (newBookmarkedState) {
        await supabase.from('content_bookmarks').insert({
          content_type: contentType,
          content_id: contentId,
          user_wallet: address.toLowerCase()
        });
        toast.success('Saved to bookmarks');
        
        // Trigger $5DEE payout for bookmark (fire and forget)
        triggerPayout('bookmark');
      } else {
        await supabase.from('content_bookmarks')
          .delete()
          .eq('content_type', contentType)
          .eq('content_id', contentId)
          .eq('user_wallet', address.toLowerCase());
        toast.success('Removed from bookmarks');
      }
    } catch (error) {
      setIsBookmarked(!newBookmarkedState);
      console.error('Error toggling bookmark:', error);
    }
  }, [address, contentType, contentId, isBookmarked, triggerPayout]);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/${contentType}/${contentId}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check this out on EARTONE',
          url
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      }
      
      setSharesCount(prev => prev + 1);
      
      // Update share count in database
      const tableName = contentType === 'track' ? 'music_tracks' 
        : contentType === 'video' ? 'music_videos' 
        : 'articles';
      
      await supabase
        .from(tableName)
        .update({ shares_count: sharesCount + 1 })
        .eq('id', contentId);
      
      // Trigger $5DEE payout for share (fire and forget)
      triggerPayout('share');
        
    } catch {
      // User cancelled share or fallback worked
    }
  }, [contentType, contentId, sharesCount, triggerPayout]);

  return {
    isLiked,
    isBookmarked,
    likesCount,
    commentsCount,
    sharesCount,
    viewsCount,
    isLoading,
    handleLike,
    handleBookmark,
    handleShare,
  };
}
