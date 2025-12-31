/**
 * Unit Tests for ConnectionValidator
 * 
 * Tests the compute graph connection validation logic including:
 * - Type compatibility
 * - Cardinality enforcement
 * - Cycle detection
 * - Self-connection prevention
 */

import { describe, it, expect } from 'vitest';
import {
  ConnectionValidator,
  isTypeCompatible,
  TYPE_COMPATIBILITY,
  HANDLE_COLORS,
  type Port,
  type EdgeDefinition,
  type DataType,
} from '@/types/computeFlow';

describe('ConnectionValidator', () => {
  // Helper to create ports
  const createPort = (overrides: Partial<Port>): Port => ({
    id: 'port-1',
    name: 'test',
    datatype: 'any' as DataType,
    cardinality: 'n',
    position: 'right',
    ...overrides,
  });

  // Helper to create edges
  const createEdge = (
    sourceNodeId: string,
    sourcePortId: string,
    targetNodeId: string,
    targetPortId: string
  ): EdgeDefinition => ({
    id: `edge-${sourceNodeId}-${targetNodeId}`,
    source: { nodeId: sourceNodeId, portId: sourcePortId },
    target: { nodeId: targetNodeId, portId: targetPortId },
    dataType: 'any',
    status: 'idle',
  });

  describe('validateConnection', () => {
    describe('self-connection prevention', () => {
      it('rejects connection from node to itself', () => {
        const sourcePort = createPort({ position: 'right', datatype: 'text' });
        const targetPort = createPort({ position: 'left', datatype: 'text' });
        
        const result = ConnectionValidator.validateConnection(
          sourcePort,
          targetPort,
          [],
          'node-1', // Same node
          'node-1'  // Same node
        );
        
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Cannot connect node to itself');
      });
    });

    describe('type compatibility', () => {
      const compatiblePairs: Array<[DataType, DataType]> = [
        ['text', 'text'],
        ['text', 'image'],      // Text is universally compatible
        ['text', 'video'],
        ['text', 'audio'],
        ['image', 'image'],
        ['image', 'any'],
        ['video', 'video'],
        ['video', 'any'],
        ['audio', 'audio'],
        ['audio', 'any'],
        ['any', 'image'],
        ['any', 'text'],
        ['any', 'any'],
      ];

      compatiblePairs.forEach(([source, target]) => {
        it(`allows ${source} → ${target}`, () => {
          const sourcePort = createPort({ position: 'right', datatype: source });
          const targetPort = createPort({ position: 'left', datatype: target });
          
          const result = ConnectionValidator.validateConnection(
            sourcePort,
            targetPort,
            [],
            'node-1',
            'node-2'
          );
          
          expect(result.valid).toBe(true);
        });
      });

      const incompatiblePairs: Array<[DataType, DataType]> = [
        ['image', 'text'],
        ['image', 'video'],
        ['image', 'audio'],
        ['video', 'text'],
        ['video', 'image'],
        ['video', 'audio'],
        ['audio', 'text'],
        ['audio', 'image'],
        ['audio', 'video'],
      ];

      incompatiblePairs.forEach(([source, target]) => {
        it(`rejects ${source} → ${target}`, () => {
          const sourcePort = createPort({ position: 'right', datatype: source });
          const targetPort = createPort({ position: 'left', datatype: target });
          
          const result = ConnectionValidator.validateConnection(
            sourcePort,
            targetPort,
            [],
            'node-1',
            'node-2'
          );
          
          expect(result.valid).toBe(false);
          expect(result.error).toContain('Type mismatch');
        });
      });
    });

    describe('cardinality enforcement', () => {
      describe('source port cardinality', () => {
        it('allows multiple connections from cardinality: n port', () => {
          const sourcePort = createPort({ 
            id: 'output-1',
            position: 'right', 
            datatype: 'image',
            cardinality: 'n' 
          });
          const targetPort = createPort({ 
            id: 'input-1',
            position: 'left', 
            datatype: 'image',
            cardinality: 'n'
          });
          
          // Existing connection from same source
          const existingEdges = [
            createEdge('node-1', 'output-1', 'node-2', 'input-x')
          ];
          
          const result = ConnectionValidator.validateConnection(
            sourcePort,
            targetPort,
            existingEdges,
            'node-1',
            'node-3'
          );
          
          expect(result.valid).toBe(true);
        });

        it('rejects second connection from cardinality: 1 port', () => {
          const sourcePort = createPort({ 
            id: 'output-1',
            position: 'right', 
            datatype: 'image',
            cardinality: '1' 
          });
          const targetPort = createPort({ 
            id: 'input-1',
            position: 'left', 
            datatype: 'image',
            cardinality: 'n'
          });
          
          // Existing connection from same source port
          const existingEdges = [
            createEdge('node-1', 'output-1', 'node-2', 'input-x')
          ];
          
          const result = ConnectionValidator.validateConnection(
            sourcePort,
            targetPort,
            existingEdges,
            'node-1',
            'node-3'
          );
          
          expect(result.valid).toBe(false);
          expect(result.error).toContain('Source port already connected');
        });
      });

      describe('target port cardinality', () => {
        it('allows multiple connections to cardinality: n port', () => {
          const sourcePort = createPort({ 
            id: 'output-1',
            position: 'right', 
            datatype: 'text',
            cardinality: 'n' 
          });
          const targetPort = createPort({ 
            id: 'input-1',
            position: 'left', 
            datatype: 'text',
            cardinality: 'n'
          });
          
          // Existing connection to same target
          const existingEdges = [
            createEdge('node-0', 'output-x', 'node-2', 'input-1')
          ];
          
          const result = ConnectionValidator.validateConnection(
            sourcePort,
            targetPort,
            existingEdges,
            'node-1',
            'node-2'
          );
          
          expect(result.valid).toBe(true);
        });

        it('rejects second connection to cardinality: 1 port', () => {
          const sourcePort = createPort({ 
            id: 'output-1',
            position: 'right', 
            datatype: 'text',
            cardinality: 'n' 
          });
          const targetPort = createPort({ 
            id: 'input-1',
            position: 'left', 
            datatype: 'text',
            cardinality: '1'
          });
          
          // Existing connection to same target port
          const existingEdges = [
            createEdge('node-0', 'output-x', 'node-2', 'input-1')
          ];
          
          const result = ConnectionValidator.validateConnection(
            sourcePort,
            targetPort,
            existingEdges,
            'node-1',
            'node-2'
          );
          
          expect(result.valid).toBe(false);
          expect(result.error).toContain('Target port already connected');
        });
      });
    });

    describe('cycle detection', () => {
      it('detects direct cycle (A → B → A)', () => {
        const sourcePort = createPort({ position: 'right', datatype: 'text' });
        const targetPort = createPort({ position: 'left', datatype: 'text' });
        
        // Existing: B → A
        const existingEdges = [
          createEdge('node-B', 'output-1', 'node-A', 'input-1')
        ];
        
        // Trying to add: A → B (would create cycle)
        const result = ConnectionValidator.validateConnection(
          sourcePort,
          targetPort,
          existingEdges,
          'node-A',
          'node-B'
        );
        
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Cycle detected');
      });

      it('detects indirect cycle (A → B → C → A)', () => {
        const sourcePort = createPort({ position: 'right', datatype: 'text' });
        const targetPort = createPort({ position: 'left', datatype: 'text' });
        
        // Existing: B → C, C → A
        const existingEdges = [
          createEdge('node-B', 'output-1', 'node-C', 'input-1'),
          createEdge('node-C', 'output-1', 'node-A', 'input-1'),
        ];
        
        // Trying to add: A → B (would create cycle)
        const result = ConnectionValidator.validateConnection(
          sourcePort,
          targetPort,
          existingEdges,
          'node-A',
          'node-B'
        );
        
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Cycle detected');
      });

      it('allows valid DAG connections', () => {
        const sourcePort = createPort({ position: 'right', datatype: 'text' });
        const targetPort = createPort({ position: 'left', datatype: 'text' });
        
        // Existing: A → B, B → C (linear chain)
        const existingEdges = [
          createEdge('node-A', 'output-1', 'node-B', 'input-1'),
          createEdge('node-B', 'output-1', 'node-C', 'input-1'),
        ];
        
        // Adding: A → C (skip connection, still DAG)
        const result = ConnectionValidator.validateConnection(
          sourcePort,
          targetPort,
          existingEdges,
          'node-A',
          'node-C'
        );
        
        expect(result.valid).toBe(true);
      });

      it('allows diamond pattern (no cycle)', () => {
        const sourcePort = createPort({ position: 'right', datatype: 'text' });
        const targetPort = createPort({ position: 'left', datatype: 'text' });
        
        // Diamond: A → B, A → C, B → D, (trying C → D)
        const existingEdges = [
          createEdge('node-A', 'output-1', 'node-B', 'input-1'),
          createEdge('node-A', 'output-2', 'node-C', 'input-1'),
          createEdge('node-B', 'output-1', 'node-D', 'input-1'),
        ];
        
        // Adding: C → D (completes diamond, no cycle)
        const result = ConnectionValidator.validateConnection(
          sourcePort,
          targetPort,
          existingEdges,
          'node-C',
          'node-D'
        );
        
        expect(result.valid).toBe(true);
      });
    });
  });
});

