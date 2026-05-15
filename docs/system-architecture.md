# System Architecture

## Runtime Shape
SMIT OS is a single React/Vite app served behind an Express API. The client and API share a repository and TypeScript contracts.

## Provider Tree
`src/main.tsx` wraps the app in:
1. `ThemeProvider`
2. `DensityProvider`
3. `QueryClientProvider`
4. `BrowserRouter`
5. `App`

## Authentication Boundary
`AppContent` reads `useAuth()`.
- Loading: full-screen spinner.
- No user: `LoginPage`.
- Authenticated: `AppShell` with lazy route content.

## Routing
`src/App.tsx` owns route declarations. Route pages are lazy loaded from `src/pages/v5/`.
- `/dashboard` is the flagship Command Center.
- `/reports` is the Intelligence workspace.
- Old tracker slugs redirect to new canonical Growth routes.

## Layout
`AppShell` owns global app chrome:
- Sidebar navigation grouped by workspace.
- Header actions.
- Main content region.
- Logout callback from `AuthContext`.

## Design System
`src/index.css` defines CSS variables and Tailwind v4 theme tokens.
`src/design/v5/tokens.ts` stores storage keys and canonical v5 token references.
`src/components/ui/` provides component primitives.

## Workspaces
- Dashboard uses `useOverviewAll` and section wrappers under `src/components/workspace/dashboard/`.
- Growth uses real tracker hooks/pages for leads, ads, and media.
- Execution uses real OKR, Daily Sync, and Weekly Check-in pages through v5 namespace routes.
- Intelligence uses dashboard overview data plus v5 reports sections.
- Admin Settings wires appearance controls to theme/density contexts.

## Server/API
Express routes live under `server/routes/` and are mounted by `server.ts`.
Prisma models back the operational data. API key and JWT flows are both supported.

## Testing
The project uses Node's built-in test runner via `tsx --test`.
Test files must live under `src/`, `server/`, or `scripts/` to match package scripts.
