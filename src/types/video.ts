// Custom type for music videos (maps to music_videos table)
export interface Video {
  id: string;
  title: string;
  artist: string;
  description: string | null;
  thumbnail_path: string | null;
  video_path: string;
  artist_wallet: string | null;
  price: number;
  duration: number | null;
  is_livestream: boolean;
  created_at: string;
}

export interface VideoSession {
  id: string;
  stream_id: string;
  video_id: string;
  access_token: string;
  expires_at: string;
}

// Type for music albums
export interface MusicAlbum {
  id: string;
  title: string;
  artist: string;
  cover_path: string | null;
  description: string | null;
  release_date: string | null;
  created_at: string;
}
