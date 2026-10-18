import { app } from './app';
import { env } from './core/config/env';
import { prisma } from './core/database/prisma';
import { redis } from './core/redis/redis';

const server = Bun.serve({
  port: env.PORT,
  fetch: app.fetch,
});

console.log(`🚀 Hono Enterprise API server listening on http://localhost:${server.port}`);
console.log(`📡 Environment: ${env.NODE_ENV}`);

// Graceful Shutdown Management
async function gracefulShutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown...`);

  try {
    server.stop();
    console.log('✓ HTTP server stopped accepting connections');

    await prisma.$disconnect();
    console.log('✓ Database connections closed');

    redis.disconnect();
    console.log('✓ Redis client disconnected');

    console.log('👋 Graceful shutdown complete. Exiting process.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export default app;
