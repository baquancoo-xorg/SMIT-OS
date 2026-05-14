---
title: "Media Baseline Layout Standardization"
description: "Use Media page as the v5 layout baseline for toolbar alignment, KPI cards, and data sections across v5 pages including Settings."
status: completed
priority: P2
effort: 7h
branch: main
tags: [ui, v5, layout, toolbar, kpi, table, settings]
created: 2026-05-15
---

# Media Baseline Layout Standardization

## Phases

| # | Phase | Status | Effort | Depends on |
|---|-------|--------|--------|------------|
| 1 | [Shared page layout primitives](phase-01-shared-page-layout-primitives.md) | completed | 2h | — |
| 2 | [Growth workspace migration](phase-02-growth-workspace-migration.md) | completed | 2h | Phase 1 |
| 3 | [Remaining v5 pages and Settings](phase-03-remaining-v5-pages-and-settings.md) | completed | 2h | Phase 1 |
| 4 | [Validation, review, and docs](phase-04-validation-review-docs.md) | completed | 1h | Phase 2, Phase 3 |

## Key Decisions

- **Baseline:** Media page is the canonical visual/layout reference for v5 data pages: toolbar → KPI summary → data table/panel.
- **Toolbar layout:** left cluster = Search, Group, Filter; right cluster = Action button, DateRangePicker. Desktop controls share one horizontal baseline.
- **Primitive strategy:** create a lightweight reusable layout/toolbar primitive instead of ad-hoc per-page classes or full page rewrites.
- **Semantic restraint:** do not force KPI cards or tables onto pages where they are not meaningful, especially Settings/Profile.
- **Contract alignment:** follow `docs/ui-design-contract.md` §1-2, §17-19, §22, §24-27, §40, §42-43, §48, §50.

## Files in Scope

| File | Phase |
|------|-------|
| `src/components/v5/ui/page-toolbar.tsx` | 1 |
| `src/components/v5/ui/page-section-stack.tsx` | 1 |
| `src/components/v5/ui/index.ts` | 1 |
| `src/pages/v5/MediaTracker.tsx` | 2 |
| `src/components/v5/growth/media/media-filter-bar.tsx` | 2 |
| `src/components/v5/growth/media/media-kpi-summary.tsx` | 2 |
| `src/components/v5/growth/media/media-posts-table.tsx` | 2 |
| `src/components/v5/growth/media/media-group-table.tsx` | 2 |
| `src/pages/v5/AdsTracker.tsx` | 2 |
| `src/components/v5/growth/ads/ads-kpi-cards.tsx` | 2 |
| `src/pages/v5/LeadTracker.tsx` | 2 |
| `src/pages/v5/DashboardOverview.tsx` | 3 |
| `src/pages/v5/Reports.tsx` | 3 |
| `src/pages/v5/DailySync.tsx` | 3 |
| `src/pages/v5/WeeklyCheckin.tsx` | 3 |
| `src/pages/v5/OKRsManagement.tsx` | 3 |
| `src/pages/v5/Settings.tsx` | 3 |
| `src/pages/v5/Profile.tsx` | 3 |
| `docs/project-changelog.md` | 4 |

## Out of Scope

- Rewriting business logic, fetch logic, API calls, or data models.
- Adding fake summary cards to Settings/Profile just for visual symmetry.
- Migrating legacy non-v5 pages unless a route still actively uses them.
- Replacing every table implementation if it already matches the canonical `DataTable`/`TableShell` contract.
- Introducing new color tokens, raw hex colors, or solid orange active/CTA states.

## Validation Gates

- `npm run typecheck`
- `npm run lint:ui-canon`
- `npm run test`
- `npm run build`
- Route smoke: `/`, `/dashboard`, `/media`, `/ads`, `/leads`, `/reports`, `/daily-sync`, `/checkin`, `/okrs`, `/settings`, `/profile`
- Manual/browser visual QA if tooling/session allows: dark + light mode, desktop + narrow viewport.

## Completion Notes

- Added shared `PageToolbar` and `PageSectionStack` primitives and exported them from v5 UI.
- Migrated Media, Ads, Leads, Dashboard, Daily Sync, Reports, and Settings to the Media-derived rhythm where semantically relevant.
- Wired `/reports` into the v5 route table and Command Center nav so the standardized Reports page is reachable.
- Kept Settings semantic: page tabs and content rhythm only, no fake KPI cards.
- Validation passed: `npm run typecheck`, `npm run lint:ui-canon`, `npm run test` (125/125), `npm run build`, canonical route smoke.
- Browser visual QA was not performed in-session; validation relies on code review, UI canon lint, build, and route smoke.
