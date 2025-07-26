
export type ProjectSetupTab = 'concept' | 'storyline' | 'settings' | 'breakdown';

export interface ProjectData {
  title: string;
  concept: string;
  genre: string;
  tone: string;
  format: string;
  customFormat?: string;
  specialRequests?: string;
  addVoiceover: boolean;
  // Commercial-specific fields
  product?: string;
  targetAudience?: string;
  mainMessage?: string;
  callToAction?: string;
  // Additional field to track AI or manual mode
  conceptOption: 'ai' | 'manual';

  // Settings fields
  aspectRatio?: string;
  videoStyle?: string;
  cinematicInspiration?: string;
  styleReferenceUrl?: string;
}

// Character type definition for reuse across components
export interface Character {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
}

// Storyline type definition
export interface Storyline {
  id: string;
  project_id: string;
  title: string;
  description: string;
  full_story: string;
  tags: string[];
  is_selected: boolean;
  created_at?: string;
}
