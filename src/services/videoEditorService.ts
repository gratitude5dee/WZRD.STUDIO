import { supabase } from '@/integrations/supabase/client';
import type { AudioTrack, Clip, CompositionSettings, LibraryMediaItem } from '@/store/videoEditorStore';

const ensureCompositionDefaults = (partial: Partial<CompositionSettings> = {}): CompositionSettings => ({
  width: partial.width ?? 1920,
  height: partial.height ?? 1080,
  fps: partial.fps ?? 30,
  aspectRatio: partial.aspectRatio ?? '16:9',
  duration: partial.duration ?? 30000,
  backgroundColor: partial.backgroundColor ?? '#000000',
});

// NOTE: Database tables 'timeline_clips' and 'compositions' don't exist yet in the schema
// This is a stub implementation until the schema is updated

export const videoEditorService = {
  async getMediaLibrary(projectId: string): Promise<LibraryMediaItem[]> {
    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load media library', error);
      return [];
    }

    return (data ?? [])
      .map((record: any): LibraryMediaItem | null => {
        if (!record) return null;
        return {
          id: record.id,
          projectId: record.project_id,
          mediaType: record.media_type ?? 'video',
          name: record.file_name ?? 'Untitled',
          url: record.file_url ?? null,
          durationSeconds: typeof record.duration_seconds === 'number' ? record.duration_seconds : undefined,
          sourceType: record.source_type ?? undefined,
          status: record.status ?? undefined,
          thumbnailUrl: record.thumbnail_url ?? undefined,
        };
      })
      .filter((item): item is LibraryMediaItem => item !== null);
  },

  // Stub implementations for timeline_clips table (doesn't exist yet)
  async getTimelineClips(projectId: string): Promise<Clip[]> {
    console.warn('timeline_clips table does not exist - returning empty array');
    return [];
  },

  async saveTimelineClip(projectId: string, clip: Clip): Promise<void> {
    console.warn('timeline_clips table does not exist - operation skipped');
  },

  async deleteTimelineClip(clipId: string): Promise<void> {
    console.warn('timeline_clips table does not exist - operation skipped');
  },

  // Stub implementations for audio_tracks operations
  async getAudioTracks(projectId: string): Promise<AudioTrack[]> {
    const { data, error } = await supabase
      .from('audio_tracks')
      .select('*')
      .eq('project_id', projectId);

    if (error) {
      console.error('Failed to load audio tracks', error);
      return [];
    }

    return (data ?? []).map((record: any): AudioTrack => ({
      id: record.id,
      type: 'audio',
      name: record.name ?? 'Audio Track',
      url: record.storage_path ?? '',
      startTime: record.start_time_ms ?? 0,
      duration: record.duration_ms ?? 0,
      endTime: record.end_time_ms ?? 0,
      trackIndex: 0,
      volume: record.volume ?? 1,
      isMuted: record.is_muted ?? false,
      fadeInDuration: 0,
      fadeOutDuration: 0,
    }));
  },

  async saveAudioTrack(projectId: string, track: AudioTrack): Promise<void> {
    console.warn('Audio track saving - limited support');
  },

  async deleteAudioTrack(trackId: string): Promise<void> {
    const { error } = await supabase.from('audio_tracks').delete().eq('id', trackId);
    if (error) {
      console.error('Failed to delete audio track', error);
    }
  },

  // Stub implementations for compositions table (doesn't exist yet)
  async getComposition(projectId: string): Promise<CompositionSettings> {
    console.warn('compositions table does not exist - returning defaults');
    return ensureCompositionDefaults();
  },

  async updateComposition(projectId: string, composition: Partial<CompositionSettings>): Promise<void> {
    console.warn('compositions table does not exist - operation skipped');
  },

  async getTimelineClip(projectId: string, clipId: string): Promise<Clip | null> {
    console.warn('timeline_clips table does not exist - returning null');
    return null;
  },

  async saveAllClipsAndTracks(
    projectId: string,
    clips: Clip[],
    audioTracks: AudioTrack[]
  ): Promise<void> {
    console.warn('Batch save operation skipped - tables do not exist');
  },

  // Additional stub methods
  mapMediaItemRecord(record: any): LibraryMediaItem | null {
    if (!record) return null;
    return {
      id: record.id,
      projectId: record.project_id,
      mediaType: record.media_type ?? 'video',
      name: record.name ?? 'Untitled',
      url: record.url ?? null,
      durationSeconds: typeof record.duration === 'number' ? record.duration : undefined,
      sourceType: record.source_type ?? undefined,
      status: record.status ?? undefined,
      thumbnailUrl: record.thumbnail_url ?? undefined,
    };
  },

  async getAudioTrack(projectIdOrTrackId: string, trackId?: string): Promise<AudioTrack | null> {
    console.warn('getAudioTrack - stub implementation');
    return null;
  },

  async getMediaItems(projectId: string): Promise<LibraryMediaItem[]> {
    return this.getMediaLibrary(projectId);
  },
};
