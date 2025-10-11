import { logger } from './logger.js';

type BucketState = {
  remaining: number;
  resetAt: number;
};

export interface RateLimiterOptions {
  windowMs?: number;
  maxRequests?: number;
}

export class RateLimiter {
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly buckets = new Map<string, BucketState>();

  constructor(options: RateLimiterOptions = {}) {
    this.windowMs = options.windowMs ?? Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000);
    this.maxRequests = options.maxRequests ?? Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 60);
  }

  consume(key: string) {
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || now >= bucket.resetAt) {
      this.buckets.set(key, {
        remaining: this.maxRequests - 1,
        resetAt: now + this.windowMs,
      });
      logger.debug('rate-limiter.reset', { key });
      return;
    }

    if (bucket.remaining <= 0) {
      const retryInMs = bucket.resetAt - now;
      logger.warn('rate-limiter.limit-hit', { key, retryInMs });
      const error = new Error(`Rate limit exceeded for ${key}. Try again in ${Math.ceil(retryInMs / 1000)}s.`);
      (error as Error & { retryInMs?: number }).retryInMs = retryInMs;
      throw error;
    }

    bucket.remaining -= 1;
  }
}
