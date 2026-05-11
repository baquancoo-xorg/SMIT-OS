# Brainstorm — Table Style Standardization

> Date: 2026-05-11 14:58
> Owner: Quân Bá
> Status: Approved → Plan parallel
> Source of truth: `src/components/lead-tracker/lead-logs-tab.tsx`

## Problem

6 trang dùng bảng dữ liệu với style drift:
- **Lead Logs** (reference): `TableShell standard` trong GlassCard wrapper
- **Dashboard KPI Metrics**: custom `<table>` với `dense` contract, sticky col, striped, no glass wrap
- **Daily Sync**: `DataTable` v2 (khác abstraction), density `comfortable` h-14
- **Weekly Checkin**: `DataTable` v2, density `comfortable`
- **Media Tracker**: `TableShell standard` ✅ (đã migrate round 2) — thiếu glass wrap
- **Ads Tracker**: `TableShell standard` ✅ (đã migrate round 2) — thiếu glass wrap
- **CRM Stats** (Lead Tracker tab): `TableShell standard` nhưng custom typography drift nặng

## Standard token spec (chuẩn Lead Logs)

```
Outer:   GlassCard bg-white/50 backdrop-blur-md border-white/20 rounded-card shadow-sm
Shell:   TableShell variant="standard" (flatten khi nằm trong glass)
Header:  sticky top-0 z-20 bg-white
         border-b border-outline-variant/40 bg-surface-variant/30
HCell:   px-4 py-2.5 text-caption font-semibold uppercase tracking-wide text-on-surface-variant
Body:    divide-y divide-outline-variant/30
Row:     hover:bg-primary/[0.02]
Cell:    px-4 py-2.5 text-body-sm
```

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| KPI Metrics variant | Giữ `dense`, align tokens only | 18 cols × 30+ rows justify dense UX; sticky Date col + striped rows cần thiết |
| DataTable v2 | Replace bằng TableShell + useSortableData + SortableTh | Match Media/Ads round 2 pattern, đã proven |
| Glass wrapper | Apply tất cả 6 table | Depth visual đồng nhất; Lead Logs đã có pattern này |
| CRM Stats | Align tokens, giữ pivot 2-row | Pivot UX cần thiết (at-a-glance AE compare); mất pivot = mất giá trị |
| Pagination | Drop từ DataTable v2 migration | Row counts < 50; load-all OK |
| Responsive `hideBelow` | Drop | Mobile out of scope round này |

## Migration matrix

| Table | File | Effort | Action |
|---|---|---|---|
| Lead Logs | `src/components/lead-tracker/lead-logs-tab.tsx` | — | Reference — no change |
| CRM Stats | `src/components/lead-tracker/daily-stats-tab.tsx` | M | Align padding/font/tracking; fix malformed `border-outline-variant/40/50`; keep pivot |
| Dashboard KPI | `src/components/dashboard/overview/KpiTable.tsx` | M | Wrap GlassCard; sync header bg `60→30`, hover `primary/5→[0.02]`; keep dense |
| Daily Sync | `src/pages/DailySync.tsx` | H | Replace `DataTable` v2 → TableShell + sortable hook; wrap GlassCard |
| Weekly Checkin | `src/pages/WeeklyCheckin.tsx` | H | Replace `DataTable` v2 → TableShell + sortable hook; wrap GlassCard |
| Media Tracker | `src/pages/MediaTracker.tsx` (parent) | L | Wrap GlassCard around posts table |
| Ads Tracker | `src/pages/AdsTracker.tsx` (parent) | L | Wrap GlassCard around campaigns table |

## Specific drift to fix

### CRM Stats (`daily-stats-tab.tsx`)
- Cell padding `px-3 py-3` → `px-4 py-2.5`
- Font sizes `text-[9px]` / `text-xs` → `text-caption` / `text-body-sm`
- Weight `font-black` → `font-semibold`
- Tracking `tracking-[0.2em]` / `tracking-widest` → `tracking-wide`
- Bug fix: `border-outline-variant/40/50` (malformed double-slash) → `border-outline-variant/40`
- Empty state custom → `standardTable.emptyState`
- Sticky header bg consistent `bg-white`

### Dashboard KPI Metrics (`KpiTable.tsx`)
- Wrap parent in `GlassCard` (currently bare `DashboardPanel`)
- Header bg `bg-surface-variant/60` → `bg-surface-variant/30`
- Row hover `hover:bg-primary/5` → `hover:bg-primary/[0.02]`
- Keep: dense `px-3 py-2`, sticky Date col, striped rows, 3-table split scroll-sync architecture

### Daily Sync + Weekly Checkin
- Drop `import { DataTable } from '../components/ui'`
- Import: `TableShell, SortableTh, useSortableData`
- Replace `columns` array → JSX `<thead>` + `<tbody>` với `getTableContract('standard')`
- Wrap output table trong `GlassCard variant="surface"` (hoặc inline glass div)
- Empty state: `EmptyState variant="inline"` (same as Lead Logs)
- Drop `pagination`, `hideBelow` from columns
- Preserve sort: use `useSortableData<Row, SortKey>(...)` + `accessor` function

### Media + Ads Tracker
- Wrap `<MediaPostsTable />` / `<CampaignsTable />` trong glass div ở page level
- TableShell add `className="bg-transparent border-0 shadow-none rounded-none"` (flatten)

## Implementation phases (parallel-ready)

3 phases, sub-tasks parallel-able do zero file overlap:

```
Phase 1: Replace DataTable v2 (parallel)
├─ 1a. Daily Sync migration (src/pages/DailySync.tsx)
└─ 1b. Weekly Checkin migration (src/pages/WeeklyCheckin.tsx)

Phase 2: Token alignment (parallel)
├─ 2a. CRM Stats (src/components/lead-tracker/daily-stats-tab.tsx)
└─ 2b. KPI Metrics (src/components/dashboard/overview/KpiTable.tsx)

Phase 3: Glass wrap (parallel)
├─ 3a. Media Tracker page wrap (src/pages/MediaTracker.tsx)
└─ 3b. Ads Tracker page wrap (src/pages/AdsTracker.tsx)
```

Toàn bộ 6 sub-tasks có thể spawn parallel cùng lúc.

## Success criteria

- Visual parity: header / cell / hover / divider matches Lead Logs trên 5 trang (excl. KPI which stays dense)
- Glass wrapper present trên 6/6 tables
- DataTable v2 removed khỏi Daily Sync + Weekly Checkin
- CRM Stats malformed border bug fixed
- TypeScript compile clean
- No regression: sort feature works on Daily Sync + Weekly Checkin
- Storybook stories (nếu có) still build

## Risks

- DataTable v2 removal có thể break Storybook stories — cần check `data-table.stories.tsx` không affected (DataTable v2 vẫn tồn tại, chỉ unused trong 2 pages)
- KPI Metrics 3-table-split scroll-sync architecture phức tạp — KHÔNG touch logic, chỉ tokens
- Glass wrap có thể conflict với section spacing — test layout sau wrap

## Out of scope

- Mobile responsive overhaul
- Pagination feature parity
- Animation/transitions enhancement
- DataTable v2 deprecation (still used in other places)

## Next step

Invoke `/ckm:plan:parallel` để break thành phase files với detailed TODO checklists.
