export interface BlockData {
  id: string;
  type: 'text' | 'image' | 'video';
  position: { x: number; y: number };
  inputs: Record<string, any>;
  outputs: Record<string, any>;
}

export interface Connection {
  id: string;
  sourceBlockId: string;
  sourcePointId: string;
  targetBlockId: string;
  targetPointId: string;
  path?: string;
}

export interface ConnectionPoint {
  id: string;
  type: 'input' | 'output';
  label: string;
  position: 'top' | 'right' | 'bottom' | 'left';
}

export interface BlockPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}
