import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVideoEditorStore } from '@/store/videoEditorStore';
import { videoEditorService } from '@/services/videoEditorService';
import { toast } from 'sonner';

export function useComputeFlowSync(projectId?: string | null) {
  const addMediaItem = useVideoEditorStore((state) => state.addMediaLibraryItem);
  const loadMediaLibrary = useVideoEditorStore((state) => state.loadMediaLibrary);

  // Initial load of media library
  useEffect(() => {
    if (!projectId) return;

    const loadInitialMedia = async () => {
      try {
        const items = await videoEditorService.getMediaLibrary(projectId);
        loadMediaLibrary(items);
      } catch (error) {
        console.error('Failed to load initial media:', error);
        toast.error('Failed to load media library');
      }
    };

    loadInitialMedia();
  }, [projectId, loadMediaLibrary]);

  // Real-time subscription for new media
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`project:${projectId}:media`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'media_items',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const mapped = videoEditorService.mapMediaItemRecord(payload.new);
          if (mapped) {
            addMediaItem(mapped);
            toast.success('New media ready', {
              description: mapped.name,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'media_items',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const mapped = videoEditorService.mapMediaItemRecord(payload.new);
          if (mapped && mapped.status === 'completed') {
            addMediaItem(mapped);
            toast.success('Media processing completed', {
              description: mapped.name,
            });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [addMediaItem, projectId]);
}
