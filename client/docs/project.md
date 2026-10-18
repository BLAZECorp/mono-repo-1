# React 19 Enterprise Template

**Version:** 1.0.0  
**Stack:** React 19, Vite 8, TanStack Router, TanStack Query, Redux Toolkit, Zod, Framer Motion, Lucide React, Sonner / React Hot Toast.

## Available Scripts

```bash
# Start development server with HMR and route auto-generation
bun run dev

# Run type check and production bundle build
bun run build

# Preview production build locally
bun run preview

# Run linting
bun run lint
```

## Architectural Highlights
- **File-Based Routing**: Defined in `src/routes/` with automatic generation of `src/routeTree.gen.ts`.
- **Loader Prefetching**: Data queries preloaded before route navigation on link hover.
- **Feature Modular Monolith**: Clear separation of `api/` (queries/fetchers) and `hooks/` (UI logic).
- **Zod Validation**: Runtime boundary enforcement on URL search params and API contracts.
