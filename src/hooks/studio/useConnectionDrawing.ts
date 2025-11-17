/**
 * Connection Drawing Hook
 * Handles the interactive connection creation between nodes
 */

import { useState, useCallback, useRef } from 'react';
import { useReactFlow, Connection } from '@xyflow/react';
import { getConnectionColor } from '@/lib/studio/connection-manager';

export interface ConnectionDrawingState {
  isDrawing: boolean;
  sourceNode: string | null;
  sourceHandle: string | null;
  currentPosition: { x: number; y: number } | null;
  dataType: 'text' | 'image' | 'video' | 'data' | null;
}

export interface UseConnectionDrawingOptions {
  onConnectionCreate?: (connection: Connection) => void;
  onValidate?: (sourceNode: string, sourceHandle: string, targetNode: string, targetHandle: string) => boolean;
  isEnabled?: boolean;
}

export const useConnectionDrawing = ({
  onConnectionCreate,
  onValidate,
  isEnabled = true,
}: UseConnectionDrawingOptions = {}) => {
  const { screenToFlowPosition, getNode } = useReactFlow();
  const [state, setState] = useState<ConnectionDrawingState>({
    isDrawing: false,
    sourceNode: null,
    sourceHandle: null,
    currentPosition: null,
    dataType: null,
  });

  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Start connection from a handle
  const startConnection = useCallback((
    nodeId: string,
    handleId: string,
    dataType: 'text' | 'image' | 'video' | 'data',
    event: React.MouseEvent
  ) => {
    if (!isEnabled) return;

    event.stopPropagation();
    
    const canvasElement = event.currentTarget.closest('[data-id="rf__wrapper"]') as HTMLDivElement;
    if (canvasElement) {
      canvasRef.current = canvasElement;
    }

    setState({
      isDrawing: true,
      sourceNode: nodeId,
      sourceHandle: handleId,
      currentPosition: { x: event.clientX, y: event.clientY },
      dataType,
    });
  }, [isEnabled]);

  // Update connection line position
  const updateConnection = useCallback((event: MouseEvent) => {
    if (!isEnabled || !state.isDrawing) return;

    setState(prev => ({
      ...prev,
      currentPosition: { x: event.clientX, y: event.clientY },
    }));
  }, [isEnabled, state.isDrawing]);

  // Complete connection
  const completeConnection = useCallback((
    targetNodeId: string,
    targetHandleId: string,
    event: React.MouseEvent
  ) => {
    if (!isEnabled || !state.isDrawing || !state.sourceNode || !state.sourceHandle) return;

    event.stopPropagation();

    // Validate connection
    const isValid = onValidate
      ? onValidate(state.sourceNode, state.sourceHandle, targetNodeId, targetHandleId)
      : true;

    if (isValid) {
      const connection: Connection = {
        source: state.sourceNode,
        sourceHandle: state.sourceHandle,
        target: targetNodeId,
        targetHandle: targetHandleId,
      };

      onConnectionCreate?.(connection);
    }

    // Reset state
    setState({
      isDrawing: false,
      sourceNode: null,
      sourceHandle: null,
      currentPosition: null,
      dataType: null,
    });
  }, [isEnabled, state, onConnectionCreate, onValidate]);

  // Cancel connection
  const cancelConnection = useCallback(() => {
    setState({
      isDrawing: false,
      sourceNode: null,
      sourceHandle: null,
      currentPosition: null,
      dataType: null,
    });
  }, []);

  // Get connection line path for rendering
  const getConnectionLinePath = useCallback(() => {
    if (!state.isDrawing || !state.sourceNode || !state.currentPosition || !canvasRef.current) {
      return null;
    }

    const sourceNode = getNode(state.sourceNode);
    if (!sourceNode) return null;

    // Get source handle position (simplified - in real use, get exact handle position)
    const sourceX = sourceNode.position.x + (sourceNode.width || 280);
    const sourceY = sourceNode.position.y + 60; // Approximate middle

    // Convert current mouse position to flow coordinates
    const rect = canvasRef.current.getBoundingClientRect();
    const flowPos = screenToFlowPosition({
      x: state.currentPosition.x - rect.left,
      y: state.currentPosition.y - rect.top,
    });

    const dx = flowPos.x - sourceX;
    const curveDistance = Math.abs(dx) * 0.5;

    const path = `M ${sourceX} ${sourceY} C ${sourceX + curveDistance} ${sourceY}, ${flowPos.x - curveDistance} ${flowPos.y}, ${flowPos.x} ${flowPos.y}`;

    return {
      path,
      color: getConnectionColor(state.dataType || 'data'),
      sourceX,
      sourceY,
      targetX: flowPos.x,
      targetY: flowPos.y,
    };
  }, [state, getNode, screenToFlowPosition]);

  return {
    state,
    startConnection,
    updateConnection,
    completeConnection,
    cancelConnection,
    getConnectionLinePath,
    isDrawing: state.isDrawing,
  };
};
