import type { AudioTrack, Clip } from '@/store/videoEditorStore';

export interface SnapConfig {
  snapToGrid: boolean;
  gridSize: number;
  threshold?: number;
}

const MIN_THRESHOLD = 50;

const getEndTime = (item: Pick<Clip, 'duration' | 'endTime' | 'startTime'>): number => {
  const start = item.startTime ?? 0;
  if (typeof item.endTime === 'number') {
    return item.endTime;
  }
  if (typeof item.duration === 'number') {
    return start + item.duration;
  }
  return start;
};

const addPoint = (set: Set<number>, value: number | undefined) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return;
  }
  set.add(Math.max(0, Math.round(value)));
};

export const buildSnapPoints = (
  clips: Clip[],
  audioTracks: AudioTrack[],
  excludeId?: string
): number[] => {
  const points = new Set<number>();

  const collect = (item: Clip | AudioTrack) => {
    if (excludeId && item.id === excludeId) {
      return;
    }
    addPoint(points, item.startTime);
    addPoint(points, getEndTime(item));
  };

  clips.forEach(collect);
  audioTracks.forEach(collect);

  return Array.from(points).sort((a, b) => a - b);
};

const findNearestPoint = (points: number[], target: number): number | null => {
  if (!points.length) {
    return null;
  }
  let left = 0;
  let right = points.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const value = points[mid];
    if (value === target) {
      return value;
    }
    if (value < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  const candidates = new Set<number>();
  if (left < points.length) {
    candidates.add(points[left]);
  }
  if (left - 1 >= 0) {
    candidates.add(points[left - 1]);
  }
  if (left + 1 < points.length) {
    candidates.add(points[left + 1]);
  }

  let best: number | null = null;
  let bestDiff = Number.POSITIVE_INFINITY;
  candidates.forEach((point) => {
    const diff = Math.abs(point - target);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = point;
    }
  });

  return best;
};

export const snapValue = (value: number, points: number[], config: SnapConfig): number => {
  const { snapToGrid, gridSize } = config;
  const rawValue = Math.max(0, value);
  const snappedToGrid = snapToGrid && gridSize > 0 ? Math.round(rawValue / gridSize) * gridSize : rawValue;
  const threshold = Math.max(config.threshold ?? 0, gridSize || 0, MIN_THRESHOLD);

  const nearest = findNearestPoint(points, snappedToGrid);
  if (nearest === null) {
    return Math.max(0, snappedToGrid);
  }

  return Math.abs(nearest - snappedToGrid) <= threshold ? Math.max(0, nearest) : Math.max(0, snappedToGrid);
};
