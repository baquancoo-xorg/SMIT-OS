# Phase 04 — Dashboard Rebuild + Feature Flag Infra

## Context Links

- Plan overview: [plan.md](./plan.md)
- Brainstorm: `/Users/dominium/Documents/Project/SMIT-OS/plans/reports/brainstorm-260512-0145-ui-rebuild-v4-foundation-first.md` §4.2, §4.3 row 4, §5
- v3 dashboard: `/Users/dominium/Documents/Project/SMIT-OS/src/pages/DashboardOverview.tsx` (note: actual dashboard page name may be `DashboardOverview.tsx`; verify before split — this phase rebuilds the primary post-login dashboard)
- Prisma schema: `/Users/dominium/Documents/Project/SMIT-OS/prisma/schema.prisma`
- Router: search `src/App.tsx` or `src/main.tsx` for `createBrowserRouter`
- Settings page: `/Users/dominium/Documents/Project/SMIT-OS/src/pages/Settings.tsx`
- PostHog monitor: `/Users/dominium/Documents/Project/SMIT-OS/scripts/posthog-ui-regression-monitor.ts`

## Overview

- Date: week 4
- Priority: P1
- Status: pending
- Goal: prove the foundation by rebuilding the most complex page (Dashboard) on v4 behind a per-user feature flag. This is the longest phase because it sets up flag infra used by all subsequent pages.

## Key Insights

- Dashboard chosen first because it stresses every component family (KPI cards, data tables, charts via slots, page header, sidebar). If foundation can ship Dashboard, batch 5-8 are mechanical.
- Feature flag = `User.uiVersion` column (DB) per brainstorm §4.3 row 4. Avoids PostHog feature flag service to keep deps minimal.
- Parallel route `/v4/*` (not subdomain, not branch). React-router v7 supports nested routes natively.
- Admin toggle inside Settings — user controls own flag; admin can set for others.
- 1-2 internal tester gate before Phase 05 (per brainstorm §5 step 1).

## Requirements

**Functional:**
- Prisma `User.uiVersion String @default("v3")` column added via `prisma db push`
- Express middleware reads JWT session, injects `uiVersion` into request context + into HTML meta for client
- React context `UIVersionContext` exposes `useUIVersion()` hook
- Route gate: `/dashboard` resolves to v3; `/v4/dashboard` resolves to v4. Sidebar nav adapts based on flag.
- Settings page adds "UI Version" radio (v3 / v4 Beta), persists via PATCH /api/users/me
- `src/pages-v4/dashboard.tsx` matches v3 functionality: KPIs, recent activity, navigation
- Git tag `ui-v4-page-dashboard` at completion

**Non-functional:**
- Zero downtime: v3 default, v4 opt-in
- Hot-reload still works
- a11y: matches batch 1+2 standards
- File size: dashboard split into sub-files if > 200 lines (e.g. `dashboard-kpis.tsx`, `dashboard-recent.tsx`)

## Architecture

```
[User] ─► JWT ─► Express auth middleware
                       │
                       ▼
                   readUser.uiVersion
                       │
        ┌──────────────┴──────────────┐
        ▼                              ▼
  inject into req.context        inject into <meta name="ui-version">
                                       │
                                       ▼
                                main.tsx reads meta
                                       │
                                       ▼
                              <UIVersionProvider>
                                       │
                                       ▼
                              Router conditional:
                                /v4/dashboard ─► pages-v4/dashboard.tsx
                                /dashboard     ─► pages/DashboardOverview.tsx
```

Both routes always mounted. Flag controls default redirect:
- `uiVersion = "v3"` → `/` redirects to `/dashboard`
- `uiVersion = "v4"` → `/` redirects to `/v4/dashboard`

## Related Code Files

