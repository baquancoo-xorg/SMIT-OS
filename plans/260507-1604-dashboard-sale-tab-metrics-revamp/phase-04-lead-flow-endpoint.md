# Phase 04 — Backend `/api/dashboard/lead-flow` endpoint

## Context Links
- Brainstorm § Decisions #5, #6, #7
- Mẫu route + service: `server/routes/dashboard-call-performance.routes.ts`, `server/services/dashboard/call-performance.service.ts`

## Overview
- **Priority:** P1
- **Status:** completed
- **Effort:** ~1h
- Tạo endpoint mới trả summary + daily series cho Lead Flow & Clearance, tính ngay ở DB level.

## Key Insights
- Tính ở backend tránh client phải fetch toàn bộ leads để tự compute backlog.
- 3 metric dùng 3 mốc ngày khác nhau → cần 3 query (hoặc 3 sub-query) độc lập:
  - Inflow → Lead với `receivedDate ∈ [from, to]`
  - Cleared → Lead với `resolvedDate ∈ [from, to]` AND `status ∈ {Qualified, Unqualified}`
  - Active Backlog → snapshot tại `to`: `receivedDate ≤ to` AND (`status NOT IN closed` OR `resolvedDate > to`)
- Daily series cần 3 buckets riêng cho mỗi ngày trong range.
- Cache 5 phút theo `(from, to)` đủ (tương tự call-performance.service).

## Requirements
- Response shape ổn định, cover cả empty range.
- Date filter inclusive cả `from` 00:00 và `to` 23:59 (timezone Asia/Ho_Chi_Minh).
- Summary và daily phải nhất quán (sum daily.cleared = summary.cleared).
- Edge: cleared + active_backlog = 0 → clearanceRate = `null` (FE hiển thị "—").

## Architecture
```
GET /api/dashboard/lead-flow?from=YYYY-MM-DD&to=YYYY-MM-DD

Response:
{
  summary: {
    inflow: number,
    cleared: number,
    activeBacklog: number,
    clearanceRate: number | null  // 0..100, null nếu denominator = 0
  },
  daily: [
    { date: 'YYYY-MM-DD', inflow, cleared, activeBacklog },
    ...
  ]
}
```

```
lead-flow.service.ts
  ├─ parseRange(from, to) → fromUtc, toUtc, days[]
  ├─ Query 1: count leads receivedDate IN [from, to]              → inflow total
  ├─ Query 2: count leads resolvedDate IN [from, to] AND closed   → cleared total
  ├─ Query 3a: leads receivedDate <= to → universe
  ├─ Query 3b: filter universe: status NOT closed OR resolvedDate > to → active backlog snapshot
  ├─ For daily series:
  │     groupBy date(receivedDate) → daily inflow
  │     groupBy date(resolvedDate) WHERE closed → daily cleared
  │     For each day: re-compute snapshot end-of-day (or accumulate from opening backlog)
  └─ Build response
```

**Daily backlog optimization:** thay vì tính snapshot per-day (N queries), accumulate từ opening_backlog:
- `opening_backlog = count(receivedDate < from AND (status NOT closed OR resolvedDate >= from))`
- Per day: `backlog[d] = backlog[d-1] + inflow[d] - cleared[d]`

Caveat: định nghĩa "cleared on day d" phải khớp — nếu lead nhận trước range nhưng cleared trong range thì vẫn trừ đúng.

## Related Code Files
**Create:**
- `server/routes/dashboard-lead-flow.routes.ts`
- `server/services/dashboard/lead-flow.service.ts`
- `server/types/lead-flow.types.ts`

**Modify:**
- `server/index.ts` (hoặc app.ts nơi register routes) — register new router.

**Read for context:**
- `server/routes/dashboard-call-performance.routes.ts`
- `server/services/dashboard/call-performance.service.ts` (cache pattern)
- `prisma/schema.prisma` (Lead model)
- `server/lib/date-utils.ts`

