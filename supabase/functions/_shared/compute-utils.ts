/**
 * Compute Flow Utilities
 * Production-grade compute graph execution engine
 * Supports topological sort, input collection, caching, and type handling
 */

// ============= Type Definitions =============

export interface ComputeNode {
  id: string;
  kind: string;
  label: string;
  params: Record<string, any>;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  preview?: any;
  status?: string;
  position?: { x: number; y: number };
  data?: Record<string, any>;
}

export interface ComputeEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  source_port_id: string;
  target_port_id: string;
}

export interface ExecutionContext {
  runId: string;
  projectId: string;
  userId: string;
  outputs: Map<string, any>;
  failedNodes: Set<string>;
}

// ============= Topological Sort =============

/**
 * Topological Sort using Kahn's Algorithm
 * Returns nodes grouped by execution level for parallel processing
 * 
 * @param nodes - Array of compute nodes
 * @param edges - Array of compute edges
 * @returns Array of node arrays, each inner array can execute in parallel
 * @throws Error if cycle detected
 */
export function topoSort(nodes: ComputeNode[], edges: ComputeEdge[]): ComputeNode[][] {
  console.log('[ComputeFlow] Starting topological sort');
  console.log('[ComputeFlow] Nodes:', nodes.map(n => `${n.id}(${n.kind})`));
  console.log('[ComputeFlow] Edges:', edges.map(e => `${e.source_node_id}->${e.target_node_id}`));

  // Initialize in-degree map
  const inDegree: Record<string, number> = {};
  nodes.forEach(node => {
    inDegree[node.id] = 0;
  });

  // Calculate in-degrees
  edges.forEach(edge => {
    if (inDegree[edge.target_node_id] !== undefined) {
      inDegree[edge.target_node_id] += 1;
    }
  });

  // Initialize queue with nodes that have no incoming edges
  const queue: string[] = [];
  Object.keys(inDegree).forEach(id => {
    if (inDegree[id] === 0) queue.push(id);
  });

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const ordered: ComputeNode[][] = [];

  while (queue.length > 0) {
    // Process all nodes at current level (can run in parallel)
    const currentLevel: ComputeNode[] = [];
    const levelSize = queue.length;

    for (let i = 0; i < levelSize; i++) {
      const id = queue.shift();
      if (id === undefined) break;

      const node = nodeMap.get(id);
      if (node) currentLevel.push(node);

      // Update in-degrees for downstream nodes
      edges.forEach(edge => {
        if (edge.source_node_id === id) {
          inDegree[edge.target_node_id] -= 1;
          if (inDegree[edge.target_node_id] === 0) {
            queue.push(edge.target_node_id);
          }
        }
      });
    }

    if (currentLevel.length > 0) {
      ordered.push(currentLevel);
    }
  }

  // Check for cycles (nodes with remaining in-degree > 0)
  const processedCount = ordered.flat().length;
  if (processedCount !== nodes.length) {
    const remainingNodes = nodes.filter(n => !ordered.flat().some(o => o.id === n.id));
    console.error('[ComputeFlow] Cycle detected! Remaining nodes:', remainingNodes.map(n => n.id));
    throw new Error(`Cycle detected in graph - cannot execute. ${nodes.length - processedCount} nodes unreachable.`);
  }

  console.log('[ComputeFlow] Sorted levels:', ordered.map(level => level.map(n => n.id)));
  return ordered;
}

/**
 * Flatten topological sort result into single execution order
 */
export function topoSortFlat(nodes: ComputeNode[], edges: ComputeEdge[]): string[] {
  const levels = topoSort(nodes, edges);
  return levels.flat().map(n => n.id);
}

// ============= Input Collection =============

/**
 * Collect inputs for a node based on upstream outputs
 * 
 * @param node - The target node
 * @param edges - All edges in the graph
 * @param outputs - Map of nodeId -> output value
 * @returns Record of portId -> value
 */
