
// Types for the request body and response from the generate-storylines function

export interface StorylineRequestBody {
  project_id: string;
  generate_alternative?: boolean;
}

export interface StorylineGenerationResult {
  success: boolean;
  storyline_id?: string;
  scene_count?: number;
  character_count?: number;
  shot_count?: number; // Add shot count to the result
  is_alternative?: boolean;
  updated_settings?: string[];
  potential_genre?: string;
  potential_tone?: string;
  error?: string;
}

export interface StorylineInfo {
  title: string;
  description: string;
  full_story: string;
  tags: string[];
  visual_style_notes?: string;
  cinematography_notes?: string;
}

export interface ShotIdea {
  shot_type: string;
  description: string;
  visual_prompt: string;
  camera_movement: string;
  duration_seconds: number;
  composition_notes?: string;
}

export interface SceneInfo {
  scene_number: number;
  title: string;
  description: string;
  location?: string;
  lighting?: string;
  weather?: string;
  emotional_tone?: string;
  color_palette?: string;
  shot_ideas?: ShotIdea[];
}

export interface CharacterInfo {
  name: string;
  description: string;
}

export interface StorylineResponseData {
  primary_storyline: StorylineInfo;
  alternative_storylines?: StorylineInfo[];
  scene_breakdown?: SceneInfo[];
}

export interface AnalysisResponseData {
  potential_genre?: string;
  potential_tone?: string;
  characters?: CharacterInfo[];
  settings?: {
    locations: string[];
    time_period?: string;
    weather_conditions?: string[];
  };
}
