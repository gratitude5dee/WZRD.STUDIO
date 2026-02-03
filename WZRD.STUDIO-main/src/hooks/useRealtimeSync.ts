import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCanvasStore } from '@/lib/stores/canvas-store';
import { RealtimeChannel } from '@supabase/supabase-js';
import type { CanvasObject } from '@/types/canvas';

export function useRealtimeSync(projectId: string | null) {
  const { addObject, updateObject, removeObject, setObjects } = useCanvasStore();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isLocalUpdate = useRef(false);

  useEffect(() => {
    if (!projectId) return;

    // Subscribe to canvas_objects changes
    const channel = supabase
      .channel(`canvas:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'canvas_objects',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (!isLocalUpdate.current) {
            const newObject = payload.new as CanvasObject;
            addObject(newObject);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'canvas_objects',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (!isLocalUpdate.current) {
            const updatedObject = payload.new as CanvasObject;
            updateObject(updatedObject.id, updatedObject);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'canvas_objects',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (!isLocalUpdate.current) {
            removeObject(payload.old.id);
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime status:', status);
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [projectId, addObject, updateObject, removeObject]);

  return {
    setIsLocalUpdate: (value: boolean) => {
      isLocalUpdate.current = value;
    },
  };
}
