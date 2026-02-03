
import { supabase } from '@/integrations/supabase/client';
import { MediaItem } from '@/store/videoEditorStore';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

// Project types
export interface Project {
  id: string;
  title: string;
  description?: string;
  aspect_ratio?: string;
  user_id: string;
  selected_storyline_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Track types
export interface Track {
  id: string;
  project_id: string;
  type: 'video' | 'audio';
  label: string;
  position: number;
  locked?: boolean;
  visible?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Track item types
export interface TrackItem {
  id: string;
  track_id: string;
  media_item_id: string;
  start_time: number;
  duration: number;
  position_x?: number;
  position_y?: number;
  scale?: number;
  rotation?: number;
  z_index?: number;
  created_at?: string;
  updated_at?: string;
}

// Keyframe types
export interface Keyframe {
  id: string;
  track_item_id: string;
  timestamp: number;
  properties: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface RenderJob {
  id: string;
  project_id: string;
  user_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  render_profile?: string | null;
  payload: Record<string, any>;
  result_bucket?: string | null;
  result_path?: string | null;
  progress: number;
  error_message?: string | null;
  created_at?: string;
  updated_at?: string;
  started_at?: string | null;
  completed_at?: string | null;
}

// Helper functions to validate and convert types
const validateTrackType = (type: string): 'video' | 'audio' => {
  if (type === 'video' || type === 'audio') {
    return type;
  }
  console.warn(`Invalid track type: ${type}, defaulting to 'video'`);
  return 'video';
};

const convertJsonToRecord = (json: Json): Record<string, any> => {
  if (typeof json === 'object' && json !== null) {
    return json as Record<string, any>;
  }
  console.warn('Invalid properties JSON, defaulting to empty object');
  return {};
};

// Error handling helper
const handleError = (error: any, action: string) => {
  console.error(`Error ${action}:`, error);
  toast.error(`Failed to ${action.toLowerCase()}`);
  throw error;
};

// Projects
export const projectService = {
  async find(id: string): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'fetching project');
      return null;
    }
  },
  
  async list(): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, 'listing projects');
      return [];
    }
  },
  
  async create(project: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...project,
          user_id: user.id
        })
        .select('id')
        .single();
        
      if (error) throw error;
      return data.id;
    } catch (error) {
      handleError(error, 'creating project');
      throw error;
    }
  },
  
  async update(id: string, updates: Partial<Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<void> {
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      handleError(error, 'updating project');
    }
  },
  
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      handleError(error, 'deleting project');
    }
  }
};

const MS_PER_SECOND = 1000;

const msToSeconds = (value?: number | null): number | undefined => {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value / MS_PER_SECOND;
  }
  return undefined;
};

const secondsToMs = (value?: number): number | null => {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return Math.round(value * MS_PER_SECOND);
  }
  return null;
};

