import { authRepository, type AuthRepository } from './auth.repository';
import { hashPassword, verifyPassword } from '../../core/security/password';
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  revokeToken,
} from '../../core/security/jwt';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../../core/errors/app-error';
import { env } from '../../core/config/env';
import type {
  RegisterInput,
  LoginInput,
  AuthResult,
  UserResponse,
} from './auth.types';

export class AuthService {
  constructor(private readonly repo: AuthRepository = authRepository) {}

  /**
   * Register a new user account.
   */
  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await this.repo.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    // Hash password with Bun native bcrypt
    const passwordHash = await hashPassword(input.password);

    const user = await this.repo.create({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
    });

    // Issue tokens
    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = await signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Save refresh token hash in DB
    const refreshTokenHash = await hashPassword(refreshToken.token);
    await this.repo.saveRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: refreshToken.expiresAt,
    });

    return {
      user: this.sanitizeUser(user),
      tokens: {
        accessToken: accessToken.token,
        refreshToken: refreshToken.token,
        tokenType: 'Bearer',
        expiresIn: env.JWT_EXPIRES_IN,
      },
    };
  }

  /**
   * Authenticate a user with email and password.
   */
  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.repo.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account has been deactivated. Contact support.');
    }

    const isValidPassword = await verifyPassword(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Issue tokens
    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = await signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Save refresh token hash
    const refreshTokenHash = await hashPassword(refreshToken.token);
    await this.repo.saveRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: refreshToken.expiresAt,
    });

    return {
      user: this.sanitizeUser(user),
      tokens: {
        accessToken: accessToken.token,
        refreshToken: refreshToken.token,
        tokenType: 'Bearer',
        expiresIn: env.JWT_EXPIRES_IN,
      },
    };
  }

  /**
   * Log out a user by blacklisting the access token in Redis.
   */
  async logout(accessToken: string): Promise<void> {
    await revokeToken(accessToken);
  }

  /**
   * Issue a new access token using a valid refresh token.
   */
  async refreshAccessToken(refreshTokenStr: string): Promise<{ accessToken: string; expiresIn: string }> {
    const payload = await verifyToken(refreshTokenStr);

    const user = await this.repo.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User session is invalid');
    }

    const newAccessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken: newAccessToken.token,
      expiresIn: env.JWT_EXPIRES_IN,
    };
  }

  /**
   * Get authenticated user profile details.
   */
  async getCurrentUser(userId: string): Promise<UserResponse> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new NotFoundError('User record not found');
    }
    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: any): UserResponse {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
