import { useState, useEffect } from "react";
import { Send, Heart } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { ContentComment, ContentType } from "@/types/engagement";
import { formatDistanceToNow } from "date-fns";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";

interface ContentCommentsSheetProps {
  contentType: ContentType;
  contentId: string;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded?: () => void;
}

export function ContentCommentsSheet({ 
  contentType, 
  contentId, 
  isOpen, 
  onClose,
  onCommentAdded 
}: ContentCommentsSheetProps) {
  const { address } = useWallet();
  const [comments, setComments] = useState<ContentComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && contentId) {
      fetchComments();
    }
  }, [isOpen, contentId, contentType]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('content_comments')
        .select('*')
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments((data as ContentComment[]) || []);
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
      const { error } = await supabase.from('content_comments').insert({
        content_type: contentType,
        content_id: contentId,
        content: newComment.trim(),
        user_wallet: address.toLowerCase(),
        user_name: `${address.slice(0, 6)}...${address.slice(-4)}`,
      });

      if (error) throw error;

      // Update comment count on source table
      const tableName = contentType === 'track' ? 'music_tracks' 
        : contentType === 'video' ? 'music_videos' 
        : 'articles';
      
      const { data: contentData } = await supabase
        .from(tableName)
        .select('comments_count')
        .eq('id', contentId)
        .single();

      if (contentData) {
        await supabase
          .from(tableName)
          .update({ comments_count: (contentData.comments_count || 0) + 1 })
          .eq('id', contentId);
      }

      setNewComment('');
      fetchComments();
      onCommentAdded?.();
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
