import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MogPost as MogPostType } from "@/types/mog";
import { MogPostCard } from "@/components/mog/MogPostCard";

export default function MogPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<MogPostType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('mog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPost(data as MogPostType);

      // Increment view count
      await supabase
        .from('mog_posts')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', id);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-medium">Post not found</p>
        <button
          onClick={() => navigate('/mog')}
          className="text-primary hover:underline"
        >
          Go back to feed
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-50 h-10 w-10 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center safe-top"
      >
        <ArrowLeft className="h-5 w-5 text-foreground" />
      </button>

      {/* Post Card */}
      <MogPostCard
        post={post}
        isActive={true}
        onProfileClick={() => navigate(`/mog/profile/${post.creator_wallet}`)}
      />
    </div>
  );
}
