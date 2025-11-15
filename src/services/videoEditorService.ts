import { supabase } from '@/integrations/supabase/client';
import type { 
  AudioTrack, 
  Clip, 
  CompositionSettings, 
  LibraryMediaItem 
} from '@/store/videoEditorStore';

// Simplified database types to reduce type complexity
type DatabaseMediaItem = {
  id: string;
  project_id: string;
  user_id: string;
  media_type: 'video' | 'image' | 'audio';
  name: string;
  url: string | null;
  status: 'processing' | 'completed' | 'failed';
  duration_seconds?: number | null;
  created_at: string;
  updated_at: string;
};

type DatabaseTimelineClip = {
  id: string;
  project_id: string;
  user_id: string;
  media_item_id: string;
  track_index: number;
  start_time: number;
  end_time: number;
  duration: number;
  z_index: number;
  created_at: string;
  updated_at: string;
};

type DatabaseAudioTrack = {
  id: string;
  project_id: string;
  user_id: string;
  media_item_id: string | null;
  start_time: number | null;
  end_time: number | null;
  duration_ms: number | null;
  name: string;
  storage_path: string;
  volume: number | null;
  is_muted: boolean | null;
  created_at: string;
  updated_at: string;
};

type DatabaseComposition = {
  id: string;
  project_id: string;
  user_id: string;
  width: number;
  height: number;
  fps: number;
  aspect_ratio: '16:9' | '9:16' | '1:1' | '4:3';
  background_color: string;
  duration: number;
  created_at: string;
  updated_at: string;
};

export const videoEditorService = {
  async getMediaLibrary(projectId: string): Promise<LibraryMediaItem[]> {
    try {
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data as DatabaseMediaItem[]).map(item => ({
        id: item.id,
        projectId: item.project_id,
        mediaType: item.media_type,
        name: item.name,
        url: item.url,
        durationSeconds: item.duration_seconds ?? undefined,
        status: item.status,
      }));
    } catch (error) {
      console.error('getMediaLibrary error:', error);
      return [];
    }
  },

  async getTimelineClips(projectId: string): Promise<Clip[]> {
    try {
      const { data, error } = await supabase
        .from('timeline_clips')
        .select('*')
        .eq('project_id', projectId)
        .order('track_index, start_time');

      if (error) throw error;

      return (data as DatabaseTimelineClip[]).map(clip => ({
        id: clip.id,
        mediaItemId: clip.media_item_id,
        type: 'video', // Default, adjust as needed
        name: 'Untitled',
        url: '',
        startTime: clip.start_time,
        duration: clip.duration,
        endTime: clip.end_time,
        trackIndex: clip.track_index,
        layer: clip.z_index,
        transforms: {
          position: { x: 0, y: 0 },
          scale: { x: 1, y: 1 },
          rotation: 0,
          opacity: 1,
        },
      }));
    } catch (error) {
      console.error('getTimelineClips error:', error);
      return [];
    }
  },

  async getAudioTracks(projectId: string): Promise<AudioTrack[]> {
    try {
      const { data, error } = await supabase
        .from('audio_tracks')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;

      return (data as DatabaseAudioTrack[]).map(track => ({
        id: track.id,
        mediaItemId: track.media_item_id ?? undefined,
        type: 'audio',
        name: track.name,
        url: track.storage_path,
        startTime: track.start_time ?? 0,
        duration: track.duration_ms ?? 0,
        endTime: track.end_time ?? 0,
        volume: track.volume ?? 1,
        isMuted: track.is_muted ?? false,
        trackIndex: 0,
        fadeInDuration: 0,
        fadeOutDuration: 0,
      }));
    } catch (error) {
      console.error('getAudioTracks error:', error);
      return [];
    }
  },

  async getComposition(projectId: string): Promise<CompositionSettings> {
    try {
      const { data, error } = await supabase
        .from('compositions')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return this.createComposition(projectId);
      }

      const item = data as DatabaseComposition;
      return {
        width: item.width,
        height: item.height,
        fps: item.fps,
        aspectRatio: item.aspect_ratio,
        duration: item.duration,
        backgroundColor: item.background_color,
      };
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
        aspect_ratio: '16:9',
        background_color: '#000000',
        duration: 0,
      };

      const { data, error } = await supabase
        .from('compositions')
        .insert(defaultComp)
        .select()
        .single();

      if (error) throw error;
      return {
        width: data.width,
        height: data.height,
        fps: data.fps,
        aspectRatio: data.aspect_ratio,
        duration: data.duration,
        backgroundColor: data.background_color,
      };
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

  mapMediaItemRecord(record: any): LibraryMediaItem | null {
    if (!record) return null;
    try {
      return {
        id: record.id,
        projectId: record.project_id,
        mediaType: record.media_type,
        name: record.name,
        url: record.url,
        durationSeconds: record.duration_seconds ?? undefined,
        sourceType: record.source_type ?? undefined,
        status: record.status,
        thumbnailUrl: record.thumbnail_url ?? undefined,
      };
    } catch (error) {
      console.error('mapMediaItemRecord error:', error);
      return null;
    }
  },

  async getMediaItems(projectId: string): Promise<LibraryMediaItem[]> {
    return this.getMediaLibrary(projectId);
  },
};