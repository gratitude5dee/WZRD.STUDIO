/**
 * Selection Box Hook
 * Handles rectangular selection of multiple nodes
 */

import { useState, useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { studioTheme } from '@/lib/studio/theme';

export interface SelectionBox {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  width: number;
  height: number;
  left: number;
  top: number;
}

export interface UseSelectionBoxOptions {
  onSelectionChange?: (nodeIds: string[]) => void;
  isEnabled?: boolean;
}

export const useSelectionBox = ({
  onSelectionChange,
  isEnabled = true,
}: UseSelectionBoxOptions = {}) => {
  const { getNodes, setNodes, screenToFlowPosition } = useReactFlow();
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // Start selection
  const startSelection = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!isEnabled) return;

    // Only start if clicking on canvas (not on nodes)
    const target = event.target as HTMLElement;
    if (target.closest('.react-flow__node')) return;

    const canvasElement = event.currentTarget;
    const rect = canvasElement.getBoundingClientRect();
    const startX = event.clientX - rect.left;
    const startY = event.clientY - rect.top;

    setIsSelecting(true);
    setSelectionBox({
      startX,
      startY,
      currentX: startX,
      currentY: startY,
      width: 0,
      height: 0,
      left: startX,
      top: startY,
    });
  }, [isEnabled]);

  // Update selection
  const updateSelection = useCallback((event: MouseEvent, canvasElement: HTMLDivElement) => {
    if (!isEnabled || !isSelecting || !selectionBox) return;

    const rect = canvasElement.getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;

    const left = Math.min(selectionBox.startX, currentX);
    const top = Math.min(selectionBox.startY, currentY);
    const width = Math.abs(currentX - selectionBox.startX);
    const height = Math.abs(currentY - selectionBox.startY);

    setSelectionBox({
      ...selectionBox,
      currentX,
      currentY,
      left,
      top,
      width,
      height,
    });
  }, [isEnabled, isSelecting, selectionBox]);

  // End selection
  const endSelection = useCallback((multiSelect: boolean = false) => {
    if (!isEnabled || !isSelecting || !selectionBox) return;

    // Only proceed if selection box has significant size
    if (selectionBox.width < 5 && selectionBox.height < 5) {
      setIsSelecting(false);
      setSelectionBox(null);
      return;
    }

    // Convert selection box to flow coordinates
    const flowStart = screenToFlowPosition({ 
      x: selectionBox.left, 
      y: selectionBox.top 
    });
    const flowEnd = screenToFlowPosition({ 
      x: selectionBox.left + selectionBox.width, 
      y: selectionBox.top + selectionBox.height 
    });

    const nodes = getNodes();
    const selectedNodeIds: string[] = [];

    // Check which nodes are within selection box
    nodes.forEach(node => {
      const nodeWidth = node.width || 280;
      const nodeHeight = node.height || 120;
      const nodeRight = node.position.x + nodeWidth;
      const nodeBottom = node.position.y + nodeHeight;

      // Node is selected if any part is within selection box
      const isIntersecting =
        node.position.x < flowEnd.x &&
        nodeRight > flowStart.x &&
        node.position.y < flowEnd.y &&
        nodeBottom > flowStart.y;

      if (isIntersecting) {
        selectedNodeIds.push(node.id);
      }
    });

    // Update node selection states
    setNodes(nodes.map(node => ({
      ...node,
      selected: multiSelect 
        ? (node.selected || selectedNodeIds.includes(node.id))
        : selectedNodeIds.includes(node.id),
    })));

    onSelectionChange?.(selectedNodeIds);

    // Clear selection box
    setIsSelecting(false);
    setSelectionBox(null);
  }, [isEnabled, isSelecting, selectionBox, getNodes, setNodes, screenToFlowPosition, onSelectionChange]);

  // Cancel selection
  const cancelSelection = useCallback(() => {
    setIsSelecting(false);
    setSelectionBox(null);
  }, []);

  // Get selection box styles for rendering
  const getSelectionBoxStyles = useCallback((): React.CSSProperties | null => {
    if (!selectionBox) return null;

    return {
      position: 'absolute',
      left: `${selectionBox.left}px`,
      top: `${selectionBox.top}px`,
      width: `${selectionBox.width}px`,
      height: `${selectionBox.height}px`,
      border: `2px solid ${studioTheme.accent.purple}`,
      background: `${studioTheme.accent.purple}20`,
      pointerEvents: 'none',
      zIndex: 1000,
      borderRadius: '4px',
    };
  }, [selectionBox]);

  return {
    selectionBox,
    isSelecting,
    startSelection,
    updateSelection,
    endSelection,
    cancelSelection,
    getSelectionBoxStyles,
  };
};