## Implementation Steps
1. Create `lead-flow.types.ts` với 2 interface: `LeadFlowSummary`, `LeadFlowDailyItem`, `LeadFlowResponse`.
2. Create `lead-flow.service.ts`:
   - `getLeadFlow(from: Date, to: Date): Promise<LeadFlowResponse>`.
   - In-memory cache `Map<string, { expiresAt, data }>` TTL 5 phút (copy pattern call-performance.service).
   - Query 1: `prisma.lead.count({ where: { receivedDate: { gte: from, lte: to } } })`.
   - Query 2: `prisma.lead.count({ where: { resolvedDate: { gte: from, lte: to }, status: { in: ['Qualified', 'Unqualified'] } } })`.
   - Query 3 (active backlog at `to`): 
     ```
     prisma.lead.count({
       where: {
         receivedDate: { lte: to },
         OR: [
           { status: { notIn: ['Qualified', 'Unqualified'] } },
           { resolvedDate: { gt: to } },
           { resolvedDate: null, status: { in: ['Qualified', 'Unqualified'] } }, // edge: status closed nhưng chưa có resolvedDate
         ],
       },
     })
     ```
   - Query 4 (opening backlog at `from`): same với `receivedDate: { lt: from }`, `resolvedDate: { gte: from }` hoặc null.
   - Query 5 (daily inflow): groupBy `date_trunc('day', receivedDate)` qua raw SQL (Prisma raw).
   - Query 6 (daily cleared): groupBy `date_trunc('day', resolvedDate)` với filter status.
   - Build daily series: iterate days, accumulate `backlog[d] = backlog[d-1] + inflow[d] - cleared[d]`.
   - Compute `clearanceRate = (cleared * 100) / (cleared + activeBacklog)` rounded; null nếu denominator = 0.
3. Create `dashboard-lead-flow.routes.ts`:
   - `GET /api/dashboard/lead-flow` với query schema (zod) cho `from`, `to`.
   - Auth middleware giống các route dashboard khác (`requireAuth`).
   - Parse date YYYY-MM-DD → toUtc bằng `date-utils.ts` (Asia/Ho_Chi_Minh boundaries).
   - Return JSON.
4. Register route trong server entry point.
5. Test bằng curl: `curl localhost:3000/api/dashboard/lead-flow?from=2026-04-01&to=2026-05-07`.
6. Verify summary.cleared = sum(daily.cleared); summary.inflow = sum(daily.inflow); summary.activeBacklog = backlog of last day.

## Todo List
- [x] Create types file
- [x] Implement service với 4 count queries + 2 groupBy
- [x] Implement daily series accumulator
- [x] Compute clearanceRate edge cases
- [x] In-memory cache 5min
- [x] Create route file with zod validation
- [x] Register route
- [x] Curl smoke test
- [x] Verify sum-equals-summary invariant

## Success Criteria
- Endpoint trả 200 với JSON đúng shape cho 1 range hợp lệ.
- `summary.inflow === daily.reduce((s, d) => s + d.inflow, 0)`.
- `summary.cleared === daily.reduce((s, d) => s + d.cleared, 0)`.
- `summary.activeBacklog === daily[daily.length-1].activeBacklog`.
- p95 latency < 500ms cho range 30 ngày trên dataset hiện tại (~6000 lead).

## Risk Assessment
| Risk | Mitigation |
|---|---|
| Lead có status closed nhưng resolvedDate=null → khó count | OR clause cover edge case (xem Query 3) |
| Timezone: receivedDate stored UTC, user chọn ngày VN | `date-utils.ts` đã có helper convert; test với ngày biên |
| Daily groupBy raw SQL portable issues | Dùng Prisma `$queryRaw` với `date_trunc('day', "receivedDate" AT TIME ZONE 'Asia/Ho_Chi_Minh')` |
| Cache 5 phút stale khi user trigger sync rồi xem ngay | Acceptable; thêm `?bust=true` query nếu cần debug |

## Security Considerations
- Auth required (cùng pattern các dashboard route khác).
- Query params validated bằng zod.
- No user input đi vào raw SQL trừ date đã parsed.

## Next Steps
- Phase 06 hooks tiêu thụ endpoint này.
- Phase 07 thay logic dashboard-tab.tsx dùng hook mới.
