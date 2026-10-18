import { z } from 'zod';
import { updateProfileSchema, userQuerySchema } from './users.schema';

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UserQueryParams = z.infer<typeof userQuerySchema>;
