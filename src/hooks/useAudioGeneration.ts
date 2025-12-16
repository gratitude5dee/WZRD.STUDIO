import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export type AudioType = 'tts' | 'sfx' | 'music';

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
}

export const VOICE_OPTIONS: VoiceOption[] = [
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', description: 'Professional male' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Warm female' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', description: 'Friendly female' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', description: 'Casual male' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', description: 'Deep male' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', description: 'Soft female' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', description: 'Young female' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', description: 'Authoritative male' },
];

interface AudioGenerationResult {
  audioUrl: string;
  duration?: number;
}

export function useAudioGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioType, setAudioType] = useState<AudioType>('tts');
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generateTTS = useCallback(async (
    text: string,
    voiceId?: string
  ): Promise<AudioGenerationResult | null> => {
    if (!text.trim()) {
      toast.error('Please enter text to convert to speech');
      return null;
    }

    setIsGenerating(true);
    setAudioType('tts');

    try {
      const response = await fetch(
        `https://ixkkrousepsiorwlaycp.supabase.co/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4a2tyb3VzZXBzaW9yd2xheWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzI1MjcsImV4cCI6MjA1NTkwODUyN30.eX_P7bJam2IZ20GEghfjfr-pNwMynsdVb3Rrfipgls4',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4a2tyb3VzZXBzaW9yd2xheWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzI1MjcsImV4cCI6MjA1NTkwODUyN30.eX_P7bJam2IZ20GEghfjfr-pNwMynsdVb3Rrfipgls4`,
          },
          body: JSON.stringify({ text, voiceId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'TTS generation failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setCurrentAudioUrl(audioUrl);

      toast.success('Voice generated successfully!');
      return { audioUrl };
    } catch (error: any) {
      toast.error(`TTS failed: ${error.message}`);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateSFX = useCallback(async (
    prompt: string,
    duration?: number
  ): Promise<AudioGenerationResult | null> => {
    if (!prompt.trim()) {
      toast.error('Please enter a description for the sound effect');
      return null;
    }

    setIsGenerating(true);
    setAudioType('sfx');

    try {
      const response = await fetch(
        `https://ixkkrousepsiorwlaycp.supabase.co/functions/v1/elevenlabs-sfx`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4a2tyb3VzZXBzaW9yd2xheWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzI1MjcsImV4cCI6MjA1NTkwODUyN30.eX_P7bJam2IZ20GEghfjfr-pNwMynsdVb3Rrfipgls4',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4a2tyb3VzZXBzaW9yd2xheWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzI1MjcsImV4cCI6MjA1NTkwODUyN30.eX_P7bJam2IZ20GEghfjfr-pNwMynsdVb3Rrfipgls4`,
          },
          body: JSON.stringify({ prompt, duration }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'SFX generation failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setCurrentAudioUrl(audioUrl);

      toast.success('Sound effect generated successfully!');
      return { audioUrl, duration };
    } catch (error: any) {
      toast.error(`SFX failed: ${error.message}`);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateMusic = useCallback(async (
    prompt: string,
    duration?: number
  ): Promise<AudioGenerationResult | null> => {
    if (!prompt.trim()) {
      toast.error('Please enter a description for the music');
      return null;
    }

    setIsGenerating(true);
    setAudioType('music');

    try {
      const response = await fetch(
        `https://ixkkrousepsiorwlaycp.supabase.co/functions/v1/elevenlabs-music`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4a2tyb3VzZXBzaW9yd2xheWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzI1MjcsImV4cCI6MjA1NTkwODUyN30.eX_P7bJam2IZ20GEghfjfr-pNwMynsdVb3Rrfipgls4',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4a2tyb3VzZXBzaW9yd2xheWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzI1MjcsImV4cCI6MjA1NTkwODUyN30.eX_P7bJam2IZ20GEghfjfr-pNwMynsdVb3Rrfipgls4`,
          },
          body: JSON.stringify({ prompt, duration }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Music generation failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setCurrentAudioUrl(audioUrl);

      toast.success('Music generated successfully!');
      return { audioUrl, duration };
    } catch (error: any) {
      toast.error(`Music failed: ${error.message}`);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const playAudio = useCallback((url?: string) => {
    const audioUrl = url || currentAudioUrl;
    if (!audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    audioRef.current = new Audio(audioUrl);
    audioRef.current.play();
  }, [currentAudioUrl]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const downloadAudio = useCallback((url?: string, filename?: string) => {
    const audioUrl = url || currentAudioUrl;
    if (!audioUrl) return;

    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = filename || `audio-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [currentAudioUrl]);

  return {
    isGenerating,
    audioType,
    currentAudioUrl,
    generateTTS,
    generateSFX,
    generateMusic,
    playAudio,
    stopAudio,
    downloadAudio,
  };
}