const resolvePublicUrl = (bucket?: string | null, path?: string | null): string => {
  if (!bucket || !path) {
    return '';
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

type VideoClipRecord = {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  type: string;
  storage_bucket: string;
  storage_path: string;
  thumbnail_bucket: string | null;
  thumbnail_path: string | null;
  duration_ms: number;
  start_time_ms: number;
  end_time_ms: number;
  layer: number;
  created_at: string;
  updated_at: string;
  metadata: Json;
};

type AudioTrackRecord = {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  storage_bucket: string;
  storage_path: string;
  duration_ms: number;
  start_time_ms: number;
  end_time_ms: number;
  volume: number;
  is_muted: boolean;
  created_at: string;
  updated_at: string;
  metadata: Json;
};

const clipTypeToMediaType = (type?: string | null): 'video' | 'image' => {
  return type === 'image' ? 'image' : 'video';
};

const mapVideoClipToMediaItem = (clip: VideoClipRecord): MediaItem => {
  const type = clipTypeToMediaType(clip.type);
  const url = resolvePublicUrl(clip.storage_bucket, clip.storage_path);
  const thumbnailUrl = resolvePublicUrl(clip.thumbnail_bucket ?? undefined, clip.thumbnail_path ?? undefined);

  return {
    id: clip.id,
    type,
    url,
    name: clip.name,
    duration: msToSeconds(clip.duration_ms),
    startTime: msToSeconds(clip.start_time_ms),
    endTime: msToSeconds(clip.end_time_ms),
    layer: 0,
    transforms: {
      position: { x: 0, y: 0 },
      scale: { x: 1, y: 1 },
      rotation: 0,
      opacity: 1,
    },
  };
};

const mapAudioTrackToMediaItem = (track: AudioTrackRecord): MediaItem => {
  const url = resolvePublicUrl(track.storage_bucket, track.storage_path);

  return {
    id: track.id,
    type: 'audio',
    url,
    name: track.name,
    duration: msToSeconds(track.duration_ms),
    startTime: msToSeconds(track.start_time_ms),
    endTime: msToSeconds(track.end_time_ms),
    volume: 1,
    isMuted: false,
  };
};

const mapRenderJobRow = (job: any): RenderJob => ({
  id: job.id,
  project_id: job.project_id,
  user_id: job.user_id,
  status: job.status,
  render_profile: job.render_profile,
  payload: convertJsonToRecord(job.payload ?? {}),
  result_bucket: job.result_bucket ?? null,
  result_path: job.result_path ?? null,
  progress: typeof job.progress === 'number' ? job.progress : 0,
  error_message: job.error_message ?? null,
  created_at: job.created_at ?? undefined,
  updated_at: job.updated_at ?? undefined,
  started_at: job.started_at ?? null,
  completed_at: job.completed_at ?? null,
});

interface CreateMediaPayload {
  type: 'video' | 'image' | 'audio';
  name: string;
  bucket: 'videos' | 'audio';
  storagePath: string;
  durationMs?: number;
  startTimeMs?: number;
  endTimeMs?: number;
  metadata?: Record<string, any>;
  thumbnailPath?: string;
  thumbnailBucket?: string;
}

// Media Items
export const mediaService = {
  async find(id: string): Promise<MediaItem | null> {
    try {
      const { data: clip, error: clipError } = await supabase
        .from('video_clips')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (clipError && clipError.code !== 'PGRST116') throw clipError;
      if (clip) {
        return mapVideoClipToMediaItem(clip as VideoClipRecord);
      }

      const { data: track, error: trackError } = await supabase
        .from('audio_tracks')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (trackError && trackError.code !== 'PGRST116') throw trackError;
      if (track) {
        return mapAudioTrackToMediaItem(track as AudioTrackRecord);
      }

      return null;
    } catch (error) {
      handleError(error, 'fetching media item');
      return null;
    }
  },

  async listByProject(projectId: string): Promise<MediaItem[]> {
    try {
      const [videoClipsResult, audioTracksResult] = await Promise.all([
        supabase
          .from('video_clips')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true }),
        supabase
          .from('audio_tracks')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true })
      ]);

      if (videoClipsResult.error) throw videoClipsResult.error;
      if (audioTracksResult.error) throw audioTracksResult.error;

      const clips = (videoClipsResult.data || []).map((clip) => mapVideoClipToMediaItem(clip as VideoClipRecord));
      const tracks = (audioTracksResult.data || []).map((track) => mapAudioTrackToMediaItem(track as AudioTrackRecord));

      return [...clips, ...tracks];
    } catch (error) {
      handleError(error, 'listing media items');
      return [];
    }
  },

  async create(projectId: string, mediaItem: CreateMediaPayload): Promise<MediaItem> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (mediaItem.type === 'audio') {
        const { data, error } = await supabase
          .from('audio_tracks')
          .insert({
            project_id: projectId,
            user_id: user.id,
            name: mediaItem.name,
            storage_bucket: mediaItem.bucket,
            storage_path: mediaItem.storagePath,
            duration_ms: mediaItem.durationMs ?? null,
            start_time_ms: mediaItem.startTimeMs ?? null,
            end_time_ms: mediaItem.endTimeMs ?? null,
            metadata: mediaItem.metadata ?? {},
          })
          .select('*')
          .single();

        if (error) throw error;
        return mapAudioTrackToMediaItem(data as AudioTrackRecord);
      }

        const { data, error } = await supabase
          .from('video_clips')
          .insert({
            project_id: projectId,
            user_id: user.id,
            name: mediaItem.name,
            type: mediaItem.type,
            storage_bucket: mediaItem.bucket,
            storage_path: mediaItem.storagePath,
            thumbnail_bucket: mediaItem.thumbnailBucket ?? null,
            thumbnail_path: mediaItem.thumbnailPath ?? null,
            duration_ms: mediaItem.durationMs ?? 0,
            start_time_ms: mediaItem.startTimeMs ?? 0,
            end_time_ms: mediaItem.endTimeMs ?? 0,
            layer: 0,
            metadata: mediaItem.metadata ?? {},
          })
          .select('*')
          .single();

      if (error) throw error;
      return mapVideoClipToMediaItem(data as VideoClipRecord);
    } catch (error) {
      handleError(error, 'creating media item');
      throw error;
    }
  },

  async update(id: string, type: 'video' | 'image' | 'audio', updates: {
    name?: string;
    duration?: number;
    startTime?: number;
    endTime?: number;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      if (type === 'audio') {
        const updatePayload: Record<string, any> = {};
        if (typeof updates.name !== 'undefined') updatePayload.name = updates.name;
        if (typeof updates.duration !== 'undefined') updatePayload.duration_ms = secondsToMs(updates.duration);
        if (typeof updates.startTime !== 'undefined') updatePayload.start_time_ms = secondsToMs(updates.startTime);
        if (typeof updates.endTime !== 'undefined') updatePayload.end_time_ms = secondsToMs(updates.endTime);
        if (typeof updates.metadata !== 'undefined') updatePayload.metadata = updates.metadata;

        const { error } = await supabase
          .from('audio_tracks')
          .update(updatePayload)
          .eq('id', id);

        if (error) throw error;
        return;
      }

      const updatePayload: Record<string, any> = {};
      if (typeof updates.name !== 'undefined') updatePayload.name = updates.name;
      if (typeof updates.duration !== 'undefined') updatePayload.duration_ms = secondsToMs(updates.duration);
      if (typeof updates.startTime !== 'undefined') updatePayload.start_time_ms = secondsToMs(updates.startTime);
      if (typeof updates.endTime !== 'undefined') updatePayload.end_time_ms = secondsToMs(updates.endTime);
      if (typeof updates.metadata !== 'undefined') updatePayload.metadata = updates.metadata;

      const { error } = await supabase
        .from('video_clips')
        .update(updatePayload)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleError(error, 'updating media item');
    }
  },

  async delete(id: string, type: 'video' | 'image' | 'audio'): Promise<void> {
    try {
      if (type === 'audio') {
        const { data, error } = await supabase
          .from('audio_tracks')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        const track = data as AudioTrackRecord;
        if (track.storage_path) {
          await supabase.storage.from(track.storage_bucket).remove([track.storage_path]);
        }

        const { error: deleteError } = await supabase
          .from('audio_tracks')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;
        return;
      }

      const { data, error } = await supabase
        .from('video_clips')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const clip = data as VideoClipRecord;
      if (clip.storage_path) {
        await supabase.storage.from(clip.storage_bucket).remove([clip.storage_path]);
      }
      if (clip.thumbnail_path) {
        const thumbBucket = clip.thumbnail_bucket ?? 'thumbnails';
        await supabase.storage.from(thumbBucket).remove([clip.thumbnail_path]);
      }

      const { error: deleteError } = await supabase
        .from('video_clips')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
    } catch (error) {
      handleError(error, 'deleting media item');
    }
  }
};

