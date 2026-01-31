import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, TrendingUp, Hash, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { MogPost } from "@/types/mog";
import { formatNumber } from "@/lib/utils";
import { BottomNavigation } from "@/components/BottomNavigation";

interface TrendingHashtag {
  tag: string;
  count: number;
}

export default function MogSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MogPost[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<TrendingHashtag[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTrendingHashtags();
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      searchPosts();
    } else {
      setResults([]);
    }
  }, [query]);

  const fetchTrendingHashtags = async () => {
    try {
      const { data } = await supabase
        .from('mog_posts')
        .select('hashtags')
        .eq('is_published', true)
        .order('views_count', { ascending: false })
        .limit(100);

      if (data) {
        // Count hashtag occurrences
        const tagCounts: Record<string, number> = {};
        data.forEach(post => {
          (post.hashtags || []).forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });

        // Sort by count and take top 10
        const trending = Object.entries(tagCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([tag, count]) => ({ tag, count }));

        setTrendingHashtags(trending);
      }
    } catch (error) {
      console.error('Error fetching trending:', error);
    }
  };

  const searchPosts = async () => {
    setLoading(true);
    try {
      const searchTerm = query.toLowerCase();
      
      // Search by title, description, or hashtags
      const { data } = await supabase
        .from('mog_posts')
        .select('*')
        .eq('is_published', true)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,creator_name.ilike.%${searchTerm}%`)
        .order('views_count', { ascending: false })
        .limit(20);

      setResults((data as MogPost[]) || []);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchByHashtag = async (tag: string) => {
    setQuery(`#${tag}`);
    setLoading(true);
    try {
      const { data } = await supabase
        .from('mog_posts')
        .select('*')
        .eq('is_published', true)
        .contains('hashtags', [tag])
        .order('views_count', { ascending: false })
        .limit(20);

      setResults((data as MogPost[]) || []);
    } catch (error) {
      console.error('Error searching by hashtag:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate('/mog')}>
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search mogs..."
              className="pl-10"
              autoFocus
            />
          </div>
        </div>
      </div>

      <div className="p-4">
        {query.length < 2 ? (
          // Show trending when no search
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Trending</h2>
              </div>
              <div className="space-y-3">
                {trendingHashtags.map((item, index) => (
                  <button
                    key={item.tag}
                    onClick={() => searchByHashtag(item.tag)}
                    className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Hash className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">#{item.tag}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(item.count)} posts
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">#{index + 1}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No results for "{query}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5">
            {results.map((post) => (
              <button
                key={post.id}
                onClick={() => navigate(`/mog/post/${post.id}`)}
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
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
