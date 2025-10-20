import { Port } from '@/types/computeFlow';
import { Type, Image, Video, Wand2, Upload, Download } from 'lucide-react';

export interface NodeDefinition {
  kind: string;
  label: string;
  icon: any;
  color: string;
  inputs: Port[];
  outputs: Port[];
  defaultParams: Record<string, any>;
}

export const nodeRegistry: Record<string, NodeDefinition> = {
  'text.input': {
    kind: 'text.input',
    label: 'Text Input',
    icon: Type,
    color: 'hsl(var(--accent-text))',
    inputs: [],
    outputs: [{
      id: 'text-out',
      name: 'Text',
      datatype: 'text/plain',
      position: 'right',
      type: 'output',
      cardinality: { min: 0, max: 100 },
    }],
    defaultParams: { text: '' },
  },
  
  'text.generate': {
    kind: 'text.generate',
    label: 'Generate Text',
    icon: Wand2,
    color: 'hsl(var(--accent-text))',
    inputs: [{
      id: 'prompt-in',
      name: 'Prompt',
      datatype: 'text/plain',
      position: 'left',
      type: 'input',
      optional: true,
      cardinality: { min: 0, max: 1 },
    }],
    outputs: [{
      id: 'text-out',
      name: 'Generated Text',
      datatype: 'text/plain',
      position: 'right',
      type: 'output',
      cardinality: { min: 0, max: 100 },
    }],
    defaultParams: { model: 'gpt-4', temperature: 0.7 },
  },
  
  'image.input': {
    kind: 'image.input',
    label: 'Image Input',
    icon: Upload,
    color: 'hsl(var(--accent-image))',
    inputs: [],
    outputs: [{
      id: 'image-out',
      name: 'Image',
      datatype: 'image/*',
      position: 'right',
      type: 'output',
      cardinality: { min: 0, max: 100 },
    }],
    defaultParams: { url: '' },
  },
  
  'image.generate': {
    kind: 'image.generate',
    label: 'Generate Image',
    icon: Image,
    color: 'hsl(var(--accent-image))',
    inputs: [{
      id: 'prompt-in',
      name: 'Prompt',
      datatype: 'text/plain',
      position: 'left',
      type: 'input',
      optional: false,
      cardinality: { min: 1, max: 1 },
    }],
    outputs: [{
      id: 'image-out',
      name: 'Generated Image',
      datatype: 'image/*',
      position: 'right',
      type: 'output',
      cardinality: { min: 0, max: 100 },
    }],
    defaultParams: { model: 'flux-dev', steps: 20, aspectRatio: '1:1' },
  },
  
  'image.transform': {
    kind: 'image.transform',
    label: 'Transform Image',
    icon: Wand2,
    color: 'hsl(var(--accent-image))',
    inputs: [{
      id: 'image-in',
      name: 'Source Image',
      datatype: 'image/*',
      position: 'left',
      type: 'input',
      cardinality: { min: 1, max: 1 },
    }, {
      id: 'params-in',
      name: 'Parameters',
      datatype: 'text/plain',
      position: 'top',
      type: 'input',
      optional: true,
      cardinality: { min: 0, max: 1 },
    }],
    outputs: [{
      id: 'image-out',
      name: 'Transformed Image',
      datatype: 'image/*',
      position: 'right',
      type: 'output',
      cardinality: { min: 0, max: 100 },
    }],
    defaultParams: { operation: 'upscale', scale: 2 },
  },
  
  'video.generate': {
    kind: 'video.generate',
    label: 'Generate Video',
    icon: Video,
    color: 'hsl(var(--accent-video))',
    inputs: [{
      id: 'image-in',
      name: 'Source Image',
      datatype: 'image/*',
      position: 'left',
      type: 'input',
      cardinality: { min: 1, max: 1 },
    }, {
      id: 'prompt-in',
      name: 'Motion Prompt',
      datatype: 'text/plain',
      position: 'top',
      type: 'input',
      optional: true,
      cardinality: { min: 0, max: 1 },
    }],
    outputs: [{
      id: 'video-out',
      name: 'Generated Video',
      datatype: 'video/*',
      position: 'right',
      type: 'output',
      cardinality: { min: 0, max: 100 },
    }],
    defaultParams: { duration: 4, fps: 24 },
  },
};

export function getNodeDefinition(kind: string): NodeDefinition | undefined {
  return nodeRegistry[kind];
}

export function getNodeDefinitionByType(type: string): NodeDefinition | undefined {
  // Map old type names to new kinds
  const typeMapping: Record<string, string> = {
    'text': 'text.generate',
    'Text': 'text.generate',
    'image': 'image.generate',
    'Image': 'image.generate',
    'video': 'video.generate',
    'Video': 'video.generate',
  };
  
  const kind = typeMapping[type] || type;
  return nodeRegistry[kind];
}
