import { useMemo } from 'react';

interface VirtualizationOptions {
  scrollOffset: number;
  viewportWidth: number;
  pixelsPerSecond: number;
  bufferSize?: number; // Extra items to render outside viewport
}

interface VirtualizedRange {
  startTime: number;
  endTime: number;
  startIndex: number;
  endIndex: number;
}

/**
 * Hook for virtualizing timeline items (clips, tracks)
 * Only renders items visible in the viewport + buffer
 */
export function useTimelineVirtualization<T extends { startTime: number; duration: number }>(
  items: T[],
  options: VirtualizationOptions
): { visibleItems: T[]; range: VirtualizedRange } {
  const { scrollOffset, viewportWidth, pixelsPerSecond, bufferSize = 5000 } = options;

  const range = useMemo<VirtualizedRange>(() => {
    // Calculate visible time range in seconds
    const startTime = Math.max(0, (scrollOffset - bufferSize) / pixelsPerSecond);
    const endTime = (scrollOffset + viewportWidth + bufferSize) / pixelsPerSecond;

    // Find first and last visible items
    let startIndex = 0;
    let endIndex = items.length;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemEndTime = item.startTime + item.duration;

      if (itemEndTime < startTime) {
        startIndex = i + 1;
      }

      if (item.startTime > endTime) {
        endIndex = i;
        break;
      }
    }

    return {
      startTime,
      endTime,
      startIndex,
      endIndex,
    };
  }, [items, scrollOffset, viewportWidth, pixelsPerSecond, bufferSize]);

  const visibleItems = useMemo(() => {
    return items.slice(range.startIndex, range.endIndex);
  }, [items, range.startIndex, range.endIndex]);

  return { visibleItems, range };
}

/**
 * Hook for calculating optimal thumbnail quality based on zoom level
 */
export function useThumbnailQuality(zoom: number): 'low' | 'medium' | 'high' {
  return useMemo(() => {
    if (zoom > 100) return 'high';
    if (zoom > 50) return 'medium';
    return 'low';
  }, [zoom]);
}

/**
 * Debounce thumbnail loading to prevent excessive requests
 */
export function useThrottledThumbnailLoad() {
  const loadedThumbnails = useMemo(() => new Set<string>(), []);
  const pendingLoads = useMemo(() => new Map<string, NodeJS.Timeout>(), []);

  const scheduleLoad = (clipId: string, callback: () => void, delay = 150) => {
    // Clear existing timeout
    const existing = pendingLoads.get(clipId);
    if (existing) {
      clearTimeout(existing);
    }

    // Don't reload if already loaded
    if (loadedThumbnails.has(clipId)) {
      callback();
      return;
    }

    // Schedule new load
    const timeout = setTimeout(() => {
      loadedThumbnails.add(clipId);
      pendingLoads.delete(clipId);
      callback();
    }, delay);

    pendingLoads.set(clipId, timeout);
  };

  return { scheduleLoad, loadedThumbnails };
}
