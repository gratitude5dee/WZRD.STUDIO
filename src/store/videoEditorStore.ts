
import { create } from 'zustand';

// Types for our store
export interface MediaItem {
  id: string;
  type: 'video' | 'image' | 'audio';
  url: string;
  name: string;
  duration?: number;
  startTime?: number;
  endTime?: number;
}

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
  mediaId: string;
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

export interface VideoEditorState {
  // Project data
  projectId: string | null;
  projectName: string;
  
  // Playback state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  
  // Media and timeline
  mediaItems: MediaItem[];
  selectedMediaIds: string[];
  
  // Timeline connections
  clipConnections: ClipConnection[];
  activeConnection: ActiveConnection | null;
  
  // Keyframes
  keyframes: Keyframe[];
  selectedKeyframeIds: string[];
  
  // Dialogs
  dialogs: DialogState;
  
  // Media generation
  generationParams: GenerationParams;
  isGenerating: boolean;
  
  // Actions
  setProjectId: (id: string | null) => void;
  setProjectName: (name: string) => void;
  
  // Playback controls
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  
  // Media management
  addMediaItem: (item: MediaItem) => void;
  updateMediaItem: (id: string, updates: Partial<MediaItem>) => void;
  removeMediaItem: (id: string) => void;
  selectMediaItem: (id: string, addToSelection?: boolean) => void;
  deselectMediaItem: (id: string) => void;
  clearMediaSelection: () => void;
  
  // Connection management
  addClipConnection: (connection: ClipConnection) => void;
  removeClipConnection: (id: string) => void;
  setActiveConnection: (connection: ActiveConnection | null) => void;
  updateActiveConnectionCursor: (x: number, y: number) => void;
  
  // Keyframe management
  addKeyframe: (keyframe: Keyframe) => void;
  updateKeyframe: (id: string, updates: Partial<Keyframe>) => void;
  removeKeyframe: (id: string) => void;
  selectKeyframe: (id: string, addToSelection?: boolean) => void;
  deselectKeyframe: (id: string) => void;
  clearKeyframeSelection: () => void;
  
  // Dialog controls
  openDialog: (dialog: keyof DialogState) => void;
  closeDialog: (dialog: keyof DialogState) => void;
  toggleDialog: (dialog: keyof DialogState) => void;
  
  // Generation controls
  setGenerationParams: (params: Partial<GenerationParams>) => void;
  startGeneration: () => void;
  finishGeneration: (success: boolean) => void;
  
  // Utility functions
  reset: () => void;
}

// Initial state
const initialState = {
  // Project data
  projectId: null,
  projectName: 'Untitled Project',
  
  // Playback state
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  
  // Media and timeline
  mediaItems: [],
  selectedMediaIds: [],
  
  // Timeline connections
  clipConnections: [],
  activeConnection: null,
  
  // Keyframes
  keyframes: [],
  selectedKeyframeIds: [],
  
  // Dialogs
  dialogs: {
    projectSettings: false,
    export: false,
    mediaGeneration: false,
    mediaLibrary: false,
  },
  
  // Media generation
  generationParams: {
    prompt: '',
    imageUrl: undefined,
    model: 'default',
    settings: {},
  },
  isGenerating: false,
};

// Create the store
export const useVideoEditorStore = create<VideoEditorState>((set) => ({
  ...initialState,
  
  // Project actions
  setProjectId: (id) => set({ projectId: id }),
  setProjectName: (name) => set({ projectName: name }),
  
  // Playback controls
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  
  // Media management
  addMediaItem: (item) => set((state) => ({ 
    mediaItems: [...state.mediaItems, item] 
  })),
  updateMediaItem: (id, updates) => set((state) => ({
    mediaItems: state.mediaItems.map((item) => 
      item.id === id ? { ...item, ...updates } : item
    ),
  })),
  removeMediaItem: (id) => set((state) => ({
    mediaItems: state.mediaItems.filter((item) => item.id !== id),
    selectedMediaIds: state.selectedMediaIds.filter((itemId) => itemId !== id),
  })),
  selectMediaItem: (id, addToSelection = false) => set((state) => ({
    selectedMediaIds: addToSelection 
      ? [...state.selectedMediaIds, id]
      : [id],
  })),
  deselectMediaItem: (id) => set((state) => ({
    selectedMediaIds: state.selectedMediaIds.filter((itemId) => itemId !== id),
  })),
  clearMediaSelection: () => set({ selectedMediaIds: [] }),
  
  // Connection management
  addClipConnection: (connection) => set((state) => ({
    clipConnections: [...state.clipConnections, connection]
  })),
  removeClipConnection: (id) => set((state) => ({
    clipConnections: state.clipConnections.filter((conn) => conn.id !== id)
  })),
  setActiveConnection: (connection) => set({ activeConnection: connection }),
  updateActiveConnectionCursor: (x, y) => set((state) => 
    state.activeConnection 
      ? { activeConnection: { ...state.activeConnection, cursorX: x, cursorY: y } }
      : {}
  ),
  
  // Keyframe management
  addKeyframe: (keyframe) => set((state) => ({ 
    keyframes: [...state.keyframes, keyframe] 
  })),
  updateKeyframe: (id, updates) => set((state) => ({
    keyframes: state.keyframes.map((keyframe) => 
      keyframe.id === id ? { ...keyframe, ...updates } : keyframe
    ),
  })),
  removeKeyframe: (id) => set((state) => ({
    keyframes: state.keyframes.filter((keyframe) => keyframe.id !== id),
    selectedKeyframeIds: state.selectedKeyframeIds.filter((kfId) => kfId !== id),
  })),
  selectKeyframe: (id, addToSelection = false) => set((state) => ({
    selectedKeyframeIds: addToSelection 
      ? [...state.selectedKeyframeIds, id]
      : [id],
  })),
  deselectKeyframe: (id) => set((state) => ({
    selectedKeyframeIds: state.selectedKeyframeIds.filter((kfId) => kfId !== id),
  })),
  clearKeyframeSelection: () => set({ selectedKeyframeIds: [] }),
  
  // Dialog controls
  openDialog: (dialog) => set((state) => ({
    dialogs: { ...state.dialogs, [dialog]: true },
  })),
  closeDialog: (dialog) => set((state) => ({
    dialogs: { ...state.dialogs, [dialog]: false },
  })),
  toggleDialog: (dialog) => set((state) => ({
    dialogs: { ...state.dialogs, [dialog]: !state.dialogs[dialog] },
  })),
  
  // Generation controls
  setGenerationParams: (params) => set((state) => ({
    generationParams: { ...state.generationParams, ...params },
  })),
  startGeneration: () => set({ isGenerating: true }),
  finishGeneration: (success) => set({ isGenerating: false }),
  
  // Reset the entire state
  reset: () => set(initialState),
}));
