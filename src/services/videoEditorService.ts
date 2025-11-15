import { supabase } from '@/integrations/supabase/client';
import type { 
  AudioTrack, 
  Clip, 
  CompositionSettings, 
  LibraryMediaItem 
} from '@/store/videoEditorStore';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface DatabaseMediaItem {
  id: string;
  project_id: string;
  user_id: string;
  media_type: 'video' | 'image' | 'audio';
  name: string;
  url: string | null;
  duration_seconds: number | null;
  source_type: 'ai-generated' | 'uploaded' | 'stock' | null;
  source_workflow_id: string | null;
  source_node_id: string | null;
  width: number | null;
  height: number | null;
  fps: number | null;
  channels: number | null;
  sample_rate: number | null;
  status: 'processing' | 'completed' | 'failed';
  error_message: string | null;
  metadata: any;
  thumbnail_url: string | null;
  waveform_data: number[] | null;
  created_at: string;
  updated_at: string;
}

interface DatabaseTimelineClip {
  id: string;
  project_id: string;
  user_id: string;
  media_item_id: string;
  track_index: number;
  start_time: number;
  end_time: number;
  duration: number;
  trim_start: number;
  trim_end: number | null;
  position_x: number;
  position_y: number;
  scale_x: number;
  scale_y: number;
  rotation: number;
  opacity: number;
  keyframes: any;
  z_index: number;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface DatabaseAudioTrack {
  id: string;
  project_id: string;
  user_id: string;
  media_item_id: string | null;
  track_type: 'music' | 'voiceover' | 'sfx' | null;
  track_index: number | null;
  start_time: number | null;
  end_time: number | null;
  duration_ms: number | null;
  volume: number | null;
  is_muted: boolean | null;
  fade_in_duration: number | null;
  fade_out_duration: number | null;
  name: string;
  storage_path: string;
  storage_bucket: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface DatabaseComposition {
  id: string;
  project_id: string;
  user_id: string;
  width: number;
  height: number;
  fps: number;
  aspect_ratio: '16:9' | '9:16' | '1:1' | '4:3';
  background_color: string;
  duration: number;
  default_format: 'mp4' | 'webm' | 'mov';
  default_quality: 'low' | 'medium' | 'high' | '4k';
  created_at: string;
  updated_at: string;
}

// ============================================
// MAPPING FUNCTIONS
// ============================================

function mapDatabaseToLibraryItem(dbItem: DatabaseMediaItem): LibraryMediaItem {
  return {
    id: dbItem.id,
    projectId: dbItem.project_id,
    mediaType: dbItem.media_type,
    name: dbItem.name,
    url: dbItem.url,
    durationSeconds: dbItem.duration_seconds ?? undefined,
    sourceType: dbItem.source_type ?? undefined,
    status: dbItem.status,
    thumbnailUrl: dbItem.thumbnail_url ?? undefined,
  };
}

function mapDatabaseToClip(dbClip: DatabaseTimelineClip, mediaItem?: { media_type: string; name: string; url: string }): Clip {
  return {
    id: dbClip.id,
    mediaItemId: dbClip.media_item_id,
    type: mediaItem?.media_type === 'video' ? 'video' : 'image',
    name: mediaItem?.name || 'Untitled',
    url: mediaItem?.url || '',
    startTime: dbClip.start_time,
    duration: dbClip.duration,
    endTime: dbClip.end_time,
    trackIndex: dbClip.track_index,
    layer: dbClip.z_index,
    trimStart: dbClip.trim_start,
    trimEnd: dbClip.trim_end ?? undefined,
    transforms: {
      position: { x: dbClip.position_x, y: dbClip.position_y },
      scale: { x: dbClip.scale_x, y: dbClip.scale_y },
      rotation: dbClip.rotation,
      opacity: dbClip.opacity,
    },
  };
}

function mapClipToDatabase(clip: Clip, projectId: string, userId: string): Partial<DatabaseTimelineClip> {
  return {
    project_id: projectId,
    user_id: userId,
    media_item_id: clip.mediaItemId ?? '',
    track_index: clip.trackIndex ?? 0,
    start_time: clip.startTime,
    end_time: clip.endTime ?? (clip.startTime + clip.duration),
    duration: clip.duration,
    trim_start: clip.trimStart ?? 0,
    trim_end: clip.trimEnd ?? null,
    position_x: clip.transforms.position.x,
    position_y: clip.transforms.position.y,
    scale_x: clip.transforms.scale.x,
    scale_y: clip.transforms.scale.y,
    rotation: clip.transforms.rotation,
    opacity: clip.transforms.opacity,
    z_index: clip.layer,
    metadata: {},
  };
}

function mapDatabaseToAudioTrack(dbTrack: DatabaseAudioTrack, mediaItem?: { name: string; url: string }): AudioTrack {
  return {
    id: dbTrack.id,
    mediaItemId: dbTrack.media_item_id ?? undefined,
    type: 'audio',
    name: mediaItem?.name || dbTrack.name || 'Audio Track',
    url: mediaItem?.url || dbTrack.storage_path || '',
    startTime: dbTrack.start_time ?? 0,
    duration: dbTrack.duration_ms ?? 0,
    endTime: dbTrack.end_time ?? 0,
    volume: dbTrack.volume ?? 1,
    isMuted: dbTrack.is_muted ?? false,
    trackIndex: dbTrack.track_index ?? 0,
    fadeInDuration: dbTrack.fade_in_duration ?? 0,
    fadeOutDuration: dbTrack.fade_out_duration ?? 0,
  };
}

function mapAudioTrackToDatabase(track: AudioTrack, projectId: string, userId: string): Partial<DatabaseAudioTrack> {
  return {
    project_id: projectId,
    user_id: userId,
    media_item_id: track.mediaItemId ?? null,
    track_type: 'music',
    track_index: track.trackIndex ?? 0,
    start_time: track.startTime,
    end_time: track.endTime ?? (track.startTime + track.duration),
    duration_ms: track.duration,
    volume: track.volume,
    is_muted: track.isMuted,
    fade_in_duration: track.fadeInDuration ?? 0,
    fade_out_duration: track.fadeOutDuration ?? 0,
    name: track.name,
    storage_path: track.url,
    storage_bucket: 'audio',
    metadata: {},
  };
}

function mapDatabaseToComposition(dbComp: DatabaseComposition): CompositionSettings {
  return {
    width: dbComp.width,
    height: dbComp.height,
    fps: dbComp.fps,
    aspectRatio: dbComp.aspect_ratio,
    duration: dbComp.duration,
    backgroundColor: dbComp.background_color,
  };
}

// ============================================
// SERVICE IMPLEMENTATION
// ============================================

export const videoEditorService = {
  // ============================================
  // MEDIA LIBRARY
  // ============================================
  
  async getMediaLibrary(projectId: string): Promise<LibraryMediaItem[]> {
    try {
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as DatabaseMediaItem[]).map(mapDatabaseToLibraryItem);
    } catch (error) {
      console.error('getMediaLibrary error:', error);
      return [];
    }
  },

  async createMediaItem(item: Partial<LibraryMediaItem> & { projectId: string }): Promise<LibraryMediaItem | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('media_items')
        .insert({
          project_id: item.projectId,
          user_id: user.id,
          media_type: item.mediaType ?? 'video',
          name: item.name ?? 'Untitled',
          url: item.url ?? null,
          duration_seconds: item.durationSeconds ?? null,
          source_type: item.sourceType ?? null,
          status: item.status ?? 'completed',
          thumbnail_url: item.thumbnailUrl ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      return mapDatabaseToLibraryItem(data as DatabaseMediaItem);
    } catch (error) {
      console.error('createMediaItem error:', error);
      return null;
    }
  },

  async deleteMediaItem(itemId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('media_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('deleteMediaItem error:', error);
      return false;
    }
  },

  // ============================================
  // TIMELINE CLIPS
  // ============================================
  
  async getTimelineClips(projectId: string): Promise<Clip[]> {
    try {
      const { data, error } = await supabase
        .from('timeline_clips')
        .select(`
          *,
          media_items (
            media_type,
            name,
            url
          )
        `)
        .eq('project_id', projectId)
        .order('track_index, start_time');

      if (error) throw error;

      return (data as any[]).map((dbClip) => {
        const mediaItem = dbClip.media_items;
        return mapDatabaseToClip(dbClip, mediaItem);
      });
    } catch (error) {
      console.error('getTimelineClips error:', error);
      return [];
    }
  },

  async getTimelineClip(projectId: string, clipId: string): Promise<Clip | null> {
    try {
      const { data, error } = await supabase
        .from('timeline_clips')
        .select(`
          *,
          media_items (
            media_type,
            name,
            url
          )
        `)
        .eq('id', clipId)
        .eq('project_id', projectId)
        .single();

      if (error) throw error;

      const mediaItem = (data as any).media_items;
      return mapDatabaseToClip(data as DatabaseTimelineClip, mediaItem);
    } catch (error) {
      console.error('getTimelineClip error:', error);
      return null;
    }
  },

  async saveTimelineClip(projectId: string, clip: Clip): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const dbClip = mapClipToDatabase(clip, projectId, user.id);

      if (clip.id) {
        const { error } = await supabase
          .from('timeline_clips')
          .update(dbClip)
          .eq('id', clip.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('timeline_clips')
          .insert({ ...dbClip, id: clip.id });

        if (error) throw error;
      }
    } catch (error) {
      console.error('saveTimelineClip error:', error);
      throw error;
    }
  },

