# Frontend Engineering Standard (React 19 & TanStack)

**Document ID:** VGC-ENG-FE-002  
**Status:** Approved  
**Related Policy:** VGC-ENG-002 (Corporate Engineering Standard)

---

## 1. Architectural Tenets (Modular Monolith)

At Veronque Group of Companies, frontend applications are treated with enterprise architectural rigor. This React template enforces a **feature-based modular monolith** designed for long-term scalability.

### 1.1 Strict Feature Isolation
- **Domain Boundaries:** Features reside in `src/features/[feature-name]`. Each feature represents an autonomous domain module containing its components, hooks, schemas, API queries, and views.
- **The Public API Contract:** Every feature must export a public interface via `src/features/[feature-name]/index.ts`. External consumers (routes, other modules) must only import from this barrel export.
- **No Cross-Feature Internal Imports:** Direct imports into the internal subfolders of another feature are forbidden. Shared utilities or cross-domain components must live in `src/lib/` or `src/components/`.

### 1.2 Separation of `api/` vs `hooks/` (Why We Do Not Put Queries in `hooks/`)
In enterprise applications, TanStack Query is **server-state synchronization**, not local UI state.
- **`src/features/[feature]/api/`**:
  - `[feature].keys.ts`: Query key factory defining typed array keys for granular cache invalidation.
  - `[feature].api.ts`: Pure async fetch functions with Zod runtime parsing.
  - `[feature].queries.ts`: Exposes `queryOptions()` and `use...Query()` hooks. Defining `queryOptions()` allows TanStack Router route loaders to prefetch data before rendering without needing React component hooks!
  - `[feature].mutations.ts`: Mutation hooks with optimistic updates and cache invalidation.
- **`src/features/[feature]/hooks/`**:
  - Reserved strictly for **React UI and composite state logic** (e.g., `useDashboardFilter.ts`, `useFormStateManager.ts`).

---

## 2. TanStack Router & File-Based Routing Standards

### 2.1 Route Files are Ultra-Thin Orchestrators
Route files in `src/routes/` must follow the Orchestrator Pattern:
1. Validate search parameters using Zod schemas (`validateSearch`).
2. Declare loader dependencies (`loaderDeps`).
3. Prefetch query data into `QueryClient` (`loader`).
4. Render the feature's View component.

```tsx
// Example: src/routes/dashboard.tsx
import { createFileRoute } from '@tanstack/react-router';
import {
  DashboardView,
  dashboardSearchSchema,
  dashboardMetricsQueryOptions,
} from '@/features/dashboard';

export const Route = createFileRoute('/dashboard')({
  validateSearch: (search) => dashboardSearchSchema.parse(search),
  loaderDeps: ({ search: { period } }) => ({ period }),
  loader: ({ context: { queryClient }, deps }) => {
    return queryClient.ensureQueryData(
      dashboardMetricsQueryOptions(deps.period)
    );
  },
  component: DashboardRouteComponent,
});

function DashboardRouteComponent() {
  const search = Route.useSearch();
  return <DashboardView initialPeriod={search.period} />;
}
```

### 2.2 Hover & Intent-Based Prefetching
The router is configured with `defaultPreload: 'intent'`. When a user hovers over a link, TanStack Router starts loading both the JavaScript chunk and prefetches the server state via the route loader. This achieves instantaneous route changes with zero visual latency.

---

## 3. State Management Governance

### 3.1 Server State vs Client State Matrix

| State Type | Solution | Examples |
| :--- | :--- | :--- |
| **Server State** | TanStack Query (`@tanstack/react-query`) | User profiles, analytics metrics, transactions, lists, cache invalidation |
| **Global Client UI State** | Redux Toolkit (`@reduxjs/toolkit`) | Sidebar expanded/collapsed, active theme, global notifications, modal wizard steps |
| **Local Component State** | `useState`, `useReducer` | Form field focus, dropdown open state, transient toggle |
| **URL State** | TanStack Router (`searchParams`) | Active filters, pagination (`?page=2`), sort order, selected tabs |

---

## 4. Large-Scale Folder Structure Example

As enterprise applications expand to hundreds of routes and dozens of domain modules, maintain this standardized layout:

```text
src/
├── app/
│   ├── App.tsx
│   └── main.tsx
├── components/
│   ├── ui/                   # Button, Card, Badge, Modal, Input, Spinner
│   ├── layout/               # Navbar, Footer, AppShell, Sidebar
│   └── providers/            # RootProvider, QueryProvider, ReduxProvider, ToastProvider
├── features/
│   ├── auth/                 # Domain: Authentication
│   │   ├── api/              # auth.keys.ts, auth.api.ts, auth.queries.ts
│   │   ├── components/       # LoginForm.tsx, SocialAuth.tsx
│   │   ├── hooks/            # useLoginForm.ts
│   │   ├── schemas/          # auth.schema.ts
│   │   ├── types/            # auth.types.ts
│   │   ├── views/            # LoginView.tsx, RegisterView.tsx
│   │   └── index.ts          # Public exports
│   ├── dashboard/            # Domain: Analytics & Metrics
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── schemas/
│   │   ├── types/
│   │   ├── views/
│   │   └── index.ts
│   └── billing/              # Domain: Invoicing & Payments
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── schemas/
│       ├── types/
│       ├── views/
│       └── index.ts
├── lib/
│   ├── query-client.ts       # QueryClient configuration
│   ├── api-client.ts         # Base HTTP client with interceptors
│   └── utils.ts              # cn, formatters
├── routes/                   # File-based route tree (thin wrappers)
│   ├── __root.tsx
│   ├── index.tsx
│   ├── login.tsx
│   └── dashboard.tsx
├── routeTree.gen.ts          # Auto-generated route tree
├── store/
│   ├── index.ts              # Redux store
│   ├── hooks.ts              # Typed hooks
│   └── slices/               # uiSlice.ts
└── types/                    # Ambient global definitions
```
