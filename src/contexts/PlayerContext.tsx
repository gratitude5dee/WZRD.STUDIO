import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Track {
  id: string;
  title: string;
  artist: string;
  cover_path: string | null;
  audio_path: string;
  price: number;
  artist_wallet: string;
  duration?: number | null;
  album_id?: string | null;
  // Engagement fields (optional for backward compatibility)
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  views_count?: number;
}

export interface StreamSession {
  id: string;
  stream_id: string;
  track_id: string;
  expires_at: string;
  access_token: string;
}

interface PlayerContextType {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  activeSession: StreamSession | null;
  isLocked: boolean;
  setCurrentTrack: (track: Track | null) => void;
  setQueue: (tracks: Track[]) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  playTrack: (track: Track) => void;
  setActiveSession: (session: StreamSession | null) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [activeSession, setActiveSession] = useState<StreamSession | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    const audio = audioRef.current;

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });

    audio.addEventListener("ended", () => {
      nextTrack();
    });

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Check if track is locked (paid track without active session)
  const isLocked = currentTrack ? currentTrack.price > 0 && !activeSession : false;

  // Load and play audio when track changes
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    const audio = audioRef.current;

    // For locked tracks (paid without session), don't load audio
    if (currentTrack.price > 0 && !activeSession) {
      audio.pause();
      audio.src = "";
      setIsPlaying(false);
      return;
    }

    const loadAudio = async () => {
      try {
        let audioUrl: string;

        // For paid tracks with valid session, get signed URL via edge function
        if (currentTrack.price > 0 && activeSession) {
          console.log('[PlayerContext] Fetching signed URL for paid track');
          const { data, error } = await supabase.functions.invoke('get-stream', {
            body: {
              track_id: currentTrack.id,
              access_token: activeSession.access_token
            }
          });

          if (error || !data?.url) {
            console.error('[PlayerContext] Failed to get signed URL:', error, data);
            
            // Check for specific error codes
            if (data?.code === 'AUDIO_NOT_FOUND') {
              toast({
                title: "Audio not available",
                description: "This track's audio file is not yet uploaded.",
                variant: "destructive",
              });
            } else {
              toast({
                title: "Playback error",
                description: "Unable to load audio. Please try again.",
                variant: "destructive",
              });
            }
            
            setActiveSession(null);
            setIsPlaying(false);
            return;
          }

          audioUrl = data.url;
          console.log('[PlayerContext] Got signed URL, expires:', data.expires_at);
        } else {
          // For free tracks, use public URL
          audioUrl = `https://mttpdwowikfzcdpehlrd.supabase.co/storage/v1/object/public/audio/${currentTrack.audio_path}`;
        }

        audio.src = audioUrl;
        audio.load();

        if (isPlaying) {
          audio.play().catch(console.error);
        }
      } catch (err) {
        console.error('[PlayerContext] Error loading audio:', err);
      }
    };

    loadAudio();
  }, [currentTrack, activeSession]);

  // Handle play/pause state changes
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying && !isLocked && currentTrack) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, isLocked, currentTrack]);

  const play = useCallback(() => {
    if (!isLocked) {
      setIsPlaying(true);
    }
  }, [isLocked]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isLocked) return;
    setIsPlaying((prev) => !prev);
  }, [isLocked]);

  const nextTrack = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    setCurrentTrack(queue[nextIndex]);
    setActiveSession(null);
  }, [currentTrack, queue]);

  const prevTrack = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    setCurrentTrack(queue[prevIndex]);
    setActiveSession(null);
  }, [currentTrack, queue]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  }, []);

  const playTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    setActiveSession(null);
    if (track.price === 0) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        queue,
        isPlaying,
        currentTime,
        duration,
        volume,
        activeSession,
        isLocked,
        setCurrentTrack,
        setQueue,
        play,
        pause,
        togglePlay,
        nextTrack,
        prevTrack,
        seek,
        setVolume,
        playTrack,
        setActiveSession,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
