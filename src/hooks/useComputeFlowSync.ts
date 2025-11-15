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
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [addMediaItem, projectId]);
}
