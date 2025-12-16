
import { useState, useRef, useEffect } from 'react';
import { ShotDetails, ImageStatus, AudioStatus } from '@/types/storyboardTypes';
import { useDebounce } from '@/hooks/use-debounce';
import { supabase } from '@/integrations/supabase/client';

export const useShotCardState = (shot: ShotDetails, onUpdate: (updates: Partial<ShotDetails>) => Promise<void>) => {
  // Local state for form values
  const [shotType, setShotType] = useState(shot.shot_type || null);
  const [promptIdea, setPromptIdea] = useState(shot.prompt_idea || null);
  const [dialogue, setDialogue] = useState(shot.dialogue || null);
  const [soundEffects, setSoundEffects] = useState(shot.sound_effects || null);
  const [localVisualPrompt, setLocalVisualPrompt] = useState(shot.visual_prompt || '');
  const [localImageUrl, setLocalImageUrl] = useState(shot.image_url || null);
  const [localImageStatus, setLocalImageStatus] = useState<ImageStatus>(shot.image_status || 'pending');
  const [localImageProgress, setLocalImageProgress] = useState<number>((shot as any).image_progress || 0);
  const [localAudioUrl, setLocalAudioUrl] = useState(shot.audio_url || null);
  const [localAudioStatus, setLocalAudioStatus] = useState<AudioStatus>(shot.audio_status || 'pending');
  const [localVideoUrl, setLocalVideoUrl] = useState(shot.video_url || null);
  const [localVideoStatus, setLocalVideoStatus] = useState(shot.video_status || 'pending');
  
  // UI state
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(shot.image_status === 'generating');
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(shot.audio_status === 'generating');
  const isGeneratingRef = useRef<boolean>(false);

  // Update local state when props change (e.g., initial load)
  useEffect(() => {
    setShotType(shot.shot_type || null);
    setPromptIdea(shot.prompt_idea || null);
    setDialogue(shot.dialogue || null);
    setSoundEffects(shot.sound_effects || null);
    setLocalVisualPrompt(shot.visual_prompt || '');
    setLocalImageUrl(shot.image_url || null);
    setLocalImageStatus(shot.image_status || 'pending');
    setLocalImageProgress((shot as any).image_progress || 0);
    setLocalAudioUrl(shot.audio_url || null);
    setLocalAudioStatus(shot.audio_status || 'pending');
    setLocalVideoUrl(shot.video_url || null);
    setLocalVideoStatus(shot.video_status || 'pending');
    setIsGeneratingImage(shot.image_status === 'generating');
    setIsGeneratingAudio(shot.audio_status === 'generating');
  }, [shot.id, shot.shot_type, shot.prompt_idea, shot.dialogue, shot.sound_effects, 
      shot.visual_prompt, shot.image_url, shot.image_status, shot.audio_url, shot.audio_status, 
      shot.video_url, shot.video_status, (shot as any).image_progress]);

  // Set up realtime subscription to receive updates for this shot
  useEffect(() => {
    // Skip if no shot id
    if (!shot.id) return;
    
    console.log(`Setting up realtime subscription for shot: ${shot.id}`);
    
    const subscription = supabase
      .channel(`shots:${shot.id}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'shots',
          filter: `id=eq.${shot.id}`
        }, 
        (payload) => {
          console.log(`Received realtime update for shot ${shot.id}:`, payload);
          const updatedShot = payload.new as any;
          
          // Only update specific fields to avoid overwriting user's input
          if (updatedShot.visual_prompt && updatedShot.visual_prompt !== localVisualPrompt) {
            setLocalVisualPrompt(updatedShot.visual_prompt);
          }
          
          if (updatedShot.image_url && updatedShot.image_url !== localImageUrl) {
            setLocalImageUrl(updatedShot.image_url);
          }
          
          if (updatedShot.image_status && updatedShot.image_status !== localImageStatus) {
            setLocalImageStatus(updatedShot.image_status as ImageStatus);
            setIsGeneratingImage(updatedShot.image_status === 'generating');
          }
          
          // Handle image progress updates
          if (updatedShot.image_progress !== undefined && updatedShot.image_progress !== localImageProgress) {
            setLocalImageProgress(updatedShot.image_progress);
          }

          // Handle audio updates
          if (updatedShot.audio_url && updatedShot.audio_url !== localAudioUrl) {
            setLocalAudioUrl(updatedShot.audio_url);
          }
          
          if (updatedShot.audio_status && updatedShot.audio_status !== localAudioStatus) {
            setLocalAudioStatus(updatedShot.audio_status as AudioStatus);
            setIsGeneratingAudio(updatedShot.audio_status === 'generating');
          }
          
          // Handle video updates
          if (updatedShot.video_url && updatedShot.video_url !== localVideoUrl) {
            setLocalVideoUrl(updatedShot.video_url);
          }
          
          if (updatedShot.video_status && updatedShot.video_status !== localVideoStatus) {
            setLocalVideoStatus(updatedShot.video_status);
          }
        })
      .subscribe();
      
    // Clean up subscription on unmount
    return () => {
      console.log(`Removing realtime subscription for shot: ${shot.id}`);
      supabase.removeChannel(subscription);
    };
  }, [shot.id]);

  // Use debounce for field updates to reduce API calls
  const debouncedShotType = useDebounce(shotType, 1000);
  const debouncedPromptIdea = useDebounce(promptIdea, 1000);
  const debouncedDialogue = useDebounce(dialogue, 1000);
  const debouncedSoundEffects = useDebounce(soundEffects, 1000);

  // Handle debounced updates
  useEffect(() => {
    if (debouncedShotType !== shot.shot_type && debouncedShotType !== null) {
      handleFieldUpdate({ shot_type: debouncedShotType });
    }
  }, [debouncedShotType]);

  useEffect(() => {
    if (debouncedPromptIdea !== shot.prompt_idea) {
      handleFieldUpdate({ prompt_idea: debouncedPromptIdea });
    }
  }, [debouncedPromptIdea]);

  useEffect(() => {
    if (debouncedDialogue !== shot.dialogue) {
      handleFieldUpdate({ dialogue: debouncedDialogue });
    }
  }, [debouncedDialogue]);

  useEffect(() => {
    if (debouncedSoundEffects !== shot.sound_effects) {
      handleFieldUpdate({ sound_effects: debouncedSoundEffects });
    }
  }, [debouncedSoundEffects]);

  // Helper to update shot fields
  const handleFieldUpdate = async (updates: Partial<ShotDetails>) => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      await onUpdate(updates);
    } catch (error) {
      console.error('Error updating shot:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Shot type change handler (with immediate update)
  const handleShotTypeChange = (value: string) => {
    setShotType(value);
    handleFieldUpdate({ shot_type: value });
  };

  return {
    // State
    shotType,
    promptIdea,
    dialogue,
    soundEffects,
    localVisualPrompt,
    localImageUrl,
    localImageStatus,
    localImageProgress,
    localAudioUrl,
    localAudioStatus,
    localVideoUrl,
    localVideoStatus,
    isDeleting,
    isSaving,
    isGeneratingPrompt,
    isGeneratingImage,
    isGeneratingAudio,
    isGeneratingRef,
    
    // Setters
    setShotType,
    setPromptIdea,
    setDialogue,
    setSoundEffects,
    setLocalVisualPrompt,
    setLocalImageStatus,
    setLocalImageProgress,
    setLocalAudioUrl,
    setLocalAudioStatus,
    setLocalVideoUrl,
    setLocalVideoStatus,
    setIsDeleting,
    setIsGeneratingPrompt,
    setIsGeneratingImage,
    setIsGeneratingAudio,
    
    // Handlers
    handleShotTypeChange
  };
};
