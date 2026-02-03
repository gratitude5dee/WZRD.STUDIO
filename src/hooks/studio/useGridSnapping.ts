/**
 * useGridSnapping.ts
 * Grid snapping detection with visual feedback support
 */

import { useState, useCallback, useMemo } from 'react';

interface Point {
  x: number;
  y: number;
}

interface SnapResult {
  snappedPosition: Point;
  isSnapped: boolean;
  gridPoint: Point | null;
}

interface UseGridSnappingOptions {
  gridSize?: number;
  snapThreshold?: number;
  enabled?: boolean;
}

interface UseGridSnappingReturn {
  checkSnap: (position: Point) => SnapResult;
  getGridPoint: (position: Point) => Point;
  isSnappedAt: (position: Point) => boolean;
  gridSize: number;
  snapThreshold: number;
}

const DEFAULT_OPTIONS = {
  gridSize: 24,
  snapThreshold: 12,
  enabled: true,
};

/**
 * Hook that provides grid snapping detection and snapped position calculation
 */
export function useGridSnapping(
  options: UseGridSnappingOptions = {}
): UseGridSnappingReturn {
  const {
    gridSize = DEFAULT_OPTIONS.gridSize,
    snapThreshold = DEFAULT_OPTIONS.snapThreshold,
    enabled = DEFAULT_OPTIONS.enabled,
  } = options;

  // Get the nearest grid point to a position
  const getGridPoint = useCallback((position: Point): Point => {
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize,
    };
  }, [gridSize]);

  // Check if a position is within snap threshold of a grid point
  const checkSnap = useCallback((position: Point): SnapResult => {
    if (!enabled) {
      return {
        snappedPosition: position,
        isSnapped: false,
        gridPoint: null,
      };
    }

    const nearestGrid = getGridPoint(position);
    const dx = Math.abs(position.x - nearestGrid.x);
    const dy = Math.abs(position.y - nearestGrid.y);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const isSnapped = distance <= snapThreshold;

    return {
      snappedPosition: isSnapped ? nearestGrid : position,
      isSnapped,
      gridPoint: isSnapped ? nearestGrid : null,
    };
  }, [enabled, snapThreshold, getGridPoint]);

  // Quick check if currently snapped
  const isSnappedAt = useCallback((position: Point): boolean => {
    return checkSnap(position).isSnapped;
  }, [checkSnap]);

  return {
    checkSnap,
    getGridPoint,
    isSnappedAt,
    gridSize,
    snapThreshold,
  };
}

export default useGridSnapping;
