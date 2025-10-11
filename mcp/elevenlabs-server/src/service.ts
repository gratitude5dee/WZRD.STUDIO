import { ElevenLabsClient } from './elevenlabsClient.js';
import { logger } from './logger.js';
import { RateLimiter } from './rateLimiter.js';
import {
  GetVoiceSettingsInput,
  TextToSpeechInput,
  getVoiceSettingsSchema,
  invokeSchema,
  textToSpeechSchema,
} from './schema.js';

export interface ToolContext {
  client: ElevenLabsClient;
  limiter: RateLimiter;
}

export interface ToolInvocation {
  id?: string;
  tool: 'text_to_speech' | 'list_voices' | 'get_voice_settings';
  params?: Record<string, unknown>;
}

export interface ToolResult<T = unknown> {
  id?: string;
  ok: boolean;
  result?: T;
  error?: {
    message: string;
    code?: string;
    retryInMs?: number;
  };
}

export const createToolRouter = (context: ToolContext) => {
  const { client, limiter } = context;

  const invoke = async (payload: ToolInvocation): Promise<ToolResult> => {
    const parsed = invokeSchema.safeParse(payload);
    if (!parsed.success) {
      logger.warn('tool.invalid-request', { issues: parsed.error.format() });
      return {
        id: payload.id,
        ok: false,
        error: { message: 'Invalid request', code: 'INVALID_REQUEST' },
      };
    }

    const { tool, params } = parsed.data;

    try {
      limiter.consume(tool);
    } catch (error) {
      return {
        id: payload.id,
        ok: false,
        error: {
          message: (error as Error).message,
          code: 'RATE_LIMITED',
          retryInMs: (error as Error & { retryInMs?: number }).retryInMs,
        },
      };
    }

    try {
      switch (tool) {
        case 'text_to_speech': {
          const input = textToSpeechSchema.parse(params ?? {});
          const result = await client.textToSpeech(input as TextToSpeechInput);
          return { id: payload.id, ok: true, result };
        }
        case 'list_voices': {
          const result = await client.listVoices();
          return { id: payload.id, ok: true, result };
        }
        case 'get_voice_settings': {
          const input = getVoiceSettingsSchema.parse(params ?? {});
          const result = await client.getVoiceSettings((input as GetVoiceSettingsInput).voice_id);
          return { id: payload.id, ok: true, result };
        }
        default: {
          const neverTool: never = tool;
          throw new Error(`Unhandled tool ${neverTool}`);
        }
      }
    } catch (error) {
      logger.error('tool.invoke-error', {
        tool,
        message: (error as Error).message,
      });
      return {
        id: payload.id,
        ok: false,
        error: {
          message: (error as Error).message,
          code: 'INTERNAL_ERROR',
        },
      };
    }
  };

  return { invoke };
};
