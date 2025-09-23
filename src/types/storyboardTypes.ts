
// Image status to track generation progress
export type ImageStatus = 'pending' | 'prompt_ready' | 'generating' | 'completed' | 'failed';

// Audio status to track generation progress
export type AudioStatus = 'pending' | 'generating' | 'completed' | 'failed';

// Generation status to track API progress
export type GenerationStatus = 'pending' | 'submitted' | 'dreaming' | 'completed' | 'failed';

// Generation provider
export type GenerationProvider = 'claude' | 'luma_image' | 'luma_video';

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
  video_url: string | null;
  video_status: 'pending' | 'generating' | 'completed' | 'failed';
  audio_url: string | null;
  audio_status: AudioStatus;
  luma_generation_id: string | null;
  failure_reason?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Generation details interface
export interface GenerationDetails {
  id: string;
  user_id: string;
  project_id: string;
  shot_id: string | null;
  api_provider: GenerationProvider;
  external_request_id: string | null;
  request_payload: Record<string, any>;
  status: GenerationStatus;
  failure_reason: string | null;
  result_media_asset_id: string | null;
  callback_received_at: string | null;
  created_at: string;
  updated_at: string;
}

// Media asset interface
export interface MediaAsset {
  id: string;
  user_id: string;
  project_id: string | null;
  storage_provider: string;
  storage_path: string | null;
  cdn_url: string | null;
  file_name: string;
  mime_type: string;
  size_bytes: number | null;
  asset_type: 'image' | 'video' | 'audio';
  purpose: 'upload' | 'generation_result' | 'character_ref' | 'style_ref';
  created_at: string;
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
