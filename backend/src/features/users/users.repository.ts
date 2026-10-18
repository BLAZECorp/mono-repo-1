import { prisma } from '../../core/database/prisma';
import type { User } from '@prisma/client';

export class UsersRepository {
  /**
   * Find a user by ID.
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Update profile fields of a user.
   */
  async update(id: string, data: { firstName?: string; lastName?: string }): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * List users with pagination and optional search.
   */
  async findMany(params: { page: number; limit: number; search?: string }): Promise<{ users: User[]; total: number }> {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }
}

export const usersRepository = new UsersRepository();
