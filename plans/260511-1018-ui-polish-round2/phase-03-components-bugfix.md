# Phase 03 — Components & Bug Fix (Bucket C)

## Context Links
- Parent plan: [`plan.md`](./plan.md)
- Brainstorm: [`../reports/brainstorm-260511-1018-ui-polish-issues.md`](../reports/brainstorm-260511-1018-ui-polish-issues.md)
- Bug root cause: Prisma Decimal serializes as string → JS `+` operator concat
- Reference v1 DateRangePicker (Dashboard): `src/components/dashboard/overview/DateRangePicker.tsx`
- v2 DateRangePicker primitive: `src/components/ui/date-range-picker.tsx`

## Overview

| Field | Value |
|---|---|
| Date | 2026-05-11 |
| Priority | P1 (bug fix urgent) |
| Effort | 1-2h |
| Status | completed |
| Review | not started |

Bucket C gồm 3 concerns không liên quan nhau nhưng cùng scale nhỏ:
1. **OKR card shrink** (L1 + L2) — visual fix
2. **MediaTracker KOL/KOC Spend bug** — Number cast fix
3. **DateRangePicker unify** — primitive consolidation (Dashboard + Ads + Lead dùng cùng 1 component)

## Key Insights

1. **Bug root cause**: Prisma `Decimal? @db.Decimal(12, 2)` → JSON response trả về **string** `"5000000.00"`. JS `+` với string = concat. `reduce` accumulator bị contaminate từ iteration đầu tiên.
2. **Decimal fields trong schema**: cần grep `Decimal` trong `prisma/schema.prisma` để audit toàn diện. Có thể có nhiều site reduce/sum bị bug.
3. **DateRangePicker shape conflict**:
   - v1 (Dashboard): `value: { from: string, to: string }` (yyyy-MM-dd)
   - v2 primitive: `value: { from: Date, to: Date }`
   - Quyết định: dùng v2 shape (Date), Dashboard adapter format khi serialize URL state
4. **v2 DateRangePicker presets default**: Today / Last 7d / Last 30d / This month / Last month / This quarter
   - v1 presets: Hôm nay / 7 ngày qua / 14 ngày qua / 30 ngày qua / Tháng này
   - Cần align: dùng presets tiếng Việt? Hay English? → giữ tiếng Việt (user-facing copy đã VN trên Dashboard hiện tại)
5. **OKR card hiện tại padding rất lớn** trên desktop (`lg:p-8` = 32px) + icon `lg:w-14` (56px) + title `lg:text-xl` → card L1 height ~140px. Shrink xuống ~80px.

## Requirements

### Functional
- [ ] OKR L1 card visible padding ≤ p-4, icon w-9, title text-base/lg, card height ≤ 80px
- [ ] OKR L2 card padding ≤ p-3, icon w-7, card height ≤ 64px
- [ ] OKR badge (L1-BOD/L2) inline với title (cùng row), không stack
- [ ] MediaTracker `totals.kolSpend` hiển thị `15,000,000 VND` thay vì `015000005000000`
- [ ] DateRangePicker render giống nhau ở Dashboard + Ads + Lead Tracker
- [ ] v2 DateRangePicker presets: "Hôm nay" / "7 ngày qua" / "30 ngày qua" / "Tháng này" / "Q này"

### Non-functional
- v1 `components/dashboard/overview/DateRangePicker.tsx` xoá sau khi migrate (dead code)
- v2 DateRangePicker primitive nhận thêm `size='sm'` (đã add ở Phase 01)
- **URL state sync** cho cả 3 pages (Dashboard + Ads + Lead) — query params `?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD` — adapter format
- Ads Tracker hiện chỉ dùng local state cho `dateFrom`/`dateTo` → cần migrate sang `useSearchParams`
- Lead Tracker filters hiện dùng local state (`useState<FilterState>`) → migrate `dateFrom`/`dateTo` sang URL params (giữ filter khác local)

## Architecture

### OKR card shrink

**L1 card** (`okr-accordion-cards.tsx:33-60`):
```diff
- <div className="bg-white/50 backdrop-blur-md rounded-card shadow-sm border border-white/20 overflow-hidden group">
+ <div className="bg-white/50 backdrop-blur-md rounded-card shadow-sm border border-white/20 overflow-hidden group">
    <div
-     className="p-5 md:p-6 lg:p-8 cursor-pointer hover:bg-surface-variant/30/50 transition-colors flex items-center justify-between"
+     className="p-3 md:p-4 cursor-pointer hover:bg-surface-variant/30/50 transition-colors flex items-center justify-between"
    >
-     <div className="flex items-center gap-4 md:gap-6 flex-1">
-       <div className={`w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-card md:rounded-card ${colors.bg} ...`}>
+     <div className="flex items-center gap-3 flex-1 min-w-0">
+       <div className={`w-9 h-9 rounded-card ${colors.bg} ...`}>
        <Icon className="size-5" />
        ...
-     <div className="flex items-center gap-2 md:gap-3 mb-1 flex-wrap">
+     <div className="flex items-center gap-2 flex-wrap">
        <span className="badge L1-BOD">L1 - BOD</span>
        <span className="O-circle">O</span>
+       <h3 className="text-base md:text-lg font-bold ...">Title here</h3>  ← inline với badges
      </div>
-     <h3 className="text-base md:text-lg lg:text-xl ...">{title}</h3>  ← remove standalone
```

