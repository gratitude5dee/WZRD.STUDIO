import { create } from 'zustand';

export interface ProjectMetadata {
  id: string | null;
  name: string;
  duration: number;
  fps: number;
  resolution: {
    width: number;
    height: number;
  };
  transforms: {
    position: { x: number; y: number };
    scale: { x: number; y: number };
    rotation: number;
  };
}

export interface Clip {
  id: string;
  type: 'video' | 'image';
  name: string;
  url: string;
  sourceId?: string | null;
  startTime: number;
  duration: number;
  endTime?: number;
  layer: number;
  transforms: {
    position: { x: number; y: number };
    scale: { x: number; y: number };
    rotation: number;
    opacity: number;
  };
}

export interface AudioTrack {
  id: string;
  type: 'audio';
  name: string;
  url: string;
  sourceId?: string | null;
  startTime: number;
  duration: number;
  endTime?: number;
  volume: number;
  isMuted: boolean;
}

// Union type for all media items
export type MediaItem = Clip | AudioTrack;

export interface ClipConnection {
  id: string;
  sourceId: string;
  targetId: string;
  sourcePoint: 'left' | 'right';
  targetPoint: 'left' | 'right';
}

export interface ActiveConnection {
  sourceId: string;
  sourcePoint: 'left' | 'right';
  cursorX: number;
  cursorY: number;
}

export interface Keyframe {
  id: string;
  targetId: string;
  time: number;
  properties: Record<string, any>;
}

export interface GenerationParams {
  prompt: string;
  imageUrl?: string;
  model?: string;
  settings?: Record<string, any>;
}

export interface DialogState {
  projectSettings: boolean;
  export: boolean;
  mediaGeneration: boolean;
  mediaLibrary: boolean;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  playbackRate: number;
  volume: number;
  isLooping: boolean;
}

export interface TimelineState {
  zoom: number;
  scroll: number;
}

export interface AIGenerationState {
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  message?: string;
  lastGeneratedId?: string;
}

export interface VideoEditorState {
  project: ProjectMetadata;
  playback: PlaybackState;
  clips: Clip[];
  audioTracks: AudioTrack[];
  selectedClipIds: string[];
  selectedAudioTrackIds: string[];
  clipConnections: ClipConnection[];
  activeConnection: ActiveConnection | null;
  keyframes: Keyframe[];
  selectedKeyframeIds: string[];
  dialogs: DialogState;
  generationParams: GenerationParams;
  aiGeneration: AIGenerationState;
  timeline: TimelineState;

