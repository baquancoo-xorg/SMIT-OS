# Phase C — Bundle Diet

**Priority:** P1 | **Status:** pending | **Effort:** 4-6h | **Depends:** Phase B

## Overview
3 sub-tasks: (1) Lazy-load 17 Recharts components (2) Audit route lazy (already done) (3) Rewrite `manualChunks` dựa trên analyzer evidence.

## Sub-task C1 — Recharts lazy-load (2-3h)

### Strategy
- Tạo wrapper `src/components/ui/charts/lazy-chart.tsx`: `React.lazy()` cho mỗi chart type
- Replace direct imports trong 17 files
- Suspense boundary ở **dashboard section level** (không per-chart) → tránh flash skeleton

### Files (17 chart consumers)
- `src/components/ui/charts/{area,bar,pie,line,sparkline}-chart.tsx` (5 base wrappers)
- `src/components/features/ads/spend-chart.tsx`
- `src/components/features/leads/dashboard-tab.tsx`
- `src/components/features/dashboard/call-performance/call-performance-trend.tsx`
- `src/components/features/dashboard/lead-distribution/*.tsx` (3)
- `src/components/features/dashboard/product/*.tsx` (7)

### Pattern
```ts
// charts/lazy-recharts.ts — single lazy boundary
export const LazyArea = lazy(() => import('recharts').then(m => ({ default: m.AreaChart })));
// ... per primitive

// Suspense wrapper at section level:
<Suspense fallback={<ChartSkeleton />}>
  <SpendChart data={...} />
</Suspense>
```

### Decision point
Recharts xài nhiều primitives (Line, Area, Bar, Pie, Tooltip, ...). Lazy whole recharts chunk **1 lần** rồi cache, hoặc lazy per chart type? → Khuyến nghị: 1 lazy chunk `recharts-bundle`, mọi chart import từ wrapper. Sau lần đầu open dashboard, cache hit.

## Sub-task C2 — Route lazy audit (verified ✅)
- `App.tsx:15-25` đã lazy 11 pages
- **Action:** skip, document only

## Sub-task C3 — Manualchunks rewrite (1-2h)

### Current problem
`vite.config.ts:14-21` — per-package vendor chunks tạo 50+ files. HTTP overhead cao.

### New strategy (sau khi đọc analyzer)
```ts
manualChunks(id) {
  if (!id.includes('node_modules')) return;
  if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
  if (id.includes('react-dom') || id.includes('react/')) return 'vendor-react';
  if (id.includes('@radix-ui') || id.includes('lucide-react')) return 'vendor-ui';
  if (id.includes('@tanstack')) return 'vendor-tanstack';
  if (id.includes('date-fns') || id.includes('zod')) return 'vendor-utils';
  return 'vendor-misc';
}
```
Adjust groups dựa trên top 10 heaviest từ analyzer.

## Todo
- [ ] C1: Tạo `lazy-recharts.ts` wrapper
- [ ] C1: Refactor 5 base chart components dùng lazy primitives
- [ ] C1: Add `<Suspense fallback={ChartSkeleton}>` ở dashboard sections
- [ ] C1: Test HMR dev mode + production build
- [ ] C2: Document route lazy already done
- [ ] C3: Rewrite manualChunks dựa trên Phase B report
- [ ] C3: Build + check chunk count (target <15) + total gzip size
- [ ] Capture analyzer screenshot AFTER → `visuals/bundle-after.png`

## Success
- Initial JS gzip giảm ≥35% (baseline từ Phase B)
- Chunk count <15 (từ 50+)
- Dashboard mount lần đầu vẫn <2s

## Risks
- Manual chunks rewrite break HMR → test dev mode kỹ
- Recharts split không đều (vài primitives nhỏ) → fallback dùng 1 chunk
- Suspense flash khó chịu nếu boundary quá nhỏ → giữ ở section level
