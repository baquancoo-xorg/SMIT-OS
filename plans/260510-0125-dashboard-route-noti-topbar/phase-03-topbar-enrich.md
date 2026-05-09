# Phase 3 — Topbar enrich

## Context Links

- Plan overview: `./plan.md`
- Brainstorm: `../reports/brainstorm-260510-0125-dashboard-route-noti-topbar.md`
- Architecture: `docs/system-architecture.md`

## Overview

- **Date:** 2026-05-10
- **Priority:** P2
- **Status:** complete
- **Review status:** complete
- **Effort:** 45 min
- **Description:** Add 2 elements to topbar Header.tsx: (1) breadcrumb route hint, (2) OKR cycle countdown pill. Page H1 unchanged — different role from breadcrumb.

## Key Insights

- Static breadcrumb map = KISS; dynamic generation overkill cho 7 routes.
- OKR cycle pill graceful fail (return null) if no active cycle / loading / error → never breaks topbar.
- `useQuery` (react-query đã trong deps) cho cache + revalidate. staleTime 1h vì cycle.endDate đổi rare.
- Color thresholds: `>30d green, 7-30d amber, <7d red`. Visual urgency cue.
- Click pill → `/okrs`. Single-purpose.

## Requirements

### Functional

- Topbar renders breadcrumb text "Section › Page" cho 7 known routes.
- Unknown routes → fallback breadcrumb "Workspace › {Capitalize(pathname)}".
- Topbar renders OKR cycle pill when active cycle exists: "{cycleName} · {daysLeft}d left".
- Pill color-coded by daysLeft: green/amber/red.
- Click pill → navigate to `/okrs`.
- Pill hidden if no active cycle, loading, or error.
- Page H1 (e.g., "Overview Dashboard") trên page-level header unchanged.

### Non-functional

- React-query cache: staleTime 1h, refetchOnWindowFocus false.
- Pill component < 60 LOC. Hook < 30 LOC. (File size rule.)
- TailwindCSS classes only; no new global CSS.
- `npm run typecheck` clean.

## Architecture

```
src/hooks/use-active-okr-cycle.ts (NEW, ~20 LOC)
  └─ useQuery → GET /api/okr-cycles → filter isActive=true → first()
     Returns: { cycle, daysLeft, color, isLoading, isError }

src/components/layout/OkrCycleCountdown.tsx (NEW, ~50 LOC)
  └─ Uses use-active-okr-cycle hook
     If !cycle || isLoading || isError → null
     Renders pill: text + color class + onClick navigate('/okrs')

src/components/layout/Header.tsx (MODIFY)
  ├─ ROUTE_BREADCRUMBS const (module scope)
  ├─ resolveBreadcrumb(pathname) helper
  ├─ Layout: [MenuBtn] [Breadcrumb] ........ [OkrCycleCountdown] [NotificationCenter] [UserMenu]
```

### ROUTE_BREADCRUMBS Map

```ts
const ROUTE_BREADCRUMBS: Record<string, [string, string]> = {
  '/dashboard':    ['Analytics', 'Dashboard'],
  '/okrs':         ['Planning',  'OKRs'],
  '/daily-sync':   ['Rituals',   'Daily Sync'],
  '/checkin':      ['Rituals',   'Weekly Check-in'],
  '/lead-tracker': ['CRM',       'Lead Tracker'],
  '/settings':     ['System',    'Settings'],
  '/profile':      ['User',      'Profile'],
};

function resolveBreadcrumb(pathname: string): [string, string] {
  return ROUTE_BREADCRUMBS[pathname] ?? [
    'Workspace',
    pathname.replace('/', '').replace(/-/g, ' ').replace(/^./, c => c.toUpperCase()) || 'Home',
  ];
}
```

### Color Mapping

```ts
function getColorClasses(daysLeft: number): string {
  if (daysLeft > 30) return 'text-emerald-600 bg-emerald-50';
  if (daysLeft >= 7) return 'text-amber-600 bg-amber-50';
  return 'text-rose-600 bg-rose-50';
}
```

## Related Code Files

### Modify

- `src/components/layout/Header.tsx` — add breadcrumb + mount OkrCycleCountdown.

### Create

- `src/hooks/use-active-okr-cycle.ts` — react-query hook for active cycle + daysLeft compute.
- `src/components/layout/OkrCycleCountdown.tsx` — pill component.

### Delete

- None.

## Implementation Steps

### 3.1 Hook

1. Create `src/hooks/use-active-okr-cycle.ts`:

```ts
import { useQuery } from '@tanstack/react-query';
import { differenceInDays } from 'date-fns';

type OkrCycle = { id: string; name: string; startDate: string; endDate: string; isActive: boolean };

export function useActiveOkrCycle() {
  const query = useQuery({
    queryKey: ['active-okr-cycle'],
    queryFn: async () => {
      const res = await fetch('/api/okr-cycles');
      if (!res.ok) throw new Error('failed');
      const cycles: OkrCycle[] = await res.json();
      return cycles.find(c => c.isActive) ?? null;
    },
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const cycle = query.data;
  const daysLeft = cycle ? differenceInDays(new Date(cycle.endDate), new Date()) : null;
  const color = daysLeft == null ? null : daysLeft > 30 ? 'green' : daysLeft >= 7 ? 'amber' : 'red';

  return { cycle, daysLeft, color, isLoading: query.isLoading, isError: query.isError };
}
```

