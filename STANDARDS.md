VERONQUE GROUP OF COMPANIES CORP.
Engineering & Technology Governance Standard (Full-Stack HR Management System)

Document ID: VGC-ENG-004
Document Type: Corporate Engineering Standard
Version: 1.0
Status: Approved
Owner: Engineering / Technology Organization
Applies To: HR Management Workspace (Backend API, Client Web Portal, Admin Console)

---

1. Purpose

This document establishes the overarching technical standards, architectural expectations, security policies, and engineering practices for the full-stack HR Management system within VERONQUE GROUP OF COMPANIES CORP.

---

2. Engineering Philosophy

2.1 Modular Monolith (Feature-Based Isolation)
Both frontend and backend codebases enforce strict feature-based boundaries:
- **Backend (`src/features/[feature]/`)**: Business rules (`service.ts`), data queries (`repository.ts`), validation schemas (`schema.ts`), and domain types (`types.ts`). Transport routing is isolated in `src/api/v1/`.
- **Frontend (`src/features/[feature]/`)**: Feature views (`views/`), network query definitions (`api/`), component UI logic (`hooks/`), and validation schemas (`schemas/`).

2.2 Strict Decoupling of Transport and Logic
- Route handlers (in Hono and TanStack Router) must be ultra-thin orchestrators.
- No business logic or complex validation rules belong inside route files. Transport delegates to Domain Services; queries delegate to Repositories.

2.3 Zero-Trust Security at All Boundaries
- All incoming HTTP inputs are validated via Zod schemas before being passed to application code.
- Cryptographic JWT signing using `jose` with short 15-minute access expirations.
- Redis-backed JTI blacklisting for instant session termination on logout.
- Bun native C-level password hashing (`Bun.password` bcrypt / argon2id).

---

3. Standard Technology Landscape

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Backend API** | Hono v4 on Bun | High-throughput, lightweight memory footprint, web standards |
| **Database & ORM** | Prisma 7 + PostgreSQL (`@prisma/adapter-pg`) | Type-safe migrations, connection pooling, enterprise transactions |
| **Caching & Rate Limiting** | ioredis | Sliding-window rate limiting, token blacklist storage |
| **Frontend Applications** | React 19 + Vite 8 | Modern React Compiler, ES2023, high-speed HMR |
| **Routing** | TanStack Router | File-based type-safe routing with intent-based hover prefetching |
| **Server State** | TanStack Query v5 | Declarative caching, deduplication, background sync |
| **Client UI State** | Redux Toolkit | Strictly global UI concerns (sidebar, theme, modals) |
| **CSS & Styling** | Tailwind CSS v4 (`@tailwindcss/vite`) | Utility-first design tokens, zero-config Vite compilation |
| **Validation** | Zod | Single source of truth for runtime validation contracts |
| **Animations & Icons** | Framer Motion & Lucide React | Hardware-accelerated UI transitions and enterprise iconography |

---

4. Strict Operational Rules

1. **No Cross-Feature Internal Imports**: Modules must interact solely through public `index.ts` barrel interfaces.
2. **Response Standardization**: All backend endpoints return standard `sendSuccess` or `sendError` envelopes with `requestId`.
3. **Graceful Degradation**: Frontend modules must employ Error Boundaries and loading states so non-critical widget failures do not crash the view.

---

5. Cloud Infrastructure & Continuous Deployment Standard

To ensure uniform DevOps operations, security parity, and predictable delivery across all corporate initiatives, the following deployment topology is mandatory across all projects:

5.1 Backend & Data Tier: Railway Standard
- **Compute Runtime**: Railway Container Service running native Bun (`Bun.serve`) with zero cold starts.
- **Database**: Railway Managed PostgreSQL with internal private networking (`${{Postgres.DATABASE_URL}}`).
- **Redis Cache**: Railway Managed Redis with persistent TCP socket connections (`${{Redis.REDIS_URL}}`).
- **Automated Deployments**: Triggered on `git push origin main` targeting the `/backend` root directory.
- **Pre-flight Migration Policy**: Every deployment must execute `bun run prisma:generate && bun run db:migrate:deploy` before accepting inbound traffic (configured via `backend/railway.json`).
- **Healthcheck Compliance**: Backend must expose `GET /health` verifying database and Redis readiness.

5.2 Frontend Web Applications: Vercel Standard
- **Hosting Tier**: Vercel Global Edge Network with multi-project repository linking:
  - `client` (Employee Portal) -> Vercel project with Root Directory `client`.
  - `admin` (HR Admin Console) -> Vercel project with Root Directory `admin`.
- **SPA Rewrite Policy**: All single-page applications must declare a `vercel.json` catch-all rewrite (`/.*` -> `/index.html`) to support client-side routing.
- **Build Efficiency Policy**: Each project must implement the Vercel Ignored Build Step (`git diff --quiet HEAD^ HEAD .`) so commits affecting one interface do not trigger builds for unrelated interfaces.
- **Environment Parity**: Frontends connect to the Railway backend URL via `VITE_API_URL`.

---

6. Frontend UI/UX & Design Token Governance

To prevent UI drift, inconsistent spacing, and accessibility regressions across interfaces:
- **Typography Standard**: All interfaces conform to `docs/design.md`. Standard body copy must use `14px` (`font-sm`) with `20px` line height. Form inputs use `14px` to prevent viewport auto-zooming on mobile safari.
- **Grid Compliance**: All margins, padding, and layout gaps conform strictly to the 4px base unit grid (4px, 8px, 12px, 16px, 20px, 24px, 32px, 48px).
- **Accessible Contrast**: Foreground text against surface backgrounds must meet WCAG 2.1 AA (minimum 4.5:1 ratio).
- **Motion Restraint**: Animations are strictly utility-focused micro-interactions (150ms–250ms) using Framer Motion. Decorative looping animations are prohibited.
- Full specifications: [Frontend Design System & UI Specifications](./docs/design.md).
