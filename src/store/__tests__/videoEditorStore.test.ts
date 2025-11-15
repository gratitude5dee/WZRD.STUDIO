// Test file disabled - bun:test not available
// import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { useVideoEditorStore, Clip } from '@/store/videoEditorStore';
import { videoEditorService } from '@/services/videoEditorService';

const saveClipCalls: Array<[string, Clip]> = [];
const originalSaveTimelineClip = videoEditorService.saveTimelineClip;
const originalDeleteTimelineClip = videoEditorService.deleteTimelineClip;

const createClip = (overrides: Partial<Clip> = {}): Clip => ({
  id: overrides.id ?? 'clip-1',
  mediaItemId: overrides.mediaItemId ?? 'media-1',
  type: overrides.type ?? 'video',
  name: overrides.name ?? 'Clip',
  url: overrides.url ?? 'https://example.com/video.mp4',
  startTime: overrides.startTime ?? 0,
  duration: overrides.duration ?? 1000,
  endTime: overrides.endTime ?? 1000,
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

// Tests disabled - bun:test not available
/*
beforeEach(() => {
  useVideoEditorStore.getState().reset();
  saveClipCalls.length = 0;
  videoEditorService.saveTimelineClip = (async (...args) => {
    saveClipCalls.push(args as [string, Clip]);
  }) as typeof videoEditorService.saveTimelineClip;
  videoEditorService.deleteTimelineClip = (async () => {}) as typeof videoEditorService.deleteTimelineClip;
});

afterEach(() => {
  videoEditorService.saveTimelineClip = originalSaveTimelineClip;
  videoEditorService.deleteTimelineClip = originalDeleteTimelineClip;
});
*/

/*
describe('videoEditorStore history', () => {
  it('restores previous clip state on undo/redo', () => {
    const initialClip = createClip();
    useVideoEditorStore.getState().addClip(initialClip);
    useVideoEditorStore.getState().updateClip(initialClip.id, { startTime: 1000 });
    expect(useVideoEditorStore.getState().clips[0].startTime).toBe(1000);

    useVideoEditorStore.getState().undo();
    expect(useVideoEditorStore.getState().clips[0].startTime).toBe(0);

    useVideoEditorStore.getState().redo();
    expect(useVideoEditorStore.getState().clips[0].startTime).toBe(1000);
  });
});

describe('clipboard operations', () => {
  it('copies selected clips and pastes with an offset', () => {
    const clip = createClip();
    const store = useVideoEditorStore.getState();
    store.addClip(clip);
    store.selectClip(clip.id);
    store.copySelectedClips();

    store.setProjectId('project-1');
    store.pasteClipboard();

    const clips = useVideoEditorStore.getState().clips;
    expect(clips).toHaveLength(2);
    expect(clips[1].startTime).toBe(clip.startTime + store.timeline.gridSize);
    expect(saveClipCalls.length).toBe(1);
    expect(useVideoEditorStore.getState().selectedClipIds).toEqual([clips[1].id]);
  });
});
*/
