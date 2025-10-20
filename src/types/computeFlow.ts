// Compute Flow Type Definitions - Based on Functional Requirements

export type DataType = 'image' | 'text' | 'video' | 'tensor' | 'json' | 'any';
export type Cardinality = '1' | 'n'; // 1 = single connection, n = multiple
export type NodeStatus = 'idle' | 'queued' | 'running' | 'succeeded' | 'failed' | 'canceled' | 'dirty';
export type EdgeStatus = 'idle' | 'running' | 'succeeded' | 'error';

export interface Port {
  id: string;
  name: string;
  datatype: DataType;
  cardinality: Cardinality;
  optional?: boolean;
  position: 'top' | 'right' | 'bottom' | 'left';
}

export interface NodeDefinition {
  id: string;
  kind: 'Image' | 'Prompt' | 'Model' | 'Transform' | 'Output' | 'Gateway' | 'Text' | 'Video';
  version: string;
  label: string;
  position: { x: number; y: number };
  size?: { w: number; h: number };
  inputs: Port[];
  outputs: Port[];
  params: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  preview?: ArtifactRef;
  status: NodeStatus;
  progress?: number; // 0-100
  error?: string;
  isDirty?: boolean;
}

export interface EdgeDefinition {
  id: string;
  source: { nodeId: string; portId: string };
  target: { nodeId: string; portId: string };
  dataType: DataType;
  status: EdgeStatus;
  metadata?: { 
    label?: string;
    validationError?: string;
  };
}

export interface ArtifactRef {
  id: string;
  type: 'image' | 'video' | 'text' | 'json';
  url?: string;
  data?: any;
  metadata?: Record<string, unknown>;
}

export interface RunEvent {
  runId: string;
  nodeId: string;
  status: NodeStatus;
  progress?: number;
  logs?: Array<{ timestamp: string; message: string; level: 'info' | 'warn' | 'error' }>;
  artifacts?: ArtifactRef[];
  startedAt?: string;
  finishedAt?: string;
  error?: string;
}

export interface ComputeFlowGraph {
  schemaVersion: string;
  metadata: {
    title: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
  };
  nodes: NodeDefinition[];
  edges: EdgeDefinition[];
  viewState: {
    zoom: number;
    center: [number, number];
  };
}

// Connection Validation Rules
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export class ConnectionValidator {
  static validateConnection(
    sourcePort: Port,
    targetPort: Port,
    existingConnections: EdgeDefinition[],
    sourceNodeId: string,
    targetNodeId: string
  ): ValidationResult {
    // Check if connecting to same node
    if (sourceNodeId === targetNodeId) {
      return {
        valid: false,
        error: 'Cannot connect node to itself'
      };
    }

    // Check port types (input vs output)
    if (sourcePort.position === 'left' || targetPort.position === 'right') {
      return {
        valid: false,
        error: 'Can only connect output (right) to input (left)'
      };
    }

    // Check datatype compatibility
    if (!this.isDataTypeCompatible(sourcePort.datatype, targetPort.datatype)) {
      return {
        valid: false,
        error: `Type mismatch: cannot connect ${sourcePort.datatype} to ${targetPort.datatype}`
      };
    }

    // Check cardinality - source port
    if (sourcePort.cardinality === '1') {
      const existingSourceConnections = existingConnections.filter(
        edge => edge.source.nodeId === sourceNodeId && edge.source.portId === sourcePort.id
      );
      if (existingSourceConnections.length >= 1) {
        return {
          valid: false,
          error: 'Source port already connected (cardinality: 1)'
        };
      }
    }

    // Check cardinality - target port
    if (targetPort.cardinality === '1') {
      const existingTargetConnections = existingConnections.filter(
        edge => edge.target.nodeId === targetNodeId && edge.target.portId === targetPort.id
      );
      if (existingTargetConnections.length >= 1) {
        return {
          valid: false,
          error: 'Target port already connected (cardinality: 1)'
        };
      }
    }

    // Check for cycles (simplified - would need full graph traversal for complex cases)
    const wouldCreateCycle = this.detectCycle(
      sourceNodeId,
      targetNodeId,
      existingConnections
    );
    if (wouldCreateCycle) {
      return {
        valid: false,
        error: 'Cycle detected: connection would create loop'
      };
    }

    return { valid: true };
  }

  private static isDataTypeCompatible(sourceType: DataType, targetType: DataType): boolean {
    // 'any' type is compatible with everything
    if (sourceType === 'any' || targetType === 'any') return true;
    
    // Text can connect to any type (metadata/prompt)
    if (sourceType === 'text') return true;
    
    // Exact match required for other types
    return sourceType === targetType;
  }

  private static detectCycle(
    sourceNodeId: string,
    targetNodeId: string,
    edges: EdgeDefinition[]
  ): boolean {
    // Build adjacency list
    const graph = new Map<string, string[]>();
    edges.forEach(edge => {
      if (!graph.has(edge.source.nodeId)) {
        graph.set(edge.source.nodeId, []);
      }
      graph.get(edge.source.nodeId)!.push(edge.target.nodeId);
    });

    // Check if adding this edge would create a cycle
    // (i.e., if there's already a path from target to source)
    const visited = new Set<string>();
    const stack = [targetNodeId];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current === sourceNodeId) {
        return true; // Cycle detected
      }
      if (visited.has(current)) continue;
      visited.add(current);

      const neighbors = graph.get(current) || [];
      stack.push(...neighbors);
    }

    return false;
  }
}

