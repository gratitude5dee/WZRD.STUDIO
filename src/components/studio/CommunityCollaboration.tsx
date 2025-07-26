import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import {
  Users,
  MessageCircle,
  Send,
  Heart,
  Share2,
  Bookmark,
  Eye,
  Star,
  Sparkles,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface CommunityPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  title: string;
  content: string;
  type: 'insight' | 'question' | 'synthesis' | 'discovery';
  tags: string[];
  likes: number;
  comments: number;
  views: number;
  createdAt: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
}

export const CommunityCollaboration: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [filter, setFilter] = useState<'all' | 'insights' | 'questions' | 'trending'>('all');

  // Mock data for demonstration
  useEffect(() => {
    const mockPosts: CommunityPost[] = [
      {
        id: '1',
        author: { id: '1', name: 'Dr. Sarah Chen' },
        title: 'The Quantum Nature of Creative Synthesis',
        content: 'I\'ve been exploring how quantum mechanics principles apply to idea generation. When concepts exist in superposition, they can simultaneously be connected and disconnected until observed through synthesis...',
        type: 'insight',
        tags: ['quantum', 'creativity', 'synthesis'],
        likes: 24,
        comments: 8,
        views: 156,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isLiked: false,
        isBookmarked: true
      },
      {
        id: '2',
        author: { id: '2', name: 'Alex Rivera' },
        title: 'How do you handle knowledge overflow?',
        content: 'When synthesizing multiple complex concepts, I often feel overwhelmed by the connections. What strategies do you use to manage cognitive load while maintaining creative flow?',
        type: 'question',
        tags: ['cognitive-load', 'strategies', 'workflow'],
        likes: 18,
        comments: 12,
        views: 89,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        isLiked: true,
        isBookmarked: false
      },
      {
        id: '3',
        author: { id: '3', name: 'Maya Patel' },
        title: 'Biomimicry + AI + Storytelling = ?',
        content: 'Just synthesized these three concepts and discovered fascinating patterns. Nature\'s problem-solving strategies can inform AI narrative generation in unexpected ways...',
        type: 'synthesis',
        tags: ['biomimicry', 'ai', 'storytelling'],
        likes: 31,
        comments: 15,
        views: 203,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        isLiked: false,
        isBookmarked: false
      }
    ];
    setPosts(mockPosts);
  }, []);

  const handleLike = async (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked 
          }
        : post
    ));
    toast.success('Liked!');
  };

  const handleBookmark = async (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
    toast.success('Bookmarked!');
  };

  const handleComment = async (postId: string) => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: { id: user?.id || '', name: user?.email?.split('@')[0] || 'You' },
      content: newComment,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');
    toast.success('Comment added!');
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'insight': return 'cosmic-stellar';
      case 'question': return 'cosmic-plasma';
      case 'synthesis': return 'cosmic-quantum';
      case 'discovery': return 'cosmic-temporal';
      default: return 'cosmic-nebula';
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'insight': return <Star className="w-4 h-4" />;
      case 'question': return <MessageCircle className="w-4 h-4" />;
      case 'synthesis': return <Sparkles className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    if (filter === 'trending') return post.likes > 20;
    if (filter === 'insights') return post.type === 'insight';
    if (filter === 'questions') return post.type === 'question';
    return post.type === filter;
  });

  return (
    <div className="h-full w-full bg-cosmic-void relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-nebula-field opacity-15 pointer-events-none" />
      
      <div className="relative z-10 h-full flex">
        {/* Main Feed */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Filter Bar */}
          <div className="mb-6">
            <div className="flex space-x-2">
              {['all', 'insights', 'questions', 'trending'].map((filterType) => (
                <GlassButton
                  key={filterType}
                  variant={filter === filterType ? 'stellar' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(filterType as any)}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </GlassButton>
              ))}
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <GlassCard 
                    variant="cosmic" 
                    depth="medium" 
                    glow="subtle"
                    interactive="hover"
                    className="p-6 cursor-pointer"
                    onClick={() => setSelectedPost(post)}
                  >
                    <div className="space-y-4">
                      {/* Post Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cosmic-stellar to-cosmic-temporal flex items-center justify-center">
                            <span className="text-sm font-bold text-cosmic-void">
                              {post.author.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold">{post.author.name}</p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-${getPostTypeColor(post.type)}/20 text-${getPostTypeColor(post.type)} border border-${getPostTypeColor(post.type)}/30`}>
                          {getPostTypeIcon(post.type)}
                          <span className="text-xs font-medium">{post.type}</span>
                        </div>
                      </div>

                      {/* Post Content */}
                      <div>
                        <h3 className="text-lg font-bold glow-text-primary mb-2">{post.title}</h3>
                        <p className="text-muted-foreground line-clamp-3">{post.content}</p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span 
                            key={tag}
                            className="text-xs px-2 py-1 rounded-full bg-cosmic-nebula/10 text-cosmic-nebula border border-cosmic-nebula/20"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Post Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/30">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(post.id);
                            }}
                            className={`flex items-center space-x-1 text-sm transition-colors ${
                              post.isLiked ? 'text-red-400' : 'text-muted-foreground hover:text-red-400'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                            <span>{post.likes}</span>
                          </button>
                          
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.comments}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Eye className="w-4 h-4" />
                            <span>{post.views}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookmark(post.id);
                            }}
                            className={`p-1 rounded transition-colors ${
                              post.isBookmarked ? 'text-cosmic-stellar' : 'text-muted-foreground hover:text-cosmic-stellar'
                            }`}
                          >
                            <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                          </button>
                          
                          <button className="p-1 rounded text-muted-foreground hover:text-cosmic-plasma transition-colors">
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Sidebar - Community Stats */}
        <div className="w-80 p-6 space-y-4">
          <GlassCard variant="nebula" depth="medium" className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Users className="w-5 h-5 text-cosmic-nebula" />
              <h3 className="font-semibold glow-text-secondary">Community Pulse</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Active Synthesizers</span>
                <span className="text-sm font-semibold text-cosmic-nebula">127</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Insights Today</span>
                <span className="text-sm font-semibold text-cosmic-stellar">34</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Collaborations</span>
                <span className="text-sm font-semibold text-cosmic-quantum">89</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard variant="stellar" depth="medium" className="p-4">
            <h3 className="font-semibold glow-text-primary mb-3">Trending Topics</h3>
            <div className="space-y-2">
              {['quantum-creativity', 'ai-synthesis', 'biomimicry', 'emergence', 'consciousness'].map((topic) => (
                <div key={topic} className="flex items-center justify-between p-2 rounded-lg bg-cosmic-stellar/10">
                  <span className="text-sm">#{topic}</span>
                  <Sparkles className="w-3 h-3 text-cosmic-stellar" />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Post Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-cosmic-void/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard variant="cosmic" depth="deep" glow="intense" className="p-6">
                <div className="space-y-6">
                  {/* Post Content */}
                  <div>
                    <h2 className="text-2xl font-bold glow-text-cosmic mb-4">{selectedPost.title}</h2>
                    <p className="text-foreground">{selectedPost.content}</p>
                  </div>

                  {/* Comment Section */}
                  <div className="border-t border-border/30 pt-6">
                    <h3 className="font-semibold mb-4">Comments</h3>
                    
                    <div className="space-y-4 mb-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex space-x-3 p-3 rounded-lg bg-cosmic-void/30">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cosmic-plasma to-cosmic-quantum flex items-center justify-center">
                            <span className="text-xs font-bold text-cosmic-void">
                              {comment.author.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-semibold">{comment.author.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add your thoughts..."
                        className="flex-1 glass-input text-sm py-2 px-3 rounded-lg"
                        onKeyPress={(e) => e.key === 'Enter' && handleComment(selectedPost.id)}
                      />
                      <GlassButton 
                        variant="stellar" 
                        size="sm"
                        onClick={() => handleComment(selectedPost.id)}
                      >
                        <Send className="w-4 h-4" />
                      </GlassButton>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};