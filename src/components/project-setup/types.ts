export type ProjectSetupTab = 'concept' | 'storyline' | 'settings' | 'breakdown';

export type ProjectFormat =
  | 'custom'
  | 'short_film'
  | 'commercial'
  | 'music_video'
  | 'infotainment';

export interface AdBriefData {
  product: string;
  targetAudience: string;
  mainMessage: string;
  callToAction: string;
  adDuration: '15s' | '30s' | '60s' | '90s';
  platform: 'tv' | 'social' | 'youtube' | 'streaming' | 'all';
  brandGuidelines?: string;
  competitorAnalysis?: string;
  kpis?: string[];
}

export interface MusicVideoData {
  artistName: string;
  trackTitle: string;
  genre: string;
  lyrics?: string;
  moodBoard?: string[];
  performanceRatio: number;
}

export interface InfotainmentData {
  topic: string;
  educationalGoals: string[];
  targetDemographic: string;
  hostStyle: 'casual' | 'professional' | 'documentary';
  segments?: string[];
}

export interface ProjectData {
  title: string;
  concept: string;
  genre: string;
  tone: string;
  format: ProjectFormat;
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
  styleReferenceAssetId?: string;

  // Format-specific data
  adBrief?: AdBriefData;
  musicVideoData?: MusicVideoData;
  infotainmentData?: InfotainmentData;

  // VoiceOver selection
  voiceoverId?: string;
  voiceoverName?: string;
  voiceoverPreviewUrl?: string;
}

// Character type definition for reuse across components
export interface Character {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  image_status?: 'pending' | 'generating' | 'completed' | 'failed';
  image_generation_error?: string | null;
}

// Storyline type definition
export interface Storyline {
  id: string;
  project_id: string;
  title: string;
  description: string;
  full_story: string;
  tags?: string[];
  is_selected?: boolean;
  status?: 'pending' | 'generating' | 'complete' | 'failed';
  failure_reason?: string | null;
  created_at?: string;
}
