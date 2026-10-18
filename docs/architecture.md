# HR Management System - Architecture & System Design

**Document ID:** VGC-HR-ARCH-001  
**Status:** Approved Standard  
**Applies To:** Full Monorepo Architecture (`backend`, `client`, `admin`)  
**Audience:** All Software Engineers & Onboarding Developers  

---

## 1. High-Level System Architecture

The HR Management system is architected as an **Integrated Modular Monolith** that separates user-facing applications by role while centralizing core business data logic.

```text
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│     Client Portal (React 19)    │       │     Admin Console (React 19)    │
│    - Employee Self-Service      │       │    - Organization, Roles, Logs  │
│    - TanStack Router + Query    │       │    - TanStack Router + Query    │
│    - Port: 5173 (Vercel Edge)   │       │    - Port: 5174 (Vercel Edge)   │
└────────────────┬────────────────┘       └────────────────┬────────────────┘
                 │                                         │
                 │ HTTP / REST (JSON API v1)               │ HTTP / REST (JSON API v1)
                 │ Bearer JWT + X-Request-Id               │ Bearer JWT + X-Request-Id
                 ▼                                         ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                       Hono v4 Backend (Bun Runtime)                       │
│                       Port: 3000 (Railway Container)                      │
│                                                                           │
│  [1. Global Middleware Pipeline]                                          │
│   ├── Correlation ID (X-Request-Id)                                       │
│   ├── Secure Headers (HSTS, CSP, X-Frame-Options)                          │
│   ├── CORS Whitelist Validation                                           │
│   └── Sliding-Window Rate Limiting (Redis-backed)                         │
│                                                                           │
│  [2. Transport Routing Gateway: src/api/]                                 │
│   ├── Root Discovery: GET /api                                            │
│   └── API v1 Gateway: /api/v1                                             │
│       ├── /auth   ──► (Register, Login, Logout, Refresh, Me)              │
│       ├── /users  ──► (Profile, Directory, Role Administration)           │
│       └── /health ──► (Infrastructure Telemetry & Migration Audit Logs)   │
│                                                                           │
│  [3. Pure Domain Business Logic: src/features/]                           │
│   ├── Features/Auth:  auth.service.ts   • auth.repository.ts              │
│   └── Features/Users: users.service.ts  • users.repository.ts             │
│                                                                           │
│  [4. Core Infrastructure: src/core/]                                      │
│   ├── Security: Jose JWT signing & Bun.password native hashing            │
│   └── Middleware Guards: authMiddleware, requireRole RBAC                  │
└───────────────────────┬───────────────────────────┬───────────────────────┘
                        │                           │
                        ▼                           ▼
        ┌───────────────────────────┐   ┌───────────────────────────┐
        │  PostgreSQL (Prisma 7)    │   │      Redis (ioredis)      │
        │  - users & refresh_tokens │   │  - JTI Token Blacklist    │
        │  - audit_logs (Migrations)│   │  - Sliding Rate Limits    │
        │  - @prisma/adapter-pg     │   │  - Fast Session Caching   │
        └───────────────────────────┘   └───────────────────────────┘
```

---

## 2. The 3-Tier Monolith Layering Rule

To keep code maintainable as the project grows to hundreds of thousands of lines, every file belongs to one of three strictly defined layers:

```text
Incoming HTTP Request
       │
       ▼
[ Layer 1: Transport Layer (src/api/) ]
  - Validates incoming parameters & JSON bodies with Zod.
  - Calls Domain Services.
  - Formats HTTP responses using standard envelopes (sendSuccess, sendError).
  - NEVER executes raw database queries or contains business math.
       │
       ▼
[ Layer 2: Domain Business Layer (src/features/) ]
  - Houses business rules, permissions checks, calculations, and domain workflows.
  - Encapsulated in services (*.service.ts) and repositories (*.repository.ts).
  - Transport-agnostic: Does not know about HTTP requests, Hono context, or response headers.
       │
       ▼
[ Layer 3: Core Infrastructure (src/core/) ]
  - Shared persistence clients (Prisma, Redis).
  - Cryptographic helpers (Jose JWT, Bun native password hashing).
  - Global error handling, environment variables, correlation ID tagging.
```

> [!IMPORTANT]
> **Dependency Direction Rule**:  
> `src/api/` can import from `src/features/` and `src/core/`.  
> `src/features/` can import from `src/core/`.  
> `src/features/` and `src/core/` **NEVER** import from `src/api/`.

---

## 3. Authentication & Security Engine

