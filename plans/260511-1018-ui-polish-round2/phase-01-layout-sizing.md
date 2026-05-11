# Phase 01 — Layout & Sizing (Bucket A)

## Context Links
- Parent plan: [`plan.md`](./plan.md)
- Brainstorm: [`../reports/brainstorm-260511-1018-ui-polish-issues.md`](../reports/brainstorm-260511-1018-ui-polish-issues.md)
- Predecessor commit removing titles: `d458645`
- Reference page (good layout): `src/pages/Settings.tsx` (đã có title h2 inline)

## Overview

| Field | Value |
|---|---|
| Date | 2026-05-11 |
| Priority | P2 |
| Effort | 2-3h |
| Status | completed |
| Review | not started |

Restore compact page title (h2 + breadcrumb) LEFT, regroup tabs/filters/datepicker/actions RIGHT-cluster trên cùng row, shrink tất cả controls về `size='sm'` (height 32px đồng nhất).

## Key Insights

1. **v2 primitives đã có sẵn `size` prop** — TabPill, Button, FilterChip — chỉ cần consume `size='sm'`
2. **FilterChip 'sm' hiện tại = h-9 (36px)** — không match TabPill/Button 'sm' = h-8 (32px). Cần tune trong primitive.
3. **DateRangePicker v2 không có size prop** — cần add 'sm' variant (h-8)
4. **Breadcrumb** — đã tồn tại trong `components/ui/page-header.tsx`. Có thể extract dùng standalone, hoặc inline tạo custom breadcrumb (~5 LOC) cho compact use case.
5. **Title token** — `text-h2` token check trong `src/index.css`. Fallback: `text-2xl font-bold`.

## Requirements

### Functional
- [ ] 5 pages render: `<header>` row với title+breadcrumb LEFT + controls RIGHT
- [ ] Controls all height 32px: TabPill, FilterChip, DateRangePicker, Button đều `size='sm'`
- [ ] Wrap behavior: `flex flex-wrap items-center` để overflow → row 2 graceful
- [ ] Breadcrumb segments: hardcoded per page (e.g., Dashboard → "Analytics / Dashboard")

### Non-functional
- Zero visual regression cho 5 other pages (LoginPage, Profile, Settings, DailySync, WeeklyCheckin)
- Bundle size impact ≤ +1 kB
- A11y: `<h2>` semantic + `<nav aria-label="Breadcrumb">` wrapper

## Architecture

### Header pattern (convention, not new component)

```tsx
<div className="flex flex-col gap-4 md:gap-6">
  {/* Row 1: header */}
  <header className="flex flex-wrap items-center justify-between gap-3">
    <div className="flex flex-col gap-1">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1 text-body-sm text-on-surface-variant">
          <li>Analytics</li>
          <li>›</li>
          <li className="text-on-surface">Dashboard</li>
        </ol>
      </nav>
      <h2 className="text-h2 font-bold text-on-surface">Dashboard</h2>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <TabPill size="sm" ... />
      <FilterChip size="sm" ... />
      <DateRangePicker size="sm" ... />
      <Button size="sm" variant="primary" ... />
    </div>
  </header>

  {/* Row 2+: page content */}
</div>
```

### Primitive changes

**1. `components/ui/filter-chip.tsx`** — tune 'sm' từ h-9 → h-8 để match TabPill/Button:
```diff
- sm: 'h-9 px-3 text-[length:var(--text-body-sm)] normal-case',
+ sm: 'h-8 px-3 text-[length:var(--text-body-sm)] normal-case',
```

**2. `components/ui/date-range-picker.tsx`** — add `size` prop:
```diff
+ export type DateRangePickerSize = 'sm' | 'md';
+
  export interface DateRangePickerProps {
    value: DateRange;
    onChange: (range: DateRange) => void;
+   size?: DateRangePickerSize;
    ...
  }

+ const SIZE_CLASSES: Record<DateRangePickerSize, string> = {
+   sm: 'h-8 px-3 text-[length:var(--text-body-sm)]',
+   md: 'h-10 px-4 text-[length:var(--text-body)]',
+ };
```

## Related Code Files

**Modify (5 pages):**
- `src/pages/DashboardOverview.tsx` — add header, shrink TabPill+DateRangePicker
- `src/pages/OKRsManagement.tsx` — add header, shrink TabPill+FilterChip+Button
- `src/pages/MediaTracker.tsx` — add header, shrink TabPill+Button
- `src/pages/AdsTracker.tsx` — add header, shrink TabPill+DateRangePicker+Button
- `src/pages/LeadTracker.tsx` — add header, shrink TabPill+Button (Sync CRM)

