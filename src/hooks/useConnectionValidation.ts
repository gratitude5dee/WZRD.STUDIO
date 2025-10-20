import { useCallback } from 'react';
import { Connection, useReactFlow, Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';

export const useConnectionValidation = () => {
  const { getNodes, getEdges } = useReactFlow();

  const wouldCreateCycle = useCallback(
    (connection: Connection): boolean => {
      const nodes = getNodes();
      const edges = getEdges();
      
      // Build adjacency list
      const adjacency = new Map<string, Set<string>>();
      nodes.forEach(node => adjacency.set(node.id, new Set()));
      
      edges.forEach(edge => {
        adjacency.get(edge.source)?.add(edge.target);
      });
      
      // Add proposed connection
      adjacency.get(connection.source!)?.add(connection.target!);
      
      // DFS to detect cycle
      const visited = new Set<string>();
      const recStack = new Set<string>();
      
      const hasCycle = (nodeId: string): boolean => {
        visited.add(nodeId);
        recStack.add(nodeId);
        
        const neighbors = adjacency.get(nodeId);
        if (neighbors) {
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
              if (hasCycle(neighbor)) return true;
            } else if (recStack.has(neighbor)) {
              return true;
            }
          }
        }
        
        recStack.delete(nodeId);
        return false;
      };
      
      return hasCycle(connection.source!);
    },
    [getNodes, getEdges]
  );

  const getHandleType = (nodeId: string, handleId: string | null): string | null => {
    const nodes = getNodes();
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !handleId) return null;
    
    // Extract type from handle ID (e.g., "text-output" -> "text")
    if (handleId.includes('text')) return 'text';
    if (handleId.includes('image')) return 'image';
    if (handleId.includes('video')) return 'video';
    
    return 'any';
  };

  const isValidConnection = useCallback(
    (connection: Connection): boolean => {
      if (!connection.source || !connection.target) return false;

      // Don't allow self-connections
      if (connection.source === connection.target) {
        toast.error('Cannot connect node to itself');
        return false;
      }

      // Check for cycles
      if (wouldCreateCycle(connection)) {
        toast.error('Cycle detected: connection would create loop');
        return false;
      }

      // Type validation
      const sourceType = getHandleType(connection.source, connection.sourceHandle);
      const targetType = getHandleType(connection.target, connection.targetHandle);
      
      if (sourceType && targetType && sourceType !== 'any' && targetType !== 'any') {
        // Text can connect to anything (metadata passthrough)
        if (sourceType === 'text' || targetType === 'text') {
          return true;
        }
        
        // Otherwise require exact match
        if (sourceType !== targetType) {
          toast.error(`Type mismatch: cannot connect ${sourceType} to ${targetType}`);
          return false;
        }
      }

      return true;
    },
    [wouldCreateCycle, getHandleType]
  );

  return { isValidConnection, wouldCreateCycle };
};
