export interface ActionTemplate {
  id: string;
  label: string;
  icon: string;
  description: string;
  defaultPrompt: string;
  requiredInputs: number;
  createNodes: Array<'text' | 'image' | 'video'>;
  nodeRole: 'input' | 'output';
}

export type BlockMode = 'suggestions' | 'prompt' | 'output';

export interface ConnectedInput {
  blockId: string;
  type: 'text' | 'image' | 'video';
  outputId: string;
  value?: any;
}
