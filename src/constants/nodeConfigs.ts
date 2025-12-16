import type { Port, DataType } from '@/types/computeFlow';

export interface NodeTypeConfig {
  inputs: Omit<Port, 'id'>[];
  outputs: Omit<Port, 'id'>[];
  defaultParams: Record<string, any>;
  color: string;
  description: string;
}

export const NODE_TYPE_CONFIGS: Record<string, NodeTypeConfig> = {
  Image: {
    inputs: [
      { name: 'prompt', datatype: 'text', cardinality: '1', optional: true, position: 'left' },
      { name: 'reference', datatype: 'image', cardinality: '1', optional: true, position: 'left' },
      { name: 'mask', datatype: 'image', cardinality: '1', optional: true, position: 'left' },
    ],
    outputs: [
      { name: 'image', datatype: 'image', cardinality: 'n', position: 'right' },
    ],
    defaultParams: {
      model: 'flux-1.1-pro',
      aspectRatio: '1:1',
      numOutputs: 1,
      guidance: 7.5,
    },
    color: '#22c55e',
    description: 'Generate images using AI models',
  },
  
  Text: {
    inputs: [
      { name: 'input', datatype: 'text', cardinality: '1', optional: true, position: 'left' },
      { name: 'context', datatype: 'any', cardinality: 'n', optional: true, position: 'left' },
    ],
    outputs: [
      { name: 'text', datatype: 'text', cardinality: 'n', position: 'right' },
    ],
    defaultParams: {
      text: '',
      model: 'groq/llama-3.1-8b-instant',
    },
    color: '#f59e0b',
    description: 'Text input and generation',
  },
  
  Video: {
    inputs: [
      { name: 'image', datatype: 'image', cardinality: '1', optional: true, position: 'left' },
      { name: 'prompt', datatype: 'text', cardinality: '1', optional: true, position: 'left' },
    ],
    outputs: [
      { name: 'video', datatype: 'video', cardinality: 'n', position: 'right' },
    ],
    defaultParams: {
      model: 'luma/dream-machine',
      duration: 5,
      fps: 24,
    },
    color: '#8b5cf6',
    description: 'Generate videos from images or prompts',
  },
  
  Prompt: {
    inputs: [],
    outputs: [
      { name: 'prompt', datatype: 'text', cardinality: 'n', position: 'right' },
    ],
    defaultParams: {
      prompt: '',
    },
    color: '#f59e0b',
    description: 'Text prompt input node',
  },
  
  Model: {
    inputs: [
      { name: 'prompt', datatype: 'text', cardinality: '1', position: 'left' },
      { name: 'input', datatype: 'any', cardinality: '1', optional: true, position: 'left' },
    ],
    outputs: [
      { name: 'output', datatype: 'any', cardinality: 'n', position: 'right' },
    ],
    defaultParams: {
      model: 'flux-1.1-pro',
      temperature: 0.7,
    },
    color: '#06b6d4',
    description: 'AI model execution node',
  },
  
  Transform: {
    inputs: [
      { name: 'input', datatype: 'any', cardinality: 'n', position: 'left' },
    ],
    outputs: [
      { name: 'output', datatype: 'any', cardinality: 'n', position: 'right' },
    ],
    defaultParams: {
      operation: 'passthrough',
    },
    color: '#64748b',
    description: 'Transform and process data',
  },
  
  Output: {
    inputs: [
      { name: 'input', datatype: 'any', cardinality: 'n', position: 'left' },
    ],
    outputs: [],
    defaultParams: {
      format: 'auto',
    },
    color: '#ec4899',
    description: 'Final output collection node',
  },
  
  Gateway: {
    inputs: [
      { name: 'input', datatype: 'any', cardinality: 'n', position: 'left' },
      { name: 'condition', datatype: 'text', cardinality: '1', optional: true, position: 'left' },
    ],
    outputs: [
      { name: 'true', datatype: 'any', cardinality: 'n', position: 'right' },
      { name: 'false', datatype: 'any', cardinality: 'n', position: 'right' },
    ],
    defaultParams: {
      condition: 'true',
    },
    color: '#94a3b8',
    description: 'Conditional flow control',
  },
};

export const NODE_KINDS = Object.keys(NODE_TYPE_CONFIGS) as Array<keyof typeof NODE_TYPE_CONFIGS>;

export function getNodeConfig(kind: string): NodeTypeConfig | undefined {
  return NODE_TYPE_CONFIGS[kind];
}

export function getNodeColor(kind: string): string {
  return NODE_TYPE_CONFIGS[kind]?.color || '#94a3b8';
}
