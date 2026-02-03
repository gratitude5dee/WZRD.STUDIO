import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';

export interface ProjectSettings {
  id: string;
  projectId: string;
  baseTextModel: string;
  baseImageModel: string;
  baseVideoModel: string;
  baseAudioModel?: string;
  updatedAt: Date;
}

export const TEXT_MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google' },
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', provider: 'Meta' },
];

export const IMAGE_MODELS = [
  { id: 'flux-1.1-pro', name: 'FLUX 1.1 Pro', provider: 'Black Forest Labs', speed: '~10s' },
  { id: 'flux-2-turbo', name: 'FLUX 2 Turbo', provider: 'Black Forest Labs', speed: '~3s' },
  { id: 'flux-2-flex', name: 'FLUX 2 Flex', provider: 'Black Forest Labs', speed: '~5s' },
  { id: 'ideogram-v2', name: 'Ideogram v2', provider: 'Ideogram', speed: '~15s' },
  { id: 'dall-e-3', name: 'DALL-E 3', provider: 'OpenAI', speed: '~20s' },
  { id: 'midjourney-v6', name: 'Midjourney v6', provider: 'Midjourney', speed: '~30s' },
  { id: 'stable-diffusion-3', name: 'SD 3.0', provider: 'Stability AI', speed: '~8s' },
];

export const VIDEO_MODELS = [
  { id: 'minimax-video-01', name: 'MiniMax Video', provider: 'MiniMax', speed: '~2min' },
  { id: 'runway-gen3', name: 'Runway Gen-3', provider: 'Runway', speed: '~45s' },
  { id: 'kling-1.5', name: 'Kling 1.5', provider: 'Kuaishou', speed: '~3min' },
  { id: 'luma-ray2', name: 'Luma Ray 2', provider: 'Luma AI', speed: '~1min' },
  { id: 'pika-1.5', name: 'Pika 1.5', provider: 'Pika Labs', speed: '~30s' },
];

interface ProjectSettingsState {
  settings: ProjectSettings | null;
  isLoading: boolean;
  error: string | null;

  fetchSettings: (projectId: string) => Promise<void>;
  updateSettings: (projectId: string, updates: Partial<ProjectSettings>) => Promise<void>;
  setBaseTextModel: (projectId: string, modelId: string) => Promise<void>;
  setBaseImageModel: (projectId: string, modelId: string) => Promise<void>;
  setBaseVideoModel: (projectId: string, modelId: string) => Promise<void>;
}

export const useProjectSettingsStore = create<ProjectSettingsState>()(
  persist(
    (set, get) => ({
      settings: null,
      isLoading: false,
      error: null,

      fetchSettings: async (projectId: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await (supabase
            .from('project_settings' as any)
            .select('*')
            .eq('project_id', projectId)
            .single() as any);

          if (error && error.code !== 'PGRST116') throw error;

          if (data) {
            const settingsData = data as any;
            set({
              settings: {
                id: settingsData.id,
                projectId: settingsData.project_id,
                baseTextModel: settingsData.base_text_model || 'gpt-4o',
                baseImageModel: settingsData.base_image_model || 'flux-2-turbo',
                baseVideoModel: settingsData.base_video_model || 'minimax-video-01',
                baseAudioModel: settingsData.base_audio_model,
                updatedAt: new Date(settingsData.updated_at),
              },
              isLoading: false,
            });
          } else {
            const { data: newData } = await (supabase
              .from('project_settings' as any)
              .insert({
                project_id: projectId,
                base_text_model: 'gpt-4o',
                base_image_model: 'flux-2-turbo',
                base_video_model: 'minimax-video-01',
              })
              .select()
              .single() as any);

            if (newData) {
              const newSettingsData = newData as any;
              set({
                settings: {
                  id: newSettingsData.id,
                  projectId: newSettingsData.project_id,
                  baseTextModel: newSettingsData.base_text_model,
                  baseImageModel: newSettingsData.base_image_model,
                  baseVideoModel: newSettingsData.base_video_model,
                  updatedAt: new Date(newSettingsData.updated_at),
                },
                isLoading: false,
              });
            }
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      updateSettings: async (projectId: string, updates: Partial<ProjectSettings>) => {
        try {
          const { error } = await (supabase
            .from('project_settings' as any)
            .update({
              base_text_model: updates.baseTextModel,
              base_image_model: updates.baseImageModel,
              base_video_model: updates.baseVideoModel,
              base_audio_model: updates.baseAudioModel,
              updated_at: new Date().toISOString(),
            })
            .eq('project_id', projectId) as any);

          if (error) throw error;

          set((state) => ({
            settings: state.settings ? { ...state.settings, ...updates } : null,
          }));
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      setBaseTextModel: async (projectId, modelId) => {
        await get().updateSettings(projectId, { baseTextModel: modelId });
      },

      setBaseImageModel: async (projectId, modelId) => {
        await get().updateSettings(projectId, { baseImageModel: modelId });
      },

      setBaseVideoModel: async (projectId, modelId) => {
        await get().updateSettings(projectId, { baseVideoModel: modelId });
      },
    }),
    {
      name: 'wzrd-project-settings',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
