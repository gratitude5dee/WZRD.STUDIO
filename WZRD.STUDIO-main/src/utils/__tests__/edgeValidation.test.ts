import { describe, it, expect } from 'vitest';
import {
  isTypeCompatible,
  wouldCreateCycle,
  validateConnection,
} from '@/utils/edgeValidation';
import type { NodeDefinition, EdgeDefinition, Port } from '@/types/computeFlow';

const createNode = (
  id: string,
  overrides: Partial<NodeDefinition> = {}
): NodeDefinition => ({
  id,
  kind: 'Text',
  version: '1.0.0',
  label: overrides.label ?? id,
  position: { x: 0, y: 0 },
  inputs: overrides.inputs ?? [],
  outputs: overrides.outputs ?? [],
  params: {},
  status: 'idle',
});

const createPort = (id: string, datatype = 'text'): Port => ({
  id,
  name: id,
  datatype: datatype as Port['datatype'],
  cardinality: '1',
  position: 'left',
});

describe('edgeValidation', () => {
  it('allows compatible types', () => {
    expect(isTypeCompatible('image', 'image')).toBe(true);
    expect(isTypeCompatible('text', 'string')).toBe(true);
  });

  it('rejects incompatible types', () => {
    expect(isTypeCompatible('image', 'json')).toBe(false);
  });

  it('detects cycles', () => {
    const edges: EdgeDefinition[] = [
      {
        id: 'edge-1',
        source: { nodeId: 'A', portId: 'out' },
        target: { nodeId: 'B', portId: 'in' },
        dataType: 'text',
        status: 'idle',
      },
    ];
    expect(wouldCreateCycle('B', 'A', edges)).toBe(true);
    expect(wouldCreateCycle('B', 'C', edges)).toBe(false);
  });

  it('validates a compatible connection', () => {
    const sourcePort = { ...createPort('out', 'image'), position: 'right' as const, cardinality: 'n' as const };
    const targetPort = { ...createPort('in', 'image'), position: 'left' as const, cardinality: '1' as const };
    const sourceNode = createNode('source', { outputs: [sourcePort] });
    const targetNode = createNode('target', { inputs: [targetPort] });

    const result = validateConnection({
      sourceNode,
      sourcePort,
      targetNode,
      targetPort,
      existingEdges: [],
    });

    expect(result.valid).toBe(true);
  });

  it('rejects self-connection', () => {
    const sourcePort = { ...createPort('out', 'image'), position: 'right' as const, cardinality: '1' as const };
    const targetPort = { ...createPort('in', 'image'), position: 'left' as const, cardinality: '1' as const };
    const node = createNode('same', { outputs: [sourcePort], inputs: [targetPort] });

    const result = validateConnection({
      sourceNode: node,
      sourcePort,
      targetNode: node,
      targetPort,
      existingEdges: [],
    });

    expect(result.valid).toBe(false);
    expect(result.error).toContain('itself');
  });
});
