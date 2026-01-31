// Custom type for music tracks (maps to music_tracks table)
export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  cover_path: string | null;
  audio_path: string | null;
  price: number;
  artist_wallet: string | null;
  description: string | null;
  duration: number | null;
  album_id: string | null;
  created_at: string;
}

// Type alias for use in PlayerContext and components
export type Track = MusicTrack;
