
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

// Media Items
export const mediaService = {
  async find(id: string): Promise<MediaItem | null> {
    try {
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      // Convert to MediaItem format
      return data ? {
        id: data.id,
        type: validateMediaType(data.media_type), // Reusing the function from VideoEditorProvider
        url: data.url || '',
        name: data.name,
        duration: data.duration,
        startTime: data.start_time,
        endTime: data.end_time
      } : null;
    } catch (error) {
      handleError(error, 'fetching media item');
      return null;
    }
  },
  
  async listByProject(projectId: string): Promise<MediaItem[]> {
    try {
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Convert to MediaItem format
      return (data || []).map(item => ({
        id: item.id,
        type: validateMediaType(item.media_type),
        url: item.url || '',
        name: item.name,
        duration: item.duration,
        startTime: item.start_time,
        endTime: item.end_time
      }));
    } catch (error) {
      handleError(error, 'listing media items');
      return [];
    }
  },
  
  async create(projectId: string, mediaItem: {
    type: 'video' | 'image' | 'audio';
    name: string;
    url?: string;
    duration?: number;
    startTime?: number;
    endTime?: number;
  }): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('media_items')
        .insert({
          project_id: projectId,
          media_type: mediaItem.type,
          name: mediaItem.name,
          url: mediaItem.url,
          duration: mediaItem.duration,
          start_time: mediaItem.startTime || 0,
          end_time: mediaItem.endTime
        })
        .select('id')
        .single();
        
      if (error) throw error;
      return data.id;
    } catch (error) {
      handleError(error, 'creating media item');
      throw error;
    }
  },
  
  async update(id: string, updates: {
    name?: string;
    url?: string;
    duration?: number;
    startTime?: number;
    endTime?: number;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('media_items')
        .update({
          name: updates.name,
          url: updates.url,
          duration: updates.duration,
          start_time: updates.startTime,
          end_time: updates.endTime
        })
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      handleError(error, 'updating media item');
    }
  },
  
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('media_items')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
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

// Define the validateMediaType function used earlier
const validateMediaType = (type: string): 'video' | 'image' | 'audio' => {
  if (type === 'video' || type === 'image' || type === 'audio') {
    return type;
  }
  // Default to 'image' if type is invalid
  console.warn(`Invalid media type: ${type}, defaulting to 'image'`);
  return 'image';
};

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

// Studio Block types
export interface StudioBlock {
  id: string;
  project_id: string;
  user_id: string;
  block_type: 'text' | 'image' | 'video';
  position_x: number;
  position_y: number;
  prompt?: string;
  generated_output_url?: string;
  selected_model?: string;
  generation_metadata?: any;
  created_at?: string;
  updated_at?: string;
}

// Studio Connection types
export interface StudioConnection {
  id: string;
  project_id: string;
  source_block_id: string;
  target_block_id: string;
  source_handle?: string;
  target_handle?: string;
  animated?: boolean;
  created_at?: string;
}

// Studio Blocks service
export const studioBlockService = {
  async listByProject(projectId: string): Promise<StudioBlock[]> {
    try {
      const { data, error } = await supabase
        .from('studio_blocks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      return (data || []).map(block => ({
        ...block,
        block_type: block.block_type as 'text' | 'image' | 'video'
      }));
    } catch (error) {
      handleError(error, 'listing studio blocks');
      return [];
    }
  },

  async create(block: Omit<StudioBlock, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('studio_blocks')
        .insert({ ...block, user_id: user.id })
        .select('id')
        .single();
        
      if (error) throw error;
      return data?.id || '';
    } catch (error) {
      handleError(error, 'creating studio block');
      throw error;
    }
  },

  async update(id: string, updates: Partial<Omit<StudioBlock, 'id' | 'project_id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<void> {
    try {
      const { error } = await supabase
        .from('studio_blocks')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      handleError(error, 'updating studio block');
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('studio_blocks')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      handleError(error, 'deleting studio block');
    }
  }
};

// Studio Connections service (assuming table exists)
export const studioConnectionService = {
  async listByProject(projectId: string): Promise<StudioConnection[]> {
    try {
      // Note: If studio_connections table doesn't exist yet, this will return empty array
      const { data, error } = await supabase
        .from('studio_connections' as any)
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.warn('studio_connections table may not exist yet:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.warn('Error listing studio connections:', error);
      return [];
    }
  },

  async create(connection: Omit<StudioConnection, 'id' | 'created_at'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('studio_connections' as any)
        .insert(connection)
        .select('id')
        .single();
        
      if (error) throw error;
      return data?.id || '';
    } catch (error) {
      console.warn('Error creating studio connection:', error);
      return '';
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('studio_connections' as any)
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      console.warn('Error deleting studio connection:', error);
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
  scenes: sceneService,
  characters: characterService,
  storylines: storylineService,
  shots: shotService,
  studioBlocks: studioBlockService,
  studioConnections: studioConnectionService
};

export default supabaseService;
