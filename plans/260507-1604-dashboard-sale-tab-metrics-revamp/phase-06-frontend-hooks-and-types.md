# Phase 06 — Frontend hooks + types

## Context Links
- Phases 04, 05 (backend endpoints)
- Mẫu hook: `src/hooks/use-call-performance.ts`

## Overview
- **Priority:** P1
- **Status:** completed
- **Effort:** ~30m
- Tạo 2 hook + types FE để consume `/api/dashboard/lead-flow` và `/api/dashboard/lead-distribution`.

## Key Insights
- Pattern hiện có: `useCallPerformance` dùng React Query với key `[entity, from, to]`, stale time vài phút.
- Types FE phản chiếu types BE — copy shape từ phase 04, 05.
- API client `src/lib/api.ts` có pattern fetch wrap sẵn.

## Requirements
- Stale time matching cache TTL backend (5 phút).
- Disable query nếu thiếu `from` hoặc `to`.
- Type-safe response.

## Architecture
```
src/hooks/use-lead-flow.ts
  useLeadFlow({ from, to }) → useQuery<LeadFlowResponse>

src/hooks/use-lead-distribution.ts
  useLeadDistribution({ from, to }) → useQuery<LeadDistributionResponse>

src/types/lead-flow.ts
src/types/lead-distribution.ts
```

## Related Code Files
**Create:**
- `src/hooks/use-lead-flow.ts`
- `src/hooks/use-lead-distribution.ts`
- `src/types/lead-flow.ts`
- `src/types/lead-distribution.ts`

**Modify:**
- `src/lib/api.ts` — thêm 2 method `getLeadFlow`, `getLeadDistribution` nếu chưa generic.

**Read for context:**
- `src/hooks/use-call-performance.ts`
- `src/lib/api.ts`
- `src/types/call-performance.ts`

## Implementation Steps
1. Types FE: copy interface từ BE types, tinh chỉnh nullable (`clearanceRate: number | null`).
2. `api.ts`: thêm
   - `getLeadFlow({ from, to }) => fetch('/api/dashboard/lead-flow?from=&to=')`
   - `getLeadDistribution({ from, to, topSources? }) => fetch(...)`
3. Hooks dùng React Query:
   ```
   useLeadFlow({ from, to }) {
     return useQuery({
       queryKey: ['lead-flow', from, to],
       queryFn: () => api.getLeadFlow({ from, to }),
       enabled: !!from && !!to,
       staleTime: 5 * 60 * 1000,
     });
   }
   ```
4. Tương tự `useLeadDistribution`.
5. Run `npx tsc --noEmit`.

## Todo List
- [x] Types files
- [x] api.ts methods
- [x] use-lead-flow hook
- [x] use-lead-distribution hook
- [x] Type-check pass

## Success Criteria
- Hooks compile, không lỗi type.
- React Query devtools (nếu có) thấy query keys mới khi component mount.

## Risk Assessment
| Risk | Mitigation |
|---|---|
| API contract drift giữa BE và FE | Đặt types BE và FE cùng tên field, chỉ copy mapping |
| Stale time quá dài → user sync xong vẫn thấy số cũ | 5min đủ ngắn; có thể dùng `refetch()` button sau này |

## Security Considerations
- Sử dụng `apiFetch` wrapper sẵn có (đã có cookie/session handling).

## Next Steps
- Phase 07 consume hook trong dashboard-tab.
- Phase 08 consume hook trong lead-distribution components.
