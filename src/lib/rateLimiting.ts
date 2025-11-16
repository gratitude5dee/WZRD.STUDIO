/**
 * Client-side rate limiting for AI generations
 * Prevents abuse in demo mode and provides better UX
 * 
 * Strategy: Token bucket algorithm with localStorage persistence
 */

interface RateLimitConfig {
  tokensPerMinute: number;
  tokensPerHour: number;
  tokensPerDay: number;
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const DEFAULT_LIMITS: RateLimitConfig = {
  tokensPerMinute: 5,   // 5 generations per minute
  tokensPerHour: 20,    // 20 generations per hour
  tokensPerDay: 50,     // 50 generations per day
};

const DEMO_LIMITS: RateLimitConfig = {
  tokensPerMinute: 2,   // Stricter for demo
  tokensPerHour: 10,
  tokensPerDay: 25,
};

class ClientRateLimiter {
  private config: RateLimitConfig;
  private storageKey: string;

  constructor(isDemo: boolean = false) {
    this.config = isDemo ? DEMO_LIMITS : DEFAULT_LIMITS;
    this.storageKey = 'wzrd_rate_limit_buckets';
  }

  private getBuckets(): Record<string, TokenBucket> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error reading rate limit buckets:', error);
      return {};
    }
  }

  private saveBuckets(buckets: Record<string, TokenBucket>): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(buckets));
    } catch (error) {
      console.error('Error saving rate limit buckets:', error);
    }
  }

  private refillBucket(bucket: TokenBucket, maxTokens: number, refillInterval: number): TokenBucket {
    const now = Date.now();
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor(timePassed / refillInterval);
    
    return {
      tokens: Math.min(bucket.tokens + tokensToAdd, maxTokens),
      lastRefill: now,
    };
  }

  async checkLimit(operation: string = 'generation'): Promise<{
    allowed: boolean;
    remaining: number;
    resetIn: number; // milliseconds
    message?: string;
  }> {
    const buckets = this.getBuckets();
    const minuteKey = `${operation}_minute`;
    const hourKey = `${operation}_hour`;
    const dayKey = `${operation}_day`;

    // Initialize buckets if they don't exist
    const now = Date.now();
    buckets[minuteKey] = buckets[minuteKey] || { tokens: this.config.tokensPerMinute, lastRefill: now };
    buckets[hourKey] = buckets[hourKey] || { tokens: this.config.tokensPerHour, lastRefill: now };
    buckets[dayKey] = buckets[dayKey] || { tokens: this.config.tokensPerDay, lastRefill: now };

    // Refill buckets
    buckets[minuteKey] = this.refillBucket(buckets[minuteKey], this.config.tokensPerMinute, 60000); // 1 min
    buckets[hourKey] = this.refillBucket(buckets[hourKey], this.config.tokensPerHour, 3600000); // 1 hour
    buckets[dayKey] = this.refillBucket(buckets[dayKey], this.config.tokensPerDay, 86400000); // 1 day

    // Check limits
    const checks = [
      { bucket: buckets[minuteKey], name: 'minute', max: this.config.tokensPerMinute, resetMs: 60000 },
      { bucket: buckets[hourKey], name: 'hour', max: this.config.tokensPerHour, resetMs: 3600000 },
      { bucket: buckets[dayKey], name: 'day', max: this.config.tokensPerDay, resetMs: 86400000 },
    ];

    for (const check of checks) {
      if (check.bucket.tokens < 1) {
        this.saveBuckets(buckets);
        const timeUntilReset = check.resetMs - (now - check.bucket.lastRefill);
        return {
          allowed: false,
          remaining: 0,
          resetIn: Math.max(0, timeUntilReset),
          message: `Rate limit exceeded: ${check.max} ${operation}s per ${check.name}. Try again in ${Math.ceil(timeUntilReset / 60000)} minute(s).`,
        };
      }
    }

    // Consume tokens
    buckets[minuteKey].tokens--;
    buckets[hourKey].tokens--;
    buckets[dayKey].tokens--;
    this.saveBuckets(buckets);

    return {
      allowed: true,
      remaining: Math.min(buckets[minuteKey].tokens, buckets[hourKey].tokens, buckets[dayKey].tokens),
      resetIn: 60000,
    };
  }

  getRemainingTokens(operation: string = 'generation'): number {
    const buckets = this.getBuckets();
    const minuteKey = `${operation}_minute`;
    const hourKey = `${operation}_hour`;
    const dayKey = `${operation}_day`;

    const minuteTokens = buckets[minuteKey]?.tokens ?? this.config.tokensPerMinute;
    const hourTokens = buckets[hourKey]?.tokens ?? this.config.tokensPerHour;
    const dayTokens = buckets[dayKey]?.tokens ?? this.config.tokensPerDay;

    return Math.min(minuteTokens, hourTokens, dayTokens);
  }

  reset(): void {
    localStorage.removeItem(this.storageKey);
  }
}

export const rateLimiter = new ClientRateLimiter(false);
export const demoRateLimiter = new ClientRateLimiter(true);

export function getRateLimiter(isDemo: boolean): ClientRateLimiter {
  return isDemo ? demoRateLimiter : rateLimiter;
}