export function collectInputs(
  node: ComputeNode,
  edges: ComputeEdge[],
  outputs: Map<string, any>
): Record<string, any> {
  const inputs: Record<string, any> = {};

  edges.forEach(edge => {
    if (edge.target_node_id === node.id) {
      const value = outputs.get(edge.source_node_id);
      const handleName = edge.target_port_id ?? 'input';

      console.log(`[ComputeFlow] Edge ${edge.source_node_id} -> ${node.id} handle=${handleName}`);

      if (value !== undefined) {
        // Handle multi-input ports (e.g., combine nodes)
        if (inputs[handleName] !== undefined) {
          // Convert to array if multiple inputs to same port
          if (Array.isArray(inputs[handleName])) {
            inputs[handleName].push(value);
          } else {
            inputs[handleName] = [inputs[handleName], value];
          }
        } else {
          inputs[handleName] = value;
        }
      }
    }
  });

  console.log(`[ComputeFlow] collectInputs for ${node.id}:`, JSON.stringify(inputs).substring(0, 200));
  return inputs;
}

/**
 * Extract the primary value from node preview/output
 */
export function extractOutputValue(preview: any): any {
  if (!preview) return null;
  
  // Handle different preview structures
  if (preview.url) return preview.url;
  if (preview.data) return preview.data;
  if (preview.text) return preview.text;
  if (preview.value) return preview.value;
  if (typeof preview === 'string') return preview;
  
  return preview;
}

// ============= Input Normalization =============

/**
 * Normalize input values - handles nested objects and arrays recursively
 */
export async function normalizeInputValues(value: any): Promise<any> {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return Promise.all(value.map(item => normalizeInputValues(item)));
  }

  if (value && typeof value === 'object') {
    const entries = await Promise.all(
      Object.entries(value).map(async ([k, v]) => [k, await normalizeInputValues(v)])
    );
    return Object.fromEntries(entries);
  }

  return value;
}

/**
 * Substitute template variables in a string
 * Supports {{variable}} syntax
 */
export function substituteVariables(template: string, variables: Record<string, any>): string {
  if (!template || typeof template !== 'string') return template || '';
  
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
    result = result.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), stringValue);
  });
  
  return result;
}

// ============= Cache Utilities =============

/**
 * Generate SHA256 hash for cache key
 */
export async function generateInputHash(inputs: Record<string, any>): Promise<string> {
  const encoder = new TextEncoder();
  // Sort keys for consistent hashing
  const sortedData = JSON.stringify(inputs, Object.keys(inputs).sort());
  const data = encoder.encode(sortedData);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============= Type Utilities =============

/**
 * Get the output type for a node kind
 */
export function getOutputType(nodeKind: string): string {
  const typeMap: Record<string, string> = {
    'Text': 'text',
    'Prompt': 'text',
    'Image': 'image',
    'Video': 'video',
    'Audio': 'audio',
    'Output': 'any',
    'Transform': 'any',
    'Combine': 'any',
    'Upload': 'file',
  };
  
  return typeMap[nodeKind] || 'unknown';
}

/**
 * Check if two port types are compatible for connection
 */
export function areTypesCompatible(sourceType: string, targetType: string): boolean {
  if (targetType === 'any') return true;
  if (sourceType === 'any') return true;
  if (sourceType === targetType) return true;
  
  // Text can connect to prompt inputs
  if (sourceType === 'text' && targetType === 'prompt') return true;
  
  // Image arrays can connect to image inputs
  if (sourceType === 'image_array' && targetType === 'image') return true;
  
  return false;
}

// ============= Dependency Checking =============

/**
 * Check if a node has any failed upstream dependencies
 */
export function hasFailedDependency(
  nodeId: string,
  edges: ComputeEdge[],
  failedNodes: Set<string>
): boolean {
  return edges.some(
    edge => edge.target_node_id === nodeId && failedNodes.has(edge.source_node_id)
  );
}

/**
 * Get all upstream node IDs for a given node
 */
export function getUpstreamNodes(nodeId: string, edges: ComputeEdge[]): string[] {
  return edges
    .filter(edge => edge.target_node_id === nodeId)
    .map(edge => edge.source_node_id);
}

/**
 * Get all downstream node IDs for a given node
 */
export function getDownstreamNodes(nodeId: string, edges: ComputeEdge[]): string[] {
  return edges
    .filter(edge => edge.source_node_id === nodeId)
    .map(edge => edge.target_node_id);
}

// ============= SSE Helpers =============

const encoder = new TextEncoder();

/**
 * Create an SSE event string
 */
export function createSSEEvent(event: string, data: Record<string, unknown>): Uint8Array {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

/**
 * Create SSE stream response headers
 */
export function getSSEHeaders(corsHeaders: Record<string, string>) {
  return {
    ...corsHeaders,
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable nginx buffering
  };
}
