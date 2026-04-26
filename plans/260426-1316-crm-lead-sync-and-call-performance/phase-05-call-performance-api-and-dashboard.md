# Phase 05 — Call Performance API & Dashboard

## Context Links
- Parent: [plan.md](plan.md)
- Brainstorm §4.4: [brainstorm-260426-1316-crm-lead-sync-and-call-performance.md](../reports/brainstorm-260426-1316-crm-lead-sync-and-call-performance.md)
- Depends on: phase-01 (User.crmEmployeeId)
- Existing: `src/pages/DashboardOverview.tsx`, `src/components/dashboard/overview/KpiTable.tsx`

## Overview
- **Date:** 2026-04-26
- **Priority:** P2
- **Status:** completed
- **Review:** completed
- **Description:** Build Call Performance section trong DashboardOverview với 4 widgets: per-AE table, 7×24 heatmap, conversion calls→qualified, trend line. Data từ `crm_call_history` JOIN `User.crmEmployeeId`.

## Key Insights
- Live data: 386 calls từ 2026-04-01 (~15/day), 4 AEs active → query nhẹ
- Heuristic answered = `total_duration > 10s` (chốt từ brainstorm)
- Timezone Asia/Saigon cho hour bucketing trong heatmap (CRM lưu UTC `Timestamptz`)
- AE name resolve qua `User.crmEmployeeId`; CRM employee không có mapping → label "Unmapped (CRM ID: X)"
- Conversion calls→qualified: cross-reference với current `crm_subscribers.status` (snapshot tại thời điểm query)
- Reuse chart lib hiện có nếu có (check `src/components/dashboard/overview/*` cho thấy chart pattern); nếu chưa: dùng `recharts` (lightweight, đã thông dụng React)

## Requirements

### Functional
- API `GET /api/dashboard/call-performance?from=YYYY-MM-DD&to=YYYY-MM-DD&aeId=optional`
- Response gồm 4 sections: `perAe`, `heatmap`, `conversion`, `trend` (xem schema brainstorm §4.4)
- Section mới trong DashboardOverview với date filter (sync với date filter của KPI Table nếu có)
- Heatmap: 7 rows (Mon-Sun) × 24 cols (0-23h), color intensity by call count
- Per-AE table: sortable columns, default sort by totalCalls DESC
- Conversion table: per AE row với calls→qualified, calls→unqualified, avgCallsBeforeClose
- Trend line: 3 series (calls, answered, avgDuration) trên cùng chart hoặc 3 small charts

### Non-functional
- Dashboard load < 2s cho 30-day window
- Cache server-side aggregations 5 phút (memoize per (from, to, aeId))
- Loading skeleton trong khi fetch
- Empty state nếu không có call data trong range

## Architecture

```
GET /api/dashboard/call-performance?from&to&aeId
└─ call-performance.service.ts
   ├─ employeeMap = await loadEmployeeMap()
   ├─ calls = await crmPrisma.crm_call_history.findMany({
   │     where: { created_at: { gte: from, lte: to }, ...(aeId && { employee_user_id: ... }) },
   │     select: { id, subscriber_id, employee_user_id, total_duration, call_start_time, created_at } })
   ├─ subStatus = await crmPrisma.crmSubscriber.findMany({
   │     where: { id: { in: distinct subscriber_ids } },
   │     select: { id, status } })
   ├─ aggregate perAe   → group by employee_user_id
   ├─ aggregate heatmap → convert to Asia/Saigon, group by (dow, hour)
   ├─ aggregate conversion → join calls + subStatus, group by AE
   ├─ aggregate trend → group by date (UTC→VN day boundary)
   └─ return { perAe, heatmap, conversion, trend }

src/pages/DashboardOverview.tsx
└─ <CallPerformanceSection from={from} to={to}>
   ├─ <CallPerformanceAeTable />
   ├─ <CallPerformanceHeatmap />
   ├─ <CallPerformanceConversion />
   └─ <CallPerformanceTrend />
```

## Related Code Files

### Create (server)
- `server/services/dashboard/call-performance.service.ts` — main aggregation
- `server/services/dashboard/call-performance-aggregators.ts` — split per-AE/heatmap/conversion/trend fns
- `server/routes/dashboard-call-performance.routes.ts` — single GET endpoint

### Create (frontend)
- `src/types/call-performance.ts` — response types
- `src/hooks/use-call-performance.ts` — TanStack Query hook
- `src/components/dashboard/call-performance/call-performance-section.tsx` — container with date filter
- `src/components/dashboard/call-performance/call-performance-ae-table.tsx`
- `src/components/dashboard/call-performance/call-performance-heatmap.tsx`
- `src/components/dashboard/call-performance/call-performance-conversion.tsx`
- `src/components/dashboard/call-performance/call-performance-trend.tsx`

### Modify
- `src/pages/DashboardOverview.tsx` — add `<CallPerformanceSection />` below KpiTable
- `server.ts` — register call-performance route

### Delete
- (none)

## Implementation Steps

1. Define types in `src/types/call-performance.ts` matching brainstorm §4.4 response schema. Export from index if convention.
2. Create `call-performance.service.ts` with 4 aggregator functions:
   - `aggregatePerAe(calls, employeeMap)` → array sorted by totalCalls DESC
   - `aggregateHeatmap(calls)` → convert `call_start_time` (UTC) to Asia/Saigon via `dayjs.tz('Asia/Saigon')`, extract `dayOfWeek` (0=Sun) and `hour` (0-23)
   - `aggregateConversion(calls, subStatus)` → for each AE, count calls where corresponding sub.status = mql_qualified vs mql_unqualified
   - `aggregateTrend(calls)` → group by date (Asia/Saigon day), output `{date, calls, answered, avgDuration}`
