import { Node, Edge } from 'reactflow';

export interface Port {
  id: string;
  name: string;
  datatype: string; // MIME type like 'text/plain', 'image/*', 'image/png', 'video/*', 'any'
  position: 'top' | 'right' | 'bottom' | 'left';
  type: 'input' | 'output';
  optional?: boolean;
  cardinality: { min: number; max: number };
  value?: any;
}

export interface ComputeFlowNodeData {
  type: string;
  label: string;
  value?: any;
  inputs: Port[];
  outputs: Port[];
  params?: Record<string, any>;
  status?: 'idle' | 'generating' | 'complete' | 'error';
  progress?: number;
  imageUrl?: string;
  contentType?: 'text' | 'content' | 'critique' | 'question';
}

export interface ComputeFlowNode extends Node {
  data: ComputeFlowNodeData;
}

export type NodeKind = 
  | 'text.input'
  | 'text.generate'
  | 'image.input'
  | 'image.generate'
  | 'image.transform'
  | 'video.input'
  | 'video.generate';

export interface ComputeFlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  type?: string;
  animated?: boolean;
  metadata?: {
    animated?: boolean;
  };
}

export interface ComputeFlowGraph {
  schemaVersion: '2.0';
  graph: {
    id: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    nodes: ComputeFlowNode[];
    edges: ComputeFlowEdge[];
    viewState: { x: number; y: number; zoom: number };
  };
}
