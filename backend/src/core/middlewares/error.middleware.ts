import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import { AppError } from '../errors/app-error';
import { sendError } from '../utils/response';
import { env } from '../config/env';

/**
 * Global exception handler for Hono.
 * Formats all unhandled errors, Zod validation errors, and domain errors into the corporate envelope.
 */
export const errorHandler: ErrorHandler = (err, c) => {
  const requestId = c.get('requestId') || 'unknown';

  // 1. Domain Application Errors (AppError)
  if (err instanceof AppError) {
    if (env.NODE_ENV === 'development' && err.statusCode >= 500) {
      console.error(`[${requestId}] AppError:`, err);
    }
    return sendError(
      c,
      err.message,
      err.code,
      err.details,
      err.statusCode as any
    );
  }

  // 2. Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedIssues = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));

    return sendError(
      c,
      'Validation failed for incoming payload',
      'VALIDATION_ERROR',
      formattedIssues,
      400
    );
  }

  // 3. Hono Standard HTTP Exceptions
  if (err instanceof HTTPException) {
    return sendError(
      c,
      err.message,
      'HTTP_EXCEPTION',
      undefined,
      err.status as any
    );
  }

  // 4. Uncaught Internal Server Errors
  console.error(`[${requestId}] Unhandled Exception:`, err);

  const message =
    env.NODE_ENV === 'production'
      ? 'An internal server error occurred'
      : err.message || 'Unknown internal error';

  return sendError(
    c,
    message,
    'INTERNAL_SERVER_ERROR',
    env.NODE_ENV === 'development' ? { stack: err.stack } : undefined,
    500
  );
};
