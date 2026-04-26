# Phase 02: Refactor Analytics Dashboard Tabs

## Context Links
- Overview plan: [plan.md](plan.md)
- UI primitives: [phase-01-dashboard-ui-primitives.md](phase-01-dashboard-ui-primitives.md)
- Target page: `src/pages/DashboardOverview.tsx`
- Current components:
  - `src/components/dashboard/overview/SummaryCards.tsx`
  - `src/components/dashboard/overview/KpiTable.tsx`
  - `src/components/dashboard/call-performance/call-performance-section.tsx`
  - `src/components/lead-tracker/dashboard-tab`

## Overview
Priority: P1  
Status: pending  
Add domain tabs to `/ads-overview` and move existing content into correct tabs without changing data contracts.

## Requirements
- Tabs: `Overview`, `Sale`, `Product`, `Marketing`, `Media`.
- Default selected tab: `Overview`.
- Persist tab via URL query `?tab=`.
- Place `SegmentedTabs` beside `DateRangePicker` in the header controls area.
- Overview tab includes only:
  - `SummaryCards`
  - `KpiTable`
- Sale tab includes:
  - `CallPerformanceSection`
  - Lead Flow & Clearance section wrapping `DashboardTab`
- Product/Marketing/Media tabs show `DashboardEmptyState` with Coming soon copy.

## Architecture
Add local tab value type in `DashboardOverview.tsx`:

```ts
type DashboardDomainTab = 'overview' | 'sale' | 'product' | 'marketing' | 'media';
```

Use React Router search params if available in project; otherwise use `window.history` carefully. Prefer existing project routing conventions after checking `App.tsx`.

## Implementation Steps
1. Read current router setup to confirm `useSearchParams` availability.
2. Add tab options with labels matching UI: Overview/Sale/Product/Marketing/Media.
3. Derive selected tab from URL query.
4. Fallback invalid query to `overview`.
5. On tab click, update `?tab=` without losing existing query params.
6. Replace inline header with `DashboardPageHeader`.
7. Render tabs + `DateRangePicker` as right controls.
8. Split scroll content into conditional tab panels.
9. Keep `useOverviewAll` data fetch active for the page unless performance becomes an issue. Do not prematurely split data fetching per tab in this phase.
10. Ensure KPI view mode toggles still work inside Overview.

## Success Criteria
- `/ads-overview` shows Overview tab by default.
- `/ads-overview?tab=sale` opens Sale directly.
- Summary cards/KPI table do not appear in Sale.
- Call Performance/Lead Flow do not appear in Overview.
- Date picker works on Overview and Sale.
- Coming soon tabs render consistent empty state.

## Risk Assessment
- Risk: header overflow due to five tabs + date picker. Mitigation: controls wrap with `flex-wrap`, tabs scroll horizontally on narrow screens if needed.
- Risk: unnecessary data fetches on Coming soon tabs. Acceptable initially for KISS; optimize later only if measured.
- Risk: invalid query causing blank page. Mitigation: strict fallback.

## Security Considerations
URL query is untrusted input; validate against allowed tab values only.

## Todo List
- [ ] Add tab query parsing and update handler.
- [ ] Add segmented tabs beside Date Picker.
- [ ] Move sections into tab panels.
- [ ] Add Coming soon panels.
- [ ] Verify responsive header behavior.
