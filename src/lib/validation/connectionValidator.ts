import { Port } from '@/types/computeFlow';
import { Edge, Node } from 'reactflow';

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export class ConnectionValidator {
  validateConnection(
    sourceNode: Node,
    targetNode: Node,
    sourceHandle: string | null,
    targetHandle: string | null,
    existingEdges: Edge[]
  ): ValidationResult {
    // Find port definitions
    const sourcePort = sourceNode.data.outputs?.find((p: Port) => p.id === sourceHandle);
    const targetPort = targetNode.data.inputs?.find((p: Port) => p.id === targetHandle);

    if (!sourcePort || !targetPort) {
      return { valid: false, reason: 'Invalid port connection' };
    }

    // 1. Datatype compatibility
    if (!this.isDatatypeCompatible(sourcePort.datatype, targetPort.datatype)) {
      return {
        valid: false,
        reason: `Type mismatch: Cannot connect ${sourcePort.datatype} to ${targetPort.datatype}`,
      };
    }

    // 2. Cardinality check - ensure target port doesn't exceed max connections
    const targetConnections = existingEdges.filter(
      (e) => e.target === targetNode.id && e.targetHandle === targetHandle
    ).length;

    if (targetConnections >= targetPort.cardinality.max) {
      return {
        valid: false,
        reason: `Port "${targetPort.name}" accepts maximum ${targetPort.cardinality.max} connection${targetPort.cardinality.max > 1 ? 's' : ''}`,
      };
    }

    // 3. Source cardinality check
    const sourceConnections = existingEdges.filter(
      (e) => e.source === sourceNode.id && e.sourceHandle === sourceHandle
    ).length;

    if (sourcePort.cardinality && sourceConnections >= sourcePort.cardinality.max) {
      return {
        valid: false,
        reason: `Source port "${sourcePort.name}" has reached maximum ${sourcePort.cardinality.max} connection${sourcePort.cardinality.max > 1 ? 's' : ''}`,
      };
    }

    // 4. Cycle detection - prevent circular dependencies
    if (this.createsCycle(sourceNode.id, targetNode.id, existingEdges)) {
      return { valid: false, reason: 'Connection would create a cycle in the workflow' };
    }

    // 5. Self-connection prevention
    if (sourceNode.id === targetNode.id) {
      return { valid: false, reason: 'Cannot connect a node to itself' };
    }

    return { valid: true };
  }

  private isDatatypeCompatible(source: string, target: string): boolean {
    // Exact match
    if (source === target) return true;
    
    // 'any' accepts everything
    if (target === 'any' || source === 'any') return true;
    
    // Wildcard matching: "image/png" → "image/*"
    if (target.endsWith('/*')) {
      const baseType = target.split('/')[0];
      return source.startsWith(baseType + '/');
    }
    
    // Specific to wildcard: "image/*" → "image/png"
    if (source.endsWith('/*')) {
      const baseType = source.split('/')[0];
      return target.startsWith(baseType + '/');
    }
    
    return false;
  }

  private createsCycle(sourceId: string, targetId: string, edges: Edge[]): boolean {
    // Use BFS to detect if adding this edge would create a cycle
    // Start from the target and see if we can reach the source by following edges
    const visited = new Set<string>();
    const queue = [targetId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      // If we reached the source node, we found a cycle
      if (current === sourceId) return true;
      
      if (visited.has(current)) continue;
      visited.add(current);

      // Add all nodes that current connects to
      edges
        .filter((e) => e.source === current)
        .forEach((e) => queue.push(e.target));
    }

    return false;
  }

  /**
   * Validates an entire graph for consistency
   * Useful for import/load operations
   */
  validateGraph(nodes: Node[], edges: Edge[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check each edge
    edges.forEach((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);

      if (!sourceNode) {
        errors.push(`Edge ${edge.id}: Source node ${edge.source} not found`);
        return;
      }

      if (!targetNode) {
        errors.push(`Edge ${edge.id}: Target node ${edge.target} not found`);
        return;
      }

      const result = this.validateConnection(
        sourceNode,
        targetNode,
        edge.sourceHandle || null,
        edge.targetHandle || null,
        edges
      );

      if (!result.valid) {
        errors.push(`Edge ${edge.id}: ${result.reason}`);
      }
    });

    // Check for orphaned nodes (nodes with required inputs but no connections)
    nodes.forEach((node) => {
      const requiredInputs = node.data.inputs?.filter((p: Port) => !p.optional) || [];
      
      requiredInputs.forEach((input: Port) => {
        const hasConnection = edges.some(
          (e) => e.target === node.id && e.targetHandle === input.id
        );

        if (!hasConnection) {
          errors.push(`Node ${node.data.label || node.id}: Required input "${input.name}" is not connected`);
        }
      });
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
