import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVideoEditorStore } from '@/store/videoEditorStore';
import { videoEditorService } from '@/services/videoEditorService';

export function useRealtimeTimelineSync(projectId?: string | null) {
  const syncClipFromRemote = useVideoEditorStore((state) => state.syncClipFromRemote);
  const syncAudioTrackFromRemote = useVideoEditorStore((state) => state.syncAudioTrackFromRemote);
  const removeClipLocal = useVideoEditorStore((state) => state.removeClipLocal);
  const removeAudioTrackLocal = useVideoEditorStore((state) => state.removeAudioTrackLocal);

  useEffect(() => {
    if (!projectId) return;

    const timelineChannel = supabase
      .channel(`project:${projectId}:timeline`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'timeline_clips', filter: `project_id=eq.${projectId}` },
        async (payload) => {
          if (payload.eventType === 'DELETE') {
            removeClipLocal(payload.old.id as string);
            return;
          }

          const clip = await videoEditorService.getTimelineClip(projectId, payload.new.id as string);
          if (clip) {
            syncClipFromRemote(clip);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'audio_tracks', filter: `project_id=eq.${projectId}` },
        async (payload) => {
          if (payload.eventType === 'DELETE') {
            removeAudioTrackLocal(payload.old.id as string);
            return;
          }

          const track = await videoEditorService.getAudioTrack(projectId, payload.new.id as string);
          if (track) {
            syncAudioTrackFromRemote(track);
          }
        }
      )
      .subscribe();

    return () => {
      timelineChannel.unsubscribe();
    };
  }, [projectId, removeAudioTrackLocal, removeClipLocal, syncAudioTrackFromRemote, syncClipFromRemote]);
}
