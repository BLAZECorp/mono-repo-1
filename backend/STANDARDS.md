VERONQUE GROUP OF COMPANIES CORP.
Engineering & Technology Governance Standard (Hono Backend / API Micro-Monolith)

Document ID: VGC-ENG-003
Document Type: Corporate Engineering Standard
Version: 1.0
Status: Approved
Owner: Engineering / Technology Organization
Applies To: All Hono + Bun backend micro-monoliths, RESTful microservices, and internal APIs

---

1. Purpose

This document establishes the technical standards, architectural expectations, security policies, and engineering practices for backend APIs built using Hono and Bun within VERONQUE GROUP OF COMPANIES CORP.

The primary objective is to maintain enterprise-grade backend software that is:
- High-Performance & Low-Latency
- Secure by Design (Zero-Trust)
- Resilient & Observable
- Encapsulated within Domain Boundaries (Modular Monolith)
- Type-Safe at All Network Boundaries

---

2. Engineering Philosophy

2.1 Modular Monolith (Feature-Based Isolation)
Backend applications are organized by domain features (`src/features/[feature-name]`), not by technical layers alone. Each feature is an autonomous unit comprising:
- `routes.ts`: Transport/HTTP layer (Hono sub-router)
- `service.ts`: Business logic layer (orchestration and rules)
- `repository.ts`: Data access layer (Prisma queries)
- `schema.ts`: Request/response validation contracts (Zod)
- `types.ts`: Domain TypeScript types inferred from Zod
- `index.ts`: Strict public API barrel export

2.2 Zero Trust & Strict Boundary Validation
All incoming requests (JSON body, query parameters, URL path parameters) must be validated at the transport boundary using `@hono/zod-validator` and Zod. Unvalidated inputs must never enter domain services or repositories.

2.3 Native Bun Performance (Bun.password vs bcrypt)
To maximize execution speed and avoid C++ compilation friction on deployment containers, password hashing must utilize Bun's native `Bun.password` API (supporting bcrypt cost 10 or argon2id) rather than legacy npm packages requiring node-gyp.

2.4 Dual-Layer Token Security (Jose + Redis Blacklisting)
- Stateless authentication uses short-lived JWT access tokens (15m) signed via `jose`.
- To support immediate revocation on logout or security events, token identifiers (`jti`) are recorded in Redis with an expiration matching the token's remaining TTL.
- Hono's `authMiddleware` validates both the cryptographic signature and checks the Redis blacklist in sub-millisecond time.

---

3. Standard Technology Landscape

| Responsibility | Technology / Package | Rationale |
| :--- | :--- | :--- |
| Core Framework | Hono v4 | Ultra-fast routing, lightweight memory footprint, web standards API |
| Runtime Engine | Bun | Native speed, zero-overhead TypeScript execution, native crypto |
| Database & ORM | Prisma 7 + PostgreSQL (`@prisma/adapter-pg`) | Type-safe migrations, auto-generated models, pooled connections |
| In-Memory Caching | ioredis | Industry standard for session blacklisting and sliding-window rate limiting |
| Authentication | `jose` | Universal, lightweight JWT sign and verification |
| Password Hashing | `Bun.password` (Native bcrypt/argon2) | Zero-dependency, native speed, maximum security |
| Schema Validation | `zod` + `@hono/zod-validator` | Strict runtime schema enforcement for request bodies and environment |
| Security Headers | `hono/secure-headers` + `hono/cors` | HSTS, CSP, X-Frame-Options, No-Sniff, and strict CORS whitelist |

---

4. Folder Structure & Architectural Anatomy

```text
src/
├── core/                         # Cross-cutting concerns & shared infrastructure
│   ├── config/                   # Zod-validated environment configuration (env.ts)
│   ├── database/                 # Prisma client singleton & connection pool (prisma.ts)
│   ├── redis/                    # Redis client singleton & cache helpers (redis.ts)
│   ├── security/                 # Security utilities
│   │   ├── jwt.ts                # Jose sign/verify/revoke helpers
│   │   └── password.ts           # Bun native bcrypt hashing & verification
│   ├── middlewares/              # Hono application middlewares
│   │   ├── auth.middleware.ts    # JWT verification & Redis blacklist check
│   │   ├── role.middleware.ts    # RBAC role verification
│   │   ├── rate-limit.ts         # Redis sliding-window rate limiter with memory fallback
│   │   ├── request-id.ts         # Correlation ID injection
│   │   └── error.middleware.ts   # Global exception formatter & status mapping
│   ├── errors/                   # Domain & HTTP Error hierarchy (AppError, NotFound, etc.)
│   └── utils/                    # Standardized response envelopes (response.ts)
├── features/                     # Domain Feature Modules (Strict Isolation)
│   ├── auth/                     # Authentication & Token Domain
│   │   ├── auth.routes.ts        # Hono route definitions (POST /login, /register, /logout, /refresh)
│   │   ├── auth.service.ts       # Business rules, credential validation, token issuance
│   │   ├── auth.repository.ts    # User credential queries & refresh token persistence
│   │   ├── auth.schema.ts        # Zod validation schemas for inputs & DTOs
│   │   ├── auth.types.ts         # Domain types
│   │   └── index.ts              # Public API barrel & sub-router export
│   └── users/                    # User Profile & Directory Domain
│       ├── users.routes.ts       # (GET /profile, PATCH /profile, GET / (admin))
│       ├── users.service.ts      # Profile management logic
│       ├── users.repository.ts   # User entity queries
│       ├── users.schema.ts       # Zod schemas for user profile updates
│       ├── users.types.ts        # User types
│       └── index.ts              # Public API barrel export
├── app.ts                        # Hono app instance, global middlewares, route mounting
└── index.ts                      # Bun HTTP server listener & graceful shutdown handlers
```

---

5. Strict Operational Rules

1. **Standardized Response Envelope**: All endpoints must return standard responses via `sendSuccess(c, data, meta)` or `sendError(c, message, code, details)`.
2. **Encapsulation via Index**: Domain features may only import from another feature's root `index.ts`. Direct deep imports into another feature's `repository` or `service` are prohibited.
3. **Graceful Shutdown**: The server must listen for `SIGINT` and `SIGTERM` signals to cleanly terminate active database connections, disconnect Redis, and drain in-flight HTTP requests.
4. **Structured Correlation Logs**: All requests must bear an `X-Request-Id` header for end-to-end distributed tracing.
