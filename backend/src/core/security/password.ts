/**
 * Security password utilities powered by Bun's native C-engine.
 * Provides high-performance bcrypt hashing without node-gyp native compilation friction.
 */

export interface HashOptions {
  algorithm?: 'bcrypt' | 'argon2id';
  cost?: number; // for bcrypt (default: 10)
}

/**
 * Hash a plain text password using Bun's native bcrypt or argon2id implementation.
 */
export async function hashPassword(
  password: string,
  options: HashOptions = { algorithm: 'bcrypt', cost: 10 }
): Promise<string> {
  if (options.algorithm === 'argon2id') {
    return Bun.password.hash(password, {
      algorithm: 'argon2id',
      memoryCost: 65536,
      timeCost: 2,
    });
  }

  return Bun.password.hash(password, {
    algorithm: 'bcrypt',
    cost: options.cost ?? 10,
  });
}

/**
 * Verify a plain text password against a stored hash.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return Bun.password.verify(password, hash);
}
