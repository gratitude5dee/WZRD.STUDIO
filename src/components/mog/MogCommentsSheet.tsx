import { useState, useEffect } from "react";
import { Send, Heart } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { MogComment } from "@/types/mog";
import { MogVerificationBadge } from "./MogVerificationBadge";
import { formatDistanceToNow } from "date-fns";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";

interface MogCommentsSheetProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function MogCommentsSheet({ postId, isOpen, onClose }: MogCommentsSheetProps) {
  const { address } = useWallet();
  const [comments, setComments] = useState<MogComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && postId) {
      fetchComments();
    }
  }, [isOpen, postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mog_comments')
        .select('*')
        .eq('post_id', postId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments((data as MogComment[]) || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    if (!address) {
      toast.error('Please connect your wallet to comment');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('mog_comments').insert({
        post_id: postId,
        content: newComment.trim(),
        user_wallet: address.toLowerCase(),
        user_name: `${address.slice(0, 6)}...${address.slice(-4)}`,
        user_type: 'human' as const
      });

      if (error) throw error;

      // Update comment count on post
      const { data: postData } = await supabase
        .from('mog_posts')
        .select('comments_count')
        .eq('id', postId)
        .single();

      if (postData) {
        await supabase
          .from('mog_posts')
          .update({ comments_count: (postData.comments_count || 0) + 1 })
          .eq('id', postId);
      }

      setNewComment('');
      fetchComments();
      toast.success('Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle className="text-center">
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(70vh-140px)] py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p>No comments yet</p>
              <p className="text-sm">Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={comment.user_avatar || undefined} />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {comment.user_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-sm truncate">
                        {comment.user_name || 'Anonymous'}
                      </span>
                      <MogVerificationBadge type={comment.user_type} size="sm" />
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-0.5">{comment.content}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <Heart className="h-3.5 w-3.5" />
                        {comment.likes_count > 0 && comment.likes_count}
                      </button>
                      <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Comment Input */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border safe-bottom">
          <div className="flex items-center gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={address ? "Add a comment..." : "Connect wallet to comment"}
              className="flex-1"
              disabled={!address || submitting}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
            />
            <Button 
              size="icon" 
              onClick={handleSubmit} 
              disabled={!newComment.trim() || !address || submitting}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
