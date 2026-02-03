import { create } from 'zustand';
import type { NodeDefinition, EdgeDefinition } from '@/types/computeFlow';

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  description: string;
  type:
    | 'add_node'
    | 'delete_node'
    | 'move_node'
    | 'add_edge'
    | 'delete_edge'
    | 'edit_node'
    | 'batch'
    | 'load_flow';
  nodeCount: number;
  edgeCount: number;
  snapshot: {
    nodes: NodeDefinition[];
    edges: EdgeDefinition[];
  };
}

interface HistoryState {
  entries: HistoryEntry[];
  currentIndex: number;
  maxEntries: number;

  pushEntry: (
    description: string,
    type: HistoryEntry['type'],
    snapshot: HistoryEntry['snapshot']
  ) => void;
  undo: () => HistoryEntry | null;
  redo: () => HistoryEntry | null;
  jumpToEntry: (index: number) => HistoryEntry | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  entries: [],
  currentIndex: -1,
  maxEntries: 50,

  pushEntry: (description, type, snapshot) => {
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      description,
      type,
      nodeCount: snapshot.nodes.length,
      edgeCount: snapshot.edges.length,
      snapshot: JSON.parse(JSON.stringify(snapshot)),
    };

    set((state) => {
      const truncatedEntries = state.entries.slice(0, state.currentIndex + 1);
      let newEntries = [...truncatedEntries, entry];

      if (newEntries.length > state.maxEntries) {
        newEntries = newEntries.slice(newEntries.length - state.maxEntries);
      }

      return {
        entries: newEntries,
        currentIndex: newEntries.length - 1,
      };
    });
  },

  undo: () => {
    const { entries, currentIndex } = get();
    if (currentIndex <= 0) return null;

    const newIndex = currentIndex - 1;
    set({ currentIndex: newIndex });
    return entries[newIndex];
  },

  redo: () => {
    const { entries, currentIndex } = get();
    if (currentIndex >= entries.length - 1) return null;

    const newIndex = currentIndex + 1;
    set({ currentIndex: newIndex });
    return entries[newIndex];
  },

  jumpToEntry: (index: number) => {
    const { entries } = get();
    if (index < 0 || index >= entries.length) return null;

    set({ currentIndex: index });
    return entries[index];
  },

  canUndo: () => get().currentIndex > 0,
  canRedo: () => get().currentIndex < get().entries.length - 1,

  clear: () => {
    set({ entries: [], currentIndex: -1 });
  },
}));