### 3.1 Dual-Token Strategy
Authentication is built with zero-trust token lifecycles:
1. **Access Token (Short-Lived):**
   - Lifespan: **15 minutes** (`JWT_EXPIRES_IN=15m`).
   - Format: HS256-signed JWT via `jose`.
   - Claims: `{ userId, email, role, jti, iat, exp }`.
2. **Refresh Token (Long-Lived):**
   - Lifespan: **7 days** (`REFRESH_TOKEN_EXPIRES_IN=7d`).
   - Stored hashed in the PostgreSQL `refresh_tokens` table.

### 3.2 Instant Revocation Flow (Redis JTI Blacklist)
Standard JWTs cannot be revoked before expiration without a database roundtrip. To achieve sub-millisecond instant logout:
1. When a user logs out (`POST /api/v1/auth/logout`), the backend extracts the unique token ID (`jti`) and expiration time (`exp`).
2. The `jti` is stored in Redis with an auto-expiring TTL:
   ```text
   SET bl:<jti> "revoked" EX <remaining_seconds>
   ```
3. On every subsequent request, `authMiddleware` checks Redis:
   - If key exists in Redis ──► Immediately rejected with `401 Unauthorized (Token Revoked)`.
   - If key does not exist ──► Request proceeds to domain handler.
4. When the token expires naturally, Redis evicts the key automatically, ensuring zero memory accumulation.

---

## 4. Frontend Architecture (Client & Admin)

Both `client` (Employee Portal) and `admin` (HR Admin Console) share an enterprise React 19 architecture:

```text
src/
├── app/                        # Root application shell & router mounting
├── components/                 # Global UI primitives (Buttons, Cards, Inputs, Modals)
├── features/                   # Domain features (e.g. dashboard, employees, payroll)
│   ├── api/                    # TanStack Query keys, fetchers, queryOptions
│   ├── components/             # Feature-specific UI components
│   ├── hooks/                  # Component UI state logic (NOT raw network calls)
│   ├── schemas/                # Zod validation schemas
│   ├── views/                  # Composed page views
│   └── index.ts                # Public feature barrel export
├── lib/                        # QueryClient singletons, utility functions
├── routes/                     # TanStack Router file-based route tree (Thin Orchestrators)
└── store/                      # Redux Toolkit global client UI state (Theme, Sidebar, Modals)
```

### Why Query Definitions Live in `api/` (Not `hooks/`):
- `features/[domain]/api/` creates `queryOptions()` and query keys.
- TanStack Router route loaders can prefetch data into the query cache **during navigation hover** before the component even mounts (`defaultPreload: 'intent'`), eliminating loading spinners and waterfalls.
- `hooks/` is strictly reserved for component-level UI state (e.g. multi-step forms, filter toggles).

---

## 5. Production Cloud Topology

The system employs a multi-cloud topology designed for maximum runtime throughput and edge CDN caching:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE NETWORK                             │
│                                                                        │
│   ┌───────────────────────────────┐  ┌───────────────────────────────┐ │
│   │ hr-client.vercel.app          │  │ hr-admin.vercel.app           │ │
│   │ (Root: client)                │  │ (Root: admin)                 │ │
│   │ React 19 + Vite Edge SPA      │  │ React 19 + Vite Edge SPA      │ │
│   │ vercel.json rewrite: /(.*)    │  │ vercel.json rewrite: /(.*)    │ │
│   └───────────────┬───────────────┘  └───────────────┬───────────────┘ │
└───────────────────┼──────────────────────────────────┼─────────────────┘
                    │                                  │
                    │ HTTPS JSON API Requests (CORS)   │
                    ▼                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        RAILWAY CONTAINER CLOUD                         │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ hr-backend.up.railway.app                                      │   │
│   │ (Root: backend)                                                │   │
│   │ High-throughput Native Bun Runtime (Bun.serve)                 │   │
│   │ Zero Cold Starts • Railway Nixpacks • railway.json             │   │
│   └──────────────────────┬───────────────────┬─────────────────────┘   │
│                          │                   │                         │
│      Private Network     │                   │     Private Network     │
│      ${{Postgres...}}    ▼                   ▼     ${{Redis...}}       │
│   ┌──────────────────────────────┐   ┌─────────────────────────────┐   │
│   │ Railway Managed PostgreSQL   │   │ Railway Managed Redis       │   │
│   │ Prisma 7 + migrations        │   │ ioredis TCP Persistent      │   │
│   └──────────────────────────────┘   └─────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```
