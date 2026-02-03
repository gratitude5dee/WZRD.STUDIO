import { useCallback, useState } from 'react';
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

interface StoredAsset {
  id: string;
  file_name: string;
  original_file_name: string;
  mime_type: string;
  file_size_bytes: number;
  storage_path: string;
  thumbnail_path?: string;
  cdn_url?: string;
  created_at: string;
}

const DEFAULT_BUCKET = 'project-media';

// Generate a simple unique ID
const generateId = () => Math.random().toString(36).substring(2, 14);

export const useProjectAssets = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assets, setAssets] = useState<StoredAsset[]>([]);

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
        const fileName = `${generateId()}.${fileExt}`;
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

        // Store asset metadata locally since project_assets table may not exist
        const newAsset: StoredAsset = {
          id: generateId(),
          file_name: fileName,
          original_file_name: file.name,
          mime_type: file.type,
          file_size_bytes: file.size,
          storage_path: storagePath,
          cdn_url: urlData?.publicUrl ?? undefined,
          created_at: new Date().toISOString(),
        };

        setAssets(prev => [newAsset, ...prev]);

        return {
          id: newAsset.id,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          url: urlData?.publicUrl ?? '',
          thumbnailUrl: undefined,
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
    setAssets(prev => prev.filter(a => a.id !== assetId));
  }, []);

  const listAssets = useCallback(async (projectId?: string) => {
    // Return locally stored assets
    return assets.map((asset) => ({
      ...asset,
      url: asset.cdn_url || supabase.storage.from(DEFAULT_BUCKET).getPublicUrl(asset.storage_path).data.publicUrl,
      thumbnailUrl: asset.thumbnail_path
        ? supabase.storage.from(DEFAULT_BUCKET).getPublicUrl(asset.thumbnail_path).data.publicUrl
        : undefined,
    }));
  }, [assets]);

  return {
    uploadAsset,
    deleteAsset,
    listAssets,
    uploading,
    error,
    assets,
  };
};

export default useProjectAssets;
