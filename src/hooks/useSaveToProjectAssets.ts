import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export type ProjectAssetType = 'image' | 'video' | 'audio';

interface SaveAssetInput {
  url: string;
  type: ProjectAssetType;
  prompt?: string;
  model?: string;
  name?: string;
  metadata?: Record<string, unknown>;
  projectId?: string;
}

interface SaveAssetResult {
  id: string | null;
  url: string;
}

const DEFAULT_CONTENT_TYPES: Record<ProjectAssetType, string> = {
  image: 'image/png',
  video: 'video/mp4',
  audio: 'audio/mpeg',
};

const getExtension = (contentType: string, type: ProjectAssetType): string => {
  if (contentType.includes('png')) return 'png';
  if (contentType.includes('jpeg') || contentType.includes('jpg')) return 'jpg';
  if (contentType.includes('webp')) return 'webp';
  if (contentType.includes('gif')) return 'gif';
  if (contentType.includes('mp4')) return 'mp4';
  if (contentType.includes('quicktime')) return 'mov';
  if (contentType.includes('webm')) return 'webm';
  if (contentType.includes('wav')) return 'wav';
  if (contentType.includes('ogg')) return 'ogg';
  if (contentType.includes('mpeg') || contentType.includes('mp3')) return 'mp3';

  switch (type) {
    case 'image':
      return 'png';
    case 'video':
      return 'mp4';
    case 'audio':
      return 'mp3';
  }
};

const buildAssetName = (type: ProjectAssetType, prompt?: string) => {
  const trimmedPrompt = prompt?.trim();
  if (trimmedPrompt) {
    return trimmedPrompt.length > 60 ? `${trimmedPrompt.slice(0, 57)}...` : trimmedPrompt;
  }
  return `AI ${type.charAt(0).toUpperCase() + type.slice(1)} ${new Date().toLocaleTimeString()}`;
};

export const useSaveToProjectAssets = (defaultProjectId?: string) => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveAsset = useCallback(
    async ({ url, type, prompt, model, name, metadata, projectId }: SaveAssetInput): Promise<SaveAssetResult | null> => {
      const resolvedProjectId = projectId ?? defaultProjectId;
      if (!resolvedProjectId) {
        const message = 'Project not found. Please open a project before saving assets.';
        setError(message);
        toast.error(message);
        return null;
      }

      setIsSaving(true);
      setError(null);

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to download asset: ${response.statusText}`);
        }

        const blob = await response.blob();
        const contentType = blob.type || DEFAULT_CONTENT_TYPES[type];
        const extension = getExtension(contentType, type);
        const storageName = `${type}-${Date.now()}-${crypto.randomUUID()}.${extension}`;
        const storagePath = `${resolvedProjectId}/${storageName}`;

        const { error: uploadError } = await supabase.storage
          .from('project-assets')
          .upload(storagePath, blob, {
            cacheControl: '3600',
            upsert: false,
            contentType,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from('project-assets')
          .getPublicUrl(storagePath);

        const metadataPayload = {
          ...(metadata ?? {}),
          ...(prompt ? { prompt } : {}),
          ...(model ? { model } : {}),
        };

        const { data: savedAsset, error: insertError } = await (supabase
          .from('project_assets' as any)
          .insert({
            project_id: resolvedProjectId,
            name: name ?? buildAssetName(type, prompt),
            url: urlData.publicUrl,
            type,
            size: blob.size,
            thumbnail_url: type === 'image' ? urlData.publicUrl : null,
            metadata: Object.keys(metadataPayload).length ? metadataPayload : null,
          })
          .select('id')
          .single() as any);

        if (insertError) {
          throw insertError;
        }

        toast.success('Saved to project assets');

        return {
          id: savedAsset?.id ?? null,
          url: urlData.publicUrl,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save asset.';
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [defaultProjectId]
  );

  return { saveAsset, isSaving, error };
};

export default useSaveToProjectAssets;