// Tracks
export const trackService = {
  async find(id: string): Promise<Track | null> {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        return {
          ...data,
          type: validateTrackType(data.type)
        };
      }
      return null;
    } catch (error) {
      handleError(error, 'fetching track');
      return null;
    }
  },
  
  async listByProject(projectId: string): Promise<Track[]> {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true });
        
      if (error) throw error;
      
      return (data || []).map(track => ({
        ...track,
        type: validateTrackType(track.type)
      }));
    } catch (error) {
      handleError(error, 'listing tracks');
      return [];
    }
  },
  
  async create(track: {
    project_id: string;
    type: 'video' | 'audio';
    label?: string;
    position?: number;
    locked?: boolean;
    visible?: boolean;
  }): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .insert(track)
        .select('id')
        .single();
        
      if (error) throw error;
      return data.id;
    } catch (error) {
      handleError(error, 'creating track');
      throw error;
    }
  },
  
  async update(id: string, updates: Partial<Omit<Track, 'id' | 'project_id' | 'created_at' | 'updated_at'>>): Promise<void> {
    try {
      const { error } = await supabase
        .from('tracks')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      handleError(error, 'updating track');
    }
  },
  
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tracks')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      handleError(error, 'deleting track');
    }
  }
};

// Track Items
export const trackItemService = {
  async find(id: string): Promise<TrackItem | null> {
    try {
      const { data, error } = await supabase
        .from('track_items')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error, 'fetching track item');
      return null;
    }
  },
  
  async listByTrack(trackId: string): Promise<TrackItem[]> {
    try {
      const { data, error } = await supabase
        .from('track_items')
        .select('*')
        .eq('track_id', trackId)
        .order('start_time', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, 'listing track items');
      return [];
    }
  },
  
  async create(trackItem: Omit<TrackItem, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('track_items')
        .insert(trackItem)
        .select('id')
        .single();
        
      if (error) throw error;
      return data.id;
    } catch (error) {
      handleError(error, 'creating track item');
      throw error;
    }
  },
  
  async update(id: string, updates: Partial<Omit<TrackItem, 'id' | 'track_id' | 'media_item_id' | 'created_at' | 'updated_at'>>): Promise<void> {
    try {
      const { error } = await supabase
        .from('track_items')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      handleError(error, 'updating track item');
    }
  },
  
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('track_items')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      handleError(error, 'deleting track item');
    }
  }
};

