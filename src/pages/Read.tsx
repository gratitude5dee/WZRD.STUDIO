import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/contexts/WalletContext";
import { WalletButton } from "@/components/WalletButton";
import { BottomNavigation } from "@/components/BottomNavigation";
import { MiniPlayer } from "@/components/MiniPlayer";
import { usePlayer } from "@/contexts/PlayerContext";
import { Headphones, Video, BookOpen, Clock, TrendingUp, Heart, MessageCircle, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useContentEngagement } from "@/hooks/useContentEngagement";
import { ContentCommentsSheet } from "@/components/engagement/ContentCommentsSheet";
import { formatNumber } from "@/lib/utils";

interface Article {
  id: string;
  title: string;
  author: string | null;
  excerpt: string | null;
  image_url: string | null;
  tags: string[] | null;
  topics: string[] | null;
  published_at: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
}

const categories = [
  { name: "All", active: true },
  { name: "Culture", active: false },
  { name: "Tech", active: false },
  { name: "Interviews", active: false },
  { name: "Guides", active: false },
];

export default function Read() {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const { currentTrack } = usePlayer();
  const [activeCategory, setActiveCategory] = useState("All");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected, navigate]);

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, author, excerpt, image_url, tags, topics, published_at, likes_count, comments_count, shares_count, views_count")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error fetching articles:", error);
      } else {
        setArticles(data || []);
      }
      setLoading(false);
    }
    fetchArticles();
  }, []);

  const trendingTopics = ["BAYC", "ApeChain", "ApeCoin", "Otherside", "Yuga Labs"];

  const getCategoryColor = (tag: string) => {
    const colors: Record<string, string> = {
      TECH: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      CULTURE: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      NFT: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      BUSINESS: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      GUIDES: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      INTERVIEWS: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    };
    return colors[tag?.toUpperCase()] || "bg-primary/20 text-primary border-primary/30";
  };

  const featuredArticle = articles[0];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3 safe-top">
          <div className="flex items-center">
            <span className="text-xl font-bold gradient-text">EARTONE</span>
          </div>

          {/* Tab Switch - Centered */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
            <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border border-primary text-foreground transition-all duration-200">
              <BookOpen className="h-4 w-4" />
              Read
            </button>
            <button onClick={() => navigate("/listen")} className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200">
              <Headphones className="h-4 w-4" />
              Listen
            </button>
            <button onClick={() => navigate("/watch")} className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200">
              <Video className="h-4 w-4" />
              Watch
            </button>
          </div>

          <div className="flex items-center gap-2">
            <NotificationsDropdown />
            <ThemeToggle />
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 pt-16 ${currentTrack ? "pb-36" : "pb-20"}`}>
        {loading ? (
          <div className="p-4 space-y-6">
            <Skeleton className="aspect-[16/10] w-full rounded-xl" />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
              ))}
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No articles yet</p>
          </div>
        ) : (
          <>
            {/* Hero Featured Article */}
            {featuredArticle && (
              <div className="relative">
                <div className="aspect-[16/10] md:aspect-[21/9] relative overflow-hidden">
                  <img
                    src={featuredArticle.image_url || "https://picsum.photos/seed/article-hero/1200/600"}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
                  
                  {/* Featured Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    {featuredArticle.tags?.[0] && (
                      <Badge className={`${getCategoryColor(featuredArticle.tags[0])} border mb-3`}>
                        {featuredArticle.tags[0]}
                      </Badge>
                    )}
                    <h1 className="text-2xl md:text-4xl font-bold text-foreground leading-tight mb-3 max-w-2xl">
                      {featuredArticle.title}
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base max-w-xl mb-4 line-clamp-2">
                      {featuredArticle.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{featuredArticle.author || "Anonymous"}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        5 min read
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {formatNumber(featuredArticle.likes_count)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {formatNumber(featuredArticle.comments_count)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Trending Topics */}
            <div className="px-4 py-4 border-b border-border/30">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Trending</span>
              </div>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {trendingTopics.map(topic => (
                  <button key={topic} className="flex-shrink-0 px-4 py-2 rounded-full bg-muted/30 hover:bg-muted/50 text-sm font-medium text-foreground transition-colors border border-border/30">
                    #{topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Tabs */}
            <div className="px-4 py-4 sticky top-16 bg-background/95 backdrop-blur-sm z-40 border-b border-border/30">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {categories.map(cat => (
                  <button 
                    key={cat.name} 
                    onClick={() => setActiveCategory(cat.name)} 
                    className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                      activeCategory === cat.name 
                        ? "bg-foreground text-background" 
                        : "bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Articles Grid */}
            <div className="px-4 py-6">
              <div className="space-y-6">
                {/* Large Featured Card */}
                {articles[1] && (
                  <ArticleCard article={articles[1]} variant="large" getCategoryColor={getCategoryColor} />
                )}

                {/* Two Column Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {articles.slice(2, 4).map(article => (
                    <ArticleCard key={article.id} article={article} variant="medium" getCategoryColor={getCategoryColor} />
                  ))}
                </div>

                {/* List Style Cards */}
                <div className="space-y-4">
                  {articles.slice(4).map(article => (
                    <ArticleCard key={article.id} article={article} variant="list" getCategoryColor={getCategoryColor} />
                  ))}
                </div>
              </div>
            </div>

            {/* Load More */}
            <div className="px-4 pb-8">
              <button className="w-full py-4 rounded-xl bg-muted/20 hover:bg-muted/40 text-foreground font-medium transition-colors border border-border/30 flex items-center justify-center gap-2">
                Load More Articles
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </main>

      <MiniPlayer />
      <BottomNavigation />
    </div>
  );
}

interface ArticleCardProps {
  article: Article;
  variant: "large" | "medium" | "list";
  getCategoryColor: (tag: string) => string;
}

function ArticleCard({ article, variant, getCategoryColor }: ArticleCardProps) {
  const [showComments, setShowComments] = useState(false);
  
  const {
    isLiked,
    likesCount,
    commentsCount,
    handleLike,
  } = useContentEngagement({
    contentType: 'article',
    contentId: article.id,
    initialLikes: article.likes_count,
    initialComments: article.comments_count,
  });

  const tag = article.tags?.[0] || "ARTICLE";
  const imageUrl = article.image_url || `https://picsum.photos/seed/${article.id}/400/300`;

  if (variant === "large") {
    return (
      <>
        <div className="group cursor-pointer">
          <div className="aspect-video rounded-2xl overflow-hidden relative mb-4">
            <img src={imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <div className="absolute top-4 left-4">
              <Badge className={`${getCategoryColor(tag)} border`}>{tag}</Badge>
            </div>
            <div className="absolute top-4 right-4 flex gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike();
                }}
                className="p-2 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-colors"
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'text-red-500 fill-red-500' : 'text-foreground'}`} />
              </button>
            </div>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{article.excerpt}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{article.author || "Anonymous"}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Heart className={`h-3 w-3 ${isLiked ? 'text-red-500 fill-red-500' : ''}`} />
              {formatNumber(likesCount)}
            </span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(true);
              }}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <MessageCircle className="h-3 w-3" />
              {formatNumber(commentsCount)}
            </button>
          </div>
        </div>
        <ContentCommentsSheet
          contentType="article"
          contentId={article.id}
          isOpen={showComments}
          onClose={() => setShowComments(false)}
        />
      </>
    );
  }

  if (variant === "medium") {
    return (
      <>
        <div className="group cursor-pointer">
          <div className="aspect-[4/3] rounded-xl overflow-hidden relative mb-3">
            <img src={imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            <div className="absolute top-2 left-2">
              <Badge className={`${getCategoryColor(tag)} border text-xs`}>{tag}</Badge>
            </div>
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{article.author || "Anonymous"}</span>
            <span>•</span>
            <span className="flex items-center gap-0.5">
              <Heart className={`h-2.5 w-2.5 ${isLiked ? 'text-red-500 fill-red-500' : ''}`} />
              {formatNumber(likesCount)}
            </span>
          </div>
        </div>
        <ContentCommentsSheet
          contentType="article"
          contentId={article.id}
          isOpen={showComments}
          onClose={() => setShowComments(false)}
        />
      </>
    );
  }

  // List variant
  return (
    <>
      <div className="group cursor-pointer flex gap-4 p-4 rounded-xl bg-muted/10 hover:bg-muted/20 transition-colors border border-border/10">
        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
          <img src={imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="flex-1 min-w-0">
          <Badge className={`${getCategoryColor(tag)} border text-xs mb-2`}>{tag}</Badge>
          <h3 className="text-sm font-bold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{article.author || "Anonymous"}</span>
            <span>•</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              className="flex items-center gap-0.5 hover:text-red-500 transition-colors"
            >
              <Heart className={`h-2.5 w-2.5 ${isLiked ? 'text-red-500 fill-red-500' : ''}`} />
              {formatNumber(likesCount)}
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(true);
              }}
              className="flex items-center gap-0.5 hover:text-foreground transition-colors"
            >
              <MessageCircle className="h-2.5 w-2.5" />
              {formatNumber(commentsCount)}
            </button>
          </div>
        </div>
      </div>
      <ContentCommentsSheet
        contentType="article"
        contentId={article.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </>
  );
}