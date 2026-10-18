VERONQUE GROUP OF COMPANIES CORP.
Engineering & Technology Governance Standard (React SPA / Client Monolith)

Document ID: VGC-ENG-002
Document Type: Corporate Engineering Standard
Version: 1.0
Status: Approved
Owner: Engineering / Technology Organization
Applies To: All React 19 single-page applications, client dashboards, admin portals, and internal tools

---

1. Purpose

This document establishes the technical standards, architectural expectations, folder structures, and coding principles for React applications built within VERONQUE GROUP OF COMPANIES CORP.

The primary objective is to maintain enterprise-grade software that is:
- Maintainable
- Strongly Typed & Validated
- Performant & Free of Network Waterfalls
- Scalable across multi-developer teams
- Architecturally consistent with our Next.js and backend micro-monolith ecosystems

---

2. Engineering Philosophy

2.1 Modular Monolith (Feature-Based Isolation)
Code must be grouped by domain features (`src/features/[feature-name]`), not by technical file types alone. Features must act as self-contained units with strict encapsulation.

2.2 Explicit Separation of Server State vs Client UI State
- **Server State**: 100% owned by TanStack Query (`@tanstack/react-query`). Caching, invalidation, background refetching, and pagination must never be stored in Redux.
- **Client UI State**: Managed via Redux Toolkit (`@reduxjs/toolkit`). Reserved strictly for global UI concerns (sidebar state, active theme, global notification counters, multi-feature modal orchestration).

2.3 Zero-Waterfall Navigation
Routes must declare data requirements ahead of render. TanStack Router file-based routes use loader prefetching (`context.queryClient.ensureQueryData`) combined with hover prefetching (`defaultPreload: 'intent'`) to ensure that navigating to a route displays instantaneous data without intermediate loading flickers.

2.4 Runtime Boundary Validation (Zod)
TypeScript types exist only at compile-time. All data crossing boundaries (URL search params, remote API payloads, form submissions) must be validated at runtime using Zod.

---

3. Standard Technology Landscape

| Component | Standard Technology | Rationale |
| :--- | :--- | :--- |
| Core Framework | React 19 (Vite 8) | High-speed HMR, modern ES2023, React Compiler support |
| Routing | TanStack Router (`@tanstack/react-router`) | 100% type-safe file-based routing with loader prefetching |
| Server State | TanStack Query (`@tanstack/react-query`) | Declarative caching, deduplication, stale-while-revalidate |
| Client UI State | Redux Toolkit (`@reduxjs/toolkit`) | Predictable, serializable global UI state with typed hooks |
| Validation | Zod | Single source of truth for runtime validation and static types |
| Animation | Framer Motion (`framer-motion`) | Hardware-accelerated transitions and layout animations |
| Icons | Lucide React (`lucide-react`) | Consistent, accessible enterprise icon set |
| Notifications | Sonner / React Hot Toast | Stacked, non-blocking toast notifications |

---

4. Folder Structure & Architectural Anatomy

```text
src/
├── app/                        # Application bootstrap & top-level layout
│   ├── App.tsx                 # Router instance & RootProvider mounting
│   └── main.tsx                # Client DOM entry point
├── components/                 # Application-wide, business-agnostic UI primitives
│   ├── ui/                     # Pure UI components (Button, Card, Badge, Modal, Input)
│   ├── layout/                 # Layout structures (Navbar, Footer, AppShell)
│   └── providers/              # Context providers (QueryProvider, ReduxProvider, ToastProvider)
├── features/                   # Feature-based Modular Monolith (Domain logic)
│   └── [feature-name]/         # Self-contained domain module
│       ├── api/                # Query keys, API fetchers, queryOptions, use...Query hooks
│       ├── components/         # Feature-specific UI components
│       ├── hooks/              # Feature-specific UI logic & state hooks (NOT raw queries)
│       ├── schemas/            # Zod validation schemas
│       ├── types/              # Domain TypeScript types inferred from Zod
│       ├── views/              # Full-page feature views (imported by routes)
│       └── index.ts            # Strict public API barrel export
├── lib/                        # Core technical infrastructure
│   ├── query-client.ts         # TanStack QueryClient singleton with production defaults
│   └── utils.ts                # General utility functions (cn, formatCurrency)
├── routes/                     # TanStack Router File-Based Routing (Ultra-Thin Orchestrators)
│   ├── __root.tsx              # Root route shell with router context injection
│   ├── index.tsx               # Home route
│   └── [route-name].tsx        # Domain routes (validateSearch + loader prefetch + render feature view)
├── routeTree.gen.ts            # Auto-generated route tree (Do not edit directly)
└── store/                      # Redux Toolkit global client state
    ├── index.ts                # Store configuration
    ├── hooks.ts                # Typed useAppDispatch & useAppSelector
    └── slices/                 # UI slices (uiSlice)
```

---

5. Strict Feature Rules

1. **Thin Routes**: Route files in `src/routes/` must contain no inline forms, complex JSX, or business calculations. They must only define `validateSearch`, `loader`, and render the imported Feature View.
2. **Encapsulation via Index**: Other features and routes may only import from a feature's root `index.ts`. Direct deep imports into another feature's internal directories (e.g. `import { x } from '@/features/auth/api/internals'`) are prohibited.
3. **No Cross-Feature Direct Mutation**: If feature A needs to trigger state in feature B, it must do so via global Redux actions, shared Query invalidation, or shared URL parameters.
4. **Query Hook Placement**:
   - TanStack Query hooks, `queryOptions()`, query key factories, and API calls belong in `src/features/[feature]/api/`.
   - React UI state and lifecycle hooks belong in `src/features/[feature]/hooks/`.
