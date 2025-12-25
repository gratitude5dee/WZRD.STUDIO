import { useCallback, useState } from 'react';
import { nanoid } from 'nanoid';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import type { AssetCategory, AssetType, AssetVisibility } from '@/types/assets';

interface UploadOptions {
  projectId?: string;
  assetType: AssetType;
  assetCategory: AssetCategory;
  visibility: AssetVisibility;
  onProgress?: (progress: number) => void;
}

interface UploadedAsset {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  thumbnailUrl?: string;
}

const DEFAULT_BUCKET = 'project-assets';

export const useProjectAssets = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadAsset = useCallback(
    async (file: File, options: UploadOptions): Promise<UploadedAsset | null> => {
      if (!user) {
        setError('Must be authenticated to upload');
        return null;
      }

      setUploading(true);
      setError(null);

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${nanoid(12)}.${fileExt}`;
        const storagePath = `${user.id}/${options.projectId ?? 'general'}/${fileName}`;

        options.onProgress?.(0);

        const { error: uploadError } = await supabase.storage
          .from(DEFAULT_BUCKET)
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        options.onProgress?.(100);

        const { data: urlData } = supabase.storage.from(DEFAULT_BUCKET).getPublicUrl(storagePath);

        const { data: asset, error: dbError } = await supabase
          .from('project_assets')
          .insert({
            user_id: user.id,
            project_id: options.projectId ?? null,
            file_name: fileName,
            original_file_name: file.name,
            mime_type: file.type,
            file_size_bytes: file.size,
            asset_type: options.assetType,
            asset_category: options.assetCategory,
            storage_provider: 'supabase',
            storage_bucket: DEFAULT_BUCKET,
            storage_path: storagePath,
            cdn_url: urlData?.publicUrl ?? null,
            media_metadata: {
              file_size: file.size,
            },
            visibility: options.visibility,
            used_in_pages: ['studio'],
          })
          .select()
          .single();

        if (dbError) throw dbError;

        return {
          id: asset.id,
          fileName: asset.original_file_name,
          fileType: asset.mime_type,
          fileSize: asset.file_size_bytes,
          url: urlData?.publicUrl ?? '',
          thumbnailUrl: asset.thumbnail_url ?? undefined,
        };
      } catch (err: any) {
        setError(err.message);
        return null;
      } finally {
        setUploading(false);
      }
    },
    [user]
  );

  const deleteAsset = useCallback(async (assetId: string, storagePath: string) => {
    await supabase.storage.from(DEFAULT_BUCKET).remove([storagePath]);
    await supabase.from('project_assets').delete().eq('id', assetId);
  }, []);

  const listAssets = useCallback(async (projectId?: string) => {
    const query = supabase.from('project_assets').select('*').order('created_at', { ascending: false });

    const { data, error: listError } = projectId ? await query.eq('project_id', projectId) : await query;

    if (listError) {
      setError(listError.message);
      return [];
    }

    return (data ?? []).map((asset) => ({
      ...asset,
      url: supabase.storage.from(DEFAULT_BUCKET).getPublicUrl(asset.storage_path).data.publicUrl,
      thumbnailUrl: asset.thumbnail_path
        ? supabase.storage.from(DEFAULT_BUCKET).getPublicUrl(asset.thumbnail_path).data.publicUrl
        : undefined,
    }));
  }, []);

  return {
    uploadAsset,
    deleteAsset,
    listAssets,
    uploading,
    error,
  };
};

export default useProjectAssets;
