# Phase 1 — URL rename `/ads-overview` → `/dashboard`

## Context Links

- Plan overview: `./plan.md`
- Brainstorm: `../reports/brainstorm-260510-0125-dashboard-route-noti-topbar.md`
- Architecture: `docs/system-architecture.md`

## Overview

- **Date:** 2026-05-10
- **Priority:** P2
- **Status:** complete
- **Review status:** complete
- **Effort:** 10 min
- **Description:** Hard rename route `/ads-overview` → `/dashboard`. No legacy redirect. Wildcard handles stale bookmarks.

## Key Insights

- Dashboard tabs (Overview/Sale/Marketing/Operation) đã work qua `useSearchParams`. Không cần thay đổi page logic.
- Sidebar + AppLayout hard-code path string → grep và replace.
- Wildcard catch-all `*` đã exist (redirect to `/`); đổi target sang `/dashboard`.

## Requirements

### Functional

- Visit `/dashboard` → render `DashboardOverview` page (Overview tab default).
- Visit `/dashboard?tab=sale` → render Sale tab.
- Visit `/` → redirect to `/dashboard`.
- Visit any unknown path → redirect to `/dashboard`.
- Sidebar nav item "Dashboard" highlighted khi `pathname === '/dashboard'`.
- AppLayout scrollable behavior preserved cho `/dashboard`.

### Non-functional

- `npm run typecheck` clean.
- `npm run build` clean.
- No console error trên dev mode.

## Architecture

```
App.tsx
  └─ Routes
      ├─ "/" → Navigate("/dashboard")
      ├─ "/dashboard" → DashboardOverview
      ├─ ... other routes
      └─ "*" → Navigate("/dashboard")

Sidebar.tsx
  └─ NavItem to="/dashboard" label="Dashboard"

AppLayout.tsx
  └─ SCROLLABLE_PATHS = ['/dashboard', ...]
```

## Related Code Files

### Modify

- `src/App.tsx` — route element + redirect target.
- `src/components/layout/Sidebar.tsx` — NavItem `to`.
- `src/components/layout/AppLayout.tsx` — SCROLLABLE_PATHS.

### Create

- None.

### Delete

- None.

## Implementation Steps

1. Open `src/App.tsx`. Find route `<Route path="/ads-overview" element={<DashboardOverview />} />`. Change path to `/dashboard`.
2. Find redirect `<Route path="/" element={<Navigate to="/ads-overview" replace />} />`. Change `to="/dashboard"`.
3. Find wildcard `<Route path="*" element={<Navigate to="/ads-overview" replace />} />` (or `to="/"`). Change `to="/dashboard"`.
4. Open `src/components/layout/Sidebar.tsx`. Find NavItem with `to="/ads-overview"`. Change to `to="/dashboard"`.
5. Open `src/components/layout/AppLayout.tsx`. Find `SCROLLABLE_PATHS` const. Replace `'/ads-overview'` → `'/dashboard'`.
6. Run `npm run typecheck`. Fix any path string references in tests/mocks if found (grep `/ads-overview` to confirm zero remaining hits).
7. Manual smoke: open `/`, expect redirect → `/dashboard`. Click sidebar Dashboard, URL stays `/dashboard`. Visit `/dashboard?tab=sale`, expect Sale tab active.

## Todo Checklist

- [x] App.tsx: route path `/ads-overview` → `/dashboard`
- [x] App.tsx: `/` redirect target → `/dashboard`
- [x] App.tsx: wildcard `*` redirect → `/dashboard`
- [x] Sidebar.tsx: NavItem `to` → `/dashboard`
- [x] AppLayout.tsx: SCROLLABLE_PATHS replace
- [x] `grep -r "/ads-overview" src/` returns 0 hits
- [x] `npm run typecheck` clean
- [x] Manual: `/` redirects, `/dashboard` works, `?tab=sale` works

## Success Criteria

- Zero `/ads-overview` string trong `src/`.
- `/dashboard` renders DashboardOverview component.
- All 4 tab params (overview/sale/marketing/operation) render correct tab.
- Sidebar highlights Dashboard item khi active.
- Build + typecheck clean.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Hard-coded `/ads-overview` trong test files | Low | Low | grep before commit; update along |
| Stale bookmark từ user → 404 | Med | Low | Wildcard `*` redirect handles |
| Sidebar active state broken khi compare path | Low | Med | NavItem already uses startsWith/exact match; verify post-change |

## Security Considerations

- None. Pure routing string change.

## Next Steps

- Independent of Phase 2 + 3.
- After complete: notify QA (or manual smoke) before merging.
