import { createInterface } from 'node:readline';

import { ElevenLabsClient } from '../elevenlabsClient.js';
import { logger } from '../logger.js';
import { RateLimiter } from '../rateLimiter.js';
import { createToolRouter } from '../service.js';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

const client = new ElevenLabsClient();
const limiter = new RateLimiter();
const tools = createToolRouter({ client, limiter });

logger.info('stdio.ready', {});

rl.on('line', async (line) => {
  const trimmed = line.trim();
  if (!trimmed) {
    return;
  }

  try {
    const payload = JSON.parse(trimmed);
    const result = await tools.invoke(payload);
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (error) {
    logger.error('stdio.invoke-error', { message: (error as Error).message });
    const response = {
      ok: false,
      error: {
        message: (error as Error).message,
        code: 'INVALID_REQUEST',
      },
    };
    process.stdout.write(`${JSON.stringify(response)}\n`);
  }
});

rl.on('close', () => {
  logger.info('stdio.closed', {});
  process.exit(0);
});
