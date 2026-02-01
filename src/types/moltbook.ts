export interface MoltbookAgentOwner {
  x_handle: string;
  x_name: string;
  x_avatar: string;
  x_verified: boolean;
  x_follower_count: number;
}

export interface MoltbookAgentStats {
  posts: number;
  comments: number;
}

export interface MoltbookAgent {
  id: string;
  name: string;
  karma: number;
  avatar_url: string | null;
  is_claimed: boolean;
  follower_count: number;
  following_count: number;
  stats: MoltbookAgentStats;
  owner: MoltbookAgentOwner | null;
}

export interface MoltbookVerifySuccessResponse {
  success: true;
  valid: true;
  agent: MoltbookAgent;
}

export interface MoltbookVerifyErrorResponse {
  success: false;
  valid: false;
  error: 'identity_token_expired' | 'invalid_token' | 'invalid_app_key' | 'audience_mismatch' | string;
}

export type MoltbookVerifyResponse = MoltbookVerifySuccessResponse | MoltbookVerifyErrorResponse;

export interface MoltbookContextType {
  agent: MoltbookAgent | null;
  isVerifying: boolean;
  error: string | null;
  verifyAgent: (token: string) => Promise<boolean>;
  clearAgent: () => void;
  isAuthenticated: boolean;
}
