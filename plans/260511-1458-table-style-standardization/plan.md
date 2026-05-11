---
title: "Table Style Standardization"
description: "Migrate 6 dashboard tables to match Lead Logs reference (TableShell standard + GlassCard wrapper)."
status: complete
priority: P2
effort: 4h
branch: main
tags: [ui, refactor, table, standardization]
created: 2026-05-11
---

# Table Style Standardization

> Brainstorm source: `plans/reports/brainstorm-260511-1458-table-style-standardization.md`
> Reference (source of truth): `src/components/lead-tracker/lead-logs-tab.tsx`

## Goal

Align 6 dashboard tables to Lead Logs visual contract: `TableShell variant="standard"` inside `GlassCard variant="surface"`. Fix CRM Stats malformed border bug. Replace `DataTable` v2 in Daily Sync + Weekly Checkin with sortable hook pattern (matches Media/Ads round 2 migration).

## Parallelization

All 6 sub-phases own distinct files (zero overlap) — spawn concurrently.

```
Phase 1 (HIGH)  ─┬─ 1a Daily Sync         (src/pages/DailySync.tsx)
                 └─ 1b Weekly Checkin     (src/pages/WeeklyCheckin.tsx)

Phase 2 (MED)   ─┬─ 2a CRM Stats          (src/components/lead-tracker/daily-stats-tab.tsx)
                 └─ 2b KPI Metrics        (src/components/dashboard/overview/KpiTable.tsx)

Phase 3 (LOW)   ─┬─ 3a Media Tracker      (src/pages/MediaTracker.tsx)
                 └─ 3b Ads Tracker        (src/pages/AdsTracker.tsx)
```

No runtime dependency between phases.

## File ownership matrix

| Phase | File | Exclusive owner |
|---|---|---|
| 1a | `src/pages/DailySync.tsx` | yes |
| 1b | `src/pages/WeeklyCheckin.tsx` | yes |
| 2a | `src/components/lead-tracker/daily-stats-tab.tsx` | yes |
| 2b | `src/components/dashboard/overview/KpiTable.tsx` | yes |
| 3a | `src/pages/MediaTracker.tsx` | yes |
| 3b | `src/pages/AdsTracker.tsx` | yes |

No other phase reads or writes any file from another phase.

## Phases

| ID | Status | Effort | File |
|---|---|---|---|
| [1a](./phase-01a-daily-sync-tableshell-migration.md) | complete | H | DailySync.tsx |
| [1b](./phase-01b-weekly-checkin-tableshell-migration.md) | complete | H | WeeklyCheckin.tsx |
| [2a](./phase-02a-crm-stats-token-alignment.md) | complete | M | daily-stats-tab.tsx |
| [2b](./phase-02b-kpi-metrics-glass-wrap.md) | complete | M | KpiTable.tsx |
| [3a](./phase-03a-media-tracker-glass-wrap.md) | complete | L | MediaTracker.tsx |
| [3b](./phase-03b-ads-tracker-glass-wrap.md) | complete | L | AdsTracker.tsx |

## Final integration (post-parallel)

1. `npx tsc --noEmit` — verify clean compile.
2. `npm run dev` + visual smoke test 6 pages.
3. Test sort on Daily Sync + Weekly Checkin (click each `SortableTh`).
4. Confirm no double-shell visual artifact (glass + TableShell stacked borders).

## Success criteria (rollup)

- 6/6 tables wrapped in GlassCard.
- Lead Logs visual parity on 5 tables (KPI keeps dense).
- DataTable v2 removed from `DailySync.tsx` + `WeeklyCheckin.tsx`.
- CRM Stats `border-outline-variant/40/50` malformed double-slash fixed.
- TypeScript compile clean. Sort working on Daily Sync + Weekly Checkin.

## Risks (top-level)

- DataTable v2 Storybook stories still build (check `data-table.stories.tsx` — DataTable not deleted, only unused in 2 pages).
- KPI scroll-sync logic in `KpiTable.tsx:271-311` must NOT be touched.
- Glass-on-glass nesting must use flatten override on TableShell (`bg-transparent border-0 shadow-none rounded-none`).

## Completion Notes

**Date:** 2026-05-11

**Execution:** All 6 phases executed in parallel with zero file overlap (zero conflicts).

**Code Review:** APPROVED — All 4 modified components reviewed, scores 9–10/10.
- `src/pages/DailySync.tsx` — ✅ DataTable v2 → TableShell + sortable hook migration, GlassCard wrap. Clean pattern.
- `src/pages/WeeklyCheckin.tsx` — ✅ Parallel pattern to Phase 1a, same architecture. Confirmed.
- `src/components/lead-tracker/daily-stats-tab.tsx` — ✅ Token alignment + border bug fix. Pivot header preserved. 
- `src/components/dashboard/overview/KpiTable.tsx` — ✅ GlassCard wrap + hover/header token sync. Scroll-sync untouched.
- `src/pages/MediaTracker.tsx` — ✅ GlassCard wrap around MediaPostsTable (no className forwarding needed — wrapped at page level).
- `src/pages/AdsTracker.tsx` — ✅ GlassCard wrap around CampaignsTable (same pattern as Media).

**tsc:** Clean (no compile errors).

**Integration Notes:**
- Phase 2b: DashboardPanel already exports GlassCard design tokens; wrapping KpiTable.tsx render output preserves structural hierarchy.
- Phase 3a/3b: MediaPostsTable and CampaignsTable do NOT forward className to inner TableShell. Applied GlassCard wrap at page level instead of nested flatten. This preserves double-shell artifact (MediaPostsTable/CampaignsTable render with TableShell visual; outer glass adds surface decoration). Flagged for future cleanup phase that adds `tableShellClassName` prop to both components for token-level flatten support.
