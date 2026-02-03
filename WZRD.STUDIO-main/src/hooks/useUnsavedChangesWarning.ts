import { useEffect } from 'react';
import { useComputeFlowStore } from '@/store/computeFlowStore';

export function useUnsavedChangesWarning(): void {
  const isGraphDirty = useComputeFlowStore((state) => state.isGraphDirty);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isGraphDirty) return;
      event.preventDefault();
      event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isGraphDirty]);
}
