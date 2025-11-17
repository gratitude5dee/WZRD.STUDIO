import { useCallback, useEffect, useRef } from 'react';
import { useVideoEditorStore } from '@/store/videoEditorStore';

// Simple debounce utility
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Hook for real-time property updates with debouncing and undo/redo support
 */
export function usePropertySync() {
  const { clips, audioTracks, selectedClipIds, updateClip, updateAudioTrack } =
    useVideoEditorStore();
  
  const pendingUpdates = useRef<Map<string, any>>(new Map());

  // Debounced batch update function
  const flushUpdates = useCallback(
    debounce(() => {
      pendingUpdates.current.forEach((updates, id) => {
        const isClip = clips.some((c) => c.id === id);
        const isAudio = audioTracks.some((a) => a.id === id);

        if (isClip) {
          updateClip(id, updates);
        } else if (isAudio) {
          updateAudioTrack(id, updates);
        }
      });

      pendingUpdates.current.clear();
    }, 150), // 150ms debounce for smooth updates
    [clips, audioTracks, updateClip, updateAudioTrack]
  );

  /**
   * Update a property immediately (for instant feedback)
   * The actual state update is debounced for performance
   */
  const updateProperty = useCallback(
    (itemId: string, property: string, value: any) => {
      const current = pendingUpdates.current.get(itemId) || {};
      pendingUpdates.current.set(itemId, {
        ...current,
        [property]: value,
      });

      flushUpdates();
    },
    [flushUpdates]
  );

  /**
   * Update multiple properties at once
   */
  const updateProperties = useCallback(
    (itemId: string, properties: Record<string, any>) => {
      const current = pendingUpdates.current.get(itemId) || {};
      pendingUpdates.current.set(itemId, {
        ...current,
        ...properties,
      });

      flushUpdates();
    },
    [flushUpdates]
  );

  /**
   * Update property for all selected clips/tracks
   */
  const updateSelectedProperty = useCallback(
    (property: string, value: any) => {
      selectedClipIds.forEach((id) => {
        updateProperty(id, property, value);
      });
    },
    [selectedClipIds, updateProperty]
  );

  /**
   * Get current value of a property for the first selected item
   */
  const getPropertyValue = useCallback(
    (property: string): any => {
      if (selectedClipIds.length === 0) return undefined;

      const firstId = selectedClipIds[0];
      const clip = clips.find((c) => c.id === firstId);
      const audio = audioTracks.find((a) => a.id === firstId);

      const item = clip || audio;
      if (!item) return undefined;

      // Handle nested properties (e.g., "transforms.position.x")
      const parts = property.split('.');
      let value: any = item;
      for (const part of parts) {
        value = value?.[part];
      }

      return value;
    },
    [selectedClipIds, clips, audioTracks]
  );

  // Flush pending updates on unmount
  useEffect(() => {
    return () => {
      if (pendingUpdates.current.size > 0) {
        flushUpdates();
      }
    };
  }, [flushUpdates]);

  return {
    updateProperty,
    updateProperties,
    updateSelectedProperty,
    getPropertyValue,
  };
}
