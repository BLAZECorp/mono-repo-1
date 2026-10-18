import { Hono } from 'hono';
import { checkDatabaseHealth, prisma } from '../../core/database/prisma';
import { checkRedisHealth } from '../../core/redis/redis';
import { sendSuccess } from '../../core/utils/response';

export const healthRouter = new Hono();

/**
 * GET /api/v1/health
 * Comprehensive infrastructure readiness and telemetry probe.
 */
healthRouter.get('/', async (c) => {
  const [dbHealthy, redisHealthy] = await Promise.all([
    checkDatabaseHealth(),
    checkRedisHealth(),
  ]);

  const allHealthy = dbHealthy && redisHealthy;
  const status = allHealthy ? 'healthy' : 'degraded';

  return sendSuccess(
    c,
    {
      status,
      services: {
        database: dbHealthy ? 'up' : 'down',
        redis: redisHealthy ? 'up' : 'down',
      },
      uptime: process.uptime(),
      version: '1.0.0',
    },
    undefined,
    allHealthy ? 200 : 503
  );
});

/**
 * GET /api/v1/health/audit
 * Retrieve historical migration and database seed audit log telemetry.
 */
healthRouter.get('/audit', async (c) => {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return sendSuccess(c, logs);
});
