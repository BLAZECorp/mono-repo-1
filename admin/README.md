# HR Management - Administration & Management Console (`admin`)

The **HR Administration Console** is an executive-level web application designed for HR Directors, People Operations, and System Administrators to manage organization departments, employee roles, access permissions, payroll oversight, and migration audit telemetry.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vite.dev/) (ES2023, modern React Compiler architecture)
- **Routing**: [TanStack Router](https://tanstack.com/router) (100% type-safe file-based routing with intent-based hover prefetching)
- **Server State**: [TanStack Query v5](https://tanstack.com/query) (Declarative data synchronization, automatic background refetching)
- **Client UI State**: [Redux Toolkit](https://redux-toolkit.js.org/) (Strictly scoped to global UI state: sidebar collapse, active modals, dark/light theme)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/vite`
- **UI & Iconography**: [Lucide React](https://lucide.dev/) + [Framer Motion](https://www.framer.com/motion/)
- **Validation**: [Zod](https://zod.dev/) (Runtime validation of administrative filters and form payloads)

---

## 📁 Architectural Highlights

The console follows the corporate **Feature-Based Modular Monolith** standard:

```text
admin/
├── public/                     # Static assets (favicons, brand assets)
├── src/
│   ├── app/                    # Root admin application shell
│   ├── components/             # Reusable UI primitives (Buttons, Inputs, Tables, Modals)
│   ├── features/               # Admin domain feature modules
│   │   ├── home/               # Executive dashboard summary & quick actions
│   │   └── dashboard/          # Detailed workforce analytics, role management & metrics
│   │       ├── api/            # Query keys, queryOptions(), admin network fetchers
│   │       ├── components/     # Admin-specific tables and metric cards
│   │       ├── hooks/          # Admin UI state logic (filters, pagination state)
│   │       ├── schemas/        # Zod validation schemas
│   │       ├── views/          # Composed administrative views
│   │       └── index.ts        # Public barrel export
│   ├── lib/                    # Technical infrastructure (queryClient singleton, utils)
│   ├── routes/                 # TanStack Router File-Based Route Tree (Thin Orchestrators)
│   │   ├── __root.tsx          # Root shell layout with persistent 240px sidebar
│   │   ├── index.tsx           # '/' route (renders HomeView)
│   │   └── dashboard.tsx       # '/dashboard' route (prefetches queries, renders DashboardView)
│   ├── routeTree.gen.ts        # Auto-generated type-safe route tree
│   └── store/                  # Redux Toolkit global client state
├── vercel.json                 # Vercel SPA rewrites (/(.*) -> /index.html) & security headers
├── vite.config.ts              # Vite & TanStack Router Vite plugin configuration
└── package.json
```

---

## ⚡ Getting Started

### 1. Environment Configuration
Ensure `.env` exists in `admin/`:
```bash
cp .env.example .env
```
Default value:
```ini
VITE_API_URL=http://localhost:3000/api/v1
```

### 2. Available Scripts
```bash
# Install dependencies
bun install

# Start Vite development server on dedicated Admin port 5174
bun run dev -- --port 5174

# Run TypeScript type check and bundle production build
bun run build

# Preview production build locally
bun run preview

# Run code linter
bun run lint
```

---

## 🔑 Default Administrator Accounts

When the database is seeded (`bun run db:seed`), use these accounts to sign into the Admin Console:
- **👑 Administrator (Full access)**: `admin@hrmanagement.com` / `Admin123!`
- **💼 HR Manager (Moderator access)**: `manager@hrmanagement.com` / `Manager123!`

---

## 🎨 Design System & UI Specifications

All administrative views adhere to the corporate design system:
- **Body Copy**: `14px` (`font-sm`) with `20px` line height.
- **Data Tables**: `44px` uppercase headers, `52px` min-height rows with hover states.
- **Spacing**: Strict 4px base unit grid.
- Full design token specifications: See [`docs/design.md`](../docs/design.md).

---

## 🚀 Vercel Production Deployment

The project is pre-configured for instant Vercel deployment:
- **Root Directory**: `admin`
- **Framework Preset**: `Vite`
- **Build Command**: `bun run build` (or `npm run build`)
- **Output Directory**: `dist`
- **SPA Rewrites**: Pre-configured in [`vercel.json`](./vercel.json) to prevent 404s on route refresh.
- Complete guide: See [`docs/deployment.md`](../docs/deployment.md).
