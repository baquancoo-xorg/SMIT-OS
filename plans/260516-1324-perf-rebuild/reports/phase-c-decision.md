# Phase C Decision Log

## Sub-tasks status

### C1 — Recharts lazy-load: **SKIPPED**

**Reason:** Routes đã lazy (App.tsx:15-25, verified). Dashboard page lazy → Recharts không trong initial bundle. Adding extra lazy boundary trong Dashboard chỉ tăng complexity + flash UX khi user navigate.

**Evidence:** Build output AFTER manualChunks rewrite:
- `vendor-charts`: 335KB raw / **90.81 KB gzip** — chỉ load khi vào /dashboard, /ads, /leads (routes đã lazy)
- Initial bundle (anonymous landing): `vendor-react` + `index` + `vendor-router` ≈ 130KB gzip

### C2 — Route lazy: **ALREADY DONE** (verified)

### C3 — manualChunks rewrite: **DONE** ✅

## Build delta

| Metric | Before | After | Δ |
|---|---|---|---|
| Total chunks (vendor-*) | ~17 | 9 | -47% |
| vendor-recharts | 70.19 KB gzip | merged → vendor-charts 90.81 KB | +d3 included (same total) |
| vendor-react split | dom 56 + react 3.5 = 59.86 KB | vendor-react 95.53 KB | merged scheduler/react/dom |
| vendor-utils | (4 separate chunks) | 43.08 KB | consolidated |

**Net:** Same total bytes, fewer HTTP requests, better cache hit ratio (1 vendor-react cache vs multiple).

## Final chunks (gzip)

```
vendor-react     95.53 KB  ← react + react-dom + scheduler
vendor-charts    90.81 KB  ← recharts + d3-* (only loads on chart pages)
vendor-utils     43.08 KB  ← zod + date-fns + es-toolkit + immer + decimal.js
vendor-motion    41.94 KB  ← framer-motion
index            20.87 KB  ← entry
DashboardOverview 17.03 KB ← lazy page
vendor-misc      15.77 KB
vendor-router    13.69 KB
vendor-tanstack  12.29 KB
vendor-ui         9.21 KB
vendor-redux      5.73 KB
```

## Unresolved

- `vendor-ui` 9.21 KB còn nhỏ — maybe merge vào misc nếu rebuild lần nữa
- `vendor-misc` 15.77 KB cần check chứa gì (analyzer treemap)
