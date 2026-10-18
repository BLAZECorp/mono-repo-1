import { Hono } from 'hono';
import { authRouter } from './auth.routes';
import { usersRouter } from './users.routes';
import { healthRouter } from './health.routes';

export const v1Router = new Hono();

// Mount Feature Domains for API v1
v1Router.route('/auth', authRouter);
v1Router.route('/users', usersRouter);
v1Router.route('/health', healthRouter);

// Export router type for Hono RPC client end-to-end type safety
export type ApiV1Routes = typeof v1Router;
export { authRouter, usersRouter, healthRouter };
