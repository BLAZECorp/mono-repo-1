import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  usersService,
  updateProfileSchema,
  userQuerySchema,
} from '../../features/users';
import { authMiddleware } from '../../core/middlewares/auth.middleware';
import { requireRole } from '../../core/middlewares/role.middleware';
import { sendSuccess } from '../../core/utils/response';

export const usersRouter = new Hono();

/**
 * GET /api/v1/users/profile
 * Get current authenticated user profile.
 */
usersRouter.get('/profile', authMiddleware, async (c) => {
  const user = c.get('user');
  const profile = await usersService.getProfile(user.userId);
  return sendSuccess(c, profile);
});

/**
 * PATCH /api/v1/users/profile
 * Update current user profile fields.
 */
usersRouter.patch(
  '/profile',
  authMiddleware,
  zValidator('json', updateProfileSchema),
  async (c) => {
    const user = c.get('user');
    const data = c.req.valid('json');
    const updated = await usersService.updateProfile(user.userId, data);
    return sendSuccess(c, updated);
  }
);

/**
 * GET /api/v1/users
 * List users (Administrator access only).
 */
usersRouter.get(
  '/',
  authMiddleware,
  requireRole('ADMIN'),
  zValidator('query', userQuerySchema),
  async (c) => {
    const query = c.req.valid('query');
    const result = await usersService.listUsers(query);
    return sendSuccess(c, result.users, { pagination: result.pagination });
  }
);
