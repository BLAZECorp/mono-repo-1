import { usersRepository, type UsersRepository } from './users.repository';
import { NotFoundError } from '../../core/errors/app-error';
import type { UpdateProfileInput, UserQueryParams } from './users.types';
import type { UserResponse } from '../auth/auth.types';

export class UsersService {
  constructor(private readonly repo: UsersRepository = usersRepository) {}

  /**
   * Get user profile by ID.
   */
  async getProfile(userId: string): Promise<UserResponse> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }
    return this.sanitizeUser(user);
  }

  /**
   * Update user profile.
   */
  async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserResponse> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    const updated = await this.repo.update(userId, {
      firstName: input.firstName,
      lastName: input.lastName,
    });

    return this.sanitizeUser(updated);
  }

  /**
   * List users with pagination (Admin access).
   */
  async listUsers(params: UserQueryParams): Promise<{
    users: UserResponse[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const { users, total } = await this.repo.findMany(params);
    const totalPages = Math.ceil(total / params.limit);

    return {
      users: users.map((u) => this.sanitizeUser(u)),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
      },
    };
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

export const usersService = new UsersService();