**L2 card** (`okr-accordion-cards.tsx:154-180`):
```diff
- className="p-4 md:p-6 cursor-pointer ..."
+ className="p-2.5 md:p-3 cursor-pointer ..."

- <div className={`w-8 h-8 md:w-10 md:h-10 ...`}>
+ <div className={`w-7 h-7 ...`}>
```

### MediaTracker spend bug fix

**`src/pages/MediaTracker.tsx:79-82`:**
```diff
  const kolSpend = allPosts
    .filter((p) => p.type === 'KOL' || p.type === 'KOC')
-   .reduce((s, p) => s + (p.cost ?? 0), 0);
+   .reduce((s, p) => s + Number(p.cost ?? 0), 0);
```

**Audit grep** cho Decimal field reduce/sum:
```bash
grep -rn "\.reduce.*[+].*\(\.cost\|\.price\|\.amount\|\.revenue\|\.spend\|\.budget\)" src/
```

Audit candidate files (predict):
- `dashboard/marketing/marketing-tab.tsx` — có thể `.reduce(s + p.spend)`
- `dashboard/media/media-tab.tsx` — KOL spend similar
- `ads-tracker/campaigns-table.tsx` — spend totals

### DateRangePicker unify

**Step 1**: Update v2 primitive `components/ui/date-range-picker.tsx`:
- Add Vietnamese presets default
- Add `size='sm' | 'md'` variant (đã làm Phase 01)
- Ensure feature parity với v1: pill button + dropdown + custom range input

**Step 2**: Migrate Dashboard (`DashboardOverview.tsx`):
```diff
- import { DateRangePicker as V1DateRangePicker } from '../components/dashboard/overview/DateRangePicker';
+ import { DateRangePicker } from '../components/ui';

  // state: keep yyyy-MM-dd strings for URL serialize
- <V1DateRangePicker value={range} onChange={setRange} />
+ <DateRangePicker
+   value={{ from: new Date(range.from), to: new Date(range.to) }}
+   onChange={(r) => setRange({
+     from: format(r.from, 'yyyy-MM-dd'),
+     to: format(r.to, 'yyyy-MM-dd'),
+   })}
+   size="sm"
+ />
```

**Step 3**: Migrate AdsTracker — URL state sync via `useSearchParams`:
```diff
+ import { useSearchParams } from 'react-router-dom';
+ const [searchParams, setSearchParams] = useSearchParams();
+ const dateFrom = searchParams.get('date_from') ?? format(subDays(new Date(), 30), 'yyyy-MM-dd');
+ const dateTo = searchParams.get('date_to') ?? format(new Date(), 'yyyy-MM-dd');

- <input type="date" value={dateFrom} onChange={...} />
- <span>—</span>
- <input type="date" value={dateTo} onChange={...} />
+ <DateRangePicker
+   value={{ from: new Date(dateFrom), to: new Date(dateTo) }}
+   onChange={(r) => setSearchParams((prev) => {
+     const next = new URLSearchParams(prev);
+     next.set('date_from', format(r.from, 'yyyy-MM-dd'));
+     next.set('date_to', format(r.to, 'yyyy-MM-dd'));
+     return next;
+   })}
+   size="sm"
+ />
```

**Step 4**: Migrate Lead Logs (`lead-logs-tab.tsx:213-216`) — URL state sync:
```diff
+ import { useSearchParams } from 'react-router-dom';
+ // Inside component (or lift to LeadTracker parent for shared URL state):
+ const [searchParams, setSearchParams] = useSearchParams();
+ const urlDateFrom = searchParams.get('date_from');
+ const urlDateTo = searchParams.get('date_to');

- <DatePicker value={filters.dateFrom} onChange={...} placeholder="Từ ngày" />
- <span>—</span>
- <DatePicker value={filters.dateTo} onChange={...} placeholder="Đến ngày" />
+ <DateRangePicker
+   value={{ from: new Date(urlDateFrom ?? filters.dateFrom), to: new Date(urlDateTo ?? filters.dateTo) }}
+   onChange={(r) => {
+     const from = format(r.from, 'yyyy-MM-dd');
+     const to = format(r.to, 'yyyy-MM-dd');
+     setSearchParams((prev) => {
+       const next = new URLSearchParams(prev);
+       next.set('date_from', from);
+       next.set('date_to', to);
+       return next;
+     });
+     sf('dateFrom', from);
+     sf('dateTo', to);
+   }}
+   size="sm"
+ />
```

