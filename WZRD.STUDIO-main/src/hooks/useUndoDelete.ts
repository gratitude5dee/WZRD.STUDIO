import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useUndoDelete() {
  const [isRestoring, setIsRestoring] = useState(false);

  const undoDelete = useCallback(async (projectId: string) => {
    setIsRestoring(true);

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          deleted_at: null,
          status: 'active',
        } as any)
        .eq('id', projectId);

      if (error) throw error;

      window.dispatchEvent(
        new CustomEvent('project-restored', {
          detail: { projectId },
        })
      );

      toast.success('Project restored!');
      return true;
    } catch (error) {
      console.error('Failed to restore project', error);
      toast.error('Failed to restore project');
      return false;
    } finally {
      setIsRestoring(false);
    }
  }, []);

  return { undoDelete, isRestoring };
}
