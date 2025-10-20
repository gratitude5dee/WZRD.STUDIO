import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useVideoEditorStore, Clip, AudioTrack, MediaItem as StoreMediaItem } from '@/store/videoEditorStore';
import { supabase } from '@/integrations/supabase/client';
import { supabaseService } from '@/services/supabaseService';
import { toast } from "sonner";
import { useParams } from "react-router-dom";

const MIN_MEDIA_DURATION = 5;

const getValidNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && !Number.isNaN(value) ? value : undefined;

const resolveStartTime = (value?: number | null): number => getValidNumber(value) ?? 0;

const resolveDuration = (
  startTime: number,
  duration?: number | null,
  endTime?: number | null
): number => {
  const validDuration = getValidNumber(duration);
  if (typeof validDuration === 'number' && validDuration > 0) {
    return validDuration;
  }

  const validEndTime = getValidNumber(endTime);
  if (typeof validEndTime === 'number') {
    const computed = validEndTime - startTime;
    if (computed > 0) {
      return computed;
    }
  }

  return MIN_MEDIA_DURATION;
};

const resolveEndTime = (startTime: number, duration: number, endTime?: number | null): number => {
  const validEndTime = getValidNumber(endTime);
  if (typeof validEndTime === 'number' && validEndTime >= startTime) {
    return validEndTime;
  }

  return startTime + duration;
};

const resolveVolume = (value?: number | null): number => {
  const validVolume = getValidNumber(value);
  if (typeof validVolume === 'number') {
    return Math.min(1, Math.max(0, validVolume));
  }

  return 1;
};

const normalizeClip = (clip: Clip): Clip => {
  const startTime = resolveStartTime(clip.startTime);
  const duration = resolveDuration(startTime, clip.duration, clip.endTime);
  const endTime = resolveEndTime(startTime, duration, clip.endTime);

  return {
    ...clip,
    startTime,
    duration,
    endTime,
    layer: typeof clip.layer === 'number' ? clip.layer : 0,
    transforms:
      clip.transforms ?? {
        position: { x: 0, y: 0 },
        scale: { x: 1, y: 1 },
        rotation: 0,
        opacity: 1,
      },
  };
};

const normalizeAudioTrack = (track: AudioTrack): AudioTrack => {
  const startTime = resolveStartTime(track.startTime);
  const duration = resolveDuration(startTime, track.duration, track.endTime);
  const endTime = resolveEndTime(startTime, duration, track.endTime);

  return {
    ...track,
    startTime,
    duration,
    endTime,
    volume: resolveVolume(track.volume),
    isMuted: typeof track.isMuted === 'boolean' ? track.isMuted : false,
  };
};

const isAudioItem = (item: StoreMediaItem): item is AudioTrack => item.type === 'audio';
const isClipItem = (item: StoreMediaItem): item is Clip => item.type === 'video' || item.type === 'image';

const clearMediaState = () => {
  useVideoEditorStore.setState((state) => ({
    ...state,
    clips: [],
    audioTracks: [],
    selectedClipIds: [],
    selectedAudioTrackIds: [],
  }));
};

// Create context with a more complete type definition
type VideoEditorContextType = {
  isLoading: boolean;
  // We could include more shared state or methods here as needed
};

// Create context with proper typing
const VideoEditorContext = createContext<VideoEditorContextType | null>(null);

// Provider component
export function VideoEditorProvider({ children }: { children: ReactNode }) {
  const {
    project,
    setProjectId,
    setProjectName,
    reset,
  } = useVideoEditorStore();
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();

  // Load project data if we have a project ID (either from params or stored)
  useEffect(() => {
    const loadProjectData = async () => {
      const urlProjectId = params.projectId;

      if (urlProjectId && urlProjectId !== project.id) {
        setProjectId(urlProjectId);
        return;
      }

      const activeProjectId = project.id ?? urlProjectId;

      if (!activeProjectId) {
        clearMediaState();
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      clearMediaState();

      try {
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', activeProjectId)
          .single();

        if (projectError) throw projectError;

        if (projectData) {
          setProjectName(projectData.title);

          const mediaItems = await supabaseService.media.listByProject(activeProjectId);
          const clips = mediaItems.filter(isClipItem).map(normalizeClip);
          const audioTracks = mediaItems.filter(isAudioItem).map(normalizeAudioTrack);

          useVideoEditorStore.setState((state) => ({
            ...state,
            clips,
            audioTracks,
            selectedClipIds: [],
            selectedAudioTrackIds: [],
          }));
        }
      } catch (error) {
        console.error('Error loading project data:', error);
        toast.error('Failed to load project data');
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectData();
  }, [params.projectId, project.id, setProjectId, setProjectName]);
  
  // Clean up when unmounting
  useEffect(() => {
    return () => {
      // Reset the store when the provider is unmounted
      reset();
    };
  }, []);

  // Create context value with proper shape
  const contextValue = {
    isLoading,
    // We can add more shared state or methods here as needed
  };

  return (
    <VideoEditorContext.Provider value={contextValue}>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        children
      )}
    </VideoEditorContext.Provider>
  );
}

// Hook to use the context state (not the store directly)
export function useVideoEditorContext() {
  const context = useContext(VideoEditorContext);
  if (context === null) {
    throw new Error('useVideoEditorContext must be used within a VideoEditorProvider');
  }
  return context;
}

// Hook to use the store (keep this for compatibility with existing components)
export function useVideoEditor() {
  // Ensure we're within the provider
  useContext(VideoEditorContext);
  return useVideoEditorStore();
}

// Export the raw store too for integration with external state if needed
export { useVideoEditorStore };
