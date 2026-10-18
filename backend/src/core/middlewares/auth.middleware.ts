import type { MiddlewareHandler } from 'hono';
import { verifyToken, type TokenPayload } from '../security/jwt';
import { UnauthorizedError } from '../errors/app-error';

declare module 'hono' {
  interface ContextVariableMap {
    user: TokenPayload;
  }
}

/**
 * Authentication guard middleware.
 * Verifies Bearer JWT token and confirms non-revoked status with Redis.
 */
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or malformed Authorization header');
  }

  const token = authHeader.substring(7);

  try {
    const payload = await verifyToken(token);
    c.set('user', payload);
  } catch (error: any) {
    if (error.message === 'TOKEN_REVOKED') {
      throw new UnauthorizedError('Token has been revoked. Please log in again.');
    }
    throw new UnauthorizedError('Invalid or expired authentication token');
  }

  await next();
};
