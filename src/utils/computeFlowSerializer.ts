// Utilities for converting between internal block format and Compute Flow format

import { Block } from '@/pages/StudioPage';
import { Connection } from '@/types/blockTypes';
import { ComputeFlowGraph, NodeDefinition, EdgeDefinition, NODE_TYPE_CONFIGS } from '@/types/computeFlow';
import { v4 as uuidv4 } from 'uuid';

/**
 * Convert internal blocks and connections to Compute Flow format
 */
export function serializeToComputeFlow(
  blocks: Block[],
  connections: Connection[],
  metadata: {
    title?: string;
    description?: string;
    userId?: string;
  }
): ComputeFlowGraph {
  const nodes: NodeDefinition[] = blocks.map(block => {
    const kind = block.type === 'text' ? 'Text' 
      : block.type === 'image' ? 'Image' 
      : 'Video';
    
    const config = NODE_TYPE_CONFIGS[kind];
    
    return {
      id: block.id,
      kind,
      version: '1.0.0',
      label: block.initialData?.prompt || `${kind} Block`,
      position: block.position,
      inputs: config.inputs.map((input, idx) => ({
        ...input,
        id: `${block.id}-input-${idx}`
      })),
      outputs: config.outputs.map((output, idx) => ({
        ...output,
        id: `${block.id}-output-${idx}`
      })),
      params: block.initialData || {},
      status: 'idle',
      metadata: {
        createdAt: new Date().toISOString()
      }
    };
  });

  const edges: EdgeDefinition[] = connections.map(conn => ({
    id: conn.id,
    source: {
      nodeId: conn.sourceBlockId,
      portId: conn.sourcePointId || 'output-0'
    },
    target: {
      nodeId: conn.targetBlockId,
      portId: conn.targetPointId || 'input-0'
    },
    dataType: conn.dataType,
    status: 'idle'
  }));

  return {
    schemaVersion: '1.0.0',
    metadata: {
      title: metadata.title || 'Untitled Workflow',
      description: metadata.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: metadata.userId || 'anonymous'
    },
    nodes,
    edges,
    viewState: {
      zoom: 1.0,
      center: [0, 0]
    }
  };
}

/**
 * Convert Compute Flow format back to internal blocks and connections
 */
export function deserializeFromComputeFlow(
  graph: ComputeFlowGraph
): { blocks: Block[]; connections: Connection[] } {
  const blocks: Block[] = graph.nodes.map(node => ({
    id: node.id,
    type: node.kind === 'Text' ? 'text' 
      : node.kind === 'Image' ? 'image' 
      : 'video',
    position: node.position,
    initialData: node.params as any
  }));

  const connections: Connection[] = graph.edges.map(edge => ({
    id: edge.id,
    sourceBlockId: edge.source.nodeId,
    targetBlockId: edge.target.nodeId,
    sourcePoint: 'right',
    targetPoint: 'left',
    dataType: edge.dataType,
    sourcePointId: edge.source.portId,
    targetPointId: edge.target.portId
  }));

  return { blocks, connections };
}

/**
 * Validate a Compute Flow graph for execution
 */
export function validateComputeFlow(graph: ComputeFlowGraph): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for output nodes
  const outputNodes = graph.nodes.filter(n => n.kind === 'Output');
  if (outputNodes.length === 0) {
    errors.push('Workflow must have at least one Output node');
  }

  // Check all nodes have valid configurations
  graph.nodes.forEach(node => {
    // Check required inputs are connected
    const requiredInputs = node.inputs.filter(i => !i.optional);
    requiredInputs.forEach(input => {
      const hasConnection = graph.edges.some(
        e => e.target.nodeId === node.id && e.target.portId === input.id
      );
      if (!hasConnection) {
        errors.push(`Node "${node.label}" is missing required input "${input.name}"`);
      }
    });
  });

  // Check for disconnected nodes
  const connectedNodeIds = new Set<string>();
  graph.edges.forEach(edge => {
    connectedNodeIds.add(edge.source.nodeId);
    connectedNodeIds.add(edge.target.nodeId);
  });

  graph.nodes.forEach(node => {
    if (!connectedNodeIds.has(node.id) && node.kind !== 'Output') {
      errors.push(`Node "${node.label}" is not connected to the workflow`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generate execution plan from Compute Flow graph
 * Returns nodes in topological order for execution
 */
export function generateExecutionPlan(graph: ComputeFlowGraph): {
  executionOrder: string[];
  cycles: string[][];
} {
  const executionOrder: string[] = [];
  const cycles: string[][] = [];
  
  // Build adjacency list
  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  
  graph.nodes.forEach(node => {
    adjacency.set(node.id, []);
    inDegree.set(node.id, 0);
  });
  
  graph.edges.forEach(edge => {
    adjacency.get(edge.source.nodeId)!.push(edge.target.nodeId);
    inDegree.set(edge.target.nodeId, (inDegree.get(edge.target.nodeId) || 0) + 1);
  });
  
  // Kahn's algorithm for topological sort
  const queue: string[] = [];
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId);
    }
  });
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    executionOrder.push(current);
    
    const neighbors = adjacency.get(current) || [];
    neighbors.forEach(neighbor => {
      const newDegree = inDegree.get(neighbor)! - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) {
        queue.push(neighbor);
      }
    });
  }
  
  // If not all nodes are in execution order, there are cycles
  if (executionOrder.length !== graph.nodes.length) {
    const remainingNodes = graph.nodes
      .map(n => n.id)
      .filter(id => !executionOrder.includes(id));
    cycles.push(remainingNodes);
  }
  
  return { executionOrder, cycles };
}
