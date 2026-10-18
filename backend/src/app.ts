import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { logger } from 'hono/logger';
import { env } from './core/config/env';
import { requestIdMiddleware } from './core/middlewares/request-id';
import { errorHandler } from './core/middlewares/error.middleware';
import { sendSuccess, sendError } from './core/utils/response';
import { apiRouter } from './api';
import { healthRouter } from './api/v1/health.routes';

export const app = new Hono();

// 1. Global Middlewares
app.use('*', requestIdMiddleware);
app.use('*', logger());
app.use('*', secureHeaders());

// CORS Configuration
const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
app.use(
  '*',
  cors({
    origin: (origin) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return origin || '*';
      }
      return null;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposeHeaders: ['X-Request-Id', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    maxAge: 86400,
    credentials: true,
  })
);

// 2. Telemetry & Direct Health Probe (Aliased for Railway Healthcheck)
app.route('/health', healthRouter);

// 3. Root Welcome & Service Discovery
app.get('/', (c) => {
  return sendSuccess(c, {
    name: 'HR Management Enterprise Backend API',
    standard: 'VGC-ENG-004',
    status: 'online',
    api: '/api',
    v1: '/api/v1',
    health: '/health',
  });
});

// 4. Mount API Gateway (/api -> /api/v1, /api/v2)
app.route('/api', apiRouter);

// 5. Fallback 404 Route
app.notFound((c) => {
  return sendError(c, `Route not found: ${c.req.method} ${c.req.path}`, 'NOT_FOUND', undefined, 404);
});

// 6. Global Error Handler
app.onError(errorHandler);

export default app;
