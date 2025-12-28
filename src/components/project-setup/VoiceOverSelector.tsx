import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Check, Loader2, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Voice {
  voice_id: string;
  name: string;
  preview_url: string;
  category: string;
  labels: {
    accent?: string;
    age?: string;
    gender?: string;
    description?: string;
    use_case?: string;
  };
}

interface VoiceOverSelectorProps {
  selectedVoiceId?: string;
  selectedVoiceName?: string;
  onVoiceSelect: (voiceId: string, voiceName: string, previewUrl: string) => void;
}

export const VoiceOverSelector: React.FC<VoiceOverSelectorProps> = ({
  selectedVoiceId,
  selectedVoiceName,
  onVoiceSelect,
}) => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchVoices = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('elevenlabs-voices', {
          body: { action: 'list' },
        });

        if (error) throw error;

        if (data?.voices) {
          setVoices(data.voices);
        }
      } catch (error: any) {
        console.error('Failed to fetch voices:', error);
        toast.error('Failed to load voices');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVoices();
  }, []);

  const handlePlayPreview = (voice: Voice) => {
    if (playingVoiceId === voice.voice_id) {
      audioRef.current?.pause();
      setPlayingVoiceId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(voice.preview_url);
      audio.onended = () => setPlayingVoiceId(null);
      audio.play();
      audioRef.current = audio;
      setPlayingVoiceId(voice.voice_id);
    }
  };

  const handleSelectVoice = (voice: Voice) => {
    onVoiceSelect(voice.voice_id, voice.name, voice.preview_url);
    toast.success(`Selected voice: ${voice.name}`);
  };

  const filteredVoices = voices.filter((voice) => {
    const matchesSearch = voice.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = !filterGender || voice.labels.gender === filterGender;
    return matchesSearch && matchesGender;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-zinc-400 uppercase tracking-wide flex items-center gap-2">
          <Mic className="w-4 h-4" />
          VoiceOver Selection
        </Label>
        {selectedVoiceName && (
          <span className="text-sm text-primary">Selected: {selectedVoiceName}</span>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search voices..."
          className="flex-1 bg-[#111319] border-zinc-700"
        />
        <div className="flex gap-1">
          {['male', 'female'].map((gender) => (
            <Button
              key={gender}
              variant={filterGender === gender ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterGender(filterGender === gender ? null : gender)}
              className="capitalize"
            >
              {gender}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1">
          {filteredVoices.map((voice) => {
            const isSelected = selectedVoiceId === voice.voice_id;
            const isPlaying = playingVoiceId === voice.voice_id;

            return (
              <motion.div
                key={voice.voice_id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card
                  className={cn(
                    'relative p-3 cursor-pointer transition-all duration-200',
                    'bg-[#18191E] border-zinc-700 hover:border-zinc-600',
                    isSelected && 'border-primary ring-2 ring-primary/20'
                  )}
                  onClick={() => handleSelectVoice(voice)}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayPreview(voice);
                      }}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-white truncate">{voice.name}</p>
                      <p className="text-xs text-zinc-500 truncate">
                        {voice.labels.accent || voice.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {voice.labels.gender && (
                      <span className="text-xs px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">
                        {voice.labels.gender}
                      </span>
                    )}
                    {voice.labels.age && (
                      <span className="text-xs px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">
                        {voice.labels.age}
                      </span>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
