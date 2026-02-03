import { ActionTemplate } from '@/types/studioTypes';

export const PROMPT_TEMPLATES: Record<string, ActionTemplate> = {
  'write-text': {
    id: 'write-text',
    label: 'Write or paste text',
    icon: '✍️',
    description: 'Start with basic text input',
    defaultPrompt: '',
    requiredInputs: 0,
    createNodes: [],
    nodeRole: 'input'
  },
  'combine-ideas': {
    id: 'combine-ideas',
    label: 'Combine ideas',
    icon: '🔀',
    description: 'Synthesize multiple inputs together',
    defaultPrompt: 'Combine these ideas into a cohesive concept:',
    requiredInputs: 2,
    createNodes: ['text', 'image'],
    nodeRole: 'input'
  },
  'elaborate': {
    id: 'elaborate',
    label: 'Elaborate',
    icon: '📝',
    description: 'Expand on an idea with more detail',
    defaultPrompt: 'Expand on this idea with more detail and depth:',
    requiredInputs: 1,
    createNodes: ['text'],
    nodeRole: 'input'
  },
  'image-question': {
    id: 'image-question',
    label: 'Ask a question about an image',
    icon: '🖼️',
    description: 'Analyze and discuss an image',
    defaultPrompt: 'What can you tell me about this image?',
    requiredInputs: 1,
    createNodes: ['image'],
    nodeRole: 'input'
  },
  'text-to-video': {
    id: 'text-to-video',
    label: 'Turn text into a video',
    icon: '🎬',
    description: 'Generate video from your text',
    defaultPrompt: 'Create a video based on this concept:',
    requiredInputs: 0,
    createNodes: ['video'],
    nodeRole: 'output'
  },
  'summarize': {
    id: 'summarize',
    label: 'Summarize',
    icon: '📋',
    description: 'Condense text into key points',
    defaultPrompt: 'Summarize the following into key points:',
    requiredInputs: 1,
    createNodes: ['text'],
    nodeRole: 'input'
  }
};

export const SUGGESTION_ORDER = [
  'write-text',
  'combine-ideas',
  'elaborate',
  'image-question',
  'text-to-video',
  'summarize'
];
