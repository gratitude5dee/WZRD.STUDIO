import { useCallback, useState } from 'react';
import { useVideoEditorStore } from '@/store/videoEditorStore';

interface ResizeState {
  isResizing: boolean;
  clipId: string | null;
  handle: 'left' | 'right' | null;
  originalDuration: number;
  originalStartTime: number;
}

const MIN_CLIP_DURATION = 0.1; // 100ms minimum

export function useClipResize() {
  const { clips, updateClip } = useVideoEditorStore();
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    clipId: null,
    handle: null,
    originalDuration: 0,
    originalStartTime: 0,
  });

  const startResize = useCallback(
    (clipId: string, handle: 'left' | 'right') => {
      const clip = clips.find((c) => c.id === clipId);
      if (!clip) return;

      setResizeState({
        isResizing: true,
        clipId,
        handle,
        originalDuration: clip.duration,
        originalStartTime: clip.startTime,
      });
    },
    [clips]
  );

  const updateResize = useCallback(
    (deltaTime: number) => {
      if (!resizeState.isResizing || !resizeState.clipId) return;

      const clip = clips.find((c) => c.id === resizeState.clipId);
      if (!clip) return;

      if (resizeState.handle === 'left') {
        // Resize from left (trim start)
        const newStartTime = resizeState.originalStartTime + deltaTime;
        const newDuration = resizeState.originalDuration - deltaTime;

        if (newDuration >= MIN_CLIP_DURATION && newStartTime >= 0) {
          updateClip(resizeState.clipId, {
            startTime: newStartTime,
            duration: newDuration,
            trimStart: (clip.trimStart || 0) + deltaTime,
          });
        }
      } else if (resizeState.handle === 'right') {
        // Resize from right (trim end)
        const newDuration = resizeState.originalDuration + deltaTime;

        if (newDuration >= MIN_CLIP_DURATION) {
          updateClip(resizeState.clipId, {
            duration: newDuration,
            trimEnd: Math.max(0, (clip.trimEnd || 0) - deltaTime),
          });
        }
      }
    },
    [resizeState, clips, updateClip]
  );

  const endResize = useCallback(() => {
    setResizeState({
      isResizing: false,
      clipId: null,
      handle: null,
      originalDuration: 0,
      originalStartTime: 0,
    });
  }, []);

  return {
    resizeState,
    startResize,
    updateResize,
    endResize,
  };
}
