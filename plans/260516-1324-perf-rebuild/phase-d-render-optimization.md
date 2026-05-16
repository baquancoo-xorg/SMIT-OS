# Phase D — Render Optimization

**Priority:** P1 | **Status:** pending | **Effort:** 3-4h | **Depends:** Phase C

## Overview
Wrap 17 chart components với `React.memo` + `useMemo` cho data transforms. Profiler audit để find real re-render culprits.

## Audit first (45 min)
1. `npm run dev` + open Dashboard
2. React DevTools → Profiler tab → record tab switch
3. Identify components có render time >16ms
4. Find inline object/array props gây cascade re-render (anti-pattern)

## Implementation pattern
```tsx
// Bad: inline array prop
<LineChart data={items.map(i => ({ x: i.date, y: i.value }))} />

// Good: memoized
const chartData = useMemo(() => items.map(i => ({ x: i.date, y: i.value })), [items]);
<LineChart data={chartData} />

// Component memoization
export const LineChart = React.memo(LineChartImpl, (prev, next) =>
  prev.data === next.data && prev.height === next.height
);
```

## Files (priority order)
1. `src/components/ui/charts/{area,bar,pie,line,sparkline}-chart.tsx` (5 base)
2. `src/components/features/dashboard/product/*.tsx` (7 — heaviest dashboard)
3. `src/components/features/dashboard/lead-distribution/*.tsx` (3)
4. `src/components/features/dashboard/call-performance/call-performance-trend.tsx`
5. `src/components/features/ads/spend-chart.tsx`

## Todo
- [ ] Profiler baseline recording (save flamegraph screenshot to `visuals/`)
- [ ] Wrap 5 base chart components với `React.memo` + custom comparator
- [ ] Audit + fix inline data prop usage (`useMemo` ở parent)
- [ ] Re-profile after → save `visuals/profiler-after.png`
- [ ] Verify dashboard tab switch <100ms (User Timing API)

## Success
- Dashboard tab switch <100ms (Profiler measure)
- No chart re-renders khi unrelated state changes (Profiler shows gray)
- No regression visual (charts vẫn update đúng khi data thay đổi)

## Risks
- `React.memo` với array prop reference compare → stale UI nếu parent mutate array. Mitigation: parent dùng spread/`useMemo` consistently
- Custom comparator quá strict → miss legitimate updates. Default `Object.is` per-prop OK cho hầu hết case
- Profiler overhead → tắt trong production build (auto)
