/**
 * Integration Tests for Compute Flow Store
 * 
 * Tests the complete lifecycle of compute graph operations including:
 * - Node CRUD operations
 * - Edge management
 * - Graph serialization
 * - Execution state management
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useComputeFlowStore } from '@/store/computeFlowStore';
import type { NodeDefinition, EdgeDefinition } from '@/types/computeFlow';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
      }),
    },
  },
}));

// Helper to create test nodes
function createTestNode(overrides: Partial<NodeDefinition> = {}): NodeDefinition {
  const id = overrides.id || `node-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return {
    id,
    kind: 'Text',
    version: '1.0.0',
    label: 'Test Node',
    position: { x: 0, y: 0 },
    inputs: [
      { id: `${id}-input-0`, name: 'input', datatype: 'text', cardinality: '1', position: 'left' }
    ],
    outputs: [
      { id: `${id}-output-0`, name: 'output', datatype: 'text', cardinality: 'n', position: 'right' }
    ],
    params: {},
    status: 'idle',
    ...overrides,
  };
}

// Helper to create test edges
function createTestEdge(
  sourceNodeId: string,
  targetNodeId: string,
  overrides: Partial<EdgeDefinition> = {}
): EdgeDefinition {
  return {
    id: `edge-${sourceNodeId}-${targetNodeId}`,
    source: { nodeId: sourceNodeId, portId: `${sourceNodeId}-output-0` },
    target: { nodeId: targetNodeId, portId: `${targetNodeId}-input-0` },
    dataType: 'text',
    status: 'idle',
    ...overrides,
  };
}

describe('ComputeFlowStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useComputeFlowStore());
    act(() => {
      result.current.clearGraph();
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Node Operations', () => {
    describe('createNode', () => {
      it('creates a node with valid UUID', () => {
        const { result } = renderHook(() => useComputeFlowStore());
        
        let newNode: NodeDefinition;
        act(() => {
          newNode = result.current.createNode('Text', { x: 100, y: 200 });
        });
        
        // Verify UUID format
        expect(newNode!.id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        );
        
        // Verify position
        expect(newNode!.position).toEqual({ x: 100, y: 200 });
        
        // Verify kind
        expect(newNode!.kind).toBe('Text');
      });

      it('generates port IDs based on node ID', () => {
        const { result } = renderHook(() => useComputeFlowStore());
        
        let newNode: NodeDefinition;
        act(() => {
          newNode = result.current.createNode('Image', { x: 0, y: 0 });
        });
        
        // Inputs should have node-based IDs
        expect(newNode!.inputs[0].id).toContain(newNode!.id);
        expect(newNode!.inputs[0].id).toContain('input');
        
        // Outputs should have node-based IDs
        expect(newNode!.outputs[0].id).toContain(newNode!.id);
        expect(newNode!.outputs[0].id).toContain('output');
      });
    });

    describe('addNode', () => {
      it('adds node to store', () => {
        const { result } = renderHook(() => useComputeFlowStore());
        const testNode = createTestNode();
        
        act(() => {
          result.current.addNode(testNode);
        });
        
        expect(result.current.nodeDefinitions).toHaveLength(1);
        expect(result.current.nodeDefinitions[0].id).toBe(testNode.id);
      });

      it('preserves existing nodes when adding', () => {
        const { result } = renderHook(() => useComputeFlowStore());
        const node1 = createTestNode({ id: 'node-1' });
        const node2 = createTestNode({ id: 'node-2' });
        
        act(() => {
          result.current.addNode(node1);
          result.current.addNode(node2);
        });
        
        expect(result.current.nodeDefinitions).toHaveLength(2);
        expect(result.current.nodeDefinitions.map(n => n.id)).toEqual(['node-1', 'node-2']);
      });
    });

    describe('updateNode', () => {
      it('updates node properties', () => {
        const { result } = renderHook(() => useComputeFlowStore());
        const testNode = createTestNode({ id: 'node-1', label: 'Original' });
        
        act(() => {
          result.current.addNode(testNode);
          result.current.updateNode('node-1', { label: 'Updated' });
        });
        
        expect(result.current.nodeDefinitions[0].label).toBe('Updated');
      });

      it('preserves unmodified properties', () => {
        const { result } = renderHook(() => useComputeFlowStore());
        const testNode = createTestNode({ 
          id: 'node-1', 
          label: 'Test',
          position: { x: 100, y: 200 }
        });
        
        act(() => {
          result.current.addNode(testNode);
          result.current.updateNode('node-1', { label: 'Updated' });
        });
        
        // Position should remain unchanged
        expect(result.current.nodeDefinitions[0].position).toEqual({ x: 100, y: 200 });
      });

      it('does nothing for non-existent node', () => {
        const { result } = renderHook(() => useComputeFlowStore());
        const testNode = createTestNode({ id: 'node-1' });
        
        act(() => {
          result.current.addNode(testNode);
          result.current.updateNode('non-existent', { label: 'Updated' });
        });
        
        expect(result.current.nodeDefinitions).toHaveLength(1);
        expect(result.current.nodeDefinitions[0].label).toBe('Test Node');
      });
    });

    describe('removeNode', () => {
      it('removes node from store', () => {
        const { result } = renderHook(() => useComputeFlowStore());
        const testNode = createTestNode({ id: 'node-1' });
        
        act(() => {
          result.current.addNode(testNode);
          result.current.removeNode('node-1');
        });
        
        expect(result.current.nodeDefinitions).toHaveLength(0);
      });

      it('removes connected edges when node is removed', () => {
        const { result } = renderHook(() => useComputeFlowStore());
        const node1 = createTestNode({ id: 'node-1' });
        const node2 = createTestNode({ id: 'node-2' });
        const edge = createTestEdge('node-1', 'node-2');
        
        act(() => {
          result.current.addNode(node1);
          result.current.addNode(node2);
          const validation = result.current.addEdge(edge);
          expect(validation.valid).toBe(true);
        });
        
        expect(result.current.edgeDefinitions).toHaveLength(1);
        
        act(() => {
          result.current.removeNode('node-1');
        });
        
        // Edge should be removed since source node was removed
        expect(result.current.edgeDefinitions).toHaveLength(0);
      });
    });
  });

  describe('Edge Operations', () => {
    describe('addEdge', () => {
      it('adds edge to store', () => {
        const { result } = renderHook(() => useComputeFlowStore());
        const node1 = createTestNode({ id: 'node-1' });
        const node2 = createTestNode({ id: 'node-2' });
        const edge = createTestEdge('node-1', 'node-2');
        
        act(() => {
          result.current.addNode(node1);
          result.current.addNode(node2);
          const validation = result.current.addEdge(edge);
          expect(validation.valid).toBe(true);
        });
        
        expect(result.current.edgeDefinitions).toHaveLength(1);
        expect(result.current.edgeDefinitions[0].source.nodeId).toBe('node-1');
        expect(result.current.edgeDefinitions[0].target.nodeId).toBe('node-2');
      });
    });

    describe('removeEdge', () => {
      it('removes edge from store', () => {
        const { result } = renderHook(() => useComputeFlowStore());
        const node1 = createTestNode({ id: 'node-1' });
        const node2 = createTestNode({ id: 'node-2' });
        const edge = createTestEdge('node-1', 'node-2');
        
        act(() => {
          result.current.addNode(node1);
          result.current.addNode(node2);
          const validation = result.current.addEdge(edge);
          expect(validation.valid).toBe(true);
          result.current.removeEdge(edge.id);
        });
        
        expect(result.current.edgeDefinitions).toHaveLength(0);
      });
    });
  });

  describe('Status Operations', () => {
    describe('setNodeStatus', () => {
      it('updates node status', () => {
        const { result } = renderHook(() => useComputeFlowStore());
        const testNode = createTestNode({ id: 'node-1', status: 'idle' });
        
        act(() => {
          result.current.addNode(testNode);
          result.current.setNodeStatus('node-1', 'queued', 0);
          result.current.setNodeStatus('node-1', 'running', 50);
        });
        
        expect(result.current.nodeDefinitions[0].status).toBe('running');
        expect(result.current.nodeDefinitions[0].progress).toBe(50);
      });

      it('updates preview when provided', () => {
        const { result } = renderHook(() => useComputeFlowStore());
        const testNode = createTestNode({ id: 'node-1' });
        const preview = { type: 'image', url: 'https://example.com/image.png' };
        
        act(() => {
          result.current.addNode(testNode);
          result.current.setNodeStatus('node-1', 'queued', 0);
          result.current.setNodeStatus('node-1', 'running', 50);
          result.current.setNodeStatus('node-1', 'succeeded', 100, preview);
        });
        
        expect(result.current.nodeDefinitions[0].preview).toEqual(preview);
      });
    });

    describe('resetNodeStatuses', () => {
      it('resets all nodes to idle', () => {
        const { result } = renderHook(() => useComputeFlowStore());
        const node1 = createTestNode({ id: 'node-1', status: 'succeeded' });
        const node2 = createTestNode({ id: 'node-2', status: 'failed' });
        
        act(() => {
          result.current.addNode(node1);
          result.current.addNode(node2);
          result.current.resetNodeStatuses();
        });
        
        expect(result.current.nodeDefinitions.every(n => n.status === 'idle')).toBe(true);
      });

      it('clears execution state', () => {
        const { result } = renderHook(() => useComputeFlowStore());
        
        act(() => {
          // Simulate execution state
          result.current.addNode(createTestNode({ id: 'node-1' }));
        });
        
        act(() => {
          result.current.resetNodeStatuses();
        });
        
        expect(result.current.execution.isRunning).toBe(false);
        expect(result.current.execution.runId).toBeNull();
      });
    });
  });

  describe('Graph Operations', () => {
    describe('clearGraph', () => {
      it('removes all nodes and edges', () => {
        const { result } = renderHook(() => useComputeFlowStore());
        const node1 = createTestNode({ id: 'node-1' });
        const node2 = createTestNode({ id: 'node-2' });
        const edge = createTestEdge('node-1', 'node-2');
        
        act(() => {
          result.current.addNode(node1);
          result.current.addNode(node2);
          const validation = result.current.addEdge(edge);
          expect(validation.valid).toBe(true);
          result.current.clearGraph();
        });
        
        expect(result.current.nodeDefinitions).toHaveLength(0);
        expect(result.current.edgeDefinitions).toHaveLength(0);
      });

      it('resets execution state', () => {
        const { result } = renderHook(() => useComputeFlowStore());
        
        act(() => {
          result.current.clearGraph();
        });
        
        expect(result.current.execution).toEqual({
          runId: null,
          isRunning: false,
          completed: 0,
          total: 0,
          startedAt: null,
          error: null,
        });
      });
    });

    describe('addGeneratedWorkflow', () => {
      it('adds nodes and edges from generated workflow', () => {
        const { result } = renderHook(() => useComputeFlowStore());
        
        const nodes = [
          createTestNode({ id: 'gen-node-1' }),
          createTestNode({ id: 'gen-node-2' }),
        ];
        const edges = [
          createTestEdge('gen-node-1', 'gen-node-2'),
        ];
        
        vi.useFakeTimers();
        act(() => {
          result.current.addGeneratedWorkflow(nodes, edges);
        });
        act(() => {
          vi.runAllTimers();
        });
        
        expect(result.current.nodeDefinitions).toHaveLength(2);
        expect(result.current.edgeDefinitions).toHaveLength(1);
        vi.useRealTimers();
      });

      it('normalizes legacy IDs to UUIDs', () => {
        const { result } = renderHook(() => useComputeFlowStore());
        
        // Legacy node with non-UUID ID
        const legacyNode: NodeDefinition = {
          id: 'node-legacy-1234567890',
          kind: 'Text',
          version: '1.0.0',
          label: 'Legacy Node',
          position: { x: 0, y: 0 },
          inputs: [{ id: 'node-legacy-1234567890-input-0', name: 'input', datatype: 'text', cardinality: '1', position: 'left' }],
          outputs: [{ id: 'node-legacy-1234567890-output-0', name: 'output', datatype: 'text', cardinality: 'n', position: 'right' }],
          params: {},
          status: 'idle',
        };
        
        act(() => {
          result.current.addGeneratedWorkflow([legacyNode], []);
        });
        
        // ID should be normalized to UUID
        expect(result.current.nodeDefinitions[0].id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        );
      });
    });
  });

  describe('Execution State', () => {
    describe('cancelExecution', () => {
      it('sets execution to not running', () => {
        const { result } = renderHook(() => useComputeFlowStore());
        
        act(() => {
          result.current.cancelExecution();
        });
        
        expect(result.current.execution.isRunning).toBe(false);
        expect(result.current.execution.error).toBe('Cancelled');
      });
    });
  });
});
