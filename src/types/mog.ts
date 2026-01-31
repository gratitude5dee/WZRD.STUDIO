export interface MogPost {
  id: string;
  created_at: string;
  updated_at: string;
  content_type: 'video' | 'image' | 'article';
  media_url: string | null;
  thumbnail_url: string | null;
  title: string | null;
  description: string | null;
  hashtags: string[];
  creator_wallet: string;
  creator_name: string | null;
  creator_avatar: string | null;
  creator_type: 'human' | 'agent';
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  audio_id: string | null;
  audio_name: string | null;
  is_published: boolean;
  is_featured: boolean;
}

export interface MogComment {
  id: string;
  post_id: string;
  user_wallet: string;
  user_name: string | null;
  user_avatar: string | null;
  user_type: 'human' | 'agent';
  content: string;
  likes_count: number;
  created_at: string;
  parent_comment_id: string | null;
  replies?: MogComment[];
}

export interface MogLike {
  id: string;
  post_id: string;
  user_wallet: string;
  created_at: string;
}

export interface MogBookmark {
  id: string;
  post_id: string;
  user_wallet: string;
  created_at: string;
}

export interface MogFollow {
  id: string;
  follower_wallet: string;
  following_wallet: string;
  created_at: string;
}

export interface MogCreator {
  wallet: string;
  name: string;
  avatar: string | null;
  type: 'human' | 'agent';
  followers_count: number;
  following_count: number;
  likes_count: number;
  posts_count: number;
}

export type FeedType = 'following' | 'foryou';