**Modify:**
- `/Users/dominium/Documents/Project/SMIT-OS/prisma/schema.prisma` — add `uiVersion String @default("v3")` to `User` model
- `/Users/dominium/Documents/Project/SMIT-OS/src/server/middleware/*` (auth middleware path — verify) — read uiVersion from user record into req context
- `/Users/dominium/Documents/Project/SMIT-OS/src/server/routes/users.ts` (or equivalent) — add PATCH /api/users/me handler for `uiVersion` field
- `/Users/dominium/Documents/Project/SMIT-OS/src/main.tsx` — read meta tag, wrap app in `<UIVersionProvider>`
- `/Users/dominium/Documents/Project/SMIT-OS/src/App.tsx` (or router file) — add `/v4/*` nested routes
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/Settings.tsx` — add UI Version section (allowed v3 edit because it's the toggle host)
- `/Users/dominium/Documents/Project/SMIT-OS/index.html` — placeholder meta tag for server injection (or via SSR template)

**Create:**
- `/Users/dominium/Documents/Project/SMIT-OS/src/contexts/ui-version-context.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/dashboard.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/dashboard/dashboard-kpis.tsx` (if split)
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/dashboard/dashboard-recent.tsx` (if split)
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/layouts/app-shell.tsx` (wires v4 app-shell + sidebar + header)
- `/Users/dominium/Documents/Project/SMIT-OS/src/server/lib/inject-ui-version.ts` (HTML template injector)

**Delete:** none

## Implementation Steps

1. Add `uiVersion` to Prisma schema. Run `npm run db:push`. Verify column with `psql`.
2. Backfill: all existing users get `uiVersion = 'v3'` by default (column default handles new rows).
3. Update auth middleware to attach `uiVersion` to `req.user.uiVersion`.
4. Add PATCH `/api/users/me` endpoint accepting `{ uiVersion: 'v3' | 'v4' }`.
5. Add HTML template injection: server replaces `<meta name="ui-version" content="__INJECT__">` with user value at response time. If template approach impractical, expose via `/api/users/me` fetch on app boot.
6. Build `UIVersionContext` + `useUIVersion()` hook.
7. Wrap `<App />` in `<UIVersionProvider initialVersion={fromMeta}>`.
8. Edit router: add `/v4/dashboard` route mounting `pages-v4/dashboard.tsx` under `pages-v4/layouts/app-shell.tsx`.
9. Root redirect: `/` checks context, redirects to `/v4/dashboard` or `/dashboard`.
10. Build `pages-v4/dashboard.tsx` using v4 components only. Match v3 functionality (same data queries). Split if > 200 lines.
11. Edit Settings page: add "UI Version" radio group. PATCH on change. Show toast "Reload to apply".
12. Smoke checklist (manual): login as `dominium` → toggle v4 → reload → land on `/v4/dashboard` → verify render → click nav → all v4 routes resolve (others 404 OK since not built yet) → toggle back to v3 → reload → land on `/dashboard`.
13. Smoke: data load, navigation, error state (kill DB briefly), empty state.
14. Internal tester gate: invite 1-2 teammates to test on their account. Collect feedback. Iterate.
15. Git tag `ui-v4-page-dashboard`.
16. Append entry to `docs/project-changelog.md`.

## Todo List

- [ ] Prisma `User.uiVersion` column + db push
- [ ] Auth middleware reads uiVersion
- [ ] PATCH `/api/users/me` endpoint
- [ ] HTML meta injection or boot fetch
- [ ] `UIVersionContext` + hook
- [ ] Router `/v4/*` mount
- [ ] Root redirect respects flag
- [ ] `pages-v4/dashboard.tsx` built (+ split files if needed)
- [ ] Settings UI Version toggle
- [ ] Smoke checklist passed
- [ ] 1-2 internal testers tried
- [ ] Git tag `ui-v4-page-dashboard`
- [ ] Append changelog entry

## Success Criteria

- Toggle in Settings persists to DB, survives reload
- `/v4/dashboard` renders fully on v4 components; `/dashboard` still renders v3 untouched
- Lint green on `src/pages-v4/**`
- Both v3 + v4 dashboards load same data correctly
- Internal testers report no blockers
- Tag pushed

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Prisma migration breaks dev DB | Low | High | Use `db push` not migration; snapshot DB before; rollback = drop column |
| Meta injection requires SSR rewrite | Medium | Medium | Fallback: boot-time `/api/users/me` fetch sets context before route resolution (small flash acceptable) |
| Router refactor leaks v4 routes to v3 users | Low | High | Keep both route trees mounted; flag only affects redirect, not access |
| Dashboard data shape mismatch v3 ↔ v4 | Low | Medium | Reuse v3 query hooks unchanged; only UI rebuilt |
| Sidebar nav diverges between v3 + v4 | Medium | Medium | Single source of truth: `src/pages-v4/layouts/nav-items.ts` for v4; v3 untouched |
| Tester reports "back to v3" missing | High | Low | Sidebar v4 includes "Back to v3" link from day 1 (planned for Phase 09 but useful sooner) |
| File size > 200 lines | High | Low | Split dashboard sections into `dashboard/` subdir |

## Security Considerations

- PATCH `/api/users/me` MUST validate user owns the record (JWT user.id === param). Reject otherwise.
- `uiVersion` field validated as enum `v3 | v4` server-side. Reject anything else with 400.
- No secrets in meta tag; only the string `v3` or `v4`.
- Admin override: defer to Phase 09 if needed; per brainstorm, self-toggle is enough.

## Next Steps

- Unlocks Phases 05, 06, 07, 08 (page rebuilds, can run in parallel by different sessions if file ownership distinct).
- Handoff: tag + tester feedback summary committed.
- Inform user that subsequent page rebuilds follow this same pattern with less infra cost.
