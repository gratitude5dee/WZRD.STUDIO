// Image status to track generation progress
export type ImageStatus = 'pending' | 'prompt_ready' | 'generating' | 'completed' | 'failed';

export interface ShotDetails {
  id: string;
  scene_id: string;
  project_id: string;
  shot_number: number;
  shot_type: string | null;
  prompt_idea: string | null;
  visual_prompt: string | null;
  dialogue: string | null;
  sound_effects: string | null;
  image_url: string | null;
  image_status: ImageStatus;
  audio_url: string | null;
  audio_status?: 'pending' | 'generating' | 'completed' | 'failed';
  failure_reason?: string | null;
  luma_generation_id: string | null;
  created_at?: string;
  updated_at?: string;
}

// Project details interface
export interface ProjectDetails {
  id: string;
  title: string;
  description?: string;
  aspect_ratio?: string;
  video_style?: string;
  cinematic_inspiration?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Scene details interface
export interface SceneDetails {
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

// Character details interface
export interface CharacterDetails {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Sidebar data interface
export interface SidebarData {
  projectTitle: string;
  projectDescription?: string | null;
  sceneDescription?: string | null;
  sceneLocation?: string | null;
  sceneLighting?: string | null;
  sceneWeather?: string | null;
  videoStyle?: string | null;
  characters: CharacterDetails[];
}
