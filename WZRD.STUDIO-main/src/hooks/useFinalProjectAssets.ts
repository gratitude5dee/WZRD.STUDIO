/**
 * Hook for managing final project assets - the curated collection of
 * images, videos, and audio tracks ready for final export.
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useVideoEditorStore, Clip, AudioTrack } from '@/store/videoEditorStore';

export interface FinalProjectAsset {
  id: string;
  project_id: string;
  asset_type: 'image' | 'video' | 'audio';
  asset_subtype?: 'voiceover' | 'sfx' | 'music' | 'visual';
  name: string;
  url: string;
  thumbnail_url?: string;
  duration_ms?: number;
  order_index: number;
  shot_card_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface SaveTimelineToFinalOptions {
  includeVideo?: boolean;
  includeAudio?: boolean;
  audioTypes?: ('voiceover' | 'sfx' | 'music')[];
}

export function useFinalProjectAssets(projectId: string | undefined) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [assets, setAssets] = useState<FinalProjectAsset[]>([]);
  const [exportProgress, setExportProgress] = useState(0);

  const clips = useVideoEditorStore((state) => state.clips);
  const audioTracks = useVideoEditorStore((state) => state.audioTracks);

  /**
   * Load final project assets from Supabase
   */
  const loadAssets = useCallback(async () => {
    if (!projectId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('final_project_assets')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (error) throw error;

      setAssets((data || []) as FinalProjectAsset[]);
    } catch (error) {
      console.error('Error loading final project assets:', error);
      toast.error('Failed to load final project assets');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  /**
   * Save a single asset to the final project assets collection
   */
  const saveAsset = useCallback(async (asset: Omit<FinalProjectAsset, 'id' | 'project_id' | 'created_at'>) => {
    if (!projectId) {
      toast.error('No project selected');
      return null;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('final_project_assets')
        .insert({
          project_id: projectId,
          ...asset,
        })
        .select()
        .single();

      if (error) throw error;

      setAssets(prev => [...prev, data as FinalProjectAsset]);
      toast.success(`${asset.name} added to final assets`);
      return data as FinalProjectAsset;
    } catch (error) {
      console.error('Error saving final project asset:', error);
      toast.error('Failed to save asset to final collection');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [projectId]);

  /**
   * Save all timeline clips and audio tracks to final project assets
   */
  const saveTimelineToFinal = useCallback(async (options: SaveTimelineToFinalOptions = {}) => {
    if (!projectId) {
      toast.error('No project selected');
      return false;
    }

    const {
      includeVideo = true,
      includeAudio = true,
      audioTypes = ['voiceover', 'sfx', 'music'],
    } = options;

    setIsSaving(true);
    try {
      const assetsToSave: Omit<FinalProjectAsset, 'id' | 'project_id' | 'created_at'>[] = [];

      // Sort clips by start time to maintain order
      const sortedClips = [...clips].sort((a, b) => (a.startTime ?? 0) - (b.startTime ?? 0));
      const sortedAudio = [...audioTracks].sort((a, b) => (a.startTime ?? 0) - (b.startTime ?? 0));

      // Add video/image clips
      if (includeVideo) {
        sortedClips.forEach((clip, index) => {
          assetsToSave.push({
            asset_type: clip.type === 'video' ? 'video' : 'image',
            asset_subtype: 'visual',
            name: clip.name || `Shot ${index + 1}`,
            url: clip.url,
            duration_ms: clip.duration,
            order_index: index,
            metadata: {
              startTime: clip.startTime,
              endTime: clip.endTime,
              transforms: clip.transforms,
              layer: clip.layer,
            },
          });
        });
      }

      // Add audio tracks
      if (includeAudio) {
        let audioIndex = sortedClips.length;
        sortedAudio.forEach((track) => {
          // Determine audio subtype based on track name or metadata
          let subtype: 'voiceover' | 'sfx' | 'music' = 'music';
          const trackNameLower = track.name.toLowerCase();
          if (trackNameLower.includes('voiceover') || trackNameLower.includes('narration') || trackNameLower.includes('voice')) {
            subtype = 'voiceover';
          } else if (trackNameLower.includes('sfx') || trackNameLower.includes('sound') || trackNameLower.includes('effect')) {
            subtype = 'sfx';
          }

          if (audioTypes.includes(subtype)) {
            assetsToSave.push({
              asset_type: 'audio',
              asset_subtype: subtype,
              name: track.name || `Audio ${audioIndex + 1}`,
              url: track.url,
              duration_ms: track.duration,
              order_index: audioIndex++,
              metadata: {
                startTime: track.startTime,
                endTime: track.endTime,
                volume: track.volume,
                isMuted: track.isMuted,
                fadeInDuration: track.fadeInDuration,
                fadeOutDuration: track.fadeOutDuration,
              },
            });
          }
        });
      }

      if (assetsToSave.length === 0) {
        toast.info('No assets to save to final collection');
        return false;
      }

      // Clear existing assets first (optional - could be a merge instead)
      await supabase
        .from('final_project_assets')
        .delete()
        .eq('project_id', projectId);

      // Insert all new assets
      const { data, error } = await supabase
        .from('final_project_assets')
        .insert(assetsToSave.map(asset => ({
          project_id: projectId,
          ...asset,
        })))
        .select();

      if (error) throw error;

      setAssets((data || []) as FinalProjectAsset[]);
      toast.success(`${assetsToSave.length} assets saved to final collection`);
      return true;
    } catch (error) {
      console.error('Error saving timeline to final assets:', error);
      toast.error('Failed to save timeline to final assets');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [projectId, clips, audioTracks]);

  /**
   * Reorder assets in the final collection
   */
  const reorderAssets = useCallback(async (newOrder: string[]) => {
    if (!projectId) return false;

    try {
      const updates = newOrder.map((id, index) => ({
        id,
        project_id: projectId,
        order_index: index,
      }));

      const { error } = await supabase
        .from('final_project_assets')
        .upsert(updates, { onConflict: 'id' });

      if (error) throw error;

      // Update local state
      setAssets(prev => {
        const assetMap = new Map(prev.map(a => [a.id, a]));
        return newOrder.map((id, index) => ({
          ...assetMap.get(id)!,
          order_index: index,
        }));
      });

      return true;
    } catch (error) {
      console.error('Error reordering assets:', error);
      toast.error('Failed to reorder assets');
      return false;
    }
  }, [projectId]);

  /**
   * Remove an asset from the final collection
   */
  const removeAsset = useCallback(async (assetId: string) => {
    try {
      const { error } = await supabase
        .from('final_project_assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;

      setAssets(prev => prev.filter(a => a.id !== assetId));
      toast.success('Asset removed from final collection');
      return true;
    } catch (error) {
      console.error('Error removing asset:', error);
      toast.error('Failed to remove asset');
      return false;
    }
  }, []);

  /**
   * Trigger the FFMPEG stitching process to create the final video
   */
  const createFinalAsset = useCallback(async () => {
    if (!projectId) {
      toast.error('No project selected');
      return null;
    }

    if (assets.length === 0) {
      toast.error('No assets in the final collection. Save timeline first.');
      return null;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      toast.info('Starting final asset creation...');

      // Call the Supabase Edge Function to stitch assets
      const { data, error } = await supabase.functions.invoke('create-final-asset', {
        body: {
          projectId,
          assets: assets.map(a => ({
            id: a.id,
            type: a.asset_type,
            subtype: a.asset_subtype,
            url: a.url,
            duration_ms: a.duration_ms,
            order_index: a.order_index,
            metadata: a.metadata,
          })),
        },
      });

      if (error) throw error;

      if (data?.status === 'processing') {
        // Poll for completion
        const checkStatus = async () => {
          const { data: statusData, error: statusError } = await supabase.functions.invoke('create-final-asset', {
            body: {
              action: 'status',
              jobId: data.jobId,
            },
          });

          if (statusError) throw statusError;

          if (statusData?.progress) {
            setExportProgress(statusData.progress);
          }

          if (statusData?.status === 'completed') {
            toast.success('Final video created successfully!');
            return statusData.outputUrl;
          } else if (statusData?.status === 'failed') {
            throw new Error(statusData.error || 'Export failed');
          }

          // Continue polling
          await new Promise(resolve => setTimeout(resolve, 2000));
          return checkStatus();
        };

        return await checkStatus();
      }

      toast.success('Final video created successfully!');
      return data?.outputUrl;
    } catch (error) {
      console.error('Error creating final asset:', error);
      toast.error(`Failed to create final asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  }, [projectId, assets]);

  return {
    assets,
    isLoading,
    isSaving,
    isExporting,
    exportProgress,
    loadAssets,
    saveAsset,
    saveTimelineToFinal,
    reorderAssets,
    removeAsset,
    createFinalAsset,
  };
}

export default useFinalProjectAssets;
