# Phase 06 — Medium Pages Implementation Report

**Date:** 2026-05-10
**Plan:** [`260510-0358-ui-system-redesign`](../plan.md)
**Phase:** [`phase-06-pages-medium.md`](../phase-06-pages-medium.md)
**Status:** implementation_done (pending user review)

## Scope

Build v2 page shells cho 5 medium-complexity pages, dùng v2 design system primitives (Phase 4) + Phase 5 batch pattern (wrap v1 sub-components để giữ behavioral parity).

## Strategy — JIT shell-first

Phase 5 batch 1+2 đã prove pattern: **shell page bằng v2 primitives + reuse v1 sub-components**. Phase 6 áp dụng cùng pattern:
- Header, KPI cards, tabs, action buttons → v2 primitives (PageHeader, KpiCard, TabPill, Button, GlassCard)
- Sub-components phức tạp (lead-logs-tab, media-posts-table, etc.) → reuse v1
- Forms đơn giản (DailySync 4-block) → rewrite với FormDialog v2
- Forms phức tạp (WeeklyCheckin multi-step KR + priorities) → reuse v1 modal

Lý do: shell-first ship nhanh + giảm risk regression. Sub-component deep migration là follow-up sau Phase 7 sign-off.

## Deliverables

| File | LOC | Strategy |
|---|---|---|
| `src/pages/v2/DailySync.tsx` | ~280 | Full v2 (PageHeader + 4 KpiCard + DataTable + FormDialog + Modal detail) — form viết lại |
| `src/pages/v2/WeeklyCheckin.tsx` | ~270 | v2 shell + reuse v1 WeeklyCheckinModal + new v2 detail Modal (5 sections) |
| `src/pages/v2/LeadTracker.tsx` | ~110 | v2 shell + TabPill (Logs/Stats) + reuse LeadLogsTab + DailyStatsTab |
| `src/pages/v2/MediaTracker.tsx` | ~150 | v2 shell + 3 TabPill + 4 KpiCard Bento + reuse MediaPostsTable + MediaPostDialog |
| `src/pages/v2/AdsTracker.tsx` | ~160 | v2 shell + 3 TabPill + 4 KpiCard Bento + reuse CampaignsTable + SpendChart + AttributionTable |
| `src/App.tsx` | +6 | `?v=2` toggle wired cho 5 routes |

## v2 Components Sử Dụng

- `PageHeader` (italic accent + breadcrumb) — 5 pages
- `Button` (primary/secondary/ghost) — header actions
- `Badge` (success/warning/error/info) — status + submission state
- `KpiCard` (Bento decorative blob) — 12 KPI cards across 4 pages
- `TabPill` — 3 pages (LeadTracker, MediaTracker, AdsTracker)
- `DataTable` (sortable + responsive) — DailySync, WeeklyCheckin
- `FormDialog` — DailySync create form
- `Modal` — DailySync + WeeklyCheckin detail views
- `EmptyState` (decorative) — DailySync, WeeklyCheckin
- `GlassCard` — table containers, stats wrapper

## Behavioral Parity

| Aspect | v1 | v2 | Match |
|---|---|---|---|
| DailySync approve gate | admin only | admin only | ✓ |
| DailySync submission status (early/ontime/late) | ✓ | ✓ (Badge variant) | ✓ |
| WeeklyCheckin multi-step form | KR loading + priorities | reuse v1 modal | ✓ |
| LeadTracker CRM sync | admin only | admin only (v2 Button) | ✓ |
| LeadTracker CSV export | isSale | isSale | ✓ |
| MediaTracker tab type filter | TAB_TYPES forwarding | TAB_TYPES forwarding | ✓ |
| AdsTracker Sync Meta | admin only | admin only | ✓ |
| AdsTracker date range | format yyyy-MM-dd | same | ✓ |

## Compile Status

```
✓ vite build complete in 2.19s
- DailySync v2: 9.7 kB (gzip 3.61 kB)
- WeeklyCheckin v2: 8.44 kB (gzip 3.15 kB)
- LeadTracker v2: 3.99 kB (gzip 1.77 kB)
- MediaTracker v2: 4.05 kB (gzip 1.81 kB)
- AdsTracker v2: 5.72 kB (gzip 2.31 kB)
```

Zero TypeScript errors, zero unused imports, zero lint issues.

## Pending Sign-Off

User cần test 5 routes với `?v=2`:
- `/daily-sync?v=2` — mobile critical (Sale checkin)
- `/checkin?v=2` — mobile critical (5-block Wodtke)
- `/lead-tracker?v=2` — Sale primary workspace
- `/media-tracker?v=2` — Marketing
- `/ads-tracker?v=2` — Marketing + admin Meta sync

**Personas to test:** Admin + Sale + Marketing + Member × Desktop + Mobile

## Follow-Up Work (out of Phase 6 scope)

1. Sub-component deep migration:
   - `src/components/lead-tracker/v2/` — lead-log-dialog, source-badge, sync-from-crm-button, last-sync-indicator, daily-stats-tab, lead-logs-tab
   - `src/components/media-tracker/v2/` — media-posts-table, platform-badge, csv-export
   - `src/components/ads-tracker/v2/` — campaigns-table, spend-chart, attribution-table
   - `src/components/checkin/v2/` — weekly-checkin sub-components, KrCheckinRow
   - `src/components/board/v2/` — ReportTableView (Weekly report table)
2. WeeklyCheckin multi-step form rewrite với FormDialog v2 wizard pattern
3. LeadTracker per-row ownership UI hint (edit button disabled + tooltip)

## Unresolved Questions

1. Sau user sign-off, có nên migrate sub-components ngay (Phase 6.5) hay defer đến Phase 8 polish? — câu hỏi cho user.
2. WeeklyCheckin multi-step có cần wizard pattern (next/prev step) hay vẫn 1-screen scroll như v1? — UX decision.
3. `LastSyncIndicator` có nên upgrade dùng v2 Badge variant thay vì raw text? — minor polish.
