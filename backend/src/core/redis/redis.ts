import Redis from 'ioredis';
import { env } from '../config/env';

declare global {
  // eslint-disable-next-line no-var
  var redisGlobal: Redis | undefined;
}

export const redis =
  globalThis.redisGlobal ??
  new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    lazyConnect: true,
  });

if (env.NODE_ENV !== 'production') {
  globalThis.redisGlobal = redis;
}

// Log connection status
redis.on('connect', () => {
  if (env.NODE_ENV === 'development') {
    console.log('✅ Redis connected successfully');
  }
});

redis.on('error', (err) => {
  console.warn('⚠️ Redis connection error:', err.message);
});

/**
 * Health check helper to verify Redis connectivity.
 */
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const status = await redis.ping();
    return status === 'PONG';
  } catch (error) {
    return false;
  }
}

/**
 * Add a JWT token's JTI to the revocation blacklist.
 * Sets the Redis TTL to match the remaining token lifetime.
 */
export async function blacklistToken(jti: string, ttlSeconds: number): Promise<void> {
  try {
    if (ttlSeconds > 0) {
      await redis.set(`bl:${jti}`, 'revoked', 'EX', ttlSeconds);
    }
  } catch (error) {
    console.error('Failed to blacklist token in Redis:', error);
  }
}

/**
 * Check if a JWT token's JTI is in the revocation blacklist.
 */
export async function isTokenBlacklisted(jti: string): Promise<boolean> {
  try {
    const result = await redis.get(`bl:${jti}`);
    return result === 'revoked';
  } catch (error) {
    console.error('Failed to check token blacklist in Redis:', error);
    return false; // Fail open if Redis is down, or configure according to policy
  }
}
