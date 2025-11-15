import { supabase } from '@/integrations/supabase/client';
import type { AudioTrack, Clip, CompositionSettings, LibraryMediaItem } from '@/store/videoEditorStore';

const DEFAULT_TRANSFORM = {
  position: { x: 0, y: 0 },
  scale: { x: 1, y: 1 },
  rotation: 0,
  opacity: 1,
};

const mapMediaItemRecord = (record: any): LibraryMediaItem | null => {
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
};

const mapClipRecord = (record: any): Clip | null => {
  if (!record?.media_items) {
    return null;
  }

  const media = record.media_items;
  if (!media.url) {
    return null;
  }

  const startTime = typeof record.start_time === 'number' ? record.start_time : 0;
  const duration = typeof record.duration === 'number'
    ? record.duration
    : Math.max(0, (record.end_time ?? 0) - startTime);

  const transform = record.transform && typeof record.transform === 'object'
    ? {
        position: {
          x: record.transform.position?.x ?? DEFAULT_TRANSFORM.position.x,
          y: record.transform.position?.y ?? DEFAULT_TRANSFORM.position.y,
        },
        scale: {
          x: record.transform.scale?.x ?? DEFAULT_TRANSFORM.scale.x,
          y: record.transform.scale?.y ?? DEFAULT_TRANSFORM.scale.y,
        },
        rotation: record.transform.rotation ?? DEFAULT_TRANSFORM.rotation,
        opacity: record.transform.opacity ?? DEFAULT_TRANSFORM.opacity,
      }
    : DEFAULT_TRANSFORM;

  return {
    id: record.id,
    mediaItemId: media.id,
    type: media.media_type === 'image' ? 'image' : 'video',
    name: media.name ?? 'Untitled Clip',
    url: media.url,
    startTime,
    duration,
    endTime: typeof record.end_time === 'number' ? record.end_time : startTime + duration,
    trackIndex: record.track_index ?? 0,
    layer: record.z_index ?? 0,
    trimStart: typeof record.trim_start === 'number' ? record.trim_start : 0,
    trimEnd: typeof record.trim_end === 'number' ? record.trim_end : undefined,
    transforms: transform,
  };
};

const mapAudioTrackRecord = (record: any): AudioTrack | null => {
  if (!record?.media_items || !record.media_items.url) {
    return null;
  }

  const startTime = typeof record.start_time === 'number' ? record.start_time : 0;
  const duration = typeof record.duration === 'number'
    ? record.duration
    : Math.max(0, (record.end_time ?? 0) - startTime);

  return {
    id: record.id,
    mediaItemId: record.media_items.id,
    type: 'audio',
    name: record.media_items.name ?? 'Audio Track',
    url: record.media_items.url,
    startTime,
    duration,
    endTime: typeof record.end_time === 'number' ? record.end_time : startTime + duration,
    trackIndex: record.track_index ?? 0,
    volume: typeof record.volume === 'number' ? record.volume : 1,
    isMuted: Boolean(record.is_muted),
    fadeInDuration: typeof record.fade_in_duration === 'number' ? record.fade_in_duration : 0,
    fadeOutDuration: typeof record.fade_out_duration === 'number' ? record.fade_out_duration : 0,
  };
};

const clipToPayload = (projectId: string, clip: Clip) => ({
  id: clip.id,
  project_id: projectId,
  media_item_id: clip.mediaItemId,
  track_index: clip.trackIndex ?? 0,
  start_time: clip.startTime ?? 0,
  end_time: clip.endTime ?? (clip.startTime ?? 0) + (clip.duration ?? 0),
  duration: clip.duration ?? 0,
  trim_start: clip.trimStart ?? 0,
  trim_end: clip.trimEnd ?? null,
  transform: clip.transforms ?? DEFAULT_TRANSFORM,
  z_index: clip.layer ?? 0,
});

const audioTrackToPayload = (projectId: string, track: AudioTrack) => ({
  id: track.id,
  project_id: projectId,
  media_item_id: track.mediaItemId,
  track_index: track.trackIndex ?? 0,
  start_time: track.startTime ?? 0,
  end_time: track.endTime ?? (track.startTime ?? 0) + (track.duration ?? 0),
  duration: track.duration ?? 0,
  volume: track.volume ?? 1,
  is_muted: Boolean(track.isMuted),
  fade_in_duration: track.fadeInDuration ?? 0,
  fade_out_duration: track.fadeOutDuration ?? 0,
});

const ensureCompositionDefaults = (composition?: Partial<CompositionSettings> | null): CompositionSettings => ({
  width: composition?.width ?? 1920,
  height: composition?.height ?? 1080,
  fps: composition?.fps ?? 30,
  aspectRatio: (composition?.aspectRatio as CompositionSettings['aspectRatio']) ?? '16:9',
  duration: composition?.duration ?? 0,
  backgroundColor: composition?.backgroundColor ?? '#000000',
});