3. Implement caching: simple in-memory `Map<key, { data, expiresAt }>` with 5-min TTL.
4. Create route handler `GET /api/dashboard/call-performance`:
   - Validate `from`/`to` (default last 30 days)
   - Optional `aeId` filter (validate user exists)
   - Call service, return JSON
5. Register route in `server.ts` under `/api/dashboard`.
6. Frontend: install `recharts` if not yet (`npm i recharts`).
7. Create `use-call-performance.ts`:
   ```typescript
   export function useCallPerformance(params: { from: Date, to: Date, aeId?: string }) {
     return useQuery({
       queryKey: ['call-performance', params],
       queryFn: () => fetch('/api/dashboard/call-performance?...'),
       staleTime: 5 * 60 * 1000,
     });
   }
   ```
8. Create container `call-performance-section.tsx`:
   - Date range picker (sync với DashboardOverview filter nếu có shared state)
   - Optional AE filter dropdown (load from `/api/leads/ae-list`)
   - Loading skeleton, error state, empty state
9. Create `call-performance-ae-table.tsx`:
   - Columns: AE | Total | Answered | Answer Rate | Avg Duration | Leads Called | Calls/Lead
   - Sortable headers (default: Total DESC)
   - "Unmapped (CRM ID: X)" row label cho employee chưa map
10. Create `call-performance-heatmap.tsx`:
    - Grid 7×24 (rows=days, cols=hours)
    - Cell color intensity = log(call_count) → `bg-blue-{100-900}` Tailwind
    - Tooltip on hover: "{day} {hour}h: N calls"
    - Day labels: Mon, Tue, ..., Sun (Vietnamese: T2-CN nếu UI là VN)
11. Create `call-performance-conversion.tsx`:
    - Table: AE | Calls→Qualified | Calls→Unqualified | Avg calls before close
    - Visual: small horizontal bar chart per row
12. Create `call-performance-trend.tsx`:
    - Line chart (recharts `<LineChart>`):
      - X axis: date
      - 2 lines: total calls, answered calls
    - Optional: secondary chart for avg duration (separate small chart)
13. Modify `DashboardOverview.tsx`:
    - Import + render `<CallPerformanceSection from={from} to={to} />` below `<KpiTable />`
    - Pass shared date range nếu DashboardOverview có state quản lý
14. Test:
    - Live API call returns data trong < 2s
    - Heatmap render đúng timezone (verify với 1 call known time)
    - Per-AE row có "Unmapped" cho CRM employee chưa map
    - Empty range (e.g., 2025-01-01 to 2025-02-01) → empty state hiển thị

## Todo List

- [x] Install `recharts` if missing
- [x] Create `src/types/call-performance.ts`
- [x] Implement `call-performance-aggregators.ts` (4 fns)
- [x] Implement `call-performance.service.ts` with 5-min cache
- [x] Implement timezone conversion (UTC → Asia/Saigon) cho heatmap & trend
- [x] Create `dashboard-call-performance.routes.ts`
- [x] Register route in `server.ts`
- [x] Create `use-call-performance.ts` hook
- [x] Create `call-performance-section.tsx` container
- [x] Create `call-performance-ae-table.tsx`
- [x] Create `call-performance-heatmap.tsx`
- [x] Create `call-performance-conversion.tsx`
- [x] Create `call-performance-trend.tsx`
- [x] Add Section to `DashboardOverview.tsx`
- [x] Test API response shape matches types
- [x] Test heatmap timezone correctness
- [x] Test "Unmapped" label cho CRM employees chưa link
- [x] Test empty range
- [x] Visual QA: 4 widgets render rõ ràng, responsive

## Success Criteria
- API < 2s cho 30-day window
- 4 widgets render đầy đủ với live CRM data
- Heatmap đúng timezone Asia/Saigon (manual verify với 1 known call time)
- Per-AE table sortable
- Conversion table tính đúng cho test case (manually count calls cho 1 sub đã qualified)
- "Unmapped (CRM ID: X)" hiển thị cho CRM employees chưa map
- Empty state thân thiện
- Cache work: 2 lần fetch liên tiếp với cùng params → lần 2 fast

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Aggregation chậm khi data scale | Medium | Cache 5 phút; nếu scale > 10k calls/month: chuyển sang DB-side aggregation (raw SQL GROUP BY) |
| Timezone bug → heatmap lệch giờ | High | Unit test với known UTC time → verify VN hour |
| Conversion count sai do sub status thay đổi sau call | Low | Document: conversion là "current snapshot", không phải "tại thời điểm call" |
| Recharts bundle size | Low | Lazy load Section nếu cần (`React.lazy`) |
| User chưa map → AE table mostly "Unmapped" | High | Highlight rõ "Map your team in Admin Settings" CTA; phase-06 admin UI giải quyết |

## Security Considerations
- API yêu cầu authentication (existing dashboard pattern)
- `aeId` param validate exists trong DB trước khi query (tránh enumeration)
- Voice URL trong call_history KHÔNG expose qua API này (privacy); chỉ aggregate metrics
- CRM data subscriber_id không leak qua API (chỉ qua aggregated counts)

## Next Steps
- Phase 06 (admin UI mapping) giúp giảm "Unmapped" rows
- Future: drill-down per-AE → list calls + voice URLs (cần auth check thêm)
- Future: export CSV cho per-AE table
