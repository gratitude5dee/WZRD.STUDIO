/**
 * useNodePositionSync Hook
 *
 * Handles node position synchronization between React Flow and the compute store
 * WITHOUT creating bidirectional update loops.
 *
 * IMPORTANT: The Studio canvas can be a *hybrid* of compute-flow nodes and legacy
 * "blocks" nodes. Even when `useComputeFlow` is enabled, legacy blocks still need
 * their positions persisted via `onUpdateBlockPosition` or they will snap back.
 */

import { useCallback, useMemo, useRef } from 'react';
import type { Node } from '@xyflow/react';
import { debounce } from '@/lib/utils';
import { useComputeFlowStore } from '@/store/computeFlowStore';

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
  /** Handler for node drag start */
  onNodeDragStart: NodeDragHandler;
  /** Filter function for node changes - returns filtered changes */
  filterNodeChanges: (changes: any[]) => any[];
  /** Whether a save is pending */
  isSavePending: boolean;
}

export function useNodePositionSync({
  useComputeFlow,
  onUpdateBlockPosition,
  saveDebounceMs = 500,
  projectId,
}: UseNodePositionSyncOptions): NodePositionSyncResult {
  const { updateNodeSilent, saveGraph, setDragging } = useComputeFlowStore();

  // Track pending save state
  const savePendingRef = useRef(false);

  // Track which nodes have been dragged (to batch saves)
  const draggedNodesRef = useRef<Set<string>>(new Set());

  /**
   * Detect whether a node is a compute-flow node.
   * We prefer a data marker (node.data.nodeDefinition) to avoid relying on node type.
   */
  const isComputeNodeInstance = useCallback(
    (node: Node): boolean => {
      if (!useComputeFlow) return false;

      const maybeData = (node as any)?.data as any;
      if (maybeData?.nodeDefinition) return true;

      // Fallback: check store membership (handles cases where node.data isn't hydrated yet)
      return useComputeFlowStore.getState().nodeDefinitions.some((n) => n.id === node.id);
    },
    [useComputeFlow]
  );

  /**
   * Debounced save function to batch rapid position changes
   */
  const debouncedSave = useMemo(
    () =>
      debounce(() => {
        if (useComputeFlow && projectId && draggedNodesRef.current.size > 0) {
          console.log(
            '[NodePositionSync] Saving positions for nodes:',
            Array.from(draggedNodesRef.current)
          );

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
   *
   * Key behavior:
   * - If dragged node is compute-flow: persist to compute store and debounce-save
   * - If dragged node is legacy block: persist via onUpdateBlockPosition
   */
  const onNodeDragStop: NodeDragHandler = useCallback(
    (_event, node, nodes) => {
      const draggedNodes = nodes?.length ? nodes : [node];
      const hasComputeNodes = draggedNodes.some(isComputeNodeInstance);

      if (hasComputeNodes) {
        setDragging(false);
      }

      draggedNodes.forEach((draggedNode) => {
        const position = { x: draggedNode.position.x, y: draggedNode.position.y };
        console.log('[NodePositionSync] Drag stopped:', draggedNode.id, position);

        if (isComputeNodeInstance(draggedNode)) {
          updateNodeSilent(draggedNode.id, { position });
          draggedNodesRef.current.add(draggedNode.id);
          savePendingRef.current = true;
        } else if (onUpdateBlockPosition) {
          // This is the critical fix for the "snap back"/"sticky" behavior in hybrid mode.
          onUpdateBlockPosition(draggedNode.id, position);
        }
      });

      if (hasComputeNodes) {
        debouncedSave();
      }
    },
    [debouncedSave, isComputeNodeInstance, onUpdateBlockPosition, setDragging, updateNodeSilent]
  );

  const onNodeDragStart: NodeDragHandler = useCallback(
    (_event, node, nodes) => {
      if (!useComputeFlow) return;

      const draggedNodes = nodes?.length ? nodes : [node];
      const hasComputeNodes = draggedNodes.some(isComputeNodeInstance);

      if (hasComputeNodes) {
        setDragging(true);
      }
    },
    [isComputeNodeInstance, setDragging, useComputeFlow]
  );

  /**
   * Filter node changes (position during drag, selection, etc.)
   * This is a pure function that returns filtered changes.
   */
  const filterNodeChanges = useCallback((changes: any[]): any[] => {
    // Currently we allow all changes through; position persistence happens on drag stop.
    return changes;
  }, []);

  return {
    onNodeDragStop,
    onNodeDragStart,
    filterNodeChanges,
    isSavePending: savePendingRef.current,
  };
}

export default useNodePositionSync;
