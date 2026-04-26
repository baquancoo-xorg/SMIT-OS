# Phase 04: Apply Dashboard Primitives to PMDashboard

## Context Links
- Overview plan: [plan.md](plan.md)
- Current PM dashboard page: `src/pages/PMDashboard.tsx`
- UI primitives: [phase-01-dashboard-ui-primitives.md](phase-01-dashboard-ui-primitives.md)

## Overview
Priority: P2  
Status: pending  
Align `PMDashboard.tsx` with the same dashboard primitives and card styling, without changing its data loading or project-management metrics.

## Requirements
- Replace inline page header with `DashboardPageHeader`.
- Replace local repeated card class strings with `DashboardPanel` or a small local `MetricCard` if cleaner.
- Align chart cards with the same panel style as Analytics Dashboard.
- Preserve current PM dashboard content and layout:
  - 6 summary cards
  - Department Progress
  - Weekly Velocity
  - Status Breakdown
  - Upcoming Deadlines
- Do not add domain tabs to PMDashboard in this plan unless the implementation naturally needs it. The domain tabs are specifically for `/ads-overview`.

## Related Code Files
Likely modify:
- `src/pages/PMDashboard.tsx`

Potential future extraction, only if file remains too large after simple alignment:
- `src/components/dashboard/pm/pm-dashboard-summary-cards.tsx`
- `src/components/dashboard/pm/pm-dashboard-charts.tsx`

## Implementation Steps
1. Replace the header JSX with `DashboardPageHeader` while preserving Last updated control.
2. Convert summary card wrappers to shared dashboard panel styling.
3. Convert chart wrappers from solid white panels to the standardized glass panel or approved dashboard panel variant.
4. Prefer CSS vars/Tailwind tokens for primary color in chart configs where practical.
5. Keep recharts data, fetches, and calculations unchanged.
6. If `PMDashboard.tsx` remains overly large, consider extracting presentational subcomponents only; do not move business logic unless necessary.

## Success Criteria
- PMDashboard visually matches Analytics Dashboard container style.
- Existing PM dashboard metrics still render correctly.
- No routing or data-fetch changes.
- File remains readable and compilable.

## Risk Assessment
- Risk: broad refactor of a large page introduces regression. Mitigation: keep changes presentational and incremental.
- Risk: chart styling changes reduce readability. Mitigation: test in browser with current data.

## Security Considerations
No security impact. UI-only refactor.

## Todo List
- [ ] Replace header with shared primitive.
- [ ] Normalize summary cards.
- [ ] Normalize chart panels.
- [ ] Browser-check PMDashboard.
