import { describe, it, expect, beforeEach } from 'vitest';
import {
  nodesMeaningfullyChanged,
  edgesMeaningfullyChanged,
  ComputeFlowHistoryManager,
} from '@/store/computeFlowHistory';
import type { NodeDefinition, EdgeDefinition } from '@/types/computeFlow';

const createNode = (overrides: Partial<NodeDefinition> = {}): NodeDefinition => ({
  id: overrides.id ?? 'node-1',
  kind: 'Text',
  version: '1.0.0',
  label: overrides.label ?? 'Node',
  position: overrides.position ?? { x: 0, y: 0 },
  inputs: overrides.inputs ?? [],
  outputs: overrides.outputs ?? [],
  params: overrides.params ?? {},
  status: overrides.status ?? 'idle',
  progress: overrides.progress ?? 0,
  error: overrides.error,
  preview: overrides.preview,
});

const createEdge = (overrides: Partial<EdgeDefinition> = {}): EdgeDefinition => ({
  id: overrides.id ?? 'edge-1',
  source: overrides.source ?? { nodeId: 'node-1', portId: 'node-1-output-0' },
  target: overrides.target ?? { nodeId: 'node-2', portId: 'node-2-input-0' },
  dataType: overrides.dataType ?? 'text',
  status: overrides.status ?? 'idle',
  metadata: overrides.metadata,
});

describe('computeFlowHistory', () => {
  it('detects meaningful node changes', () => {
    const oldNodes = [createNode({ label: 'Node A' })];
    const newNodes = [createNode({ label: 'Node B' })];
    expect(nodesMeaningfullyChanged(oldNodes, newNodes)).toBe(true);
  });

  it('ignores transient node fields', () => {
    const oldNodes = [createNode({ status: 'idle' })];
    const newNodes = [createNode({ status: 'running' })];
    expect(nodesMeaningfullyChanged(oldNodes, newNodes)).toBe(false);
  });

  it('ignores position changes', () => {
    const oldNodes = [createNode({ position: { x: 0, y: 0 } })];
    const newNodes = [createNode({ position: { x: 100, y: 100 } })];
    expect(nodesMeaningfullyChanged(oldNodes, newNodes)).toBe(false);
  });

  it('detects meaningful edge changes', () => {
    const oldEdges = [createEdge({ source: { nodeId: 'node-1', portId: 'out' } })];
    const newEdges = [createEdge({ source: { nodeId: 'node-2', portId: 'out' } })];
    expect(edgesMeaningfullyChanged(oldEdges, newEdges)).toBe(true);
  });
});

describe('ComputeFlowHistoryManager', () => {
  let manager: ComputeFlowHistoryManager;

  beforeEach(() => {
    manager = new ComputeFlowHistoryManager();
  });

  it('starts with undo/redo disabled', () => {
    expect(manager.getState()).toEqual({ canUndo: false, canRedo: false });
  });

  it('enables undo after multiple snapshots', () => {
    manager.pushSnapshot([createNode({ id: 'node-1' })], []);
    manager.pushSnapshot([createNode({ id: 'node-2' })], []);
    expect(manager.getState().canUndo).toBe(true);
  });

  it('does not record during drag', () => {
    manager.pushSnapshot([createNode({ id: 'node-1' })], []);
    manager.setDragging(true);
    manager.pushSnapshot([createNode({ id: 'node-2' })], []);
    manager.setDragging(false);
    expect(manager.getState().canUndo).toBe(false);
  });
});