**Modify (2 primitives):**
- `src/components/ui/filter-chip.tsx` — tune 'sm' to h-8
- `src/components/ui/date-range-picker.tsx` — add size variant

**Reference (no change):**
- `src/components/ui/tab-pill.tsx` (size đã ok)
- `src/components/ui/button.tsx` (size đã ok)
- `src/components/ui/page-header.tsx` (Breadcrumb export — extract nếu cần)

## Implementation Steps

1. **Tune FilterChip 'sm' to h-8** — diff 1 line
2. **Add DateRangePicker 'sm' variant** — ~10 LOC diff
3. **Verify breadcrumb available**: read `page-header.tsx`, check Breadcrumb export. Nếu không có → inline `<ol>` pattern.
4. **Refactor DashboardOverview.tsx**:
   - Add header row: breadcrumb "Analytics / Dashboard" + h2 "Dashboard"
   - Wrap existing TabPill + DateRangePicker into right-cluster với `size='sm'`
5. **Refactor OKRsManagement.tsx**:
   - Header: "Planning / OKRs" + h2 "OKRs"
   - Right cluster: TabPill (L1/L2) + 2 FilterChip + Button — all size='sm'
6. **Refactor MediaTracker.tsx**:
   - Header: "Acquisition / Media Tracker" + h2 "Media Tracker"
   - Right cluster: TabPill (Owned/KOL-KOC/PR) + Button "Add post" — size='sm'
7. **Refactor AdsTracker.tsx**:
   - Header: "Acquisition / Ads Tracker" + h2 "Ads Tracker"
   - Right cluster: TabPill + DateRangePicker (replaces 2 native inputs) + Button "Sync Meta" — size='sm'
8. **Refactor LeadTracker.tsx**:
   - Header: "CRM / Lead Tracker" + h2 "Lead Tracker"
   - Right cluster: TabPill (Lead Logs / CRM Stats) + sync indicator badge + Button "Sync CRM" — size='sm'
   - DatePicker chuyển sang Phase 03 (DateRangePicker unify)
9. **vite build verify** — 0 TS errors
10. **Visual smoke test** — open 5 pages, verify height đồng nhất

## Todo List

- [x] Tune FilterChip 'sm' h-9 → h-8
- [x] Add DateRangePicker 'sm' size variant
- [x] Verify/extract Breadcrumb primitive
- [x] Refactor DashboardOverview.tsx header
- [x] Refactor OKRsManagement.tsx header
- [x] Refactor MediaTracker.tsx header
- [x] Refactor AdsTracker.tsx header
- [x] Refactor LeadTracker.tsx header
- [x] vite build clean
- [x] Visual smoke test (5 pages)
- [x] Commit: `refactor(ui): restore page titles + shrink controls to size='sm' uniform 32px`

## Success Criteria

- [x] 5 pages có visible h2 title + breadcrumb LEFT
- [x] Tất cả TabPill, FilterChip, DateRangePicker, Button trên top row đều h-8 (32px)
- [x] FilterChip 'sm' primitive: h-9 → h-8
- [x] DateRangePicker: size='sm' renders correctly
- [x] vite build: 0 errors, 0 warnings new
- [x] Bundle delta ≤ +1 kB

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| FilterChip h-9 → h-8 affect khác trang (Lead Logs filter chips) | 🟡 Medium | Visual check Lead Logs sau change. h-9→h-8 = 4px delta, low visual impact. |
| Breadcrumb không có sẵn primitive | 🟢 Low | Inline `<ol>` ~5 LOC, không cần new primitive |
| h2 text-h2 token chưa định nghĩa | 🟢 Low | Fallback `text-2xl font-bold` |
| Header row wrap khi nhiều controls | 🟡 Medium | `flex-wrap items-center gap-3` → graceful |
| OKR FilterChip dùng `size="sm"` mới h-8 thay vì h-9 | 🟢 Low | Test OKR page sau update |

## Security Considerations
None — pure visual refactor.

## Next Steps
After Phase 01:
- Phase 02 consumes header layout from Phase 01
- Phase 03 (OKR shrink + bug fix + DateRangePicker unify) có thể parallel với Phase 01
