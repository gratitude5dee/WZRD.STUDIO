import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVideoEditorStore } from '@/store/videoEditorStore';
import type { LibraryMediaItem } from '@/store/videoEditorStore';
import { videoEditorService } from '@/services/videoEditorService';
import { toast } from 'sonner';

const mapRecordToLibraryItem = (record: Record<string, any>): LibraryMediaItem | null => {
  return videoEditorService.mapMediaItemRecord(record);
};

export function useComputeFlowSync(projectId?: string | null) {
  const addMediaItem = useVideoEditorStore((state) => state.addMediaLibraryItem);
  const updateMediaItem = useVideoEditorStore((state) => state.updateMediaLibraryItem);

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
          const mapped = mapRecordToLibraryItem(payload.new as Record<string, any>);
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
          const mapped = mapRecordToLibraryItem(payload.new as Record<string, any>);
          if (mapped) {
            updateMediaItem(mapped.id, mapped);
            if (mapped.status === 'completed') {
              toast.success(`${mapped.name} is ready!`);
            } else if (mapped.status === 'failed') {
              toast.error(`${mapped.name} generation failed`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [addMediaItem, updateMediaItem, projectId]);
}
