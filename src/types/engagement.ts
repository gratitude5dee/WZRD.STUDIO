// Unified engagement types for cross-content interaction

export type ContentType = 'track' | 'video' | 'article';

export interface EngagementCounts {
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
}

export interface ContentLike {
  id: string;
  content_type: ContentType;
  content_id: string;
  user_wallet: string;
  created_at: string;
}

export interface ContentBookmark {
  id: string;
  content_type: ContentType;
  content_id: string;
  user_wallet: string;
  created_at: string;
}

export interface ContentComment {
  id: string;
  content_type: ContentType;
  content_id: string;
  user_wallet: string;
  user_name: string | null;
  user_avatar: string | null;
  content: string;
  likes_count: number;
  parent_comment_id: string | null;
  created_at: string;
  replies?: ContentComment[];
}

// Helper type for components that need engagement data
export interface WithEngagement extends EngagementCounts {}
