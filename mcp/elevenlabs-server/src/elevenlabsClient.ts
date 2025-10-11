import { Buffer } from 'node:buffer';

import { logger } from './logger.js';

export interface TextToSpeechParams {
  text: string;
  voice_id: string;
  model_id?: string;
  audio_format?: string;
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
  optimize_streaming_latency?: 0 | 1 | 2 | 3 | 4;
}

export interface ElevenLabsClientOptions {
  apiKey?: string;
  apiBaseUrl?: string;
  fetchImpl?: typeof fetch;
}

type FetchOptions = Parameters<typeof fetch>[1];
type FetchHeaders = FetchOptions extends { headers?: infer H } ? H : Record<string, string>;

export class ElevenLabsClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: ElevenLabsClientOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.ELEVENLABS_API_KEY ?? '';
    if (!this.apiKey) {
      throw new Error('ELEVENLABS_API_KEY is required');
    }

    this.baseUrl = options.apiBaseUrl ?? 'https://api.elevenlabs.io/v1';
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  private async request<T>(path: string, init?: FetchOptions): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: FetchHeaders = {
      'xi-api-key': this.apiKey,
      ...(init?.headers ?? {}),
    } as FetchHeaders;

    const response = await this.fetchImpl(url, {
      ...init,
      headers,
    });

    if (!response.ok) {
      let detail: unknown;
      try {
        detail = await response.json();
      } catch {
        detail = await response.text();
      }
      logger.error('elevenlabs.request-failed', {
        path,
        status: response.status,
        detail,
      });
      throw new Error(`ElevenLabs request failed with status ${response.status}`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      return (await response.json()) as T;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer.toString('base64') as unknown as T;
  }

  async listVoices() {
    return this.request<{ voices: unknown[] }>('/voices');
  }

  async getVoiceSettings(voiceId: string) {
    return this.request(`/voices/${voiceId}/settings`);
  }

  async textToSpeech(params: TextToSpeechParams) {
    const {
      text,
      voice_id,
      model_id,
      audio_format = 'mp3',
      stability,
      similarity_boost,
      style,
      use_speaker_boost,
      optimize_streaming_latency,
    } = params;

    const payload: Record<string, unknown> = {
      text,
      model_id,
      voice_settings: {
        stability,
        similarity_boost,
        style,
        use_speaker_boost,
      },
      optimize_streaming_latency,
    };

    // Remove undefined voice_settings fields to avoid API validation errors.
    if (payload.voice_settings) {
      const voiceSettings = payload.voice_settings as Record<string, unknown>;
      Object.keys(voiceSettings).forEach((key) => {
        if (voiceSettings[key] === undefined) {
          delete voiceSettings[key];
        }
      });
      if (Object.keys(voiceSettings).length === 0) {
        delete payload.voice_settings;
      }
    }
    if (!payload.optimize_streaming_latency && payload.optimize_streaming_latency !== 0) {
      delete payload.optimize_streaming_latency;
    }
    if (!payload.model_id) {
      delete payload.model_id;
    }

    const path = `/text-to-speech/${voice_id}`;
    const base64Audio = await this.request<string>(path, {
      method: 'POST',
      headers: {
        Accept: `audio/${audio_format}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return {
      audio_base64: base64Audio,
      audio_format,
      voice_id,
      model_id: model_id ?? null,
      text,
    };
  }
}
