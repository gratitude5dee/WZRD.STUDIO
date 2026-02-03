export type ModelType = 
  | 'google/gemini-flash-1.5'
  | 'google/gemini-2.5-flash'
  | 'google/gemini-2.5-pro'
  | 'google/gemini-2.5-flash-lite'
  | 'anthropic/claude-3.5-sonnet'
  | 'anthropic/claude-3-5-haiku'
  | 'anthropic/claude-3-haiku'
  | 'google/gemini-pro-1.5'
  | 'google/gemini-flash-1.5-8b'
  | 'meta-llama/llama-3.2-1b-instruct'
  | 'meta-llama/llama-3.2-3b-instruct'
  | 'meta-llama/llama-3.1-8b-instruct'
  | 'meta-llama/llama-3.1-70b-instruct'
  | 'openai/gpt-4o-mini'
  | 'groq/llama-3.3-70b-versatile'
  | 'groq/gemma2-9b-it'
  | 'groq/llama3-8b-8192'
  | 'groq/llama3-70b-8192'
  | 'groq/llama-3.1-8b-instant';

export type GeminiTextModel = 
  | 'google/gemini-2.5-flash'
  | 'google/gemini-2.5-pro'
  | 'google/gemini-2.5-flash-lite';

export type GeminiImageModel = 'google/gemini-2.5-flash-image-preview';

export type GeminiVideoModel = 'google/veo-3';

export const models: { value: ModelType; label: string }[] = [
  { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash (FREE)' },
  { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro (FREE)' },
  { value: 'google/gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite (FREE)' },
  { value: 'google/gemini-flash-1.5', label: 'google/gemini-flash-1.5' },
  { value: 'anthropic/claude-3.5-sonnet', label: 'anthropic/claude-3.5-sonnet' },
  { value: 'anthropic/claude-3-5-haiku', label: 'anthropic/claude-3-5-haiku' },
  { value: 'anthropic/claude-3-haiku', label: 'anthropic/claude-3-haiku' },
  { value: 'google/gemini-pro-1.5', label: 'google/gemini-pro-1.5' },
  { value: 'google/gemini-flash-1.5-8b', label: 'google/gemini-flash-1.5-8b' },
  { value: 'meta-llama/llama-3.2-1b-instruct', label: 'meta-llama/llama-3.2-1b-instruct' },
  { value: 'meta-llama/llama-3.2-3b-instruct', label: 'meta-llama/llama-3.2-3b-instruct' },
  { value: 'meta-llama/llama-3.1-8b-instruct', label: 'meta-llama/llama-3.1-8b-instruct' },
  { value: 'meta-llama/llama-3.1-70b-instruct', label: 'meta-llama/llama-3.1-70b-instruct' },
  { value: 'openai/gpt-4o-mini', label: 'openai/gpt-4o-mini' },
  { value: 'groq/llama-3.3-70b-versatile', label: 'Llama 3.3 70B Versatile (Groq)' },
  { value: 'groq/gemma2-9b-it', label: 'Gemma 2 9B (Groq)' },
  { value: 'groq/llama3-8b-8192', label: 'Llama 3 8B (Groq)' },
  { value: 'groq/llama3-70b-8192', label: 'Llama 3 70B (Groq)' },
  { value: 'groq/llama-3.1-8b-instant', label: 'Llama 3.1 8B Instant (Groq)' },
];

export const geminiTextModels = [
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fast, balanced, FREE until Oct 6', time: '~2s' },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Highest quality, FREE until Oct 6', time: '~4s' },
  { id: 'google/gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', description: 'Ultra fast, FREE until Oct 6', time: '~1s' },
];

export const geminiImageModel = {
  id: 'google/gemini-2.5-flash-image-preview',
  name: 'Nano banana (Gemini 2.5 Flash)',
  description: 'Image generation and editing',
  time: '~10s'
};

export const geminiVideoModel = {
  id: 'google/veo-3',
  name: 'Google Veo 3',
  description: 'High-quality video generation',
  time: '~3-5min'
};
