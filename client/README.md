# HR Management - Employee Self-Service Web Portal (`client`)

The **Employee Self-Service Web Portal** enables organization employees to manage personal profiles, view company directories, submit time-off/leave requests, and access organization announcements.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vite.dev/) (ES2023, modern React Compiler architecture)
- **Routing**: [TanStack Router](https://tanstack.com/router) (100% type-safe file-based routing with intent-based hover prefetching)
- **Server State**: [TanStack Query v5](https://tanstack.com/query) (Declarative data synchronization, automatic background refetching)
- **Client UI State**: [Redux Toolkit](https://redux-toolkit.js.org/) (Strictly scoped to global client UI state, e.g. dark/light theme, sidebar toggling, modal manager)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/vite`
- **UI & Iconography**: [Lucide React](https://lucide.dev/) + [Framer Motion](https://www.framer.com/motion/)
- **Validation**: [Zod](https://zod.dev/) (Runtime validation of URL search parameters and API payloads)

---

## 📁 Architectural Highlights

The portal follows the corporate **Feature-Based Modular Monolith** standard:

```text
client/
├── public/                     # Static assets (favicons, public images)
├── src/
│   ├── app/                    # Root application entry shell
│   ├── components/             # Reusable UI primitives (Buttons, Inputs, Cards, Layout)
│   ├── features/               # Domain feature modules (Self-contained)
│   │   ├── home/               # Portal dashboard & activity feed
│   │   └── dashboard/          # Metrics, employee analytics & shortcuts
│   │       ├── api/            # Query keys, queryOptions(), network fetchers
│   │       ├── components/     # Feature-specific widgets
│   │       ├── hooks/          # Component UI state logic (NOT network calls)
│   │       ├── schemas/        # Zod validation schemas
│   │       ├── views/          # Composed page views
│   │       └── index.ts        # Public barrel export
│   ├── lib/                    # Technical infrastructure (queryClient singleton, utils)
│   ├── routes/                 # TanStack Router File-Based Route Tree (Thin Orchestrators)
│   │   ├── __root.tsx          # Root shell layout with header, navigation, and router outlet
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
Ensure `.env` exists in `client/`:
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

# Start Vite development server (Port 5173)
bun run dev

# Run TypeScript type check and bundle production build
bun run build

# Preview production build locally
bun run preview

# Run code linter
bun run lint
```

---

## 🎨 Design System & UI Specifications

All components adhere to the corporate design system:
- **Default Body Typography**: `14px` (`font-sm`) with `20px` line height.
- **Grid & Spacing**: Strict 4px base unit grid.
- **Animations**: Framer Motion micro-interactions (150ms–250ms).
- Full design token specifications: See [`docs/design.md`](../docs/design.md).

---

## 🚀 Vercel Production Deployment

The project is pre-configured for instant Vercel deployment:
- **Root Directory**: `client`
- **Framework Preset**: `Vite`
- **Build Command**: `bun run build` (or `npm run build`)
- **Output Directory**: `dist`
- **SPA Rewrites**: Pre-configured in [`vercel.json`](./vercel.json) to prevent 404s on route refresh.
- Complete guide: See [`docs/deployment.md`](../docs/deployment.md).
