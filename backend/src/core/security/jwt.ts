import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { env } from '../config/env';
import { blacklistToken, isTokenBlacklisted } from '../redis/redis';

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
}

const secretKey = new TextEncoder().encode(env.JWT_SECRET);

/**
 * Sign a short-lived access token using jose.
 */
export async function signAccessToken(
  payload: Omit<TokenPayload, 'jti' | 'iat' | 'exp'>
): Promise<{ token: string; jti: string; expiresAt: Date }> {
  const jti = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  const token = await new SignJWT({ ...payload, jti })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(secretKey);

  return { token, jti, expiresAt };
}

/**
 * Sign a long-lived refresh token.
 */
export async function signRefreshToken(
  payload: Omit<TokenPayload, 'jti' | 'iat' | 'exp'>
): Promise<{ token: string; jti: string; expiresAt: Date }> {
  const jti = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const token = await new SignJWT({ ...payload, jti })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.REFRESH_TOKEN_EXPIRES_IN)
    .sign(secretKey);

  return { token, jti, expiresAt };
}

/**
 * Verify a token's cryptographic signature, expiration, and Redis blacklist status.
 */
export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, secretKey);

  const tokenPayload = payload as TokenPayload;

  // Check if token has been revoked via Redis blacklist
  if (tokenPayload.jti) {
    const isRevoked = await isTokenBlacklisted(tokenPayload.jti);
    if (isRevoked) {
      throw new Error('TOKEN_REVOKED');
    }
  }

  return tokenPayload;
}

/**
 * Revoke an active token by placing its JTI into the Redis blacklist.
 */
export async function revokeToken(token: string): Promise<void> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    if (payload.jti && payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      const remainingTtl = payload.exp - now;
      if (remainingTtl > 0) {
        await blacklistToken(payload.jti, remainingTtl);
      }
    }
  } catch (error) {
    // If token is already invalid, no need to blacklist
  }
}
