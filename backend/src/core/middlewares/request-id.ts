import type { MiddlewareHandler } from 'hono';

declare module 'hono' {
  interface ContextVariableMap {
    requestId: string;
  }
}

/**
 * Middleware that assigns or forwards an X-Request-Id correlation header.
 */
export const requestIdMiddleware: MiddlewareHandler = async (c, next) => {
  const incomingId = c.req.header('x-request-id');
  const requestId = incomingId || crypto.randomUUID();

  c.set('requestId', requestId);
  c.header('x-request-id', requestId);

  await next();
};
