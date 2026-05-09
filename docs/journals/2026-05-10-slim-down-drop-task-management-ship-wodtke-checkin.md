---
date: 2026-05-10
title: Slim-Down Refactor — Drop Task Management, Ship Wodtke Check-in
plan: plans/260509-2355-smit-os-slim-down/
tags: [refactor, scope-reduction, product-pivot, database-cleanup, bundle-reduction]
---

# Slim-Down Refactor — Execution Journal

Executed 5-phase slim-down plan after scope revision (2026-05-10). Mission: drop task management half (WorkItem/Sprint/board pages), pivot to OKR-loop product (OKRs + Daily Sync + Weekly Check-in Wodtke 5-block + LeadTracker + FB Ads dashboard).

## Phase 1 — Database Schema Cleanup

- Truncated 105 work_items, 7 sprints, 35 daily_reports, 17 weekly_reports (no migration path worth saving — fresh slate cleaner)
- Dropped 4 Prisma models: `WorkItem`, `Sprint`, `DailyReport`, `WeeklyReportItem`
- Added `KeyResult.ownerId` (U+N to assign OKRs to team members)
- Reused `WeeklyReport` columns (progress/plans/blockers/krProgress) as Wodtke 5-block JSON storage — cheaper than new table
- Used `prisma db push --accept-data-loss` (no `_prisma_migrations` table existed in schema) instead of `migrate dev`

## Phase 2 — Frontend Pages & Components Deletion

- Deleted 9 pages: WorkItemsBoard, SprintPlanning, WorkItemDetail, DailyReportForm, WeeklyReportForm, PMDashboard, ProductBacklog, + routing in layout
- Renamed `/sync` → `/checkin` (matches feature name)
- Dropped 12 daily-report subform components (textarea.jsx, priority-badge, status-select, effort-estimate, etc.) — replaced by single 4-textarea DailySync form (Date, Completed, Next, Blockers)
- Made `/` redirect to `/ads-overview` (DashboardOverview becomes landing); PMDashboard stripped entirely

## Phase 3 — Backend Route Cleanup

- Removed `/api/work-items/*`, `/api/sprints/*`, `/api/daily-reports/*`, `/api/weekly-report-items/*` (2 route files deleted)
- Removed unused middleware/utils that only served task management (3 exports from `server/lib/`)
- Kept `weekly-reports.routes.ts` + `okrs.routes.ts` — reused for Wodtke 5-block JSON

## Phase 4 — Type System Update

- `src/types/index.ts`: removed `WorkItem`, `Sprint`, `DailyReport`, `WeeklyReportItem` exports
- OKRsManagement.tsx (1544 LOC) had deep WorkItem coupling — refactored surgically to remove imports, kept component structure intact
- No cascade errors; DashboardOverview was clean of WorkItem refs

## Phase 5 — Bundle Reduction & Verification

- DailySync: 82kB → 10kB (gzip 3.26kB) — stripped subform maze
- WeeklyCheckin: 41kB → 19kB (gzip 5.46kB) — simplified from 8 components to 1 form + Wodtke blocks
- Verified no broken imports via `npm run typecheck` + `npm run build`

## Key Decisions

1. **Truncate over migrate:** No legacy code worth carrying. Simpler mental model.
2. **Reuse WeeklyReport for Wodtke:** `progress/plans/blockers/krProgress` columns map directly to 5-block JSON; no schema bloat.
3. **db push instead of migrate dev:** Non-interactive path (no `_prisma_migrations` precedent).
4. **Confidence 0-10 scale:** Replaces percentage (Radical Focus framework).
5. **Full redirect:** PMDashboard → /ads-overview (don't deprecate, nuke it).

## Difficulties

- **Daemon stop non-existent:** npm scripts had restart/install/uninstall but not `stop`. Used `launchctl bootout com.smitos.dev` directly.
- **Interactive prisma migrate:** `prisma migrate dev --create-only` requires interactive tty; fell back to `db push`.
- **pg_dump not on PATH:** No postgres-client installed locally. Backed up via `docker exec smit_os_db pg_dump`.
- **OKRsManagement tight coupling:** 1544 LOC with WorkItem imports scattered. Refactored by removing dead branches rather than rewrite (risky refactor = surgical refactor).

## Verification

```
npm run typecheck  ✓
npm run build      ✓ (3.1s)
database synced    ✓ (105 work_items truncated, 4 models dropped)
bundle sizes       ✓ (DailySync 10kB, WeeklyCheckin 19kB)
imports cleaned    ✓ (0 WorkItem/Sprint references in UI)
```

## Files Changed

- 4 commits: af8eb7a, a471f73, 978d1a1, 2cf67c7
- Prisma schema: 4 models dropped, 1 column added
- Frontend: 9 pages deleted, 12 components deleted
- Backend: 2 route files deleted, 3 lib exports removed
- Net: ~240 LOC deleted (pages) + ~180 LOC deleted (routes) + ~60 LOC added (schema + OKR refactor)

## What I'd Do Differently

**Prepare daemon script beforehand.** `launchctl bootout` is lower-level than npm script; adding a `daemon:stop` npm wrapper pre-execution would've been smoother. For next refactor: always inventory the npm scripts needed before plan phase.

**Validate OKRsManagement imports earlier.** Waiting until Phase 4 to discover 1544 LOC of coupling created refactor risk. Next time: scan for file coupling in Phase 1 (Research) so surgical vs. rewrite decision is pre-decision, not mid-panic.
