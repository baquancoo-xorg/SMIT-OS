# Phase 04 u2014 Responsive Audit

## Overview

- **Priority:** Medium
- **Status:** completed
- **Blocked by:** Phase 01, 02, 03 (audit sau khi components u0111u00e3 chuu1ea9n hu00f3a)
- **Effort:** ~2h

Audit vu00e0 fix responsive layout cho tablet (768-1279px) vu00e0 laptop nhu1ecf (1024-1439px).

## Key Insights

- Sidebar u1ea9n hou00e0n tou00e0n du01b0u1edbi `xl:` (1280px) u2014 tablet khu00f4ng cu00f3 fixed sidebar, content cu00f3 tou00e0n bu1ed9 width
- Breakpoint custom: `md`=430px, `tablet`=768px, `lg`=1024px u2014 nu00ean du00f9ng `tablet:` cho 768px thay vu00ec `md:`
- `page-padding` class du00f9ng `--content-px-tablet` tu1eeb 430px (thay vu00ec 768px) u2014 cu00f3 thu1ec3 gu00e2y lu1ec7ch
- `content-h` = `100dvh - header-h` u2014 u0111u00fang tru00ean cu1ea3 2 desktop vu00e0 tablet

## Pages to Audit

### 1. DailySync page (`src/pages/DailySync.tsx`)
- Kiu1ec3m tra `DailySyncStatsBar` tru00ean 768px
- Kiu1ec3m tra cards grid tru00ean tablet
- Kiu1ec3m tra text truncation

### 2. Dashboard/Overview (`src/components/dashboard/overview/`)
- `SummaryCards`: grid layout tru00ean tablet
- `KpiTable`: table overflow tru00ean tablet
- `DateRangePicker`: layout tru00ean tablet

### 3. Board views (`src/components/board/`)
- `TaskCard`, `DraggableTaskCard`: khu00f4ng vu1ee1 text tru00ean tablet
- `TaskTableView`, `ReportTableView`: horizontal overflow

### 4. Header (`src/components/layout/Header.tsx`)
- u0110u1ea3m bu1ea3o header items khu00f4ng overflow tru00ean tablet

### 5. Lead Tracker (`src/components/lead-tracker/`)
- `dashboard-tab`, `lead-logs-tab`: grid/table responsive

## Responsive Fix Patterns

### Pattern 1: Text truncation
```tsx
// Xu1ea5u: text bu1ecb cu1eaft khu00f4ng cu00f3 tooltip
<span className="text-sm">{longText}</span>

// Tu1ed1t: truncate + title
<span className="text-sm truncate" title={longText}>{longText}</span>
```

### Pattern 2: Grid tru00ean tablet
```tsx
// Breakpoint `md`=430px cu00f3 thu1ec3 collapse su1edbm quu00e1 tru00ean mu00e0n tablet thu1eadt su1ef1
// Xu00e9t lu1ea1i nu01a1i du00f9ng md:grid-cols-N u2014 nu1ebfu cu1ea7n tablet layout khu00e1c, du00f9ng tablet:grid-cols-N
grid-cols-1 tablet:grid-cols-2 xl:grid-cols-4
```

### Pattern 3: Table overflow
```tsx
// Thu00eam wrapper responsive cho tables
<div className="w-full overflow-x-auto rounded-xl">
  <table className="min-w-[600px] w-full">...</table>
  <p className="text-[10px] text-center text-slate-400 py-2 tablet:hidden">
    u2190 Vuu1ed1t ngang u0111u1ec3 xem u2192
  </p>
</div>
```

### Pattern 4: Content padding tru00ean tablet
- Kiu1ec3m tra `page-padding` class u2014 hiu1ec7n `padding-inline: --content-px-mobile` u0111u1ebfn 430px, sau u0111u00f3 `--content-px-tablet`
- Tru00ean tablet thu1eadt su1ef1 (768px), sidebar u1ea9n nu00ean content cu00f3 full width u2014 padding nu00e0y lu00e0 quan tru1ecdng

## Breakpoint Reference

```css
/* index.css custom breakpoints */
--breakpoint-xs: 375px
--breakpoint-sm: 390px
--breakpoint-md: 430px      /* u2190 khu00f4ng phu1ea3i 768! */
--breakpoint-tablet: 768px  /* u2190 du00f9ng cu00e1i nu00e0y cho tablet */
--breakpoint-lg: 1024px
--breakpoint-xl: 1440px
```

**Trong Tailwind classes:** du00f9ng `tablet:` thay vu00ec `md:` khi muu1ed1n trigger tu1ea1i 768px.

## Files to Check

- `src/pages/DailySync.tsx`
- `src/components/daily-report/DailySyncStatsBar.tsx`
- `src/components/dashboard/overview/SummaryCards.tsx`
- `src/components/dashboard/overview/KpiTable.tsx`
- `src/components/board/TaskTableView.tsx`
- `src/components/board/ReportTableView.tsx`
- `src/components/layout/Header.tsx`
- `src/components/lead-tracker/lead-logs-tab.tsx`
- `src/components/lead-tracker/dashboard-tab.tsx`

## Implementation Steps

1. **Audit tu1eebng page** tu1ea1i viewport 768px (devtools tablet simulation)
2. **Ghi lu1ea1i cu00e1c breakpoints** du00f9ng sai (`md:` cho 768px intent) vu00e0 su1eeda
3. **Fix text truncation** u2014 thu00eam `truncate` + `title` u1edf nu01a1i cu1ea7n
4. **Fix table overflow** u2014 thu00eam wrapper vu00e0 `min-w` hint
5. **Kiu1ec3m tra touch targets** u2014 bu1ea5t ku1ef3 button/click target nu00e0o cu1ea7n `min-h-[44px]` hou1eb7c `min-w-[44px]`
6. **Compile + visual check**

## Todo

- [x] Audit `DailySync.tsx` + `DailySyncStatsBar.tsx` tu1ea1i 768px
- [x] Audit `SummaryCards.tsx` + `KpiTable.tsx` tu1ea1i 768px
- [x] Audit `TaskTableView.tsx` + `ReportTableView.tsx` u2014 table overflow
- [x] Audit `Header.tsx` tu1ea1i 768px
- [x] Audit `lead-logs-tab.tsx` + `dashboard-tab.tsx`
- [x] Fix tu1ea5t cu1ea3 vu1ea5n u0111u1ec1 phu00e1t hiu1ec7n
- [x] Compile check

## Success Criteria

- Khu00f4ng cu00f3 horizontal overflow u1edf viewport 768px
- Khu00f4ng cu00f3 text bu1ecb cu1eaft khu00f4ng cu00f3 tooltip/ellipsis
- Tu1ea5t cu1ea3 interactive elements u2265 44px touch target
- Layout u0111u1eb9p tru00ean cu1ea3 768px (tablet), 1024px (small laptop), 1440px (standard desktop)
