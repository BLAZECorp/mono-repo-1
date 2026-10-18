# HR Management System - Development & Setup Guide

**Document ID:** VGC-HR-SETUP-001  
**Status:** Approved  
**Applies To:** Full-Stack Monorepo (`backend`, `client`, `admin`)  

---

## 1. Prerequisites

Ensure the following tooling is available on your workstation:
- **Bun**: v1.1.0 or newer ([bun.sh](https://bun.sh))
- **Node.js**: v20 or newer (for standard tooling and Prisma compatibility)
- **Docker Desktop** (Optional, recommended for instant 1-command local Postgres & Redis)

---

## 2. Step 1: Start PostgreSQL and Redis

The backend requires a **PostgreSQL** database and a **Redis** instance for caching and instant JWT revocation. Choose one of the following methods:

### Option A: Local Docker (Recommended & Fastest)
A pre-configured [`docker-compose.yml`](file:///c:/Users/konoe/projects/personal-projects/hr-management/docker-compose.yml) is provided in the repository root.

From the project root:
```bash
# Start PostgreSQL (port 5432) and Redis (port 6379) in the background
docker compose up -d

# Or using the root bun script:
bun run docker:up
```

### Option B: Railway Cloud Database
If using Railway for your databases:
> [!IMPORTANT]
> **Railway Internal vs Public URLs**:  
> Hostnames ending in `.railway.internal` (e.g. `postgres.railway.internal`) **only resolve inside Railway's cloud network**.  
> To connect from your **local developer machine**, you must use Railway's **Public TCP Proxy URL**:
> 1. In Railway, click your **PostgreSQL** service > go to **Connect** or **Variables** tab.
> 2. Copy the **`DATABASE_PUBLIC_URL`** (format: `postgresql://postgres:pass@roundhouse.proxy.rlwy.net:PORT/railway`).
> 3. In Railway, click your **Redis** service > go to **Connect** or **Variables** tab.
> 4. Copy the **`REDIS_PUBLIC_URL`** (format: `redis://default:pass@roundhouse.proxy.rlwy.net:PORT`).

### Option C: Cloud Serverless Providers
- **PostgreSQL**: Free tier on [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com).
- **Redis**: Free tier on [Upstash.com](https://upstash.com).

---

## 3. Step 2: Environment Configuration

Copy the example environment files into active `.env` files:

### Backend Configuration
In `backend/`:
```bash
cd backend
cp .env.example .env
```
Ensure your `backend/.env` has valid credentials matching your chosen database option:

```ini
NODE_ENV=development
PORT=3000

# PostgreSQL Connection String
# If using Option A (Docker):
DATABASE_URL=postgresql://postgres:password@localhost:5432/hr_db?schema=public

# If using Option B (Railway Public URL):
# DATABASE_URL=postgresql://postgres:<password>@<host>.proxy.rlwy.net:<port>/railway

# Redis Connection String
# If using Option A (Docker):
REDIS_URL=redis://localhost:6379

# If using Option B (Railway Public URL):
# REDIS_URL=redis://default:<password>@<host>.proxy.rlwy.net:<port>

# Authentication Secrets (Jose JWT)
JWT_SECRET=super-secret-jwt-key-at-least-32-characters-long-enterprise
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS Allowed Origins
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000
```

### Frontend Configuration
In `client/` and `admin/`:
```bash
# Client
cd ../client
cp .env.example .env

# Admin
cd ../admin
cp .env.example .env
```
Both frontends default to `VITE_API_URL=http://localhost:3000/api/v1`.

---

## 4. Step 3: Database Initialization (Push & Seed)

By default, an initialized database is completely empty. Follow these three steps to make the database 100% operational:

### 4.1 Push Schema to Database
Synchronize the Prisma schema with the database to automatically generate all tables, enums (`Role`: `USER`, `ADMIN`, `MODERATOR`), foreign keys, and indexes:

```bash
# From the backend directory:
bun run db:push

# Or directly from the hr-management root:
bun run db:push
```
*Expected output: `🚀 Your database is now in sync with your Prisma schema.`*

### 4.2 Generate Prisma Client
Regenerate the type-safe Prisma client:
```bash
# Inside backend:
bun run prisma:generate
```

### 4.3 Seed Initial Accounts & Data
Run the database seeder to populate default accounts for development and testing:

```bash
# From the backend directory:
bun run db:seed

# Or directly from the hr-management root:
bun run db:seed
```

#### Seeded Accounts Created:
| Role | Portal / Destination | Email | Password |
| :--- | :--- | :--- | :--- |
| **👑 Administrator** | HR Admin Console (`:5174`) | `admin@hrmanagement.com` | `Admin123!` |
| **💼 HR Manager** | HR Admin Console (`:5174`) | `manager@hrmanagement.com` | `Manager123!` |
| **👤 Employee** | Client Portal (`:5173`) | `employee@hrmanagement.com` | `Employee123!` |

### 4.4 Inspect Data via Prisma Studio (Optional)
To visually inspect your database tables and rows in your browser:
```bash
# Inside backend:
bun run db:studio
# Opens Prisma Studio at http://localhost:5555
```

### 4.5 Creating New Migrations on Model Changes
Whenever you modify or add new models in `prisma/schema.prisma`:
1. Generate an immutable, timestamped migration SQL file:
   ```bash
   cd backend
   bun run db:migrate
   # Or from root:
   bun run db:migrate
   ```
2. Prisma creates `prisma/migrations/<timestamp>_<migration_name>/migration.sql` for version-controlled change logging.
3. The migration process automatically triggers `prisma/seed.ts`, which persists a new audit trail entry into the `audit_logs` table (`DATABASE_MIGRATION_SEEDED`).
4. To view historical migration audit records:
   - **REST API Endpoint**: `GET /api/v1/health/audit`
   - **Prisma Studio**: `bun run db:studio` (inspect `audit_logs` table)

---

## 5. Step 4: Starting the Applications

Open three terminal sessions:

### Terminal 1: Backend REST API
```bash
cd backend
bun run dev
# Server listening on http://localhost:3000
```

### Terminal 2: Employee Portal (Client)
```bash
cd client
bun run dev
# Vite server running on http://localhost:5173
```

### Terminal 3: HR Admin Console (Admin)
```bash
cd admin
bun run dev -- --port 5174
# Vite server running on http://localhost:5174
```

---

## 6. Step 5: Verify 100% Working Status

### A. Healthcheck Telemetry
Visit `http://localhost:3000/health` in your browser or run:
```bash
curl http://localhost:3000/health
```
**Expected 200 OK Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "services": {
      "database": "up",
      "redis": "up"
    },
    "uptime": 10.5,
    "version": "1.0.0"
  }
}
```

### B. Test Authentication Endpoint
Verify that the seeded administrator can authenticate:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@hrmanagement.com\",\"password\":\"Admin123!\"}"
```
**Expected 200 OK Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "admin@hrmanagement.com",
      "firstName": "System",
      "lastName": "Administrator",
      "role": "ADMIN"
    },
    "tokens": {
      "accessToken": "ey...",
      "refreshToken": "ey...",
      "expiresIn": 900
    }
  }
}
```

---

## 7. Production Deployment Reference

When deploying to production:
- **Backend**: Hosted on **Railway** via [`backend/railway.json`](file:///c:/Users/konoe/projects/personal-projects/hr-management/backend/railway.json) (runs migrations automatically on deploy).
- **Frontends**: Hosted on **Vercel** (`client` and `admin`) with SPA rewrites.
- Complete guide: [Production & Deployment Guide](./deployment.md).
