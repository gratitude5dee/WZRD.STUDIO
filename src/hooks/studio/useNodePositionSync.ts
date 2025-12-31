/**
 * useNodePositionSync Hook
 * 
 * Handles node position synchronization between React Flow and the compute store
 * WITHOUT creating bidirectional update loops.
 * 
 * The Problem:
 * Previously, position sync was done in a useEffect watching the nodes array,
 * which created this loop:
 * 1. User drags node → nodes state updates
 * 2. useEffect fires → calls onUpdateBlockPosition
 * 3. Parent updates blocks → StudioCanvas re-renders
 * 4. blocks→nodes sync effect fires → back to step 1
 * 
 * The Solution:
 * Use event-driven position sync (onNodeDragStop) instead of effect-based sync.
 * Only persist positions on explicit user interactions, not on every state change.
 */

import { useCallback, useRef, useMemo } from 'react';
import { useComputeFlowStore } from '@/store/computeFlowStore';
import type { Node, OnNodesChange } from '@xyflow/react';
import { debounce } from '@/lib/utils';

// Define NodeDragHandler type locally since it's not exported from @xyflow/react
type NodeDragHandler = (event: React.MouseEvent, node: Node, nodes: Node[]) => void;

interface Position {
  x: number;
  y: number;
}

interface UseNodePositionSyncOptions {
  /** Whether to use compute flow store for positions */
  useComputeFlow: boolean;
  /** Callback for legacy block position updates */
  onUpdateBlockPosition?: (id: string, position: Position) => void;
  /** Debounce delay for position saves (ms) */
  saveDebounceMs?: number;
  /** Project ID for compute flow saves */
  projectId?: string;
}

interface NodePositionSyncResult {
  /** Handler for node drag end - triggers position save */
  onNodeDragStop: NodeDragHandler;
  /** Filter function for node changes - returns filtered changes */
  filterNodeChanges: (changes: any[]) => any[];
  /** Whether a save is pending */
  isSavePending: boolean;
}

/**
 * Hook for managing node position synchronization
 * 
 * @example
 * ```tsx
 * const { onNodeDragStop, onNodesChange } = useNodePositionSync({
 *   useComputeFlow: true,
 *   projectId: 'proj-123',
 * });
 * 
 * <ReactFlow
 *   onNodeDragStop={onNodeDragStop}
 *   onNodesChange={onNodesChange}
 * />
 * ```
 */
export function useNodePositionSync({
  useComputeFlow,
  onUpdateBlockPosition,
  saveDebounceMs = 500,
  projectId,
}: UseNodePositionSyncOptions): NodePositionSyncResult {
  const { updateNode, saveGraph } = useComputeFlowStore();
  
  // Track pending save state
  const savePendingRef = useRef(false);
  
  // Track which nodes have been dragged (to batch saves)
  const draggedNodesRef = useRef<Set<string>>(new Set());
  
  /**
   * Debounced save function to batch rapid position changes
   */
  const debouncedSave = useMemo(
    () =>
      debounce(() => {
        if (useComputeFlow && projectId && draggedNodesRef.current.size > 0) {
          console.log('[NodePositionSync] Saving positions for nodes:', 
            Array.from(draggedNodesRef.current));
          
          saveGraph(projectId).finally(() => {
            savePendingRef.current = false;
            draggedNodesRef.current.clear();
          });
        }
      }, saveDebounceMs),
    [useComputeFlow, projectId, saveGraph, saveDebounceMs]
  );
  
  /**
   * Handle node drag end
   * This is the PRIMARY mechanism for position persistence.
   * Only fires when user explicitly finishes dragging.
   */
  const onNodeDragStop: NodeDragHandler = useCallback(
    (event, node, nodes) => {
      const position = { x: node.position.x, y: node.position.y };
      
      console.log('[NodePositionSync] Drag stopped:', node.id, position);
      
      if (useComputeFlow) {
        // Update compute flow store
        updateNode(node.id, { position });
        
        // Mark for debounced save
        draggedNodesRef.current.add(node.id);
        savePendingRef.current = true;
        debouncedSave();
      } else if (onUpdateBlockPosition) {
        // Legacy block system
        onUpdateBlockPosition(node.id, position);
      }
      
      // Handle multi-select drag (all selected nodes moved together)
      if (nodes.length > 1) {
        nodes.forEach((draggedNode) => {
          if (draggedNode.id !== node.id) {
            const draggedPosition = { 
              x: draggedNode.position.x, 
              y: draggedNode.position.y 
            };
            
            if (useComputeFlow) {
              updateNode(draggedNode.id, { position: draggedPosition });
              draggedNodesRef.current.add(draggedNode.id);
            } else if (onUpdateBlockPosition) {
              onUpdateBlockPosition(draggedNode.id, draggedPosition);
            }
          }
        });
      }
    },
    [useComputeFlow, updateNode, onUpdateBlockPosition, debouncedSave]
  );
  
  /**
   * Filter node changes (position during drag, selection, etc.)
   * This is a pure function that returns filtered changes.
   */
  const filterNodeChanges = useCallback(
    (changes: any[]): any[] => {
      // Filter out any changes we want to ignore
      return changes.filter((change) => {
        // Always allow non-position changes
        if (change.type !== 'position') return true;
        
        // For position changes during drag, allow them (updates visual position)
        // The save happens in onNodeDragStop
        return true;
      });
    },
    []
  );
  
  return {
    onNodeDragStop,
    filterNodeChanges,
    isSavePending: savePendingRef.current,
  };
}

/**
 * Utility to check if a node position has changed significantly
 * (avoids saving micro-movements)
 */
export function hasPositionChanged(
  oldPos: Position,
  newPos: Position,
  threshold = 1
): boolean {
  return (
    Math.abs(oldPos.x - newPos.x) > threshold ||
    Math.abs(oldPos.y - newPos.y) > threshold
  );
}

/**
 * Merge position changes into existing node array
 * (Pure function, no side effects)
 */
export function applyPositionUpdates(
  nodes: Node[],
  updates: Map<string, Position>
): Node[] {
  return nodes.map((node) => {
    const newPosition = updates.get(node.id);
    if (newPosition && hasPositionChanged(node.position, newPosition)) {
      return { ...node, position: newPosition };
    }
    return node;
  });
}

export default useNodePositionSync;
