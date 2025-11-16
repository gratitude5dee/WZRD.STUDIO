import { useEffect, useRef, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AutoSaveOptions {
  projectId: string | null;
  data: any;
  enabled?: boolean;
  debounceMs?: number;
  onSaveStart?: () => void;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

export function useAutoSave({
  projectId,
  data,
  enabled = true,
  debounceMs = 2000,
  onSaveStart,
  onSaveSuccess,
  onSaveError,
}: AutoSaveOptions) {
  const lastSavedRef = useRef<string>('');
  const isSavingRef = useRef(false);

  const saveToDatabase = useCallback(async () => {
    if (!projectId || !enabled || isSavingRef.current) return;

    const dataString = JSON.stringify(data);
    
    // Don't save if data hasn't changed
    if (dataString === lastSavedRef.current) return;

    isSavingRef.current = true;
    onSaveStart?.();

    try {
      const { error } = await supabase
        .from('canvas_projects')
        .update({
          viewport: data.viewport,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);

      if (error) throw error;

      lastSavedRef.current = dataString;
      onSaveSuccess?.();
    } catch (error) {
      console.error('Auto-save failed:', error);
      onSaveError?.(error as Error);
      toast.error('Failed to save changes', {
        description: 'Your work may not be saved',
      });
    } finally {
      isSavingRef.current = false;
    }
  }, [projectId, data, enabled, onSaveStart, onSaveSuccess, onSaveError]);

  // Debounced save function
  const debouncedSave = useDebouncedCallback(saveToDatabase, debounceMs);

  // Trigger save when data changes
  useEffect(() => {
    if (enabled && projectId) {
      debouncedSave();
    }
  }, [data, enabled, projectId, debouncedSave]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (enabled && projectId && !isSavingRef.current) {
        saveToDatabase();
      }
    };
  }, [enabled, projectId, saveToDatabase]);

  // Force save (bypass debounce)
  const forceSave = useCallback(() => {
    debouncedSave.flush();
  }, [debouncedSave]);

  return {
    forceSave,
    isSaving: isSavingRef.current,
  };
}