  async deleteTimelineClip(clipId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('timeline_clips')
        .delete()
        .eq('id', clipId);

      if (error) throw error;
    } catch (error) {
      console.error('deleteTimelineClip error:', error);
      throw error;
    }
  },

  // ============================================
  // AUDIO TRACKS
  // ============================================
  
  async getAudioTracks(projectId: string): Promise<AudioTrack[]> {
    try {
      const { data, error } = await supabase
        .from('audio_tracks')
        .select(`
          *,
          media_items (
            name,
            url
          )
        `)
        .eq('project_id', projectId)
        .order('track_index, start_time');

      if (error) throw error;

      return (data as any[]).map((dbTrack) => {
        const mediaItem = dbTrack.media_items;
        return mapDatabaseToAudioTrack(dbTrack, mediaItem);
      });
    } catch (error) {
      console.error('getAudioTracks error:', error);
      return [];
    }
  },

  async getAudioTrack(projectId: string, trackId: string): Promise<AudioTrack | null> {
    try {
      const { data, error } = await supabase
        .from('audio_tracks')
        .select(`
          *,
          media_items (
            name,
            url
          )
        `)
        .eq('id', trackId)
        .eq('project_id', projectId)
        .single();

      if (error) throw error;

      const mediaItem = (data as any).media_items;
      return mapDatabaseToAudioTrack(data as DatabaseAudioTrack, mediaItem);
    } catch (error) {
      console.error('getAudioTrack error:', error);
      return null;
    }
  },

  async saveAudioTrack(projectId: string, track: AudioTrack): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const dbTrack = mapAudioTrackToDatabase(track, projectId, user.id);

      if (track.id) {
        const { error } = await supabase
          .from('audio_tracks')
          .update(dbTrack)
          .eq('id', track.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('audio_tracks')
          .insert({ ...dbTrack, id: track.id });

        if (error) throw error;
      }
    } catch (error) {
      console.error('saveAudioTrack error:', error);
      throw error;
    }
  },

  async deleteAudioTrack(trackId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('audio_tracks')
        .delete()
        .eq('id', trackId);

      if (error) throw error;
    } catch (error) {
      console.error('deleteAudioTrack error:', error);
      throw error;
    }
  },

  // ============================================
  // COMPOSITION
  // ============================================
  
  async getComposition(projectId: string): Promise<CompositionSettings> {
    try {
      const { data, error } = await supabase
        .from('compositions')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return await this.createComposition(projectId);
      }

      return mapDatabaseToComposition(data as DatabaseComposition);
    } catch (error) {
      console.error('getComposition error:', error);
      return {
        width: 1920,
        height: 1080,
        fps: 30,
        aspectRatio: '16:9',
        duration: 0,
        backgroundColor: '#000000',
      };
    }
  },

  async createComposition(projectId: string): Promise<CompositionSettings> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const defaultComp = {
        project_id: projectId,
        user_id: user.id,
        width: 1920,
        height: 1080,
        fps: 30,
        aspect_ratio: '16:9' as const,
        background_color: '#000000',
        duration: 0,
        default_format: 'mp4' as const,
        default_quality: 'high' as const,
      };

      const { data, error } = await supabase
        .from('compositions')
        .insert(defaultComp)
        .select()
        .single();

      if (error) throw error;
      return mapDatabaseToComposition(data as DatabaseComposition);
    } catch (error) {
      console.error('createComposition error:', error);
      return {
        width: 1920,
        height: 1080,
        fps: 30,
        aspectRatio: '16:9',
        duration: 0,
        backgroundColor: '#000000',
      };
    }
  },

  async updateComposition(projectId: string, composition: Partial<CompositionSettings>): Promise<void> {
    try {
      const updates: Partial<DatabaseComposition> = {};
      
      if (composition.width) updates.width = composition.width;
      if (composition.height) updates.height = composition.height;
      if (composition.fps) updates.fps = composition.fps;
      if (composition.aspectRatio) updates.aspect_ratio = composition.aspectRatio;
      if (composition.backgroundColor) updates.background_color = composition.backgroundColor;
      if (composition.duration !== undefined) updates.duration = composition.duration;

      const { error } = await supabase
        .from('compositions')
        .update(updates)
        .eq('project_id', projectId);

      if (error) throw error;
    } catch (error) {
      console.error('updateComposition error:', error);
      throw error;
    }
  },

  // ============================================
  // BATCH OPERATIONS
  // ============================================
  
  async saveAllClipsAndTracks(
    projectId: string,
    clips: Clip[],
    audioTracks: AudioTrack[]
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const clipPromises = clips.map(clip => this.saveTimelineClip(projectId, clip));
      const trackPromises = audioTracks.map(track => this.saveAudioTrack(projectId, track));

      await Promise.all([...clipPromises, ...trackPromises]);
    } catch (error) {
      console.error('saveAllClipsAndTracks error:', error);
      throw error;
    }
  },

  // ============================================
  // PROJECT LOADING
  // ============================================
  
  async loadProject(projectId: string): Promise<{
    clips: Clip[];
    audioTracks: AudioTrack[];
    composition: CompositionSettings;
    mediaLibrary: LibraryMediaItem[];
  }> {
    try {
      const [clips, audioTracks, composition, mediaLibrary] = await Promise.all([
        this.getTimelineClips(projectId),
        this.getAudioTracks(projectId),
        this.getComposition(projectId),
        this.getMediaLibrary(projectId),
      ]);

      return {
        clips,
        audioTracks,
        composition,
        mediaLibrary,
      };
    } catch (error) {
      console.error('loadProject error:', error);
      throw error;
    }
  },

  // ============================================
  // UTILITY
  // ============================================
  
  mapMediaItemRecord(record: any): LibraryMediaItem | null {
    if (!record) return null;
    try {
      return mapDatabaseToLibraryItem(record as DatabaseMediaItem);
    } catch (error) {
      console.error('mapMediaItemRecord error:', error);
      return null;
    }
  },

  async getMediaItems(projectId: string): Promise<LibraryMediaItem[]> {
    return this.getMediaLibrary(projectId);
  },
};