**Note**: Lead Tracker's filters cũ vẫn dùng local state — chỉ `dateFrom`/`dateTo` sync URL. Other filters (`ae`, `status`, `hasNote`, `noteDate`, `q`) giữ local. Pattern này preserve compat với existing filter sync logic.

Lead Logs `noteDate` (filter changed at date) — giữ DatePicker single (không phải range).

**Step 5**: Delete v1 file: `git rm src/components/dashboard/overview/DateRangePicker.tsx`

## Related Code Files

**Modify:**
- `src/components/okr/okr-accordion-cards.tsx` — shrink L1 + L2 padding/icon/title
- `src/pages/MediaTracker.tsx` — line 81 Number cast
- `src/components/ui/date-range-picker.tsx` — Vietnamese presets, size variant (đã Phase 01)
- `src/pages/DashboardOverview.tsx` — migrate v1 → v2 DateRangePicker
- `src/pages/AdsTracker.tsx` — replace 2 native inputs
- `src/components/lead-tracker/lead-logs-tab.tsx` — replace 2 DatePicker với DateRangePicker

**Delete:**
- `src/components/dashboard/overview/DateRangePicker.tsx` (v1 — sau khi migrate xong)

**Audit only (potential bug sites):**
- `src/components/dashboard/marketing/marketing-tab.tsx`
- `src/components/dashboard/media/media-tab.tsx`
- `src/components/ads-tracker/campaigns-table.tsx`
- Khác sites grep ra

## Implementation Steps

1. **Bug fix MediaTracker** — 1 line change, instant impact
2. **Audit Decimal fields** — grep `.reduce.*[+].*\.(cost|price|amount|revenue|spend|budget)` → fix all sites với `Number()` cast
3. **DateRangePicker Vietnamese presets** — update primitive default
4. **Migrate Dashboard DateRangePicker** — adapter for URL state
5. **Migrate Ads Tracker DateRangePicker**
6. **Migrate Lead Logs DateRangePicker**
7. **Delete v1 DateRangePicker** + cleanup imports
8. **OKR L1 card shrink** — apply padding/icon/title diffs
9. **OKR L2 card shrink** — apply padding/icon diffs
10. **vite build verify**
11. **Visual smoke test** — OKR page (~10 objectives stack), Media spend (correct format), 3 datepicker pages

## Todo List

- [x] MediaTracker.tsx:81 Number cast fix
- [x] Grep audit Decimal reduce sites — fix all
- [x] v2 DateRangePicker presets Vietnamese
- [x] Migrate Dashboard to v2 DateRangePicker (giữ URL state hiện có)
- [x] Migrate Ads Tracker to v2 DateRangePicker + add URL state sync `?date_from=&date_to=`
- [x] Migrate Lead Logs to v2 DateRangePicker (dateFrom/dateTo only) + URL state sync
- [x] Delete v1 dashboard DateRangePicker file
- [x] Shrink OKR L1 card (padding/icon/title inline)
- [x] Shrink OKR L2 card (padding/icon)
- [x] vite build clean
- [x] Visual verify OKR page (card count visible)
- [x] Visual verify Media spend format
- [x] Commit: `fix(ui): KOL spend Number cast + shrink OKR cards + unify DateRangePicker primitive`

## Success Criteria

- [x] KOL/KOC Spend hiển thị correct (e.g., "15,000,000 VND")
- [x] No other reduce sites bị bug Decimal
- [x] OKR L1 card height ≤ 80px (measure DOM)
- [x] OKR L2 card height ≤ 64px
- [x] OKR title + badges inline cùng row
- [x] DateRangePicker visual identical 3 pages
- [x] URL state sync working 3 pages — refresh giữ date range; share link giữ date range
- [x] v1 DateRangePicker file removed
- [x] vite build 0 errors

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Number() cast on `null` → `0` (not NaN) | 🟢 Low | `p.cost ?? 0` guard trước → Number(0) = 0 safe |
| OKR shrink quá nhiều → khó click/tap mobile | 🟡 Medium | Test mobile breakpoint. Min target size 44x44 (a11y) cho click area |
| DateRangePicker shape mismatch break URL state | 🟡 Medium | Adapter useEffect: parse URL params → Date objects, format Date → URL params |
| v1 DateRangePicker delete break các nơi khác import | 🟢 Low | grep import trước delete, hiện chỉ Dashboard import |
| Decimal audit miss sites | 🟡 Medium | Grep broad pattern + visual inspect any totals/sums hiển thị lạ |
| OKR inline title + badges flex-wrap → 2 rows trên narrow screen | 🟡 Medium | `min-w-0 truncate` cho title, accept 2 rows trên mobile |

## Security Considerations
None — bug fix + visual refactor.

## Next Steps
After Phase 03:
- Final commit (3 buckets done)
- vite build + 5-page smoke test
- Update phase-08-polish-migration.md với round 2 outcomes section
- Bundle size measure delta
- Run PostHog monitor script nếu user muốn track impact