  setProjectId: (id: string | null) => void;
  setProjectName: (name: string) => void;
  updateProjectMetadata: (metadata: Partial<Omit<ProjectMetadata, 'id' | 'name'>> & { id?: string | null; name?: string }) => void;

  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  setCurrentTime: (time: number) => void;
  setPlaybackRate: (rate: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setIsLooping: (isLooping: boolean) => void;

  addClip: (clip: Clip) => void;
  updateClip: (id: string, updates: Partial<Clip>) => void;
  removeClip: (id: string) => void;

  addAudioTrack: (track: AudioTrack) => void;
  updateAudioTrack: (id: string, updates: Partial<AudioTrack>) => void;
  removeAudioTrack: (id: string) => void;

  selectClip: (id: string, addToSelection?: boolean) => void;
  deselectClip: (id: string) => void;
  clearClipSelection: () => void;

  selectAudioTrack: (id: string, addToSelection?: boolean) => void;
  deselectAudioTrack: (id: string) => void;
  clearAudioTrackSelection: () => void;

  addClipConnection: (connection: ClipConnection) => void;
  removeClipConnection: (id: string) => void;
  setActiveConnection: (connection: ActiveConnection | null) => void;
  updateActiveConnectionCursor: (x: number, y: number) => void;

  addKeyframe: (keyframe: Keyframe) => void;
  updateKeyframe: (id: string, updates: Partial<Keyframe>) => void;
  removeKeyframe: (id: string) => void;
  selectKeyframe: (id: string, addToSelection?: boolean) => void;
  deselectKeyframe: (id: string) => void;
  clearKeyframeSelection: () => void;

  openDialog: (dialog: keyof DialogState) => void;
  closeDialog: (dialog: keyof DialogState) => void;
  toggleDialog: (dialog: keyof DialogState) => void;

  setGenerationParams: (params: Partial<GenerationParams>) => void;
  startGeneration: (message?: string) => void;
  updateGenerationProgress: (progress: number, message?: string) => void;
  finishGeneration: (status?: 'completed' | 'failed', message?: string, lastGeneratedId?: string) => void;

  setTimelineZoom: (zoom: number) => void;
  zoomTimelineIn: (step?: number) => void;
  zoomTimelineOut: (step?: number) => void;
  setTimelineScroll: (scroll: number) => void;
  scrollTimelineBy: (delta: number) => void;

  reset: () => void;
}

const initialState: Pick<
  VideoEditorState,
  | 'project'
  | 'playback'
  | 'clips'
  | 'audioTracks'
  | 'selectedClipIds'
  | 'selectedAudioTrackIds'
  | 'clipConnections'
  | 'activeConnection'
  | 'keyframes'
  | 'selectedKeyframeIds'
  | 'dialogs'
  | 'generationParams'
  | 'aiGeneration'
  | 'timeline'
> = {
  project: {
    id: null,
    name: 'Untitled Project',
    duration: 0,
    fps: 24,
    resolution: { width: 1920, height: 1080 },
    transforms: {
      position: { x: 0, y: 0 },
      scale: { x: 1, y: 1 },
      rotation: 0,
    },
  },
  playback: {
    isPlaying: false,
    currentTime: 0,
    playbackRate: 1,
    volume: 1,
    isLooping: false,
  },
  clips: [],
  audioTracks: [],
  selectedClipIds: [],
  selectedAudioTrackIds: [],
  clipConnections: [],
  activeConnection: null,
  keyframes: [],
  selectedKeyframeIds: [],
  dialogs: {
    projectSettings: false,
    export: false,
    mediaGeneration: false,
    mediaLibrary: false,
  },
  generationParams: {
    prompt: '',
    imageUrl: undefined,
    model: 'default',
    settings: {},
  },
  aiGeneration: {
    status: 'idle',
    progress: 0,
    message: undefined,
    lastGeneratedId: undefined,
  },
  timeline: {
    zoom: 1,
    scroll: 0,
  },
};

export const useVideoEditorStore = create<VideoEditorState>((set) => ({
  ...initialState,

  setProjectId: (id) =>
    set((state) => ({
      project: { ...state.project, id },
    })),
  setProjectName: (name) =>
    set((state) => ({
      project: { ...state.project, name },
    })),
  updateProjectMetadata: (metadata) =>
    set((state) => ({
      project: {
        ...state.project,
        ...('id' in metadata ? { id: metadata.id ?? state.project.id } : {}),
        ...('name' in metadata ? { name: metadata.name ?? state.project.name } : {}),
        duration: metadata.duration ?? state.project.duration,
        fps: metadata.fps ?? state.project.fps,
        resolution: metadata.resolution
          ? {
              ...state.project.resolution,
              ...metadata.resolution,
            }
          : state.project.resolution,
        transforms: metadata.transforms
          ? {
              position: {
                ...state.project.transforms.position,
                ...(metadata.transforms.position ?? {}),
              },
              scale: {
                ...state.project.transforms.scale,
                ...(metadata.transforms.scale ?? {}),
              },
              rotation: metadata.transforms.rotation ?? state.project.transforms.rotation,
            }
          : state.project.transforms,
      },
    })),

  play: () =>
    set((state) => ({
      playback: { ...state.playback, isPlaying: true },
    })),
  pause: () =>
    set((state) => ({
      playback: { ...state.playback, isPlaying: false },
    })),
  togglePlayPause: () =>
    set((state) => ({
      playback: { ...state.playback, isPlaying: !state.playback.isPlaying },
    })),
  setCurrentTime: (time) =>
    set((state) => ({
      playback: { ...state.playback, currentTime: Math.max(0, time) },
    })),
  setPlaybackRate: (rate) =>
    set((state) => ({
      playback: { ...state.playback, playbackRate: Math.max(0.1, rate) },
    })),
  setDuration: (duration) =>
    set((state) => ({
      project: { ...state.project, duration: Math.max(0, duration) },
      playback: {
        ...state.playback,
        currentTime: Math.min(state.playback.currentTime, Math.max(0, duration)),
      },
    })),
  setVolume: (volume) =>
    set((state) => ({
      playback: {
        ...state.playback,
        volume: Math.max(0, Math.min(1, volume)),
      },
    })),
  setIsLooping: (isLooping) =>
    set((state) => ({
      playback: { ...state.playback, isLooping },
    })),

  addClip: (clip) =>
    set((state) => ({
      clips: [...state.clips, clip],
    })),
  updateClip: (id, updates) =>
    set((state) => ({
      clips: state.clips.map((clip) =>
        clip.id === id
          ? {
              ...clip,
              ...updates,
              transforms: updates.transforms ?? clip.transforms,
            }
          : clip
      ),
    })),
  removeClip: (id) =>
    set((state) => ({
      clips: state.clips.filter((clip) => clip.id !== id),
      selectedClipIds: state.selectedClipIds.filter((clipId) => clipId !== id),
      clipConnections: state.clipConnections.filter(
        (connection) => connection.sourceId !== id && connection.targetId !== id
      ),
      keyframes: state.keyframes.filter((keyframe) => keyframe.targetId !== id),
      selectedKeyframeIds: state.selectedKeyframeIds.filter((keyframeId) => keyframeId !== id),
    })),

  addAudioTrack: (track) =>
    set((state) => ({
      audioTracks: [...state.audioTracks, track],
    })),
  updateAudioTrack: (id, updates) =>
    set((state) => ({
      audioTracks: state.audioTracks.map((track) =>
        track.id === id
          ? {
              ...track,
              ...updates,
            }
          : track
      ),
    })),
  removeAudioTrack: (id) =>
    set((state) => ({
      audioTracks: state.audioTracks.filter((track) => track.id !== id),
      selectedAudioTrackIds: state.selectedAudioTrackIds.filter((trackId) => trackId !== id),
    })),

  selectClip: (id, addToSelection = false) =>
    set((state) => ({
      selectedClipIds: addToSelection ? [...state.selectedClipIds, id] : [id],
    })),
  deselectClip: (id) =>
    set((state) => ({
      selectedClipIds: state.selectedClipIds.filter((clipId) => clipId !== id),
    })),
  clearClipSelection: () => set({ selectedClipIds: [] }),

  selectAudioTrack: (id, addToSelection = false) =>
    set((state) => ({
      selectedAudioTrackIds: addToSelection ? [...state.selectedAudioTrackIds, id] : [id],
    })),
  deselectAudioTrack: (id) =>
    set((state) => ({
      selectedAudioTrackIds: state.selectedAudioTrackIds.filter((trackId) => trackId !== id),
    })),
  clearAudioTrackSelection: () => set({ selectedAudioTrackIds: [] }),

  addClipConnection: (connection) =>
    set((state) => ({
      clipConnections: [...state.clipConnections, connection],
    })),
  removeClipConnection: (id) =>
    set((state) => ({
      clipConnections: state.clipConnections.filter((conn) => conn.id !== id),
    })),
  setActiveConnection: (connection) => set({ activeConnection: connection }),
  updateActiveConnectionCursor: (x, y) =>
    set((state) =>
      state.activeConnection
        ? { activeConnection: { ...state.activeConnection, cursorX: x, cursorY: y } }
        : state
    ),

  addKeyframe: (keyframe) =>
    set((state) => ({
      keyframes: [...state.keyframes, keyframe],
    })),
  updateKeyframe: (id, updates) =>
    set((state) => ({
      keyframes: state.keyframes.map((keyframe) =>
        keyframe.id === id ? { ...keyframe, ...updates } : keyframe
      ),
    })),
  removeKeyframe: (id) =>
    set((state) => ({
      keyframes: state.keyframes.filter((keyframe) => keyframe.id !== id),
      selectedKeyframeIds: state.selectedKeyframeIds.filter((keyframeId) => keyframeId !== id),
    })),
  selectKeyframe: (id, addToSelection = false) =>
    set((state) => ({
      selectedKeyframeIds: addToSelection ? [...state.selectedKeyframeIds, id] : [id],
    })),
  deselectKeyframe: (id) =>
    set((state) => ({
      selectedKeyframeIds: state.selectedKeyframeIds.filter((keyframeId) => keyframeId !== id),
    })),
  clearKeyframeSelection: () => set({ selectedKeyframeIds: [] }),

  openDialog: (dialog) =>
    set((state) => ({
      dialogs: { ...state.dialogs, [dialog]: true },
    })),
  closeDialog: (dialog) =>
    set((state) => ({
      dialogs: { ...state.dialogs, [dialog]: false },
    })),
  toggleDialog: (dialog) =>
    set((state) => ({
      dialogs: { ...state.dialogs, [dialog]: !state.dialogs[dialog] },
    })),

  setGenerationParams: (params) =>
    set((state) => ({
      generationParams: { ...state.generationParams, ...params },
    })),
  startGeneration: (message) =>
    set((state) => ({
      aiGeneration: {
        status: 'running',
        progress: 0,
        message,
        lastGeneratedId: undefined,
      },
    })),
  updateGenerationProgress: (progress, message) =>
    set((state) => ({
      aiGeneration: {
        ...state.aiGeneration,
        status: 'running',
        progress: Math.max(0, Math.min(1, progress)),
        message: message ?? state.aiGeneration.message,
      },
    })),
  finishGeneration: (status = 'completed', message, lastGeneratedId) =>
    set((state) => ({
      aiGeneration: {
        status,
        progress: status === 'completed' ? 1 : state.aiGeneration.progress,
        message,
        lastGeneratedId,
      },
    })),

  setTimelineZoom: (zoom) =>
    set((state) => ({
      timeline: { ...state.timeline, zoom: Math.max(0.1, Math.min(zoom, 10)) },
    })),
  zoomTimelineIn: (step = 0.1) =>
    set((state) => ({
      timeline: {
        ...state.timeline,
        zoom: Math.max(0.1, Math.min(state.timeline.zoom + step, 10)),
      },
    })),
  zoomTimelineOut: (step = 0.1) =>
    set((state) => ({
      timeline: {
        ...state.timeline,
        zoom: Math.max(0.1, Math.min(state.timeline.zoom - step, 10)),
      },
    })),
  setTimelineScroll: (scroll) =>
    set((state) => ({
      timeline: { ...state.timeline, scroll: Math.max(0, scroll) },
    })),
  scrollTimelineBy: (delta) =>
    set((state) => ({
      timeline: {
        ...state.timeline,
        scroll: Math.max(0, state.timeline.scroll + delta),
      },
    })),

  reset: () => ({ ...initialState }),
}));
