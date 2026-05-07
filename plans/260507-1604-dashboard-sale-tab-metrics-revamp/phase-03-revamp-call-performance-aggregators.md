# Phase 03 — Revamp call-performance: AE CRM-first + CRM-linked-only

## Context Links
- Brainstorm § Decisions #1, #2, #3
- Current files: `server/services/dashboard/call-performance.service.ts`, `call-performance-aggregators.ts`

## Overview
- **Priority:** P1
- **Status:** completed
- **Effort:** ~45m
- Đảo chiều employee map (CRM trước, SMIT enrichment sau), siết Per-AE metrics chỉ tính call có `subscriberId`.

## Key Insights
- Hiện tại `loadEmployeeMap()` (từ lead-sync) load CRM `smit_employee` trước và `loadCrmEmployeeNameMap` (trong service) chỉ fallback. Logic gần đúng nhưng `mergedEmployeeMap` dùng `if (!mergedEmployeeMap.has(employeeUserId))` — ưu tiên SMIT/lead-sync map. Cần đảo: ưu tiên CRM employee name, SMIT user chỉ cho ID enrichment.
- Heatmap, Conversion, Trend giữ nguyên — chỉ Per-AE aggregator thay đổi semantics.
- `Total Calls`, `Answered`, `Avg Duration` cũng chỉ tính call có `subscriberId` (consistent với cột Leads Called và Calls/Lead).
- `Conversion` aggregator hiện đã chỉ tính call có `subscriberId` (đã có `if (call.subscriberId === null) continue`) → giữ nguyên.

## Requirements
- AE name luôn lấy từ CRM `lark_info.name` nếu có, không fallback sang SMIT user name.
- Cuộc gọi không có `subscriberId` không xuất hiện trong bảng Per-AE (kể cả `Total Calls`).
- `aggregateHeatmap` và `aggregateTrend` giữ nguyên (đếm tất cả call để biểu đồ phân bổ vẫn đầy đủ).
- Backward-compatible API response shape (không đổi schema).

## Architecture
```
getCallPerformance(from, to, aeId?)
  ├─ Fetch crm_call_history rows
  ├─ Build crmEmployeeNameMap (CRM smit_employee.lark_info)  ← source of truth
  ├─ Build smitUserMap = loadEmployeeMap() (SMIT-OS users)   ← enrichment only
  ├─ mergedMap = crmEmployeeNameMap (primary)
  │     for each entry in smitUserMap:
  │       if mergedMap has key → keep CRM name, attach SMIT id for link
  │       else → use SMIT entry as-is
  ├─ aggregatePerAe(crmLinkedCalls, mergedMap)  ← FILTER subscriberId !== null
  ├─ aggregateHeatmap(allCalls)
  ├─ aggregateConversion(crmLinkedCalls, mergedMap, statusMap)
  └─ aggregateTrend(allCalls)
```

## Related Code Files
**Modify:**
- `server/services/dashboard/call-performance.service.ts` — đảo merge order; tách `crmLinkedCalls`.
- `server/services/dashboard/call-performance-aggregators.ts` — `aggregatePerAe` chỉ nhận crm-linked calls.

**Read for context:**
- `server/types/call-performance.types.ts`
- Brainstorm doc

## Implementation Steps
1. Trong `call-performance.service.ts`:
   - Sau khi có `calls`, tạo `crmLinkedCalls = calls.filter(c => c.subscriberId !== null)`.
   - Refactor `mergedEmployeeMap`: bắt đầu từ `crmEmployeeNameMap`, merge SMIT chỉ để add `id` (không override name). Logic mới:
     ```
     for (const [uid, smitEmp] of employeeMap.entries()) {
       const existing = mergedEmployeeMap.get(uid);
       if (existing) mergedEmployeeMap.set(uid, { ...existing, id: smitEmp.id });
       else mergedEmployeeMap.set(uid, smitEmp);
     }
     ```
   - Pass `crmLinkedCalls` vào `aggregatePerAe`.
   - Pass `calls` (full) vào `aggregateHeatmap` + `aggregateTrend`.
   - `aggregateConversion` đã filter subscriberId trong logic → giữ pass `calls`.
2. Trong `call-performance-aggregators.ts`:
   - `aggregatePerAe` không cần đổi (chỉ nhận đúng input đã filter).
   - Optional: thêm comment ghi rõ "expects CRM-linked calls only".
3. Run `npx tsc --noEmit`.
4. Manual test: hit `/api/dashboard/call-performance?from=...&to=...` → kiểm tra `perAe[].totalCalls` ≤ `perAe[].leadsCalled × callsPerLead` trước/sau.
5. Spot-check: 1 AE có nhiều call ngoài CRM (subscriber null) → confirm `Total Calls` giảm đúng số đó.

## Todo List
- [x] Đảo merge order CRM-first trong service
- [x] Tách `crmLinkedCalls` filter
- [x] Pass đúng calls cho từng aggregator
- [x] Type-check pass
- [x] Spot-check 1 AE before/after
- [x] Verify Heatmap/Trend không đổi (full call count)

## Success Criteria
- AE name trong response = CRM `lark_info.name` cho mọi AE có trong `smit_employee`.
- Per-AE `totalCalls` giảm hoặc bằng (không tăng) so với trước.
- `aeUserId` cho AE có cả CRM + SMIT mapping = SMIT user id (cho FE link tới profile).
- Heatmap tổng count giữ nguyên (sanity check).

## Risk Assessment
| Risk | Mitigation |
|---|---|
| Cache cũ phản hồi giá trị cũ → confused trong dev | Restart server hoặc clear cache (`CACHE_TTL_MS = 5min`); short TTL nên ít vấn đề |
| AE đã quen thấy "Unmapped (CRM ID: X)" → giờ đột ngột đổi tên | Đây là intent — nâng chất lượng data |
| `lark_info` employee inactive bỏ qua → mất AE | Chỉ filter `is_active = true` trong CRM employee load — đã đúng |

## Security Considerations
- Không thay đổi auth surface, chỉ logic aggregator.
- Read-only.

## Next Steps
- Phase 04, 05 độc lập với phase này, có thể song song.
