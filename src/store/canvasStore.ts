import { create } from 'zustand';
import { Node, Edge } from '@xyflow/react';
import { Clip, AudioTrack } from './videoEditorStore';

interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  updateNode: (id: string, data: Partial<Node['data']>) => void;
  removeNode: (id: string) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (id: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  
  // Sync with timeline
  syncFromTimeline: (clips: Clip[], audioTracks: AudioTrack[]) => void;
  syncToTimeline: () => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  
  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, node],
  })),
  
  updateNode: (id, data) => set((state) => ({
    nodes: state.nodes.map((node) =>
      node.id === id ? { ...node, data: { ...node.data, ...data } } : node
    ),
  })),
  
  removeNode: (id) => set((state) => ({
    nodes: state.nodes.filter((node) => node.id !== id),
    edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
  })),
  
  addEdge: (edge) => set((state) => ({
    edges: [...state.edges, edge],
  })),
  
  removeEdge: (id) => set((state) => ({
    edges: state.edges.filter((edge) => edge.id !== id),
  })),
  
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  
  syncFromTimeline: (clips, audioTracks) => {
    // Convert timeline clips to canvas nodes
    const videoNodes: Node[] = clips.map((clip, index) => ({
      id: `video-${clip.id}`,
      type: 'videoClip',
      position: { x: index * 300, y: 100 },
      data: {
        clipId: clip.id,
        name: clip.name,
        url: clip.url,
        duration: clip.duration,
        thumbnailUrl: clip.url,
      },
    }));
    
    const audioNodes: Node[] = audioTracks.map((track, index) => ({
      id: `audio-${track.id}`,
      type: 'audioTrack',
      position: { x: index * 250, y: 400 },
      data: {
        trackId: track.id,
        name: track.name,
        duration: track.duration,
        volume: track.volume || 1,
      },
    }));
    
    set({ nodes: [...videoNodes, ...audioNodes] });
  },
  
  syncToTimeline: () => {
    // Implementation to sync canvas changes back to timeline
    // This will be expanded in Phase 3
  },
}));