export const videoEditorService = {
  mapMediaItemRecord,

  async getMediaItems(projectId: string): Promise<LibraryMediaItem[]> {
    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load media items', error);
      return [];
    }

    return (data ?? [])
      .map(mapMediaItemRecord)
      .filter((item): item is LibraryMediaItem => Boolean(item));
  },

  async getTimelineClips(projectId: string): Promise<Clip[]> {
    const { data, error } = await supabase
      .from('timeline_clips')
      .select('*, media_items:media_item_id (id, media_type, name, url)')
      .eq('project_id', projectId)
      .order('track_index', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Failed to load timeline clips', error);
      return [];
    }

    return (data ?? [])
      .map(mapClipRecord)
      .filter((clip): clip is Clip => Boolean(clip));
  },

  async saveTimelineClip(projectId: string, clip: Clip): Promise<void> {
    if (!clip.mediaItemId) {
      return;
    }

    const payload = clipToPayload(projectId, clip);
    const { error } = await supabase.from('timeline_clips').upsert(payload);

    if (error) {
      console.error('Failed to save timeline clip', error);
    }
  },

  async deleteTimelineClip(clipId: string): Promise<void> {
    const { error } = await supabase.from('timeline_clips').delete().eq('id', clipId);
    if (error) {
      console.error('Failed to delete clip', error);
    }
  },

  async getAudioTracks(projectId: string): Promise<AudioTrack[]> {
    const { data, error } = await supabase
      .from('audio_tracks')
      .select('*, media_items:media_item_id (id, name, url)')
      .eq('project_id', projectId)
      .order('track_index', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Failed to load audio tracks', error);
      return [];
    }

    return (data ?? [])
      .map(mapAudioTrackRecord)
      .filter((track): track is AudioTrack => Boolean(track));
  },

  async saveAudioTrack(projectId: string, track: AudioTrack): Promise<void> {
    if (!track.mediaItemId) {
      return;
    }

    const payload = audioTrackToPayload(projectId, track);
    const { error } = await supabase.from('audio_tracks').upsert(payload);

    if (error) {
      console.error('Failed to save audio track', error);
    }
  },

  async deleteAudioTrack(trackId: string): Promise<void> {
    const { error } = await supabase.from('audio_tracks').delete().eq('id', trackId);
    if (error) {
      console.error('Failed to delete audio track', error);
    }
  },

  async getComposition(projectId: string): Promise<CompositionSettings> {
    const { data, error } = await supabase
      .from('compositions')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error) {
      // Create default composition if not found
      const defaults = ensureCompositionDefaults();
      const { error: insertError } = await supabase.from('compositions').insert({
        project_id: projectId,
        width: defaults.width,
        height: defaults.height,
        fps: defaults.fps,
        aspect_ratio: defaults.aspectRatio,
        background_color: defaults.backgroundColor,
        duration: defaults.duration,
      });

      if (insertError) {
        console.error('Failed to create default composition', insertError);
      }

      return defaults;
    }

    return ensureCompositionDefaults({
      width: data.width,
      height: data.height,
      fps: data.fps,
      aspectRatio: data.aspect_ratio,
      backgroundColor: data.background_color,
      duration: data.duration,
    });
  },

  async updateComposition(projectId: string, composition: Partial<CompositionSettings>): Promise<void> {
    const payload: Record<string, any> = {};
    if (composition.width !== undefined) payload.width = composition.width;
    if (composition.height !== undefined) payload.height = composition.height;
    if (composition.fps !== undefined) payload.fps = composition.fps;
    if (composition.aspectRatio !== undefined) payload.aspect_ratio = composition.aspectRatio;
    if (composition.backgroundColor !== undefined) payload.background_color = composition.backgroundColor;
    if (composition.duration !== undefined) payload.duration = composition.duration;

    if (Object.keys(payload).length === 0) {
      return;
    }

    const { error } = await supabase
      .from('compositions')
      .upsert({ project_id: projectId, ...payload }, { onConflict: 'project_id' });

    if (error) {
      console.error('Failed to update composition', error);
    }
  },

  async getTimelineClip(projectId: string, clipId: string): Promise<Clip | null> {
    const { data, error } = await supabase
      .from('timeline_clips')
      .select('*, media_items:media_item_id (id, media_type, name, url)')
      .eq('project_id', projectId)
      .eq('id', clipId)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch clip', error);
      return null;
    }

    return data ? mapClipRecord(data) : null;
  },

  async getAudioTrack(projectId: string, trackId: string): Promise<AudioTrack | null> {
    const { data, error } = await supabase
      .from('audio_tracks')
      .select('*, media_items:media_item_id (id, name, url)')
      .eq('project_id', projectId)
      .eq('id', trackId)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch audio track', error);
      return null;
    }

    return data ? mapAudioTrackRecord(data) : null;
  },
};
