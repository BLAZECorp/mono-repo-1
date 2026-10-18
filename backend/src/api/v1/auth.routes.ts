import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  authService,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../../features/auth';
import { authMiddleware } from '../../core/middlewares/auth.middleware';
import { rateLimiter } from '../../core/middlewares/rate-limit';
import { sendSuccess } from '../../core/utils/response';

export const authRouter = new Hono();

/**
 * POST /api/v1/auth/register
 * Register a new user account.
 */
authRouter.post(
  '/register',
  rateLimiter({ limit: 10, windowSeconds: 60, keyPrefix: 'rl:register' }),
  zValidator('json', registerSchema),
  async (c) => {
    const data = c.req.valid('json');
    const result = await authService.register(data);
    return sendSuccess(c, result, undefined, 201);
  }
);

/**
 * POST /api/v1/auth/login
 * Authenticate user credentials and return JWT tokens.
 */
authRouter.post(
  '/login',
  rateLimiter({ limit: 10, windowSeconds: 60, keyPrefix: 'rl:login' }),
  zValidator('json', loginSchema),
  async (c) => {
    const data = c.req.valid('json');
    const result = await authService.login(data);
    return sendSuccess(c, result, undefined, 200);
  }
);

/**
 * POST /api/v1/auth/logout
 * Revoke active access token via Redis blacklist.
 */
authRouter.post('/logout', authMiddleware, async (c) => {
  const authHeader = c.req.header('authorization')!;
  const token = authHeader.substring(7);

  await authService.logout(token);
  return sendSuccess(c, { message: 'Logged out successfully' });
});

/**
 * POST /api/v1/auth/refresh
 * Exchange a valid refresh token for a new access token.
 */
authRouter.post(
  '/refresh',
  rateLimiter({ limit: 20, windowSeconds: 60, keyPrefix: 'rl:refresh' }),
  zValidator('json', refreshTokenSchema),
  async (c) => {
    const { refreshToken } = c.req.valid('json');
    const result = await authService.refreshAccessToken(refreshToken);
    return sendSuccess(c, result);
  }
);

/**
 * GET /api/v1/auth/me
 * Fetch authenticated user profile.
 */
authRouter.get('/me', authMiddleware, async (c) => {
  const currentUser = c.get('user');
  const user = await authService.getCurrentUser(currentUser.userId);
  return sendSuccess(c, user);
});