// Node Type Definitions with Port Configurations
export const NODE_TYPE_CONFIGS: Record<string, { inputs: Omit<Port, 'id'>[]; outputs: Omit<Port, 'id'>[] }> = {
  Image: {
    inputs: [
      { name: 'prompt', datatype: 'text', cardinality: '1', optional: true, position: 'left' },
      { name: 'reference', datatype: 'image', cardinality: '1', optional: true, position: 'top' }
    ],
    outputs: [
      { name: 'image', datatype: 'image', cardinality: 'n', position: 'right' },
      { name: 'metadata', datatype: 'json', cardinality: 'n', position: 'bottom' }
    ]
  },
  Text: {
    inputs: [
      { name: 'input', datatype: 'text', cardinality: '1', optional: true, position: 'left' },
      { name: 'context', datatype: 'any', cardinality: 'n', optional: true, position: 'top' }
    ],
    outputs: [
      { name: 'text', datatype: 'text', cardinality: 'n', position: 'right' }
    ]
  },
  Video: {
    inputs: [
      { name: 'prompt', datatype: 'text', cardinality: '1', optional: true, position: 'left' },
      { name: 'image', datatype: 'image', cardinality: '1', optional: true, position: 'top' }
    ],
    outputs: [
      { name: 'video', datatype: 'video', cardinality: 'n', position: 'right' }
    ]
  },
  Transform: {
    inputs: [
      { name: 'input', datatype: 'any', cardinality: 'n', position: 'left' }
    ],
    outputs: [
      { name: 'output', datatype: 'any', cardinality: 'n', position: 'right' }
    ]
  },
  Model: {
    inputs: [
      { name: 'prompt', datatype: 'text', cardinality: '1', position: 'left' },
      { name: 'input', datatype: 'any', cardinality: '1', optional: true, position: 'top' }
    ],
    outputs: [
      { name: 'output', datatype: 'any', cardinality: 'n', position: 'right' }
    ]
  },
  Output: {
    inputs: [
      { name: 'input', datatype: 'any', cardinality: 'n', position: 'left' }
    ],
    outputs: []
  },
  Gateway: {
    inputs: [
      { name: 'input', datatype: 'any', cardinality: 'n', position: 'left' }
    ],
    outputs: [
      { name: 'output', datatype: 'any', cardinality: 'n', position: 'right' }
    ]
  }
};

// Dirty State Tracker
export class DirtyStateTracker {
  static markDirtyDownstream(
    nodeId: string,
    nodes: NodeDefinition[],
    edges: EdgeDefinition[]
  ): Set<string> {
    const dirtyNodes = new Set<string>();
    dirtyNodes.add(nodeId);

    // Build adjacency list
    const graph = new Map<string, string[]>();
    edges.forEach(edge => {
      if (!graph.has(edge.source.nodeId)) {
        graph.set(edge.source.nodeId, []);
      }
      graph.get(edge.source.nodeId)!.push(edge.target.nodeId);
    });

    // BFS to mark all downstream nodes
    const queue = [nodeId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      const downstream = graph.get(current) || [];
      downstream.forEach(nodeId => {
        if (!dirtyNodes.has(nodeId)) {
          dirtyNodes.add(nodeId);
          queue.push(nodeId);
        }
      });
    }

    return dirtyNodes;
  }

  static computeDirtySubgraph(
    nodes: NodeDefinition[],
    edges: EdgeDefinition[]
  ): { nodes: NodeDefinition[]; edges: EdgeDefinition[] } {
    const dirtyNodeIds = new Set(
      nodes.filter(n => n.isDirty || n.status === 'dirty').map(n => n.id)
    );

    const dirtyEdges = edges.filter(
      edge => dirtyNodeIds.has(edge.source.nodeId) || dirtyNodeIds.has(edge.target.nodeId)
    );

    const dirtyNodes = nodes.filter(n => dirtyNodeIds.has(n.id));

    return { nodes: dirtyNodes, edges: dirtyEdges };
  }
}
