// Test file disabled - bun:test not available
// import { describe, expect, it } from 'bun:test';
import { runExportRequest } from '@/hooks/useExport';
import type { Clip, AudioTrack, CompositionSettings } from '@/store/videoEditorStore';

type InvokeArgs = Parameters<typeof runExportRequest>[0];

const createClip = (): Clip => ({
  id: 'clip-1',
  mediaItemId: 'media-1',
  type: 'video',
  name: 'Clip',
  url: 'https://example.com/video.mp4',
  startTime: 0,
  duration: 1000,
  endTime: 1000,
  trackIndex: 0,
  layer: 0,
  transforms: {
    position: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotation: 0,
    opacity: 1,
  },
});

const createAudioTrack = (): AudioTrack => ({
  id: 'audio-1',
  mediaItemId: 'media-2',
  type: 'audio',
  name: 'Audio',
  url: 'https://example.com/audio.mp3',
  startTime: 0,
  duration: 1000,
  endTime: 1000,
  volume: 1,
  isMuted: false,
  trackIndex: 0,
  fadeInDuration: 0,
  fadeOutDuration: 0,
});

const composition: CompositionSettings = {
  width: 1920,
  height: 1080,
  fps: 30,
  aspectRatio: '16:9',
  duration: 1000,
  backgroundColor: '#000000',
};

const createContext = (overrides: Partial<{ projectId: string | null; clips: Clip[]; audioTracks: AudioTrack[] }> = {}) => ({
  projectId: overrides.projectId ?? 'project-1',
  clips: overrides.clips ?? [createClip()],
  audioTracks: overrides.audioTracks ?? [],
  composition,
});

// Tests disabled - bun:test not available
/*
describe('runExportRequest', () => {
  it('rejects unsupported formats', async () => {
    const deps: InvokeArgs = { invoke: async () => ({ data: null, error: null }) };
    const result = await runExportRequest(deps, createContext(), { format: 'mov' as 'mp4', quality: 'high' });
    expect(result.error).toContain('Unsupported export format');
  });

  it('returns Supabase errors when invocation fails', async () => {
    const deps: InvokeArgs = {
      invoke: async () => ({ data: null, error: { message: 'Failed' } }),
    };
    const result = await runExportRequest(deps, createContext(), { format: 'mp4', quality: 'high' });
    expect(result.error).toBe('Failed');
  });

  it('returns a download URL on success', async () => {
    const deps: InvokeArgs = {
      invoke: async () => ({ data: { url: 'https://example.com/video.mp4' }, error: null }),
    };
    const result = await runExportRequest(
      deps,
      createContext({ audioTracks: [createAudioTrack()] }),
      { format: 'mp4', quality: 'high' }
    );
    expect(result.url).toBe('https://example.com/video.mp4');
    expect(result.error).toBeUndefined();
  });
});
*/