// Keyframes
export const keyframeService = {
  async find(id: string): Promise<Keyframe | null> {
    try {
      const { data, error } = await supabase
        .from('keyframes')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        return {
          ...data,
          properties: convertJsonToRecord(data.properties)
        };
      }
      return null;
    } catch (error) {
      handleError(error, 'fetching keyframe');
      return null;
    }
  },
  
  async listByTrackItem(trackItemId: string): Promise<Keyframe[]> {
    try {
      const { data, error } = await supabase
        .from('keyframes')
        .select('*')
        .eq('track_item_id', trackItemId)
        .order('timestamp', { ascending: true });
        
      if (error) throw error;
      
      return (data || []).map(keyframe => ({
        ...keyframe,
        properties: convertJsonToRecord(keyframe.properties)
      }));
    } catch (error) {
      handleError(error, 'listing keyframes');
      return [];
    }
  },
  
  async create(keyframe: Omit<Keyframe, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('keyframes')
        .insert(keyframe)
        .select('id')
        .single();
        
      if (error) throw error;
      return data.id;
    } catch (error) {
      handleError(error, 'creating keyframe');
      throw error;
    }
  },
  
  async update(id: string, updates: Partial<Omit<Keyframe, 'id' | 'track_item_id' | 'created_at' | 'updated_at'>>): Promise<void> {
    try {
      const { error } = await supabase
        .from('keyframes')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      handleError(error, 'updating keyframe');
    }
  },
  
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('keyframes')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      handleError(error, 'deleting keyframe');
    }
  }
};

// Render jobs - Commented out as render_jobs table doesn't exist in current schema
// export const renderJobService = {
//   async listByProject(projectId: string): Promise<RenderJob[]> { ... }
//   async create(projectId: string, options: { ... }): Promise<RenderJob> { ... }
//   async update(id: string, updates: { ... }): Promise<void> { ... }
//   async delete(id: string): Promise<void> { ... }
// };

// Scene types
export interface Scene {
  id: string;
  project_id: string;
  storyline_id?: string;
  scene_number: number;
  title?: string;
  description?: string;
  location?: string;
  lighting?: string;
  weather?: string;
  voiceover?: string;
  created_at?: string;
  updated_at?: string;
}

