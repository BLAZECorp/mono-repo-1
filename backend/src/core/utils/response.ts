import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: Record<string, unknown>;
  requestId?: string;
  timestamp: string;
}

/**
 * Send a standardized JSON success response.
 */
export function sendSuccess<T>(
  c: Context,
  data: T,
  meta?: Record<string, unknown>,
  statusCode: ContentfulStatusCode = 200
) {
  const requestId = c.get('requestId') as string | undefined;

  const responseBody: ApiResponse<T> = {
    success: true,
    data,
    meta,
    requestId,
    timestamp: new Date().toISOString(),
  };

  return c.json(responseBody, statusCode);
}

/**
 * Send a standardized JSON error response.
 */
export function sendError(
  c: Context,
  message: string,
  code = 'ERROR',
  details?: unknown,
  statusCode: ContentfulStatusCode = 400
) {
  const requestId = c.get('requestId') as string | undefined;

  const responseBody: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    requestId,
    timestamp: new Date().toISOString(),
  };

  return c.json(responseBody, statusCode);
}
