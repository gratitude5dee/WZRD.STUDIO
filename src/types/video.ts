export interface Video {
  id: string;
  title: string;
  artist: string;
  description?: string;
  thumbnail_path?: string;
  video_path: string;
  artist_wallet: string;
  price: number;
  duration?: number;
  is_livestream: boolean;
  created_at?: string;
}

export interface VideoSession {
  id: string;
  stream_id: string;
  video_id: string;
  access_token: string;
  expires_at: string;
}
