# HR Management - Backend REST API Service

An enterprise-grade, high-throughput REST API service built with **Hono v4** running natively on **Bun**, connected to **PostgreSQL** via **Prisma 7** and **Redis** for sub-millisecond caching and session blacklisting.

---

## 🛠️ Technology Stack

- **Runtime & Web Framework**: [Bun](https://bun.sh/) + [Hono v4](https://hono.dev/)
- **Database ORM**: [Prisma 7](https://www.prisma.io/) + PostgreSQL (`@prisma/adapter-pg` + `pg.Pool`)
- **In-Memory Cache & Session Store**: [ioredis](https://github.com/redis/ioredis)
- **Security & Authentication**: [Jose](https://github.com/panva/jose) (HS256 JWTs) + Bun native password hashing (`Bun.password` bcrypt)
- **Runtime Validation**: [Zod](https://zod.dev/) + `@hono/zod-validator`

---

## 🏛️ Directory Architecture

The backend strictly separates **HTTP Transport Routing** from **Pure Domain Logic**:

```text
backend/
├── prisma/
│   ├── migrations/               # Immutable version-controlled SQL migration history
│   ├── schema.prisma             # PostgreSQL schema models (User, RefreshToken, AuditLog)
│   └── seed.ts                   # Database seeder with automated migration audit logging
├── src/
│   ├── api/                      # ⭐ Layer 1: HTTP Transport Layer
│   │   ├── index.ts              # Root API discovery gateway (GET /api)
│   │   └── v1/                   # Version 1 Gateway (/api/v1)
│   │       ├── auth.routes.ts    # /api/v1/auth route orchestrators
│   │       ├── users.routes.ts   # /api/v1/users route orchestrators
│   │       ├── health.routes.ts  # /api/v1/health & /audit telemetry probes
│   │       └── index.ts          # v1 Router aggregation & ApiV1Routes type export
│   ├── features/                 # ⭐ Layer 2: Pure Domain Business Logic
│   │   ├── auth/                 # auth.service.ts, auth.repository.ts, auth.schema.ts
│   │   └── users/                # users.service.ts, users.repository.ts, users.schema.ts
│   ├── core/                     # ⭐ Layer 3: Cross-Cutting Infrastructure
│   │   ├── config/               # Zod-validated environment schema (env.ts)
│   │   ├── database/             # Prisma client instance & PostgreSQL connection pool
│   │   ├── redis/                # Redis client instance & cache health check
│   │   ├── security/             # Jose JWT signing/verification & Bun password hashing
│   │   ├── middlewares/          # Auth guards, RBAC, sliding-window rate limit, requestId
│   │   └── utils/                # Response envelopes (sendSuccess, sendError)
│   ├── app.ts                    # Hono application setup & global middleware mounting
│   └── index.ts                  # Bun.serve listener & graceful shutdown handlers
├── prisma.config.ts              # Prisma 7 configuration file
├── railway.json                  # Railway continuous deployment and healthcheck config
└── package.json
```

---

## ⚡ Developer Quickstart

### 1. Environment Configuration
Ensure `.env` exists in `backend/`:
```bash
cp .env.example .env
```
Populate your database and Redis connection strings:
```ini
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/hr_db?schema=public
REDIS_URL=redis://localhost:6379
JWT_SECRET=super-secret-jwt-key-at-least-32-characters-long-enterprise
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000
```

*(Note: When connecting to a Railway cloud database from your local machine, use Railway's **Public TCP Proxy URL** `*.proxy.rlwy.net`; see [`docs/setup.md`](../docs/setup.md)).*

### 2. Database Synchronization & Seeding
```bash
# Push schema directly to database (rapid prototyping)
bun run db:push

# Or create an immutable timestamped migration:
bun run db:migrate

# Seed default test accounts (Admin, Manager, Employee):
bun run db:seed
```

### 3. Start Development Server
```bash
bun run dev
# Server listening on http://localhost:3000
```

---

## 📜 Available NPM / Bun Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `bun run dev` | `bun run --hot src/index.ts` | Starts dev server with hot reload |
| `bun run build` | `bun build src/index.ts --outdir dist --target bun` | Bundles single production file |
| `bun run typecheck`| `tsc --noEmit` | Validates TypeScript with zero emitted files |
| `bun run db:push` | `prisma db push` | Syncs Prisma schema directly to DB |
| `bun run db:migrate`| `prisma migrate dev` | Creates new timestamped migration & runs seed |
| `bun run db:seed` | `bun run prisma/seed.ts` | Seeds accounts and logs audit record |
| `bun run db:studio`| `prisma studio` | Opens visual web interface at port 5555 |

---

## 📡 API Endpoints Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api` | Public | Service discovery & active version listing |
| `GET` | `/health` or `/api/v1/health` | Public | Telemetry & service readiness probe |
| `GET` | `/api/v1/health/audit` | Public | Historical migration & database audit logs |
| `POST` | `/api/v1/auth/register` | Public (Rate-limited) | Register new user account |
| `POST` | `/api/v1/auth/login` | Public (Rate-limited) | Authenticate & issue access/refresh tokens |
| `POST` | `/api/v1/auth/logout` | Bearer Token | Revoke active access token in Redis |
| `POST` | `/api/v1/auth/refresh` | Public | Exchange refresh token for fresh access token |
| `GET` | `/api/v1/auth/me` | Bearer Token | Retrieve authenticated user profile |
| `GET` | `/api/v1/users/profile` | Bearer Token | Retrieve user profile |
| `PATCH`| `/api/v1/users/profile` | Bearer Token | Update user profile fields |
| `GET` | `/api/v1/users` | Admin Role | Paginated employee/user directory |

---

## 🚀 Railway Cloud Deployment

The backend is pre-configured for automated continuous delivery to Railway via [`railway.json`](./railway.json):
- **Root Directory**: `backend`
- **Build Command**: `bun install && bun run prisma:generate && bun run db:migrate:deploy`
- **Start Command**: `bun run src/index.ts`
- **Healthcheck Path**: `/health`
- Complete guide: See [`docs/deployment.md`](../docs/deployment.md).
