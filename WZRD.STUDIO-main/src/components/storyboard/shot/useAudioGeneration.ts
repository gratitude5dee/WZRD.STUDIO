
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AudioStatus } from '@/types/storyboardTypes';

interface UseAudioGenerationProps {
  shotId: string;
  isGeneratingRef: React.MutableRefObject<boolean>;
  setIsGeneratingAudio: (isGenerating: boolean) => void;
  setLocalAudioUrl: (url: string | null) => void;
  setLocalAudioStatus: (status: AudioStatus) => void;
}

export const useAudioGeneration = ({
  shotId,
  isGeneratingRef,
  setIsGeneratingAudio,
  setLocalAudioUrl,
  setLocalAudioStatus
}: UseAudioGenerationProps) => {

  const handleGenerateAudio = async () => {
    if (isGeneratingRef.current) {
      toast.info("Already working on this shot");
      return;
    }

    try {
      // Set UI state
      setIsGeneratingAudio(true);
      isGeneratingRef.current = true;
      setLocalAudioStatus('generating');
      
      // Call our edge function to generate the audio
      const { data, error } = await supabase.functions.invoke('generate-shot-audio', {
        body: { shot_id: shotId }
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to generate audio');
      }
      
      toast.success('Audio generation started');
      
      // If the audio was retrieved from cache, we can update the UI immediately
      if (data?.audio_url) {
        setLocalAudioUrl(data.audio_url);
        setLocalAudioStatus('completed');
      }
      
    } catch (error: any) {
      console.error('Error generating audio:', error);
      toast.error(`Failed to generate audio: ${error.message}`);
      setLocalAudioStatus('failed');
      setLocalAudioUrl(null);
    } finally {
      // We don't reset isGeneratingAudio here since we want to keep showing the loading
      // state until the realtime subscription updates the status
      isGeneratingRef.current = false;
    }
  };

  return { handleGenerateAudio };
};
