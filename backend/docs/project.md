# Hono Enterprise Backend Template

**Version:** 1.0.0  
**Stack:** Hono v4, Bun Runtime, Prisma 7, PostgreSQL, ioredis, Jose, Bun Native Bcrypt, Zod, @hono/zod-validator.

## Available Scripts

```bash
# Start development server with hot module reloading
bun run dev

# Bundle production build
bun run build

# Run TypeScript typecheck
bun run typecheck

# Regenerate Prisma Client
bun run prisma:generate
```

## Architectural Highlights
- **Feature-Based Modular Monolith**: Isolated `auth` and `users` features containing `routes`, `services`, `repositories`, `schemas`, and `types`.
- **Instant Token Revocation**: Short-lived JWTs via `jose` paired with Redis JTI blacklisting on logout.
- **Native Password Hashing**: Native C-speed bcrypt via `Bun.password` without node-gyp issues.
- **Sliding-Window Rate Limiter**: Redis-backed with memory fallback.
- **Prisma 7 with Connection Pooling**: Using `@prisma/adapter-pg` with `pg` connection pool.
