import { useCallback, useState } from 'react';
import { useVideoEditorStore } from '@/store/videoEditorStore';

interface DragState {
  isDragging: boolean;
  draggedClipId: string | null;
  initialPosition: { x: number; y: number } | null;
  currentPosition: { x: number; y: number } | null;
}

export function useClipDrag() {
  const { updateClip, selectedClipIds } = useVideoEditorStore();
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedClipId: null,
    initialPosition: null,
    currentPosition: null,
  });

  const startDrag = useCallback((clipId: string, x: number, y: number) => {
    setDragState({
      isDragging: true,
      draggedClipId: clipId,
      initialPosition: { x, y },
      currentPosition: { x, y },
    });
  }, []);

  const updateDrag = useCallback((x: number, y: number) => {
    setDragState((prev) => ({
      ...prev,
      currentPosition: { x, y },
    }));
  }, []);

  const endDrag = useCallback((newStartTime: number, newTrackIndex: number) => {
    if (dragState.draggedClipId) {
      const isMultiSelect = selectedClipIds.includes(dragState.draggedClipId);
      
      if (isMultiSelect && selectedClipIds.length > 1) {
        // Move all selected clips
        selectedClipIds.forEach((id) => {
          updateClip(id, {
            startTime: newStartTime,
            trackIndex: newTrackIndex,
          });
        });
      } else {
        // Move single clip
        updateClip(dragState.draggedClipId, {
          startTime: newStartTime,
          trackIndex: newTrackIndex,
        });
      }
    }

    setDragState({
      isDragging: false,
      draggedClipId: null,
      initialPosition: null,
      currentPosition: null,
    });
  }, [dragState.draggedClipId, selectedClipIds, updateClip]);

  const cancelDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedClipId: null,
      initialPosition: null,
      currentPosition: null,
    });
  }, []);

  return {
    dragState,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
  };
}
