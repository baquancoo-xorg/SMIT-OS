# Phase 01 — Sprint 1: Executive + Funnel Sections (5d)

## Context Links
- Brainstorm §Layout §1+§2 + §Backend Services + §Frontend Components
- Phase 1 done: `plans/260507-2219-posthog-product-tab/` — KPI cards 6-cell + Funnel 4-step làm baseline
- Audit verdict (phase-00): có thể tinh chỉnh spec dựa vào kết quả

## Overview
- **Priority:** P2 (high — phần lõi tab Product)
- **Status:** pending (blocked by phase-00)
- Build §1 Executive (8 KPI + Pre-PQL Trend + Activation Heatmap 3 views) + §2 Funnel (Funnel-with-Time + TTV Histogram)

## Key Insights
- Pre-PQL Rate = `firstSyncCount / totalSignups × 100` (đúng Master Plan PLG Gate #1)
- Activation Heatmap 1 component, 3 view via dropdown (single endpoint variant param) — tránh code 3 component khác nhau
- Funnel-with-Time = extend funnel hiện tại + label "avg X days" giữa step (KHÔNG build mới component, modify existing)
- TTV Histogram bucket: 0-1d, 2-3d, 4-7d, 8-14d, 15-30d, 30d+

## Requirements

### Functional
- 8 KPI cards: Signup · FirstSync · Pre-PQL Rate · PQL · Activation · DAU · MAU · DAU/MAU
- Pre-PQL Trend line chart 30/60/90d toggle
- Activation Heatmap 3 view: hour×day-of-week · cohort×days-since-signup · business×days (top 50)
- Funnel-with-Time hiển thị avg days giữa step (Created→FirstSync, FirstSync→Feature, Feature→PQL)
- TTV Histogram 6-bucket distribution + p50/p90 vertical lines

### Non-functional
- Mỗi file <200 LOC
- Cache TTL: trends 15min, heatmap 30min, ttv 30min
- API response <800ms (cached) / <3s (uncached)
- Heatmap dropdown switch không re-fetch nếu đã cache

## Architecture
```
Backend
  routes/dashboard-product.routes.ts
    ├── GET /trends?metric=&days=  → product-trends.service.ts → PostHog timeseries + CRM
    ├── GET /heatmap?view=         → product-heatmap.service.ts → PostHog HogQL (3 variant)
    └── GET /ttv                   → product-time-to-value.service.ts → CRM diff timestamps

Frontend
  product-section.tsx
    ├── §1 Executive
    │   ├── product-kpi-cards.tsx (UPDATED 6→8 cards)
    │   ├── product-pre-pql-trend.tsx (NEW)
    │   └── product-activation-heatmap.tsx (NEW, dropdown switch)
    └── §2 Funnel
        ├── product-funnel-chart.tsx (giữ — extend label)
        ├── product-funnel-with-time.tsx (NEW, wrap existing)
        └── product-ttv-histogram.tsx (NEW)
```

## Related Code Files

### Modify
- `/Users/dominium/Documents/Project/SMIT-OS/server/routes/dashboard-product.routes.ts` — thêm 3 endpoint
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/product/product-kpi-cards.tsx` — 6→8 cards (thêm Pre-PQL Rate)
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/product/product-section.tsx` — wire-up §1 §2 heading
- `/Users/dominium/Documents/Project/SMIT-OS/server/types/dashboard-product.types.ts` — thêm Trends/Heatmap/TTV types
- `/Users/dominium/Documents/Project/SMIT-OS/src/types/dashboard-product.ts` — mirror types
- `/Users/dominium/Documents/Project/SMIT-OS/src/hooks/use-product-dashboard.ts` — thêm 3 query hook

### Create (Backend)
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/posthog/product-trends.service.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/posthog/product-heatmap.service.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/posthog/product-time-to-value.service.ts`

### Create (Frontend)
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/product/product-pre-pql-trend.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/product/product-activation-heatmap.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/product/product-funnel-with-time.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/product/product-ttv-histogram.tsx`

## Implementation Steps

### Backend (2d)

1. **Types** — extend `server/types/dashboard-product.types.ts`:
   ```ts
   ProductTrendsResponse: { metric, days, points: [{ date, value }] }
   ProductHeatmapResponse: { view, cells: [{ x, y, value, label? }] }
   ProductTtvResponse: { steps: [{ from, to, buckets, p50, p90 }] }
   ```
2. **`product-trends.service.ts`** — HogQL group by `toDate(timestamp)`, support metric={signup|firstsync|pre_pql_rate|activation}, return time series
3. **`product-heatmap.service.ts`** — switch by `view`:
   - `hour-day`: `SELECT toDayOfWeek(timestamp) y, toHour(timestamp) x, count() FROM events WHERE properties.business_id IS NOT NULL GROUP BY y,x`
   - `cohort`: bucket cohort by `toStartOfWeek(min(timestamp))`, X = days-since-signup
   - `business`: top 50 business by signup, X = last 30 days, value = session_duration sum
4. **`product-time-to-value.service.ts`** — CRM query `crmBusinessPqlStatus`, calc `dateDiff('day', created_at, first_sync_at)` → bucket 6 bins, calc p50/p90 với `array_sort`
5. **Routes** — thêm 3 GET endpoint vào `dashboard-product.routes.ts`, reuse cache + auth pattern Phase 1
6. **Cache TTL** — `trends: 15min`, `heatmap: 30min`, `ttv: 30min` (set qua existing cache helper)

### Frontend (1.5d)

7. **Types mirror** — copy 3 type vào `src/types/dashboard-product.ts`
8. **Hook** — `use-product-dashboard.ts` thêm `useProductTrends(metric, days)` · `useProductHeatmap(view)` · `useProductTtv()` (React Query 5min staleTime)
9. **`product-kpi-cards.tsx` extend** — 6 → 8 cards, thêm:
   - Pre-PQL Rate: tính `firstSyncCount/totalSignups*100`, format `X%`, badge "PLG Gate #1"
   - Tooltip "Master Plan §3 PLG Gate condition #1"
10. **`product-pre-pql-trend.tsx`** — Recharts `LineChart`, X=date, Y=Pre-PQL Rate %, toggle 30/60/90d, ~80 LOC
11. **`product-activation-heatmap.tsx`** — Single component, dropdown 3 option, color scale theo value, hover tooltip, ~150 LOC
12. **`product-funnel-with-time.tsx`** — wrap `product-funnel-chart.tsx`, fetch TTV data, hiển thị "avg N days" giữa step, ~90 LOC
13. **`product-ttv-histogram.tsx`** — Recharts `BarChart`, 6 bucket + ReferenceLine cho p50/p90, ~100 LOC

### Wire-up + Smoke Test (1.5d)

14. **`product-section.tsx`** — refactor: thêm 2 section heading "§1 Executive Overview", "§2 Conversion Funnel"
15. **Manual smoke test:**
    - Mở dashboard, scroll §1 §2 không lỗi console
    - Heatmap dropdown switch 3 view, response <2s mỗi view
    - Cache hit: refresh button invalidate, second load nhanh
    - 8 KPI cards có data đúng, Pre-PQL Rate match audit số liệu
    - Build production: `npm run build` không leak `POSTHOG_PERSONAL_API_KEY`

## Todo List
- [ ] Backend types extend (3 type mới)
- [ ] `product-trends.service.ts`
- [ ] `product-heatmap.service.ts` (3 variant)
- [ ] `product-time-to-value.service.ts`
- [ ] Routes 3 endpoint mới
- [ ] Cache TTL config
- [ ] Frontend types mirror
- [ ] React Query hooks 3 mới
- [ ] `product-kpi-cards.tsx` 6→8 cards
- [ ] `product-pre-pql-trend.tsx`
- [ ] `product-activation-heatmap.tsx` (dropdown 3 view)
- [ ] `product-funnel-with-time.tsx`
- [ ] `product-ttv-histogram.tsx`
- [ ] `product-section.tsx` wire-up §1 §2 heading
- [ ] Smoke test full flow + build verify

## Success Criteria
- ✅ 8 KPI cards render đầy đủ với Pre-PQL Rate prominent
- ✅ Pre-PQL Trend line chart toggle 30/60/90d
- ✅ Activation Heatmap dropdown 3 view, không re-fetch nếu cached
- ✅ Funnel-with-Time hiển thị avg days giữa step
- ✅ TTV Histogram 6-bucket + p50/p90 markers
- ✅ Build production không leak `POSTHOG_PERSONAL_API_KEY`
- ✅ Initial load §1+§2 <2s với cache warm
- ✅ Mỗi file <200 LOC

## Risk Assessment
- 🟡 **MED** — Heatmap business×days perf với 381 business; mitigation: top 50 limit + virtualization defer
- 🟡 **MED** — Cohort heatmap HogQL phức tạp; mitigation: cache 30min, EXPLAIN check trong dev
- 🟢 **LOW** — TTV calc simple CRM query
- 🟢 **LOW** — Pre-PQL Rate là computed metric, không cần query mới (tính từ existing summary)

## Security Considerations
- `POSTHOG_PERSONAL_API_KEY` chỉ dùng server-side
- Endpoint mới phải qua auth middleware giống Phase 1
- Heatmap business×days KHÔNG expose business name nếu không có quyền — chỉ business_id (audit Sprint 3 nếu cần mask)

## Next Steps
- Sprint 1 done → input cho Sprint 2 (Cohort + Channel)
- Phase 0 audit verdict ảnh hưởng Sprint 2 design (không phải Sprint 1)
- Demo cuối Sprint 1 cho user duyệt §1 §2
