import { Hono } from 'hono';
import { v1Router } from './v1';
import { sendSuccess } from '../core/utils/response';

export const apiRouter = new Hono();

/**
 * Root API Gateway Discovery
 * GET /api
 */
apiRouter.get('/', (c) => {
  return sendSuccess(c, {
    name: 'HR Management Enterprise REST API',
    versions: {
      v1: {
        status: 'active',
        basePath: '/api/v1',
        endpoints: {
          auth: '/api/v1/auth',
          users: '/api/v1/users',
          health: '/api/v1/health',
        },
      },
    },
    documentation: '/docs',
  });
});

// Mount Version 1 Gateway
apiRouter.route('/v1', v1Router);

// Future Version 2 Gateway can be mounted here seamlessly:
// apiRouter.route('/v2', v2Router);

export { v1Router };
