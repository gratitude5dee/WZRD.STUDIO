import type { EdgeDefinition, NodeDefinition } from '@/types/computeFlow';

export interface HistorySnapshot {
  nodes: NodeDefinition[];
  edges: EdgeDefinition[];
  timestamp: number;
  description?: string;
}

const TRANSIENT_FIELDS = [
  'status',
  'progress',
  'preview',
  'error',
] as const;

export function nodesMeaningfullyChanged(
  oldNodes: NodeDefinition[],
  newNodes: NodeDefinition[]
): boolean {
  if (oldNodes.length !== newNodes.length) return true;

  const oldMap = new Map(oldNodes.map((node) => [node.id, node]));

  for (const newNode of newNodes) {
    const oldNode = oldMap.get(newNode.id);
    if (!oldNode) return true;

    const oldData = { ...oldNode } as Record<string, unknown>;
    const newData = { ...newNode } as Record<string, unknown>;

    for (const field of TRANSIENT_FIELDS) {
      delete oldData[field];
      delete newData[field];
    }

    delete oldData.position;
    delete newData.position;

    if (JSON.stringify(oldData) !== JSON.stringify(newData)) return true;
  }

  return false;
}

export function edgesMeaningfullyChanged(
  oldEdges: EdgeDefinition[],
  newEdges: EdgeDefinition[]
): boolean {
  if (oldEdges.length !== newEdges.length) return true;

  const oldIds = new Set(
    oldEdges.map(
      (edge) =>
        `${edge.source.nodeId}:${edge.source.portId}->${edge.target.nodeId}:${edge.target.portId}`
    )
  );
  const newIds = new Set(
    newEdges.map(
      (edge) =>
        `${edge.source.nodeId}:${edge.source.portId}->${edge.target.nodeId}:${edge.target.portId}`
    )
  );

  if (oldIds.size !== newIds.size) return true;

  for (const id of newIds) {
    if (!oldIds.has(id)) return true;
  }

  return false;
}

export function createSnapshot(
  nodes: NodeDefinition[],
  edges: EdgeDefinition[],
  description?: string
): HistorySnapshot {
  return {
    nodes: JSON.parse(JSON.stringify(nodes)) as NodeDefinition[],
    edges: JSON.parse(JSON.stringify(edges)) as EdgeDefinition[],
    timestamp: Date.now(),
    description,
  };
}

export class ComputeFlowHistoryManager {
  private history: HistorySnapshot[] = [];
  private historyIndex = -1;
  private maxHistory = 10;
  private isDragging = false;

  setDragging(dragging: boolean): void {
    this.isDragging = dragging;
  }

  pushSnapshot(
    nodes: NodeDefinition[],
    edges: EdgeDefinition[],
    description?: string
  ): void {
    if (this.isDragging) return;

    if (this.historyIndex >= 0) {
      const last = this.history[this.historyIndex];
      if (
        !nodesMeaningfullyChanged(last.nodes, nodes) &&
        !edgesMeaningfullyChanged(last.edges, edges)
      ) {
        return;
      }
    }

    const snapshot = createSnapshot(nodes, edges, description);

    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(snapshot);
    this.historyIndex += 1;

    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.historyIndex -= 1;
    }
  }

  undo(): HistorySnapshot | null {
    if (this.historyIndex <= 0) return null;
    this.historyIndex -= 1;
    return this.history[this.historyIndex];
  }

  redo(): HistorySnapshot | null {
    if (this.historyIndex >= this.history.length - 1) return null;
    this.historyIndex += 1;
    return this.history[this.historyIndex];
  }

  getState(): { canUndo: boolean; canRedo: boolean } {
    return {
      canUndo: this.historyIndex > 0,
      canRedo: this.historyIndex < this.history.length - 1,
    };
  }

  clear(): void {
    this.history = [];
    this.historyIndex = -1;
  }
}