// Character types
export interface Character {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Storyline types
export interface Storyline {
  id: string;
  project_id: string;
  title: string;
  description: string;
  full_story: string;
  tags?: string[];
  is_selected?: boolean;
  generated_by?: string;
  created_at?: string;
}

// Scenes service
export const sceneService = {
  async listByProject(projectId: string): Promise<Scene[]> {
    try {
      const { data, error } = await supabase
        .from('scenes')
        .select('*')
        .eq('project_id', projectId)
        .order('scene_number', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, 'listing scenes');
      return [];
    }
  },

  async create(scene: Omit<Scene, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('scenes')
        .insert(scene)
        .select('id')
        .single();
        
      if (error) throw error;
      return data.id;
    } catch (error) {
      handleError(error, 'creating scene');
      throw error;
    }
  },

  async update(id: string, updates: Partial<Omit<Scene, 'id' | 'project_id' | 'created_at' | 'updated_at'>>): Promise<void> {
    try {
      const { error } = await supabase
        .from('scenes')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      handleError(error, 'updating scene');
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('scenes')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      handleError(error, 'deleting scene');
    }
  }
};

// Characters service
export const characterService = {
  async listByProject(projectId: string): Promise<Character[]> {
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, 'listing characters');
      return [];
    }
  },

  async create(character: Omit<Character, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('characters')
        .insert(character)
        .select('id')
        .single();
        
      if (error) throw error;
      return data.id;
    } catch (error) {
      handleError(error, 'creating character');
      throw error;
    }
  },

  async update(id: string, updates: Partial<Omit<Character, 'id' | 'project_id' | 'created_at' | 'updated_at'>>): Promise<void> {
    try {
      const { error } = await supabase
        .from('characters')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      handleError(error, 'updating character');
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      handleError(error, 'deleting character');
    }
  }
};

// Storylines service
export const storylineService = {
  async listByProject(projectId: string): Promise<Storyline[]> {
    try {
      const { data, error } = await supabase
        .from('storylines')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, 'listing storylines');
      return [];
    }
  },

  async findSelected(projectId: string): Promise<Storyline | null> {
    try {
      const { data, error } = await supabase
        .from('storylines')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_selected', true)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.log('No selected storyline found or error:', error);
      return null;
    }
  },

  async setSelected(storylineId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('storylines')
        .update({ is_selected: true })
        .eq('id', storylineId);
        
      if (error) throw error;
    } catch (error) {
      handleError(error, 'selecting storyline');
    }
  },

  async clearSelection(projectId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('storylines')
        .update({ is_selected: false })
        .eq('project_id', projectId);
        
      if (error) throw error;
    } catch (error) {
      handleError(error, 'clearing storyline selection');
    }
  }
};

// Shot types
export interface Shot {
  id: string;
  scene_id: string;
  project_id: string;
  shot_number: number;
  shot_type?: string;
  prompt_idea?: string;
  visual_prompt?: string;
  dialogue?: string;
  sound_effects?: string;
  image_url?: string;
  image_status?: string;
  video_url?: string;
  video_status?: string;
  luma_generation_id?: string;
  audio_url?: string;
  audio_status?: string;
  failure_reason?: string;
  created_at?: string;
  updated_at?: string;
}

// Shots service
export const shotService = {
  async listByScene(sceneId: string): Promise<Shot[]> {
    try {
      const { data, error } = await supabase
        .from('shots')
        .select('*')
        .eq('scene_id', sceneId)
        .order('shot_number', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error, 'listing shots');
      return [];
    }
  },

  async create(shot: Omit<Shot, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('shots')
        .insert(shot)
        .select('id')
        .single();
        
      if (error) throw error;
      return data.id;
    } catch (error) {
      handleError(error, 'creating shot');
      throw error;
    }
  },

  async update(id: string, updates: Partial<Omit<Shot, 'id' | 'scene_id' | 'project_id' | 'created_at' | 'updated_at'>>): Promise<void> {
    try {
      const { error } = await supabase
        .from('shots')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      handleError(error, 'updating shot');
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('shots')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      handleError(error, 'deleting shot');
    }
  }
};

// Export all services
export const supabaseService = {
  projects: projectService,
  media: mediaService,
  tracks: trackService,
  trackItems: trackItemService,
  keyframes: keyframeService,
  // renderJobs: renderJobService, // Commented out - table doesn't exist
  scenes: sceneService,
  characters: characterService,
  storylines: storylineService,
  shots: shotService
};

export default supabaseService;
