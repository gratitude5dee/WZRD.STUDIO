import express from 'express';
import morgan from 'morgan';

import { ElevenLabsClient } from './elevenlabsClient.js';
import { logger } from './logger.js';
import { RateLimiter } from './rateLimiter.js';
import { createToolRouter } from './service.js';

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info('http.access', { message: message.trim() }),
    },
  })
);

const client = new ElevenLabsClient();
const limiter = new RateLimiter();
const tools = createToolRouter({ client, limiter });

const manifest = {
  mcp: {
    version: '1.0',
  },
  name: 'wzrd-elevenlabs-tts',
  description: 'Generate ElevenLabs audio and manage voices via the Model Context Protocol.',
  tools: [
    {
      name: 'text_to_speech',
      description: 'Convert text into audio using a selected ElevenLabs voice.',
      inputSchema: {
        type: 'object',
        required: ['text', 'voice_id'],
        properties: {
          text: {
            type: 'string',
            description: 'The text that should be synthesized into speech.',
            maxLength: 5000,
          },
          voice_id: {
            type: 'string',
            description: 'Identifier of the ElevenLabs voice.',
          },
          audio_format: {
            type: 'string',
            enum: ['mp3', 'mp4', 'wav', 'pcm', 'ogg', 'm4a'],
            description: 'Audio format to request from ElevenLabs.',
          },
          model_id: {
            type: 'string',
            description: 'Optional ElevenLabs model identifier to use for synthesis.',
          },
          stability: {
            type: 'number',
            minimum: 0,
            maximum: 1,
            description: 'Voice stability parameter (0-1).',
          },
          similarity_boost: {
            type: 'number',
            minimum: 0,
            maximum: 1,
            description: 'Similarity boost parameter (0-1).',
          },
          style: {
            type: 'number',
            minimum: 0,
            maximum: 1,
            description: 'Style exaggeration parameter (0-1).',
          },
          use_speaker_boost: {
            type: 'boolean',
            description: 'Toggle the ElevenLabs speaker boost feature.',
          },
          optimize_streaming_latency: {
            type: 'integer',
            enum: [0, 1, 2, 3, 4],
            description: 'Streaming latency optimizations as defined by ElevenLabs.',
          },
        },
      },
      outputSchema: {
        type: 'object',
        properties: {
          audio_base64: { type: 'string', description: 'Base64 encoded audio data.' },
          audio_format: { type: 'string', description: 'Format of the synthesized audio.' },
          voice_id: { type: 'string' },
          model_id: { type: ['string', 'null'] },
          text: { type: 'string' },
        },
      },
    },
    {
      name: 'list_voices',
      description: 'List all available ElevenLabs voices for the authenticated account.',
      inputSchema: { type: 'object', additionalProperties: false },
    },
    {
      name: 'get_voice_settings',
      description: 'Retrieve the current settings for a specific ElevenLabs voice.',
      inputSchema: {
        type: 'object',
        required: ['voice_id'],
        properties: {
          voice_id: { type: 'string', description: 'Identifier of the ElevenLabs voice.' },
        },
      },
    },
  ],
};

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/manifest.json', (_req, res) => {
  res.json(manifest);
});

const handleInvocation = async (body: unknown) => {
  return tools.invoke(body as any);
};

app.post('/invoke', async (req, res) => {
  const acceptsSse = req.headers.accept?.includes('text/event-stream');

  if (acceptsSse) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
    });

    res.write(`event: start\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);
    const result = await handleInvocation(req.body);
    const eventName = result.ok ? 'result' : 'error';
    res.write(`event: ${eventName}\ndata: ${JSON.stringify(result)}\n\n`);
    res.write(`event: end\ndata: {}\n\n`);
    res.end();
    return;
  }

  const result = await handleInvocation(req.body);
  res.status(result.ok ? 200 : 400).json(result);
});

const port = Number(process.env.PORT ?? 7331);
app.listen(port, () => {
  logger.info('server.started', { port });
});