describe('isTypeCompatible', () => {
  describe('any type', () => {
    it('any accepts any type', () => {
      const types: DataType[] = ['text', 'image', 'video', 'audio', 'tensor', 'json', 'any'];
      types.forEach(t => {
        expect(isTypeCompatible('any', t)).toBe(true);
        expect(isTypeCompatible(t, 'any')).toBe(true);
      });
    });
  });

  describe('text type', () => {
    it('text is universally compatible as source', () => {
      const types: DataType[] = ['text', 'image', 'video', 'audio', 'tensor', 'json', 'any'];
      types.forEach(t => {
        expect(isTypeCompatible('text', t)).toBe(true);
      });
    });
  });

  describe('strict type matching', () => {
    it('image only connects to image or any', () => {
      expect(isTypeCompatible('image', 'image')).toBe(true);
      expect(isTypeCompatible('image', 'any')).toBe(true);
      expect(isTypeCompatible('image', 'video')).toBe(false);
      expect(isTypeCompatible('image', 'audio')).toBe(false);
    });

    it('video only connects to video or any', () => {
      expect(isTypeCompatible('video', 'video')).toBe(true);
      expect(isTypeCompatible('video', 'any')).toBe(true);
      expect(isTypeCompatible('video', 'image')).toBe(false);
      expect(isTypeCompatible('video', 'audio')).toBe(false);
    });

    it('audio only connects to audio or any', () => {
      expect(isTypeCompatible('audio', 'audio')).toBe(true);
      expect(isTypeCompatible('audio', 'any')).toBe(true);
      expect(isTypeCompatible('audio', 'image')).toBe(false);
      expect(isTypeCompatible('audio', 'video')).toBe(false);
    });
  });
});

