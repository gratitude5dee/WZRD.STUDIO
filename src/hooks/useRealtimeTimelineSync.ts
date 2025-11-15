import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVideoEditorStore } from '@/store/videoEditorStore';
import { videoEditorService } from '@/services/videoEditorService';
import { toast } from 'sonner';

export function useRealtimeTimelineSync(projectId?: string | null) {
  const syncClipFromRemote = useVideoEditorStore((state) => state.syncClipFromRemote);
  const syncAudioTrackFromRemote = useVideoEditorStore((state) => state.syncAudioTrackFromRemote);
  const removeClipLocal = useVideoEditorStore((state) => state.removeClipLocal);
  const removeAudioTrackLocal = useVideoEditorStore((state) => state.removeAudioTrackLocal);
  const setClips = useVideoEditorStore((state) => state.setClips);
  const setAudioTracks = useVideoEditorStore((state) => state.setAudioTracks);
  const setComposition = useVideoEditorStore((state) => state.setComposition);

  // Initial load of timeline state
  useEffect(() => {
    if (!projectId) return;

    const loadInitialState = async () => {
      try {
        const { clips, audioTracks, composition } = await videoEditorService.loadProject(projectId);
        setClips(clips);
        setAudioTracks(audioTracks);
        setComposition(composition);
      } catch (error) {
        console.error('Failed to load timeline state:', error);
        toast.error('Failed to load project timeline');
      }
    };

    loadInitialState();
  }, [projectId, setClips, setAudioTracks, setComposition]);

  // Real-time subscriptions
  useEffect(() => {
    if (!projectId) return;

    const timelineChannel = supabase
      .channel(`project:${projectId}:timeline`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'timeline_clips', filter: `project_id=eq.${projectId}` },
        async (payload) => {
          const clip = await videoEditorService.getTimelineClip(projectId, payload.new.id as string);
          if (clip) {
            syncClipFromRemote(clip);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'timeline_clips', filter: `project_id=eq.${projectId}` },
        async (payload) => {
          const clip = await videoEditorService.getTimelineClip(projectId, payload.new.id as string);
          if (clip) {
            syncClipFromRemote(clip);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'timeline_clips', filter: `project_id=eq.${projectId}` },
        (payload) => {
          removeClipLocal(payload.old.id as string);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audio_tracks', filter: `project_id=eq.${projectId}` },
        async (payload) => {
          const track = await videoEditorService.getAudioTrack(projectId, payload.new.id as string);
          if (track) {
            syncAudioTrackFromRemote(track);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'audio_tracks', filter: `project_id=eq.${projectId}` },
        async (payload) => {
          const track = await videoEditorService.getAudioTrack(projectId, payload.new.id as string);
          if (track) {
            syncAudioTrackFromRemote(track);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'audio_tracks', filter: `project_id=eq.${projectId}` },
        (payload) => {
          removeAudioTrackLocal(payload.old.id as string);
        }
      )
      .subscribe();

    return () => {
      timelineChannel.unsubscribe();
    };
  }, [projectId, removeAudioTrackLocal, removeClipLocal, syncAudioTrackFromRemote, syncClipFromRemote]);
}
