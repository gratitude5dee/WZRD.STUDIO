import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { CanvasObject, Transform, ViewportState } from '@/types/canvas';

interface CanvasState {
  // State
  objects: CanvasObject[];
  selectedIds: string[];
  clipboard: CanvasObject[];
  history: CanvasObject[][];
  historyIndex: number;
  viewport: ViewportState;
  currentProjectId: string | null;

  // Actions
  setProjectId: (id: string) => void;
  addObject: (object: CanvasObject) => void;
  updateObject: (id: string, updates: Partial<CanvasObject>) => void;
  removeObject: (id: string) => void;
  setSelectedIds: (ids: string[]) => void;
  clearSelection: () => void;
  selectAll: () => void;
  updateTransform: (id: string, transform: Partial<Transform>) => void;
  setViewport: (viewport: Partial<ViewportState>) => void;
  undo: () => void;
  redo: () => void;
  copy: () => void;
  paste: () => void;
  duplicate: () => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  deleteSelected: () => void;
  reset: () => void;
  setObjects: (objects: CanvasObject[]) => void;
}

const initialState = {
  objects: [],
  selectedIds: [],
  clipboard: [],
  history: [[]],
  historyIndex: 0,
  viewport: { x: 0, y: 0, scale: 1 },
  currentProjectId: null,
};

export const useCanvasStore = create<CanvasState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setProjectId: (id) => set({ currentProjectId: id }),

        addObject: (object) =>
          set((state) => {
            const newObjects = [...state.objects, object];
            return {
              objects: newObjects,
              history: [
                ...state.history.slice(0, state.historyIndex + 1),
                newObjects,
              ],
              historyIndex: state.historyIndex + 1,
            };
          }),

        updateObject: (id, updates) =>
          set((state) => ({
            objects: state.objects.map((obj) =>
              obj.id === id ? { ...obj, ...updates, updatedAt: new Date().toISOString() } : obj
            ),
          })),

        removeObject: (id) =>
          set((state) => ({
            objects: state.objects.filter((obj) => obj.id !== id),
            selectedIds: state.selectedIds.filter((selectedId) => selectedId !== id),
          })),

        setSelectedIds: (ids) => set({ selectedIds: ids }),

        clearSelection: () => set({ selectedIds: [] }),

        selectAll: () =>
          set((state) => ({
            selectedIds: state.objects.map((obj) => obj.id),
          })),

        updateTransform: (id, transform) =>
          set((state) => ({
            objects: state.objects.map((obj) =>
              obj.id === id
                ? {
                    ...obj,
                    transform: { ...obj.transform, ...transform },
                    updatedAt: new Date().toISOString(),
                  }
                : obj
            ),
          })),

        setViewport: (viewport) =>
          set((state) => ({
            viewport: { ...state.viewport, ...viewport },
          })),

        undo: () =>
          set((state) => {
            if (state.historyIndex > 0) {
              return {
                objects: state.history[state.historyIndex - 1],
                historyIndex: state.historyIndex - 1,
              };
            }
            return state;
          }),

        redo: () =>
          set((state) => {
            if (state.historyIndex < state.history.length - 1) {
              return {
                objects: state.history[state.historyIndex + 1],
                historyIndex: state.historyIndex + 1,
              };
            }
            return state;
          }),

        copy: () =>
          set((state) => ({
            clipboard: state.objects.filter((obj) =>
              state.selectedIds.includes(obj.id)
            ),
          })),

        paste: () =>
          set((state) => {
            const newObjects = state.clipboard.map((obj) => ({
              ...obj,
              id: crypto.randomUUID(),
              transform: {
                ...obj.transform,
                x: obj.transform.x + 20,
                y: obj.transform.y + 20,
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }));
            return {
              objects: [...state.objects, ...newObjects],
              selectedIds: newObjects.map((obj) => obj.id),
            };
          }),

        duplicate: () => {
          const state = get();
          state.copy();
          state.paste();
        },

        bringToFront: (id) =>
          set((state) => {
            const maxIndex = Math.max(...state.objects.map((obj) => obj.layerIndex), 0);
            return {
              objects: state.objects.map((obj) =>
                obj.id === id ? { ...obj, layerIndex: maxIndex + 1 } : obj
              ),
            };
          }),

        sendToBack: (id) =>
          set((state) => {
            const minIndex = Math.min(...state.objects.map((obj) => obj.layerIndex), 0);
            return {
              objects: state.objects.map((obj) =>
                obj.id === id ? { ...obj, layerIndex: minIndex - 1 } : obj
              ),
            };
          }),

        deleteSelected: () =>
          set((state) => ({
            objects: state.objects.filter((obj) => !state.selectedIds.includes(obj.id)),
            selectedIds: [],
          })),

        reset: () => set(initialState),

        setObjects: (objects) => set({ objects }),
      }),
      {
        name: 'wzrd-canvas-storage',
        partialize: (state) => ({
          viewport: state.viewport,
          currentProjectId: state.currentProjectId,
        }),
      }
    )
  )
);
