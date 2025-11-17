/**
 * Studio Mouse Interactions Hook
 * Handles mouse events for canvas interaction (pan, zoom, selection)
 */

import { useCallback, useState, useRef } from 'react';
import { useReactFlow, Viewport } from '@xyflow/react';

export interface MouseInteractionState {
  isPanning: boolean;
  isSelecting: boolean;
  selectionBox: {
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null;
  lastMousePosition: { x: number; y: number } | null;
}

export interface UseStudioMouseOptions {
  onSelectionChange?: (nodeIds: string[]) => void;
  minZoom?: number;
  maxZoom?: number;
  isEnabled?: boolean;
}

export const useStudioMouse = ({
  onSelectionChange,
  minZoom = 0.1,
  maxZoom = 2.0,
  isEnabled = true,
}: UseStudioMouseOptions = {}) => {
  const { 
    getNodes, 
    setNodes, 
    getViewport, 
    setViewport, 
    screenToFlowPosition,
  } = useReactFlow();

  const [state, setState] = useState<MouseInteractionState>({
    isPanning: false,
    isSelecting: false,
    selectionBox: null,
    lastMousePosition: null,
  });

  const isSpacePressed = useRef(false);

  // Track space key for pan mode
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space' && !isSpacePressed.current) {
      isSpacePressed.current = true;
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      isSpacePressed.current = false;
      if (state.isPanning) {
        setState(prev => ({ ...prev, isPanning: false }));
      }
    }
  }, [state.isPanning]);

  // Mouse down - Start pan or selection
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEnabled) return;

    const isMiddleClick = e.button === 1;
    const isRightClick = e.button === 2;
    const shouldPan = isMiddleClick || isRightClick || (isSpacePressed.current && e.button === 0);

    if (shouldPan) {
      e.preventDefault();
      setState(prev => ({
        ...prev,
        isPanning: true,
        lastMousePosition: { x: e.clientX, y: e.clientY },
      }));
    } else if (e.button === 0) {
      // Left click - start selection box
      const canvasElement = e.currentTarget;
      const rect = canvasElement.getBoundingClientRect();
      const startX = e.clientX - rect.left;
      const startY = e.clientY - rect.top;

      setState(prev => ({
        ...prev,
        isSelecting: true,
        selectionBox: {
          startX,
          startY,
          currentX: startX,
          currentY: startY,
        },
      }));
    }
  }, [isEnabled]);

  // Mouse move - Pan or update selection box
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEnabled) return;

    if (state.isPanning && state.lastMousePosition) {
      const dx = e.clientX - state.lastMousePosition.x;
      const dy = e.clientY - state.lastMousePosition.y;

      const currentViewport = getViewport();
      setViewport({
        x: currentViewport.x + dx,
        y: currentViewport.y + dy,
        zoom: currentViewport.zoom,
      });

      setState(prev => ({
        ...prev,
        lastMousePosition: { x: e.clientX, y: e.clientY },
      }));
    } else if (state.isSelecting && state.selectionBox) {
      const canvasElement = e.currentTarget;
      const rect = canvasElement.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      setState(prev => ({
        ...prev,
        selectionBox: prev.selectionBox ? {
          ...prev.selectionBox,
          currentX,
          currentY,
        } : null,
      }));
    }
  }, [isEnabled, state.isPanning, state.isSelecting, state.lastMousePosition, state.selectionBox, getViewport, setViewport]);

  // Mouse up - End pan or finalize selection
  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEnabled) return;

    if (state.isSelecting && state.selectionBox) {
      // Calculate selected nodes
      const { startX, startY, currentX, currentY } = state.selectionBox;
      const viewport = getViewport();
      
      const minX = Math.min(startX, currentX);
      const maxX = Math.max(startX, currentY);
      const minY = Math.min(startY, currentY);
      const maxY = Math.max(startY, currentY);

      // Convert screen coords to flow coords
      const flowStart = screenToFlowPosition({ x: minX, y: minY });
      const flowEnd = screenToFlowPosition({ x: maxX, y: maxY });

      const nodes = getNodes();
      const selectedNodeIds: string[] = [];

      nodes.forEach(node => {
        const nodeRight = node.position.x + (node.width || 280);
        const nodeBottom = node.position.y + (node.height || 120);

        const isInSelection =
          node.position.x >= flowStart.x &&
          nodeRight <= flowEnd.x &&
          node.position.y >= flowStart.y &&
          nodeBottom <= flowEnd.y;

        if (isInSelection) {
          selectedNodeIds.push(node.id);
        }
      });

      // Update selected state
      setNodes(nodes.map(node => ({
        ...node,
        selected: selectedNodeIds.includes(node.id),
      })));

      onSelectionChange?.(selectedNodeIds);
    }

    setState({
      isPanning: false,
      isSelecting: false,
      selectionBox: null,
      lastMousePosition: null,
    });
  }, [isEnabled, state.isSelecting, state.selectionBox, getNodes, setNodes, getViewport, screenToFlowPosition, onSelectionChange]);

  // Zoom with wheel
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (!isEnabled) return;

    const isZoomGesture = e.ctrlKey || e.metaKey;
    if (!isZoomGesture) return;

    e.preventDefault();
    e.stopPropagation();

    const viewport = getViewport();
    const delta = -e.deltaY * 0.001;
    const newZoom = Math.max(minZoom, Math.min(maxZoom, viewport.zoom * (1 + delta)));

    // Zoom towards cursor position
    const canvasElement = e.currentTarget;
    const rect = canvasElement.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomRatio = newZoom / viewport.zoom;
    
    setViewport({
      x: mouseX - (mouseX - viewport.x) * zoomRatio,
      y: mouseY - (mouseY - viewport.y) * zoomRatio,
      zoom: newZoom,
    });
  }, [isEnabled, getViewport, setViewport, minZoom, maxZoom]);

  return {
    state,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onWheel: handleWheel,
      onKeyDown: handleKeyDown,
      onKeyUp: handleKeyUp,
    },
    isSpacePressed: isSpacePressed.current,
  };
};