describe('TYPE_COMPATIBILITY', () => {
  it('defines compatibility for all standard types', () => {
    const requiredTypes: DataType[] = ['text', 'image', 'video', 'audio', 'tensor', 'json', 'any'];
    requiredTypes.forEach(t => {
      expect(TYPE_COMPATIBILITY[t]).toBeDefined();
      expect(Array.isArray(TYPE_COMPATIBILITY[t])).toBe(true);
    });
  });

  it('any type compatible with everything', () => {
    expect(TYPE_COMPATIBILITY.any).toEqual(['image', 'text', 'video', 'audio', 'tensor', 'json', 'any']);
  });
});

describe('HANDLE_COLORS', () => {
  it('defines colors for all data types', () => {
    const requiredTypes: DataType[] = ['text', 'image', 'video', 'audio', 'tensor', 'json', 'any'];
    requiredTypes.forEach(t => {
      expect(HANDLE_COLORS[t]).toBeDefined();
      expect(typeof HANDLE_COLORS[t]).toBe('string');
      expect(HANDLE_COLORS[t]).toMatch(/^#[0-9A-Fa-f]{6}$/); // Hex color
    });
  });

  it('uses distinct colors for different types', () => {
    const colors = Object.values(HANDLE_COLORS);
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(colors.length);
  });
});
