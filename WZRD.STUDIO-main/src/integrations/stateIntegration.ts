
import { useVideoEditorStore } from '@/store/videoEditorStore';
import { useEffect } from 'react';

export function createVideoEditorSelectors() {
  return {
    selectProjectId: () => useVideoEditorStore.getState().project.id,
    selectProjectName: () => useVideoEditorStore.getState().project.name,
    selectPlayback: () => useVideoEditorStore.getState().playback,
    selectProjectMetadata: () => useVideoEditorStore.getState().project,
    selectClips: () => useVideoEditorStore.getState().clips,
    selectAudioTracks: () => useVideoEditorStore.getState().audioTracks,
    selectTimeline: () => useVideoEditorStore.getState().timeline,
    selectAIGeneration: () => useVideoEditorStore.getState().aiGeneration,
  };
}

export function useSyncVideoEditorState(options: {
  projectId?: string | null;
  projectName?: string;
  onClipsChange?: (clips: any[]) => void;
  onAudioTracksChange?: (tracks: any[]) => void;
}) {
  const {
    projectId: externalProjectId,
    projectName: externalProjectName,
    onClipsChange,
    onAudioTracksChange,
  } = options;

  const videoEditorStore = useVideoEditorStore();

  useEffect(() => {
    if (externalProjectId !== undefined && externalProjectId !== videoEditorStore.project.id) {
      videoEditorStore.setProjectId(externalProjectId);
    }
  }, [externalProjectId, videoEditorStore]);

  useEffect(() => {
    if (externalProjectName && externalProjectName !== videoEditorStore.project.name) {
      videoEditorStore.setProjectName(externalProjectName);
    }
  }, [externalProjectName, videoEditorStore]);

  useEffect(() => {
    if (onClipsChange) {
      const unsubscribe = useVideoEditorStore.subscribe((state) => {
        onClipsChange(state.clips);
      });
      return unsubscribe;
    }
  }, [onClipsChange]);

  useEffect(() => {
    if (onAudioTracksChange) {
      const unsubscribe = useVideoEditorStore.subscribe((state) => {
        onAudioTracksChange(state.audioTracks);
      });
      return unsubscribe;
    }
  }, [onAudioTracksChange]);
}

export function getVideoEditorActions() {
  return {
    setProjectId: (id: string | null) => useVideoEditorStore.getState().setProjectId(id),
    setProjectName: (name: string) => useVideoEditorStore.getState().setProjectName(name),
    addClip: (clip: any) => useVideoEditorStore.getState().addClip(clip),
    addAudioTrack: (track: any) => useVideoEditorStore.getState().addAudioTrack(track),
    play: () => useVideoEditorStore.getState().play(),
    pause: () => useVideoEditorStore.getState().pause(),
    setTimelineZoom: (zoom: number) => useVideoEditorStore.getState().setTimelineZoom(zoom),
    scrollTimelineBy: (delta: number) => useVideoEditorStore.getState().scrollTimelineBy(delta),
  };
}
