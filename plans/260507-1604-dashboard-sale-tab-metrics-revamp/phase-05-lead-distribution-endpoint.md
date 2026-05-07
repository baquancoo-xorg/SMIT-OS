# Phase 05 — Backend `/api/dashboard/lead-distribution` endpoint

## Context Links
- Brainstorm § Decisions #8
- Mẫu route: `dashboard-call-performance.routes.ts`

## Overview
- **Priority:** P2
- **Status:** completed
- **Effort:** ~45m
- Endpoint trả 2 distribution: theo `source` và theo `ae` (workload), tuân datepicker.

## Key Insights
- 2 distribution có shape khác nhau (donut vs stacked bar) → 2 sub-objects trong response.
- Theo source: count by `Lead.source` (sau Phase 01 đã có), top N + "Others" group.
- Theo AE: count by `Lead.ae`, stack 2 nhóm (Active vs Cleared), sort by total desc.
- Cùng cache pattern 5 phút.

## Requirements
- Source bucket "Others" gộp các source ngoài top N (default top 8).
- AE workload phân biệt active (chưa close) và cleared (Qualified/Unqualified) trong range datepicker.
- Range filter ở đây dùng `receivedDate` (lead inflow).

## Architecture
```
GET /api/dashboard/lead-distribution?from=YYYY-MM-DD&to=YYYY-MM-DD&topSources=8

Response:
{
  bySource: [
    { source: 'agency-create-business', count: 234 },
    { source: 'original-website', count: 152 },
    ...
    { source: 'Others', count: 23 }
  ],
  byAe: [
    { ae: 'Phương Linh', active: 12, cleared: 80, total: 92 },
    { ae: 'Kim Huệ', active: 8, cleared: 45, total: 53 },
    ...
  ]
}
```

```
lead-distribution.service.ts
  ├─ Query A (groupBy source):
  │     SELECT COALESCE(source, 'Unknown') AS source, COUNT(*) FROM Lead
  │     WHERE receivedDate IN [from, to] GROUP BY source ORDER BY count DESC
  ├─ Sort, slice top N, sum tail → "Others"
  ├─ Query B (groupBy ae + status bucket):
  │     SELECT ae, status IN ('Q','UQ') AS isCleared, COUNT(*)
  │     FROM Lead WHERE receivedDate IN [from, to] GROUP BY ae, isCleared
  ├─ Pivot to active vs cleared per AE, sort by total
  └─ Return
```

## Related Code Files
**Create:**
- `server/routes/dashboard-lead-distribution.routes.ts`
- `server/services/dashboard/lead-distribution.service.ts`
- `server/types/lead-distribution.types.ts`

**Modify:**
- Server entry — register route.

**Read for context:**
- Phase 01 schema (Lead.source phải có sẵn)
- `dashboard-call-performance.routes.ts`

## Implementation Steps
1. Types: `LeadDistributionBySourceItem`, `LeadDistributionByAeItem`, `LeadDistributionResponse`.
2. Service:
   - Cache pattern giống lead-flow.
   - Query A: `prisma.lead.groupBy({ by: ['source'], _count: true, where: { receivedDate: { gte, lte } } })`.
   - Sort desc by count, top 8 (configurable via query param), sum tail vào `{ source: 'Others', count: tailSum }`. Source NULL → label 'Unknown'.
   - Query B: dùng `$queryRaw` cho 2-level groupBy hoặc 2 separate `groupBy` + merge:
     - Option đơn giản: `groupBy(['ae'])` rồi `groupBy(['ae'])` filter status closed → 2 maps, merge thành array.
   - Sort by `total` desc.
3. Route với zod validate `from`, `to`, `topSources` (default 8, max 20).
4. Register route.
5. Curl test cả 2 sub-object.

## Todo List
- [x] Types file
- [x] Service Query A + Others grouping
- [x] Service Query B + pivot active/cleared
- [x] Cache layer
- [x] Route + zod
- [x] Register route
- [x] Curl smoke test
- [x] Verify sum bySource = total inflow trong range

## Success Criteria
- `sum(bySource.count) === inflow` trong cùng range (nhất quán với lead-flow endpoint).
- Top sources khớp distribution thực CRM (`agency-create-business` thường top).
- AE list không có "Unmapped" (nếu Phase 03 đã nâng AE mapping).
- Response p95 < 400ms.

## Risk Assessment
| Risk | Mitigation |
|---|---|
| Source NULL chiếm % cao trước backfill (Phase 02) | Hiển thị 'Unknown' bucket; sau backfill sẽ giảm |
| AE name không chuẩn (vd ' Phuong Linh ' với space) | Trim trong service |
| `topSources` user truyền > số source thực | Slice an toàn, không cần error |

## Security Considerations
- Auth required.
- Zod validate `topSources` để tránh DoS với top=99999.

## Next Steps
- Phase 06 hooks consume endpoint này.
- Phase 08 components hiển thị.
