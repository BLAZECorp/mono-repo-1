import { z } from 'zod';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  userResponseSchema,
} from './auth.schema';

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
}

export interface AuthResult {
  user: UserResponse;
  tokens: AuthTokens;
}
