# Backend Engineering Standard (Hono + Bun)

**Document ID:** VGC-ENG-BE-002  
**Status:** Approved  
**Related Policy:** VGC-ENG-003 (Corporate Engineering Standard)

---

## 1. Architectural Tenets (Modular Monolith)

To balance rapid feature delivery with long-term maintainability, Veronque Group backend systems are constructed as **Modular Monoliths**. We avoid premature microservice distribution while maintaining microservice-grade boundaries inside our codebase.

### 1.1 Strict Feature Isolation
- **Domain Boundaries:** Features reside in `src/features/[feature-name]`. Each feature represents an autonomous domain containing its routes, services, repositories, schemas, and types.
- **The Public API Contract:** Every feature must export a public interface via `src/features/[feature-name]/index.ts`. External callers (such as `app.ts` or another feature) must only import from this barrel export.
- **Database Encapsulation:** Modules must not directly query the database tables belonging to another module. E.g., The `Billing` module should never run a raw join on `User` credentials. It must call the `Users` service.

---

## 2. Security & Token Lifecycle Standards

### 2.1 Short-Lived Access Tokens + Instant Revocation
- **Access Tokens:** Signed via `jose` with HS256, 15-minute expiration (`JWT_EXPIRES_IN=15m`).
- **Instant Revocation (Redis Blacklisting):** When a user logs out (`POST /api/v1/auth/logout`), the token's unique identifier (`jti`) is written to Redis with a TTL equal to the token's remaining lifespan. `authMiddleware` validates every token against Redis:
  ```ts
  const isRevoked = await isTokenBlacklisted(payload.jti);
  if (isRevoked) throw new UnauthorizedError('Token revoked');
  ```
- **Refresh Tokens:** Long-lived tokens (7 days) stored securely as salted hashes in the database.

### 2.2 Password Hashing (Bun Native)
We use Bun's native C-engine password API:
```ts
// src/core/security/password.ts
export async function hashPassword(password: string): Promise<string> {
  return Bun.password.hash(password, { algorithm: 'bcrypt', cost: 10 });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return Bun.password.verify(password, hash);
}
```

---

## 3. Standard API Envelopes

All responses follow a predictable JSON contract:

### 3.1 Success Response (`sendSuccess`)
```json
{
  "success": true,
  "data": {
    "id": "usr_123",
    "email": "user@veronque.com"
  },
  "meta": {
    "pagination": { "page": 1, "limit": 20, "total": 100 }
  },
  "requestId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "timestamp": "2026-10-18T14:30:00.000Z"
}
```

### 3.2 Error Response (`sendError`)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed for incoming payload",
    "details": [
      { "path": "email", "message": "Invalid email address format" }
    ]
  },
  "requestId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "timestamp": "2026-10-18T14:30:00.000Z"
}
```

---

## 4. Large-Scale Folder Structure Example

```text
src/
├── core/
│   ├── config/               # env.ts (Zod schema)
│   ├── database/             # prisma.ts (Pool + PrismaPg adapter)
│   ├── redis/                # redis.ts (ioredis + blacklist helpers)
│   ├── security/             # jwt.ts, password.ts
│   ├── middlewares/          # auth, role, rate-limit, request-id, error
│   ├── errors/               # app-error.ts (domain error classes)
│   └── utils/                # response.ts
├── features/
│   ├── auth/                 # Domain: Authentication
│   │   ├── auth.routes.ts    # POST /login, POST /register, POST /logout, GET /me
│   │   ├── auth.service.ts   # Registration, verification, token refresh
│   │   ├── auth.repository.ts # Prisma queries for user & refresh tokens
│   │   ├── auth.schema.ts    # Zod schemas
│   │   ├── auth.types.ts     # Domain types
│   │   └── index.ts          # Public exports
│   └── users/                # Domain: User Profiles
│       ├── users.routes.ts   # GET /profile, PATCH /profile, GET / (admin)
│       ├── users.service.ts
│       ├── users.repository.ts
│       ├── users.schema.ts
│       ├── users.types.ts
│       └── index.ts
├── app.ts                    # Hono app instance & middleware stack
└── index.ts                  # Bun.serve listener & graceful shutdown
```
