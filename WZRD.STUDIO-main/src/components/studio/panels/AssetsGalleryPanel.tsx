import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Image as ImageIcon,
  Video,
  FileText,
  Music,
  Trash2,
  Download,
  Search,
  Grid,
  List,
  Loader2,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export type AssetType = 'image' | 'video' | 'audio' | 'document';
export type AssetSource = 'uploaded' | 'generated';
export type AssetFilterType = AssetType | 'all';
export type AssetSourceFilter = AssetSource | 'all';

export interface Asset {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  type: AssetType;
  source: AssetSource;
  size: number;
  createdAt: Date;
  metadata?: Record<string, any>;
}

interface AssetsGalleryPanelProps {
  projectId: string;
  onAssetSelect?: (asset: Asset) => void;
  onClose: () => void;
  hideHeader?: boolean;
}

export const AssetsGalleryPanel: React.FC<AssetsGalleryPanelProps> = ({
  projectId,
  onAssetSelect,
  hideHeader = false,
}) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<AssetFilterType>('all');
  const [filterSource, setFilterSource] = useState<AssetSourceFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, [projectId]);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const { data: uploadedData } = await (supabase
        .from('project_assets' as any)
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false }) as any);

      const { data: generatedData } = await (supabase
        .from('generation_outputs' as any)
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false }) as any);

      const allAssets: Asset[] = [
        ...((uploadedData as any[])?.map((asset: any) => ({
          id: asset.id,
          name: asset.name,
          url: asset.url,
          thumbnailUrl: asset.thumbnail_url,
          type: asset.type as AssetType,
          source: 'uploaded' as AssetSource,
          size: asset.size || 0,
          createdAt: new Date(asset.created_at),
          metadata: asset.metadata,
        })) || []),
        ...((generatedData as any[])?.map((generated: any) => ({
          id: generated.id,
          name: generated.prompt?.slice(0, 30) ? `${generated.prompt.slice(0, 30)}...` : 'Generated',
          url: generated.output_url,
          thumbnailUrl: generated.thumbnail_url || generated.output_url,
          type: generated.output_type as AssetType,
          source: 'generated' as AssetSource,
          size: 0,
          createdAt: new Date(generated.created_at),
          metadata: { prompt: generated.prompt, model: generated.model },
        })) || []),
      ];

      setAssets(allAssets);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast.error('Failed to load assets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      const fileName = `${projectId}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('project-assets').upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage.from('project-assets').getPublicUrl(fileName);

      await (supabase.from('project_assets' as any).insert({
        project_id: projectId,
        name: file.name,
        url: urlData.publicUrl,
        type: file.type.startsWith('image/')
          ? 'image'
          : file.type.startsWith('video/')
            ? 'video'
            : file.type.startsWith('audio/')
              ? 'audio'
              : 'document',
        size: file.size,
      }) as any);

      return urlData.publicUrl;
    });

    try {
      await Promise.all(uploadPromises);
      toast.success(`Uploaded ${files.length} file(s)`);
      fetchAssets();
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (assetId: string) => {
    if (!confirm('Delete this asset?')) return;

    try {
      await (supabase.from('project_assets' as any).delete().eq('id', assetId) as any);
      setAssets((current) => current.filter((asset) => asset.id !== assetId));
      toast.success('Asset deleted');
    } catch (error) {
      toast.error('Failed to delete asset');
    }
  };

  const filteredAssets = assets.filter((asset) => {
    if (filterType !== 'all' && asset.type !== filterType) return false;
    if (filterSource !== 'all' && asset.source !== filterSource) return false;
    if (searchQuery && !asset.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const TYPE_ICONS: Record<AssetType, React.ElementType> = {
    image: ImageIcon,
    video: Video,
    audio: Music,
    document: FileText,
  };

  return (
    <div className="w-96 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-xl overflow-hidden shadow-2xl">
      <div className="px-4 py-3 border-b border-zinc-800/50">
        {!hideHeader && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-accent-amber" />
              <span className="text-sm font-medium text-white">Project Assets</span>
              <span className="text-xs text-zinc-500">({filteredAssets.length})</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </button>
              <label className="p-1.5 rounded-lg bg-accent-amber/20 hover:bg-accent-amber/30 text-accent-amber cursor-pointer transition-colors">
                <Plus className="w-4 h-4" />
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(event) => handleUpload(event.target.files)}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
          />
        </div>

        <div className="flex gap-2 mt-3">
          <select
            value={filterType}
            onChange={(event) => setFilterType(event.target.value as AssetFilterType)}
            className="flex-1 px-2 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-xs text-zinc-300"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
            <option value="document">Documents</option>
          </select>
          <select
            value={filterSource}
            onChange={(event) => setFilterSource(event.target.value as AssetSourceFilter)}
            className="flex-1 px-2 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-xs text-zinc-300"
          >
            <option value="all">All Sources</option>
            <option value="uploaded">Uploaded</option>
            <option value="generated">Generated</option>
          </select>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto p-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">No assets found</p>
            <p className="text-xs text-zinc-600 mt-1">Upload or generate some content</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-2">
            {filteredAssets.map((asset) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative aspect-square rounded-lg overflow-hidden bg-zinc-800 cursor-pointer"
                onClick={() => onAssetSelect?.(asset)}
              >
                {asset.type === 'image' || asset.type === 'video' ? (
                  <img
                    src={asset.thumbnailUrl || asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {React.createElement(TYPE_ICONS[asset.type] || FileText, {
                      className: 'w-8 h-8 text-zinc-500',
                    })}
                  </div>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      window.open(asset.url, '_blank');
                    }}
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {asset.source === 'uploaded' && (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(asset.id);
                      }}
                      className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div
                  className={cn(
                    'absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-medium',
                    asset.source === 'generated'
                      ? 'bg-purple-500/80 text-white'
                      : 'bg-zinc-700/80 text-zinc-300'
                  )}
                >
                  {asset.source === 'generated' ? 'AI' : 'UP'}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredAssets.map((asset) => {
              const Icon = TYPE_ICONS[asset.type] || FileText;
              return (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="group flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 cursor-pointer"
                  onClick={() => onAssetSelect?.(asset)}
                >
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden">
                    {(asset.type === 'image' || asset.type === 'video') && asset.thumbnailUrl ? (
                      <img src={asset.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Icon className="w-5 h-5 text-zinc-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{asset.name}</p>
                    <p className="text-[10px] text-zinc-500">
                      {asset.source} • {formatDistanceToNow(asset.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
