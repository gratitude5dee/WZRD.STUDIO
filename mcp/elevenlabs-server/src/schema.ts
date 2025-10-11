import { z } from 'zod';

export const audioFormats = [
  'mp3',
  'mp4',
  'wav',
  'pcm',
  'ogg',
  'm4a',
] as const;

export const textToSpeechSchema = z.object({
  text: z
    .string({ required_error: 'text is required' })
    .min(1, 'text must not be empty')
    .max(5000, 'text must be 5000 characters or fewer'),
  voice_id: z
    .string({ required_error: 'voice_id is required' })
    .min(1, 'voice_id must not be empty'),
  model_id: z.string().optional(),
  audio_format: z.enum(audioFormats).optional(),
  stability: z.number().min(0).max(1).optional(),
  similarity_boost: z.number().min(0).max(1).optional(),
  style: z.number().min(0).max(1).optional(),
  use_speaker_boost: z.boolean().optional(),
  optimize_streaming_latency: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
  ]).optional(),
});

export const getVoiceSettingsSchema = z.object({
  voice_id: z
    .string({ required_error: 'voice_id is required' })
    .min(1, 'voice_id must not be empty'),
});

export type TextToSpeechInput = z.infer<typeof textToSpeechSchema>;
export type GetVoiceSettingsInput = z.infer<typeof getVoiceSettingsSchema>;

export const invokeSchema = z.object({
  id: z.string().optional(),
  tool: z.enum(['text_to_speech', 'list_voices', 'get_voice_settings']),
  params: z.record(z.any()).optional(),
});
