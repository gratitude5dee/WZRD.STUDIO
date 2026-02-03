import type { EdgeDefinition, NodeDefinition, Port } from '@/types/computeFlow';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
}

export interface ConnectionContext {
  sourceNode: NodeDefinition;
  sourcePort: Port;
  targetNode: NodeDefinition;
  targetPort: Port;
  existingEdges: EdgeDefinition[];
}

const TYPE_COMPATIBILITY: Record<string, string[]> = {
  image: ['image', 'any'],
  video: ['video', 'any'],
  text: ['text', 'string', 'any', 'image', 'video', 'audio', 'json', 'tensor'],
  string: ['text', 'string', 'any'],
  number: ['number', 'any'],
  boolean: ['boolean', 'any'],
  audio: ['audio', 'any'],
  json: ['json', 'any'],
  tensor: ['tensor', 'any'],
  any: ['any', 'image', 'text', 'video', 'audio', 'json', 'tensor'],
};

export function isTypeCompatible(sourceType: string, targetType: string): boolean {
  const normalizedSource = sourceType?.toLowerCase() ?? 'any';
  const normalizedTarget = targetType?.toLowerCase() ?? 'any';

  if (normalizedSource === normalizedTarget) return true;

  const compatible = TYPE_COMPATIBILITY[normalizedSource] ?? [];
  return compatible.includes(normalizedTarget);
}

export function wouldCreateCycle(
  sourceNodeId: string,
  targetNodeId: string,
  edges: EdgeDefinition[]
): boolean {
  if (sourceNodeId === targetNodeId) return true;

  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    const sources = adjacency.get(edge.source.nodeId) ?? [];
    sources.push(edge.target.nodeId);
    adjacency.set(edge.source.nodeId, sources);
  }

  const visited = new Set<string>();
  const stack = [targetNodeId];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current === sourceNodeId) return true;
    if (visited.has(current)) continue;
    visited.add(current);

    const neighbors = adjacency.get(current) ?? [];
    stack.push(...neighbors);
  }

  return false;
}

export function validateConnection(context: ConnectionContext): ValidationResult {
  const { sourceNode, sourcePort, targetNode, targetPort, existingEdges } = context;

  if (sourceNode.id === targetNode.id) {
    return { valid: false, error: 'Cannot connect a node to itself' };
  }

  const sourceType = sourcePort.datatype ?? 'any';
  const targetType = targetPort.datatype ?? 'any';

  if (!isTypeCompatible(sourceType, targetType)) {
    return {
      valid: false,
      error: `Type mismatch: ${sourceType} cannot connect to ${targetType}`,
    };
  }

  const existingInputConnection = existingEdges.find(
    (edge) =>
      edge.target.nodeId === targetNode.id && edge.target.portId === targetPort.id
  );

  if (targetPort.cardinality === '1' && existingInputConnection) {
    return {
      valid: false,
      error: 'This input is already connected. Remove the existing connection first.',
    };
  }

  if (wouldCreateCycle(sourceNode.id, targetNode.id, existingEdges)) {
    return {
      valid: false,
      error: 'This connection would create a cycle in the workflow',
    };
  }

  const sourceIsOutput = sourceNode.outputs?.some((port) => port.id === sourcePort.id);
  const targetIsInput = targetNode.inputs?.some((port) => port.id === targetPort.id);

  if (!sourceIsOutput) {
    return { valid: false, error: 'Source must be an output port' };
  }
  if (!targetIsInput) {
    return { valid: false, error: 'Target must be an input port' };
  }

  const duplicateEdge = existingEdges.find(
    (edge) =>
      edge.source.nodeId === sourceNode.id &&
      edge.source.portId === sourcePort.id &&
      edge.target.nodeId === targetNode.id &&
      edge.target.portId === targetPort.id
  );

  if (duplicateEdge) {
    return { valid: false, error: 'This connection already exists' };
  }

  let warning: string | undefined;

  if (sourceType === 'any' || targetType === 'any') {
    warning = 'Using flexible type - ensure data formats are compatible at runtime';
  }

  return { valid: true, warning };
}

export function validateAllEdges(
  nodes: NodeDefinition[],
  edges: EdgeDefinition[]
): { valid: boolean; errors: Array<{ edgeId: string; error: string }> } {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const errors: Array<{ edgeId: string; error: string }> = [];

  for (const edge of edges) {
    const sourceNode = nodeMap.get(edge.source.nodeId);
    const targetNode = nodeMap.get(edge.target.nodeId);

    if (!sourceNode) {
      errors.push({
        edgeId: edge.id,
        error: `Source node ${edge.source.nodeId} not found`,
      });
      continue;
    }

    if (!targetNode) {
      errors.push({
        edgeId: edge.id,
        error: `Target node ${edge.target.nodeId} not found`,
      });
      continue;
    }

    const sourcePort = sourceNode.outputs?.find(
      (port) => port.id === edge.source.portId
    );
    const targetPort = targetNode.inputs?.find(
      (port) => port.id === edge.target.portId
    );

    if (!sourcePort) {
      errors.push({
        edgeId: edge.id,
        error: `Source port ${edge.source.portId} not found on ${sourceNode.label}`,
      });
      continue;
    }

    if (!targetPort) {
      errors.push({
        edgeId: edge.id,
        error: `Target port ${edge.target.portId} not found on ${targetNode.label}`,
      });
      continue;
    }

    const otherEdges = edges.filter((candidate) => candidate.id !== edge.id);
    const result = validateConnection({
      sourceNode,
      sourcePort,
      targetNode,
      targetPort,
      existingEdges: otherEdges,
    });

    if (!result.valid) {
      errors.push({ edgeId: edge.id, error: result.error ?? 'Invalid connection' });
    }
  }

  return { valid: errors.length === 0, errors };
}
