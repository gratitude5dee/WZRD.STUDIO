import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/contexts/WalletContext";
import { useEffect } from "react";
import { WalletButton } from "@/components/WalletButton";
import { BottomNavigation } from "@/components/BottomNavigation";
import { MiniPlayer } from "@/components/MiniPlayer";
import { usePlayer } from "@/contexts/PlayerContext";
import { Headphones, Video, BookOpen, Clock, TrendingUp, Bookmark, Share2, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";

// Mock articles data - Complex Magazine style
const featuredArticle = {
  id: "1",
  title: "The Future of Music Streaming: How Blockchain is Revolutionizing Artist Payments",
  excerpt: "Web3 technology is reshaping how musicians get paid, cutting out middlemen and creating direct fan-to-artist connections.",
  image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop",
  category: "TECH",
  author: "Marcus Chen",
  readTime: "8 min read",
  date: "Dec 6, 2024"
};
const articles = [{
  id: "2",
  title: "Inside the Monad Music Scene: 10 Artists You Need to Know",
  excerpt: "From underground producers to rising stars, these creators are defining the sound of decentralized music.",
  image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
  category: "CULTURE",
  author: "Aria Johnson",
  readTime: "5 min read",
  date: "Dec 5, 2024"
}, {
  id: "3",
  title: "NFT Drops This Week: December's Hottest Music Collectibles",
  excerpt: "Exclusive drops from top artists including limited edition stems and unreleased tracks.",
  image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop",
  category: "NFTs",
  author: "Dev Thompson",
  readTime: "4 min read",
  date: "Dec 5, 2024"
}, {
  id: "4",
  title: "The Rise of Pay-Per-Stream: Why Micropayments Are the Future",
  excerpt: "Traditional streaming royalties pay fractions of a cent. Crypto is changing that equation.",
  image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=300&fit=crop",
  category: "BUSINESS",
  author: "Sarah Kim",
  readTime: "6 min read",
  date: "Dec 4, 2024"
}, {
  id: "5",
  title: "Behind the Beats: A Producer's Guide to Web3 Music",
  excerpt: "How to mint, distribute, and monetize your music on the blockchain.",
  image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=300&fit=crop",
  category: "GUIDES",
  author: "Jordan Blake",
  readTime: "12 min read",
  date: "Dec 3, 2024"
}, {
  id: "6",
  title: "Exclusive Interview: CryptoBeats on Their New Album 'Neon Dreams'",
  excerpt: "The duo discusses their creative process and why they chose to release exclusively on Monad.",
  image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=300&fit=crop",
  category: "INTERVIEWS",
  author: "Marcus Chen",
  readTime: "10 min read",
  date: "Dec 2, 2024"
}];
const trendingTopics = ["Web3 Music", "NFT Drops", "Artist Spotlight", "Crypto Payments", "Live Streams"];
const categories = [{
  name: "All",
  active: true
}, {
  name: "Culture",
  active: false
}, {
  name: "Tech",
  active: false
}, {
  name: "Interviews",
  active: false
}, {
  name: "Guides",
  active: false
}];
export default function Read() {
  const navigate = useNavigate();
  const {
    isConnected
  } = useWallet();
  const {
    currentTrack
  } = usePlayer();
  const [activeCategory, setActiveCategory] = useState("All");
  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected, navigate]);
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      TECH: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      CULTURE: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      NFTs: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      BUSINESS: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      GUIDES: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      INTERVIEWS: "bg-pink-500/20 text-pink-400 border-pink-500/30"
    };
    return colors[category] || "bg-primary/20 text-primary border-primary/30";
  };
  return <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3 safe-top">
          <div className="flex items-center">
            <span className="text-xl font-bold gradient-text">EARTONE</span>
          </div>

          {/* Tab Switch */}
          <div className="flex items-center gap-1">
            <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border border-primary text-foreground transition-all duration-200">
              <BookOpen className="h-4 w-4" />
              Read
            </button>
            <button onClick={() => navigate("/home")} className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200">
              <Headphones className="h-4 w-4" />
              Listen
            </button>
            <button onClick={() => navigate("/home?tab=watch")} className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200">
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
        {/* Hero Featured Article - Complex Magazine Style */}
        <div className="relative">
          <div className="aspect-[16/10] md:aspect-[21/9] relative overflow-hidden">
            <img src={featuredArticle.image} alt={featuredArticle.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
            
            {/* Featured Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <Badge className={`${getCategoryColor(featuredArticle.category)} border mb-3`}>
                {featuredArticle.category}
              </Badge>
              <h1 className="text-2xl md:text-4xl font-bold text-foreground leading-tight mb-3 max-w-2xl">
                {featuredArticle.title}
              </h1>
              <p className="text-muted-foreground text-sm md:text-base max-w-xl mb-4 line-clamp-2">
                {featuredArticle.excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{featuredArticle.author}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {featuredArticle.readTime}
                </span>
                <span>•</span>
                <span>{featuredArticle.date}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trending Topics - Horizontal Scroll */}
        <div className="px-4 py-4 border-b border-border/30">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Trending</span>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {trendingTopics.map(topic => <button key={topic} className="flex-shrink-0 px-4 py-2 rounded-full bg-muted/30 hover:bg-muted/50 text-sm font-medium text-foreground transition-colors border border-border/30">
                #{topic.replace(/\s/g, "")}
              </button>)}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-4 py-4 sticky top-16 bg-background/95 backdrop-blur-sm z-40 border-b border-border/30">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map(cat => <button key={cat.name} onClick={() => setActiveCategory(cat.name)} className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.name ? "bg-foreground text-background" : "bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground"}`}>
                {cat.name}
              </button>)}
          </div>
        </div>

        {/* Articles Grid - Complex Magazine Style */}
        <div className="px-4 py-6">
          <div className="space-y-6">
            {/* Large Featured Card */}
            <ArticleCard article={articles[0]} variant="large" getCategoryColor={getCategoryColor} />

            {/* Two Column Grid */}
            <div className="grid grid-cols-2 gap-4">
              {articles.slice(1, 3).map(article => <ArticleCard key={article.id} article={article} variant="medium" getCategoryColor={getCategoryColor} />)}
            </div>

            {/* List Style Cards */}
            <div className="space-y-4">
              {articles.slice(3).map(article => <ArticleCard key={article.id} article={article} variant="list" getCategoryColor={getCategoryColor} />)}
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
      </main>

      <MiniPlayer />
      <BottomNavigation />
    </div>;
}
interface ArticleCardProps {
  article: typeof articles[0];
  variant: "large" | "medium" | "list";
  getCategoryColor: (category: string) => string;
}
function ArticleCard({
  article,
  variant,
  getCategoryColor
}: ArticleCardProps) {
  if (variant === "large") {
    return <div className="group cursor-pointer">
        <div className="aspect-video rounded-2xl overflow-hidden relative mb-4">
          <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="absolute top-4 left-4">
            <Badge className={`${getCategoryColor(article.category)} border`}>
              {article.category}
            </Badge>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <button className="p-2 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-colors">
              <Bookmark className="h-4 w-4 text-foreground" />
            </button>
            <button className="p-2 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-colors">
              <Share2 className="h-4 w-4 text-foreground" />
            </button>
          </div>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{article.excerpt}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{article.author}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.readTime}
          </span>
        </div>
      </div>;
  }
  if (variant === "medium") {
    return <div className="group cursor-pointer">
        <div className="aspect-[4/3] rounded-xl overflow-hidden relative mb-3">
          <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          <div className="absolute top-2 left-2">
            <Badge className={`${getCategoryColor(article.category)} border text-xs`}>
              {article.category}
            </Badge>
          </div>
        </div>
        <h3 className="text-sm font-bold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{article.author}</span>
          <span>•</span>
          <span>{article.readTime}</span>
        </div>
      </div>;
  }

  // List variant
  return <div className="group cursor-pointer flex gap-4 p-4 rounded-xl bg-muted/10 hover:bg-muted/20 transition-colors border border-border/10">
      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
        <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="flex-1 min-w-0">
        <Badge className={`${getCategoryColor(article.category)} border text-xs mb-2`}>
          {article.category}
        </Badge>
        <h3 className="text-sm font-bold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{article.author}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.readTime}
          </span>
        </div>
      </div>
    </div>;
}