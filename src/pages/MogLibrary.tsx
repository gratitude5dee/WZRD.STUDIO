import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/contexts/WalletContext";
import { MogPost } from "@/types/mog";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function MogLibrary() {
  const navigate = useNavigate();
  const { address, isConnected, connect } = useWallet();
  const [myPosts, setMyPosts] = useState<MogPost[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<MogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLibrary();
  }, [address]);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      if (!address) {
        setMyPosts([]);
        setBookmarkedPosts([]);
        return;
      }

      const [myPostsResult, bookmarksResult] = await Promise.all([
        supabase
          .from("mog_posts")
          .select("*")
          .eq("creator_wallet", address.toLowerCase())
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("mog_bookmarks")
          .select("post_id, mog_posts(*)")
          .eq("user_wallet", address.toLowerCase())
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (myPostsResult.data) {
        setMyPosts(myPostsResult.data as MogPost[]);
      }

      if (bookmarksResult.data) {
        const mapped = bookmarksResult.data
          .map((row) => row.mog_posts as MogPost | null)
          .filter((post): post is MogPost => post !== null);
        setBookmarkedPosts(mapped);
      }
    } catch (error) {
      console.error("Failed to load library", error);
    } finally {
      setLoading(false);
    }
  };

  const renderGrid = (posts: MogPost[], emptyMessage: string) => {
    if (posts.length === 0) {
      return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
    }

    return (
      <div className="grid grid-cols-3 gap-0.5">
        {posts.map((post) => (
          <button
            key={post.id}
            onClick={() => navigate(`/mog/post/${post.id}`)}
            className="aspect-[9/16] relative overflow-hidden bg-muted"
          >
            {post.content_type === "video" ? (
              <video
                src={post.media_url || ""}
                className="h-full w-full object-cover"
                muted
              />
            ) : post.content_type === "image" ? (
              <img
                src={post.media_url || ""}
                alt={post.title || "Mog"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-primary/20 flex items-center justify-center p-2">
                <p className="text-xs text-center line-clamp-4">{post.title}</p>
              </div>
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Library</h1>
          {!isConnected && (
            <Button size="sm" onClick={connect}>
              Connect Wallet
            </Button>
          )}
        </div>
      </header>

      <main className="p-4 space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Your Posts</h2>
              {renderGrid(myPosts, "You haven’t posted any Mogs yet.")}
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Bookmarks</h2>
              {renderGrid(bookmarkedPosts, "No saved Mogs yet.")}
            </section>
          </>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
