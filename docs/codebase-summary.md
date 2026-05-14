# Codebase Summary

## Stack
- React 19 + TypeScript + Vite frontend.
- Express 5 API server with Prisma ORM.
- PostgreSQL 15 via local Docker container.
- TanStack Query for client data fetching.
- TailwindCSS v4 tokens from `src/index.css` and v5 token constants.

## Frontend Entry
- `src/main.tsx` mounts providers: `ThemeProvider`, `DensityProvider`, `QueryClientProvider`, `BrowserRouter`.
- `src/App.tsx` gates routes behind `AuthProvider` and authenticated `V5Shell`.
- Root `/` redirects to `/dashboard`.

## V5 Workspace Routes
- Command Center: `/dashboard`.
- Growth: `/leads`, `/ads`, `/media`.
- Execution: `/okrs`, `/daily-sync`, `/checkin`.
- Intelligence: `/reports`.
- Admin: `/settings`, `/profile`, `/integrations` (SocialChannel CRUD, admin-only).
- Legacy slugs redirect: `/lead-tracker`, `/ads-tracker`, `/media-tracker`.

## Key Directories
- `src/components/v5/layout/` — command-center shell, sidebar, header, navigation.
- `src/components/v5/ui/` — reusable design primitives (inputs, buttons, cards, tables, modals).
- `src/components/v5/ui/charts/` — chart wrappers (line, bar, area, donut, pie, funnel, heatmap, sparkline).
- `src/components/v5/dashboard/` — dashboard section wrappers and KPI blocks.
- `src/components/v5/growth/` — Growth workspace support components.
- `src/components/v5/intelligence/` — Reports sections.
- `src/components/v5/admin/` — Settings appearance/security controls.
- `src/pages/v5/` — v5 route namespace (includes `/playground` for component showcase).
- `src/hooks/` — TanStack Query hooks for dashboard, trackers, and workspace data.
- `server/routes/` — Express API routes.
- `server/services/media-sync.service.ts` — FB Graph post-sync orchestrator (upserts MediaPost + MediaSyncRun).
- `server/services/social-channel.service.ts` — SocialChannel CRUD with encrypted token storage.
- `server/lib/fb-graph-client.ts` — FB Graph API client (page posts + post insights).
- `server/cron/media-sync.cron.ts` — Cron job (every 6h at minute 17) calling syncAllActive().

## Data Flow
1. UI route loads page from `src/pages/v5/`.
2. Page calls hooks or fetch functions.
3. Hooks call `/api/*` endpoints with real DB-backed data.
4. Server routes use Prisma and auth middleware.
5. UI renders via v5 primitives and tokens.

## Media Data Flow
- Media posts auto-pull from FB Graph API (no manual entry).
- Cron fires every 6h; admin can also trigger sync via Refresh button on `/media`.
- `SocialChannel` stores encrypted page tokens; `MediaPost` stores canonical metrics + `metricsExtra` JSON.
- `MediaSyncRun` provides audit trail per sync run.

## Auth
- `AuthProvider` checks `/api/auth/me` and stores `currentUser`.
- Authenticated app renders `V5Shell`; unauthenticated users see `LoginPage`.
- Admin-only UI is guarded with `isAdmin` and backend RBAC remains authoritative.

## Validation Commands
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
