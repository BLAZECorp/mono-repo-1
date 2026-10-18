import type { MiddlewareHandler } from 'hono';
import { ForbiddenError, UnauthorizedError } from '../errors/app-error';
import type { TokenPayload } from '../security/jwt';

/**
 * Role-Based Access Control (RBAC) middleware.
 * Ensures the authenticated user possesses at least one of the specified roles.
 */
export function requireRole(...allowedRoles: TokenPayload['role'][]): MiddlewareHandler {
  return async (c, next) => {
    const user = c.get('user');

    if (!user) {
      throw new UnauthorizedError('Authentication required prior to role evaluation');
    }

    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenError(
        `Insufficient privileges. Requires one of: [${allowedRoles.join(', ')}]`
      );
    }

    await next();
  };
}
