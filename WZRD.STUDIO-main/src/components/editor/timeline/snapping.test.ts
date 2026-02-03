// Test file disabled - bun:test not available
// import { describe, expect, it } from 'bun:test';
import type { AudioTrack, Clip } from '@/store/videoEditorStore';
import { buildSnapPoints, snapValue } from './snapping';

const createClip = (overrides: Partial<Clip> = {}): Clip => ({
  id: overrides.id ?? 'clip-1',
  mediaItemId: overrides.mediaItemId,
  type: overrides.type ?? 'video',
  name: overrides.name ?? 'Clip',
  url: overrides.url ?? 'https://example.com/video.mp4',
  startTime: overrides.startTime ?? 0,
  duration: overrides.duration ?? 1000,
  endTime: overrides.endTime,
  trackIndex: overrides.trackIndex ?? 0,
  layer: overrides.layer ?? 0,
  trimStart: overrides.trimStart,
  trimEnd: overrides.trimEnd,
  transforms: overrides.transforms ?? {
    position: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotation: 0,
    opacity: 1,
  },
});

const createAudio = (overrides: Partial<AudioTrack> = {}): AudioTrack => ({
  id: overrides.id ?? 'audio-1',
  mediaItemId: overrides.mediaItemId,
  type: 'audio',
  name: overrides.name ?? 'Audio',
  url: overrides.url ?? 'https://example.com/audio.mp3',
  startTime: overrides.startTime ?? 0,
  duration: overrides.duration ?? 1000,
  endTime: overrides.endTime,
  volume: overrides.volume ?? 1,
  isMuted: overrides.isMuted ?? false,
  trackIndex: overrides.trackIndex ?? 0,
  fadeInDuration: overrides.fadeInDuration ?? 0,
  fadeOutDuration: overrides.fadeOutDuration ?? 0,
});

// Tests disabled - bun:test not available
/*
describe('timeline snapping helpers', () => {
  it('buildSnapPoints returns sorted unique points while excluding the active clip', () => {
    const clipA = createClip({ id: 'a', startTime: 0, duration: 1500 });
    const clipB = createClip({ id: 'b', startTime: 2000, duration: 500 });
    const audio = createAudio({ id: 'audio', startTime: 1500, duration: 1000 });

    const points = buildSnapPoints([clipA, clipB], [audio], 'a');

    expect(points).toEqual([1500, 2000, 2500]);
  });

  it('snapValue snaps to nearest neighbour when within threshold', () => {
    const points = [0, 1000, 2000];
    const snapped = snapValue(950, points, { snapToGrid: true, gridSize: 100 });
    expect(snapped).toBe(1000);
  });

  it('snapValue falls back to grid snapping when points are too far', () => {
    const points = [0, 4000];
    const snapped = snapValue(2100, points, { snapToGrid: true, gridSize: 100 });
    expect(snapped).toBe(2100);
  });
});
*/