### 3.2 Component

2. Create `src/components/layout/OkrCycleCountdown.tsx`:

```tsx
import { useNavigate } from 'react-router-dom';
import { useActiveOkrCycle } from '@/hooks/use-active-okr-cycle';

const COLOR_MAP: Record<string, string> = {
  green: 'text-emerald-600 bg-emerald-50',
  amber: 'text-amber-600 bg-amber-50',
  red:   'text-rose-600 bg-rose-50',
};

export function OkrCycleCountdown() {
  const { cycle, daysLeft, color, isLoading, isError } = useActiveOkrCycle();
  const navigate = useNavigate();

  if (isLoading || isError || !cycle || daysLeft == null || !color) return null;

  return (
    <button
      onClick={() => navigate('/okrs')}
      className={`rounded-full px-3 py-1 text-xs font-bold cursor-pointer hover:opacity-90 transition ${COLOR_MAP[color]}`}
      title={`${cycle.name} ends ${cycle.endDate}`}
    >
      {cycle.name} · {daysLeft}d left
    </button>
  );
}
```

### 3.3 Header integration

3. Open `src/components/layout/Header.tsx`. Add imports:

```tsx
import { useLocation } from 'react-router-dom';
import { OkrCycleCountdown } from './OkrCycleCountdown';
```

4. Add `ROUTE_BREADCRUMBS` const + `resolveBreadcrumb` helper at module scope (above Header function).

5. Inside Header function:

```tsx
const location = useLocation();
const [section, page] = resolveBreadcrumb(location.pathname);
```

6. Render breadcrumb between menu button and right-side widgets:

```tsx
<div className="flex items-center gap-1.5 text-xs text-slate-500">
  <span>{section}</span>
  <span className="text-slate-300">›</span>
  <span className="font-medium text-slate-700">{page}</span>
</div>
```

7. Mount `<OkrCycleCountdown />` between breadcrumb and `<NotificationCenter />`.

### 3.4 Validation

8. Run `npm run typecheck`.
9. Manual smoke:
   - Visit each of 7 routes; topbar shows correct breadcrumb pair.
   - Visit unknown route (e.g., `/foo`) → fallback "Workspace › Foo".
   - With active cycle exists in DB → pill renders. Hover shows tooltip date.
   - Click pill → navigate `/okrs`.
   - Set cycle.isActive=false in DB → pill hides.
   - daysLeft 35 → green. 15 → amber. 3 → red. (Manually shift endDate trong DB).

## Todo Checklist

- [x] Create `src/hooks/use-active-okr-cycle.ts`
- [x] Create `src/components/layout/OkrCycleCountdown.tsx`
- [x] Add `ROUTE_BREADCRUMBS` map in Header.tsx
- [x] Add `resolveBreadcrumb` helper
- [x] Use `useLocation` + render breadcrumb in Header.tsx
- [x] Mount `<OkrCycleCountdown />` in Header.tsx
- [x] `npm run typecheck` clean
- [x] Smoke: all 7 routes show correct breadcrumb
- [x] Smoke: unknown route fallback works
- [x] Smoke: pill renders with active cycle
- [x] Smoke: pill click → /okrs
- [x] Smoke: pill hides when no active cycle
- [x] Smoke: color thresholds (green/amber/red) verified

## Success Criteria

- Topbar shows breadcrumb text "Section › Page" cho 7 routes.
- OKR pill renders only when active cycle exists; hidden gracefully otherwise.
- Pill text format: `{cycleName} · {N}d left`.
- Click pill → URL = `/okrs`.
- Color matches threshold: green (>30), amber (7-30), red (<7).
- Page H1 unchanged trên content area.
- Header.tsx still under 200 LOC after edits.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| API endpoint `/api/okr-cycles` returns different shape | Med | Med | Confirm response shape via grep server route before write hook |
| Breadcrumb fallback ugly cho route có `/segment/:id` | Low | Low | Phase 3 only handles top-level routes; nested routes use static map (defer) |
| Active cycle date string format mismatch (UTC vs local) | Med | Low | `new Date(cycle.endDate)` parses ISO; differenceInDays floors; off-by-1 acceptable |
| Pill click trong middle of long header overflows on mobile | Low | Med | Test viewport <768px; if overflow, hide pill on mobile via `hidden md:inline-flex` |
| react-query devtools log noise | Low | Low | staleTime 1h limits refetch; ignore |

## Security Considerations

- `/api/okr-cycles` must be auth-gated (assume already via existing middleware).
- No PII in pill display; just cycle name + days.

## Next Steps

- Independent of Phase 1 + 2.
- Future: per-page page-title-aware H1 sync (out of scope; brainstorm raised page H1 unchanged decision).
- Future: breadcrumb supports nested routes (e.g., `/okrs/:id`) — defer until needed.
