import type { MiddlewareHandler } from 'hono';
import { redis } from '../redis/redis';
import { TooManyRequestsError } from '../errors/app-error';

interface RateLimitOptions {
  limit?: number; // max requests (default 60)
  windowSeconds?: number; // time window in seconds (default 60)
  keyPrefix?: string;
}

// In-memory fallback map if Redis is temporarily unreachable
const memoryFallback = new Map<string, { count: number; resetAt: number }>();

/**
 * Sliding-window rate limiting middleware backed by Redis with in-memory fallback.
 */
export function rateLimiter(options: RateLimitOptions = {}): MiddlewareHandler {
  const { limit = 60, windowSeconds = 60, keyPrefix = 'rl' } = options;

  return async (c, next) => {
    // Derive client IP or fallback identifier
    const clientIp =
      c.req.header('cf-connecting-ip') ||
      c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
      'anonymous';

    const key = `${keyPrefix}:${clientIp}`;

    try {
      // 1. Try Redis first
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      c.header('X-RateLimit-Limit', limit.toString());
      c.header('X-RateLimit-Remaining', Math.max(0, limit - current).toString());

      if (current > limit) {
        const ttl = await redis.ttl(key);
        c.header('Retry-After', Math.max(1, ttl).toString());
        throw new TooManyRequestsError(`Rate limit exceeded. Try again in ${ttl} seconds.`);
      }
    } catch (error: any) {
      if (error instanceof TooManyRequestsError) {
        throw error;
      }

      // 2. In-memory fallback if Redis has connection error
      const now = Date.now();
      const record = memoryFallback.get(key);

      if (!record || now > record.resetAt) {
        memoryFallback.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
      } else {
        record.count += 1;
        if (record.count > limit) {
          const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
          c.header('Retry-After', retryAfterSec.toString());
          throw new TooManyRequestsError(`Rate limit exceeded. Try again in ${retryAfterSec} seconds.`);
        }
      }
    }

    await next();
  };
}
