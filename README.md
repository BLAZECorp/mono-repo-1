# HR Management System (Enterprise Architecture)

An enterprise-grade, high-performance Human Resource Management System built following the **VERONQUE GROUP OF COMPANIES (VGC-ENG)** engineering standards.

This repository is organized as a unified multi-tier workspace comprising:
- **[`backend/`](./backend/README.md)**: High-throughput REST API built on **Hono v4** + **Bun**, **Prisma 7**, **PostgreSQL**, **Redis**, and **Jose JWT**.
- **[`client/`](./client/README.md)**: Employee Portal interface built on **React 19**, **TanStack Router**, **TanStack Query**, **Redux Toolkit**, and **Framer Motion**.
- **[`admin/`](./admin/README.md)**: Executive & HR Administration Console built on **React 19**, **TanStack Router**, **TanStack Query**, **Redux Toolkit**, and **Framer Motion**.

---

## 🏛️ Project Directory Structure

```text
hr-management/
├── backend/                    # Hono v4 + Bun REST API (Port 3000) -> See backend/README.md
│   ├── prisma/                 # PostgreSQL schema, migrations & seed scripts
│   ├── src/
│   │   ├── api/                # HTTP Transport Layer (GET /api, /api/v1)
│   │   ├── features/           # Pure Domain Logic (auth, users, etc.)
│   │   └── core/               # Shared infrastructure (Prisma, Redis, Jose, Middlewares)
│   └── package.json
├── client/                     # Employee Self-Service Web Portal (Port 5173) -> See client/README.md
│   ├── src/
│   │   ├── features/           # Modular Monolith domains (views, api, hooks)
│   │   ├── routes/             # TanStack Router type-safe file-based route tree
│   │   └── store/              # Redux Toolkit global client UI state
│   └── package.json
├── admin/                      # HR Administrator & Manager Console (Port 5174) -> See admin/README.md
│   ├── src/
│   │   ├── features/           # Administrative dashboard, user & role management
│   │   ├── routes/             # TanStack Router file-based route tree
│   │   └── store/              # Redux Toolkit global UI state
│   └── package.json
├── docs/                       # Global System Documentation
│   ├── architecture.md         # System design, 3-tier monolith rules, and data flow
│   ├── api.md                  # RESTful API specifications & response contracts
│   ├── setup.md                # Quickstart, local Docker, Railway database, and seed guide
│   ├── deployment.md           # Railway + Vercel production deployment guide
│   └── design.md               # Frontend Design System & UI Specifications
├── docker-compose.yml          # Instant local PostgreSQL 16 & Redis 7 services
└── STANDARDS.md                # Corporate Engineering Governance Standard (VGC-ENG-004)
```

---

## ⚡ Quickstart Guide

### 1. Start Local PostgreSQL & Redis
```bash
# Start local containers via Docker Compose
docker compose up -d
# (Or use bun run docker:up)
```
*(If connecting to Railway instead, ensure you use the **Public TCP Proxy URL** for local development; see [docs/setup.md](./docs/setup.md)).*

### 2. Initialize Database & Seed Sample Accounts
```bash
# Push Prisma schema to create tables & enums
bun run db:push

# Or run official Prisma migrations:
bun run db:migrate

# Populate default Admin, Manager, and Employee accounts:
bun run db:seed
```

### 3. Start Services
```bash
# Terminal 1: Backend REST API (Port 3000)
bun run dev:backend

# Terminal 2: Employee Portal (Port 5173)
bun run dev:client

# Terminal 3: HR Admin Console (Port 5174)
bun run dev:admin
```

#### 🔑 Default Seeded Accounts:
| Role | Portal | Email | Password |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | Admin Console (`:5174`) | `admin@hrmanagement.com` | `Admin123!` |
| **💼 Manager** | Admin Console (`:5174`) | `manager@hrmanagement.com` | `Manager123!` |
| **👤 Employee** | Client Portal (`:5173`) | `employee@hrmanagement.com` | `Employee123!` |

---

## 🛡️ Security & Architecture Highlights

- **Zero-Trust Boundary Validation**: All incoming network payloads are strictly validated using **Zod** (`@hono/zod-validator`).
- **Instant Token Revocation**: Short-lived JWTs (15m) issued via **`jose`** paired with **Redis** JTI blacklisting for immediate session invalidation upon logout.
- **Native Password Hashing**: Bun native C-engine bcrypt/argon2 hashing (`Bun.password`) eliminating node-gyp build issues.
- **Zero-Waterfall Navigation**: Client and Admin frontends use TanStack Router with hover loader prefetching (`defaultPreload: 'intent'`) into the TanStack Query cache.
- **State Segregation**: Server state is managed 100% by TanStack Query; Redux Toolkit solely manages global client UI state (modals, theme, layout).

---

## 🚀 Corporate Cloud Deployment Stack

The repository follows the corporate standard multi-cloud deployment topology:
- **Backend API & Data Tier**: Deployed on **Railway** (`/backend`) with native **Bun** (`Bun.serve`), managed **PostgreSQL**, and managed **Redis** using [`backend/railway.json`](./backend/railway.json).
- **Frontend Applications**: Deployed on **Vercel** (`/client` and `/admin`) with TanStack Router SPA rewrites and global Edge CDN distribution.
- **Continuous Delivery**: A single GitHub repository triggers parallel, independent builds on `git push origin main`.
- Full guide: [Railway + Vercel Production Deployment Guide](./docs/deployment.md).

---

## 📚 Global Documentation

- [System Architecture & System Design](./docs/architecture.md)
- [REST API Contract Specifications](./docs/api.md)
- [Local Development & Environment Setup](./docs/setup.md)
- [Railway + Vercel Production Deployment Guide](./docs/deployment.md)
- [Frontend Design System & UI Specifications](./docs/design.md)
- [Corporate Engineering Standards](./STANDARDS.md)
