---
title: "Dashboard System Refactor: Domain Tabs & Unified UI"
description: "Refactor dashboard-related UI into reusable components, add Overview/Sale/Product/Marketing/Media tabs to Analytics Dashboard, and align cards/tables/charts across dashboard pages."
status: pending
priority: P1
effort: 14h
branch: main
tags: [dashboard, analytics, ui-refactor, tabs, design-system]
created: 2026-04-26
blockedBy: []
blocks: []
---

# Plan: Dashboard System Refactor — Domain Tabs & Unified UI

## Context Links
- User request: reorganize Analytics Dashboard into domain tabs and unify UI style.
- Reference UI: Team Backlog segmented tabs, Analytics Overview glass-card/control-panel styling.
- Existing related plan: `../260426-1316-crm-lead-sync-and-call-performance/plan.md`.
- Architecture docs: `../../docs/system-architecture.md`.

## Goal
Refactor dashboard UI broadly enough to establish reusable dashboard primitives, then apply them to:
1. `src/pages/DashboardOverview.tsx` (`/ads-overview`) with domain tabs.
2. Dashboard overview components under `src/components/dashboard/overview/`.
3. Call performance/dashboard sections under `src/components/dashboard/call-performance/` and `src/components/lead-tracker/dashboard-tab` wrapper usage.
4. `src/pages/PMDashboard.tsx` where shared dashboard primitives fit without changing business logic.

## Requirements
- Add tabs: `Overview`, `Sale`, `Product`, `Marketing`, `Media`.
- Default tab: `Overview`.
- Persist selected tab in URL query: `?tab=overview|sale|product|marketing|media`.
- Place tab control beside Date Picker in dashboard header.
- `Overview` tab shows only Summary Cards + KPI Metrics Table.
- `Sale` tab shows every current section below KPI Table: Call Performance + Lead Flow & Clearance/CRM dashboard sections.
- `Product`, `Marketing`, `Media` show a consistent `Coming soon` empty state.
- Standardize dashboard page header, section titles, panels/cards, segmented tabs, empty states.
- Do not change API contracts, calculations, date range behavior, table sorting, or chart data logic.

## Phase Overview

| # | Phase | File | Status | Effort |
|---|---|---|---|---|
| 01 | Define dashboard UI primitives | [phase-01-dashboard-ui-primitives.md](phase-01-dashboard-ui-primitives.md) | pending | 3h |
| 02 | Refactor Analytics Dashboard tabs | [phase-02-dashboard-overview-tabs.md](phase-02-dashboard-overview-tabs.md) | pending | 4h |
| 03 | Normalize dashboard sections/cards/tables | [phase-03-normalize-dashboard-sections.md](phase-03-normalize-dashboard-sections.md) | pending | 3h |
| 04 | Apply primitives to PMDashboard | [phase-04-pm-dashboard-ui-alignment.md](phase-04-pm-dashboard-ui-alignment.md) | pending | 2h |
| 05 | Validation, browser QA, docs | [phase-05-validation-docs-review.md](phase-05-validation-docs-review.md) | pending | 2h |

## Dependencies
```txt
Existing CRM/call-performance plan
  ↓
phase-01 primitives
  ↓
phase-02 DashboardOverview tabs
  ↓
phase-03 dashboard component normalization
  ↓
phase-04 PMDashboard alignment
  ↓
phase-05 validation/docs/review
```

## Blocking Relationship
Dependency resolved: `260426-1316-crm-lead-sync-and-call-performance` has been closed, so this plan is unblocked and ready for implementation.

## Design Principles
- KISS: introduce only dashboard primitives needed by current pages.
- DRY: remove duplicated header/section/card style strings where touched.
- YAGNI: no generic analytics framework, no permissions model, no new data layer.
- Preserve behavior: visual refactor only except tab routing/query state.

## Success Criteria
- `/ads-overview` opens on Overview tab by default.
- `/ads-overview?tab=sale` opens directly on Sale tab.
- Invalid tab query falls back to Overview without breaking UI.
- Summary Cards + KPI Table are not duplicated in Sale.
- Call Performance + Lead Flow & Clearance appear only in Sale.
- Product/Marketing/Media tabs show consistent Coming soon state.
- Header controls are responsive and do not overflow at common viewport widths.
- Dashboard cards/tables/charts use shared primitives and consistent glass style.
- `npm run build` or TypeScript compile command passes.
- Browser QA verifies tab switching, date range persistence, KPI view toggles, and horizontal table scroll.

## Cook Command
```bash
/ck:cook /Users/dominium/Documents/Project/SMIT-OS/plans/260426-2346-dashboard-system-refactor-tabs-ui/plan.md
```

## Unresolved Questions
- Should the existing CRM/call-performance plan be marked completed before implementation starts?
- Should PMDashboard get its own domain tabs later, or only shared UI primitives in this plan?
