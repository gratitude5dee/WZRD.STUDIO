/**
 * Studio Keyboard Shortcuts Hook
 * Handles all keyboard interactions for the Studio canvas
 */

import { useEffect, useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';

export interface StudioKeyboardShortcutsOptions {
  onAddTextNode?: () => void;
  onAddImageNode?: () => void;
  onAddVideoNode?: () => void;
  onDelete?: (nodeIds: string[]) => void;
  onDuplicate?: (nodeIds: string[]) => void;
  onGroup?: (nodeIds: string[]) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onCut?: () => void;
  onSearch?: () => void;
  selectedNodeIds?: string[];
  isEnabled?: boolean;
}

export const useStudioKeyboardShortcuts = ({
  onAddTextNode,
  onAddImageNode,
  onAddVideoNode,
  onDelete,
  onDuplicate,
  onGroup,
  onUndo,
  onRedo,
  onCopy,
  onPaste,
  onCut,
  onSearch,
  selectedNodeIds = [],
  isEnabled = true,
}: StudioKeyboardShortcutsOptions = {}) => {
  const { 
    fitView, 
    zoomTo, 
    getNodes, 
    setNodes, 
    getEdges,
  } = useReactFlow();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;

    const target = event.target as HTMLElement;
    const isInputField = target.tagName === 'INPUT' || 
                        target.tagName === 'TEXTAREA' || 
                        target.isContentEditable;

    // Don't trigger shortcuts when typing in input fields
    if (isInputField && !event.metaKey && !event.ctrlKey) return;

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

    // Canvas Navigation
    if (cmdOrCtrl && event.key === '0') {
      event.preventDefault();
      zoomTo(1); // Reset zoom to 100%
      return;
    }

    if (cmdOrCtrl && event.key === '1') {
      event.preventDefault();
      fitView({ padding: 0.2, duration: 300 }); // Fit all nodes
      return;
    }

    // Selection
    if (cmdOrCtrl && event.key === 'a' && !isInputField) {
      event.preventDefault();
      const allNodes = getNodes();
      setNodes(allNodes.map(node => ({ ...node, selected: true })));
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setNodes(getNodes().map(node => ({ ...node, selected: false })));
      return;
    }

    // Node Creation (only when not in input field)
    if (!isInputField) {
      if (event.key === 't' || event.key === 'T') {
        event.preventDefault();
        onAddTextNode?.();
        return;
      }

      if (event.key === 'i' || event.key === 'I') {
        event.preventDefault();
        onAddImageNode?.();
        return;
      }

      if (event.key === 'v' || event.key === 'V') {
        event.preventDefault();
        onAddVideoNode?.();
        return;
      }
    }

    // Delete
    if ((event.key === 'Delete' || event.key === 'Backspace') && !isInputField) {
      event.preventDefault();
      if (selectedNodeIds.length > 0) {
        onDelete?.(selectedNodeIds);
      }
      return;
    }

    // Duplicate
    if (cmdOrCtrl && event.key === 'd') {
      event.preventDefault();
      if (selectedNodeIds.length > 0) {
        onDuplicate?.(selectedNodeIds);
      }
      return;
    }

    // Group
    if (cmdOrCtrl && event.key === 'g') {
      event.preventDefault();
      if (selectedNodeIds.length > 1) {
        onGroup?.(selectedNodeIds);
      }
      return;
    }

    // Undo
    if (cmdOrCtrl && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      onUndo?.();
      return;
    }

    // Redo
    if (cmdOrCtrl && event.shiftKey && event.key === 'z') {
      event.preventDefault();
      onRedo?.();
      return;
    }

    // Copy
    if (cmdOrCtrl && event.key === 'c' && !isInputField) {
      event.preventDefault();
      onCopy?.();
      return;
    }

    // Paste
    if (cmdOrCtrl && event.key === 'v' && !isInputField) {
      event.preventDefault();
      onPaste?.();
      return;
    }

    // Cut
    if (cmdOrCtrl && event.key === 'x' && !isInputField) {
      event.preventDefault();
      onCut?.();
      return;
    }

    // Search
    if (event.key === '/' && !isInputField) {
      event.preventDefault();
      onSearch?.();
      return;
    }

    // Arrow keys - Move selected nodes
    if (!isInputField && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      const moveDistance = event.shiftKey ? 10 : 1;
      const nodes = getNodes();
      
      setNodes(nodes.map(node => {
        if (!node.selected) return node;
        
        let dx = 0, dy = 0;
        if (event.key === 'ArrowLeft') dx = -moveDistance;
        if (event.key === 'ArrowRight') dx = moveDistance;
        if (event.key === 'ArrowUp') dy = -moveDistance;
        if (event.key === 'ArrowDown') dy = moveDistance;
        
        return {
          ...node,
          position: {
            x: node.position.x + dx,
            y: node.position.y + dy,
          },
        };
      }));
      return;
    }
  }, [
    isEnabled,
    selectedNodeIds,
    onAddTextNode,
    onAddImageNode,
    onAddVideoNode,
    onDelete,
    onDuplicate,
    onGroup,
    onUndo,
    onRedo,
    onCopy,
    onPaste,
    onCut,
    onSearch,
    fitView,
    zoomTo,
    getNodes,
    setNodes,
  ]);

  useEffect(() => {
    if (!isEnabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, isEnabled]);

  return {
    isEnabled,
  };
};

/**
 * Keyboard shortcuts reference
 */
export const STUDIO_SHORTCUTS = {
  canvas: {
    'Space + Drag': 'Pan canvas',
    'Cmd/Ctrl + Wheel': 'Zoom',
    'Cmd/Ctrl + 0': 'Reset zoom to 100%',
    'Cmd/Ctrl + 1': 'Fit all nodes in view',
  },
  selection: {
    'Click': 'Select node',
    'Cmd/Ctrl + Click': 'Multi-select',
    'Drag': 'Select multiple (rectangle)',
    'Cmd/Ctrl + A': 'Select all',
    'Escape': 'Deselect all',
  },
  nodes: {
    'T': 'Add text node',
    'I': 'Add image node',
    'V': 'Add video node',
    'Delete/Backspace': 'Delete selected',
    'Cmd/Ctrl + D': 'Duplicate selected',
    'Cmd/Ctrl + G': 'Group selected',
  },
  editing: {
    'Cmd/Ctrl + Z': 'Undo',
    'Cmd/Ctrl + Shift + Z': 'Redo',
    'Cmd/Ctrl + C': 'Copy',
    'Cmd/Ctrl + V': 'Paste',
    'Cmd/Ctrl + X': 'Cut',
  },
  navigation: {
    'Arrow Keys': 'Move selected node',
    'Shift + Arrow': 'Move node by 10px',
    '/': 'Search',
  },
} as const;
