import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, Music, Play, Pause, Upload, Sparkles, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AudioTrack {
  id: string;
  url: string;
  name: string;
  duration: number;
  artist?: string;
}

interface MusicLibraryTabProps {
  onSelectTrack: (track: AudioTrack) => void;
}

export const MusicLibraryTab: React.FC<MusicLibraryTabProps> = ({ onSelectTrack }) => {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadTracks();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const loadTracks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('audio_tracks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTracks(
        data?.map((item) => ({
          id: item.id,
          url: item.storage_path ? `${supabase.storage.from(item.storage_bucket).getPublicUrl(item.storage_path).data.publicUrl}` : '',
          name: item.name || 'Untitled Track',
          duration: item.duration_ms || 0,
          artist: (item.metadata as { artist?: string })?.artist,
        })) || []
      );
    } catch (error) {
      console.error('Failed to load tracks:', error);
      // Set empty array on error to allow the UI to render
      setTracks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = useCallback((track: AudioTrack) => {
    if (playingId === track.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(track.url);
      audio.onended = () => setPlayingId(null);
      audio.play();
      audioRef.current = audio;
      setPlayingId(track.id);
    }
  }, [playingId]);

  const handleUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { error: uploadError } = await supabase.storage
          .from('user-uploads')
          .upload(`audio/${fileName}`, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from('user-uploads').getPublicUrl(`audio/${fileName}`);

        // Get audio duration
        const audio = new Audio(publicUrl);
        await new Promise((resolve) => {
          audio.onloadedmetadata = resolve;
        });

        const newTrack: AudioTrack = {
          id: `audio-${Date.now()}`,
          url: publicUrl,
          name: file.name,
          duration: audio.duration * 1000,
        };

        // Try to save track info to local state only (audio_tracks table requires project_id)
        // The track is already uploaded to storage, so we can use it from there
        setTracks((prev) => [newTrack, ...prev]);
        toast.success('Audio uploaded!');
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload audio');
      }
    };
    input.click();
  }, []);

  const handleGenerateMusic = useCallback(async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-music', {
        body: {
          prompt: 'Create an upbeat, energetic background music track',
          duration: 30,
        },
      });

      if (error) throw error;

      if (data?.audio_url) {
        const newTrack: AudioTrack = {
          id: `generated-${Date.now()}`,
          url: data.audio_url,
          name: 'AI Generated Music',
          duration: 30000,
        };
        setTracks((prev) => [newTrack, ...prev]);
        toast.success('Music generated!');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate music');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-zinc-800 space-y-2">
        <Button onClick={handleUpload} className="w-full" variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Upload Audio
        </Button>
        <Button
          onClick={handleGenerateMusic}
          className="w-full"
          variant="secondary"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          Generate with AI
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tracks.length === 0 ? (
          <div className="text-center text-zinc-500 py-8">
            <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No audio tracks yet</p>
            <p className="text-sm">Upload or generate music</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center gap-3 p-3 hover:bg-zinc-800/50 cursor-pointer transition-colors"
                onClick={() => onSelectTrack(track)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlay(track);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-700 hover:bg-zinc-600 transition-colors"
                >
                  {playingId === track.id ? (
                    <Pause className="w-4 h-4 text-white" />
                  ) : (
                    <Play className="w-4 h-4 text-white" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{track.name}</p>
                  <p className="text-xs text-zinc-400">{formatDuration(track.duration)}</p>
                </div>
                <Volume2 className="w-4 h-4 text-zinc-500" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

MusicLibraryTab.displayName = 'MusicLibraryTab';
