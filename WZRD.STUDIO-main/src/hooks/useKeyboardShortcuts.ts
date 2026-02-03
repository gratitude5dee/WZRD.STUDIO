import { useEffect } from 'react';
import { useCanvasStore } from '@/lib/stores/canvas-store';
import { toast } from 'sonner';

export function useKeyboardShortcuts(onExport?: () => void, onSave?: () => void) {
  const {
    selectedIds,
    selectAll,
    clearSelection,
    copy,
    paste,
    duplicate,
    deleteSelected,
    undo,
    redo,
    bringToFront,
    sendToBack,
  } = useCanvasStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + A: Select all
      if (isMod && e.key === 'a') {
        e.preventDefault();
        selectAll();
        return;
      }

      // Cmd/Ctrl + D: Deselect all or Duplicate
      if (isMod && e.key === 'd') {
        e.preventDefault();
        if (selectedIds.length > 0) {
          duplicate();
          toast.success('Duplicated selection');
        } else {
          clearSelection();
        }
        return;
      }

      // Delete/Backspace: Delete selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        e.preventDefault();
        deleteSelected();
        toast.success(`Deleted ${selectedIds.length} object(s)`);
        return;
      }

      // Cmd/Ctrl + Z: Undo
      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        toast.success('Undo');
        return;
      }

      // Cmd/Ctrl + Shift + Z: Redo
      if (isMod && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        redo();
        toast.success('Redo');
        return;
      }

      // Cmd/Ctrl + C: Copy
      if (isMod && e.key === 'c') {
        e.preventDefault();
        copy();
        toast.success('Copied to clipboard');
        return;
      }

      // Cmd/Ctrl + V: Paste
      if (isMod && e.key === 'v') {
        e.preventDefault();
        paste();
        toast.success('Pasted from clipboard');
        return;
      }

      // Cmd/Ctrl + X: Cut
      if (isMod && e.key === 'x') {
        e.preventDefault();
        copy();
        deleteSelected();
        toast.success('Cut to clipboard');
        return;
      }

      // Cmd/Ctrl + S: Save
      if (isMod && e.key === 's') {
        e.preventDefault();
        onSave?.();
        return;
      }

      // Cmd/Ctrl + E: Export
      if (isMod && e.key === 'e') {
        e.preventDefault();
        onExport?.();
        return;
      }

      // [ or ]: Move layer order
      if (e.key === '[' && selectedIds.length > 0) {
        e.preventDefault();
        if (isMod) {
          selectedIds.forEach(id => sendToBack(id));
          toast.success('Sent to back');
        } else {
          // Move down one layer (not implemented yet)
        }
        return;
      }

      if (e.key === ']' && selectedIds.length > 0) {
        e.preventDefault();
        if (isMod) {
          selectedIds.forEach(id => bringToFront(id));
          toast.success('Brought to front');
        } else {
          // Move up one layer (not implemented yet)
        }
        return;
      }

      // Escape: Deselect
      if (e.key === 'Escape') {
        clearSelection();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedIds,
    selectAll,
    clearSelection,
    copy,
    paste,
    duplicate,
    deleteSelected,
    undo,
    redo,
    bringToFront,
    sendToBack,
    onExport,
    onSave,
  ]);
}
