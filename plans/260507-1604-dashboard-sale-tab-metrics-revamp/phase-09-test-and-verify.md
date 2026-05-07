# Phase 09 — Test + verify consistency

## Context Links
- All previous phases (01–08).
- Brainstorm § Success Metrics.

## Overview
- **Priority:** P1
- **Status:** completed
- **Effort:** ~30m
- Smoke test toàn bộ Sale tab, verify nhất quán giữa các metric, type-check toàn project, fix nếu có gap.

## Key Insights
- Đây là phase cuối "merge" — đảm bảo các phase độc lập trước đó hoạt động cùng nhau.
- Kiểm tra invariant: summary card = sum daily series; bySource sum = inflow; AE active+cleared sum tách đúng.
- Không cần unit test mới — codebase chưa có test framework đầy đủ; smoke test thủ công + type-check là đủ ở giai đoạn này.

## Requirements
- Tất cả endpoint mới trả 200, JSON shape đúng.
- UI render không lỗi, datepicker đổi → tất cả refetch.
- TypeScript compile pass toàn project.
- Type-check pass.

## Verification Checklist

### Backend
- [ ] `GET /api/dashboard/lead-flow?from=2026-04-01&to=2026-05-07` → 200, đủ summary + daily.
- [ ] `summary.inflow === sum(daily.inflow)`.
- [ ] `summary.cleared === sum(daily.cleared)`.
- [ ] `summary.activeBacklog === daily[last].activeBacklog`.
- [ ] `summary.clearanceRate ∈ [0, 100]` hoặc `null` khi `cleared + activeBacklog = 0`.
- [ ] `GET /api/dashboard/lead-distribution?from=...&to=...` → 200, có `bySource` + `byAe`.
- [ ] `sum(bySource.count) === lead-flow.summary.inflow` (cùng range).
- [ ] AE list không có "Unmapped (CRM ID: X)" cho AE đã có trong CRM `smit_employee`.
- [ ] `GET /api/dashboard/call-performance?from=...&to=...` → AE name đúng theo CRM, totalCalls không có call subscriberId null.

### Frontend
- [ ] Tab Sale render đủ 3 section: Call Performance, Lead Flow & Clearance, Lead Distribution.
- [ ] Đổi datepicker → tất cả 3 section refetch.
- [ ] 4 KPI cards Lead Flow đồng nhất với Weekly Performance bar (sum daily = summary).
- [ ] Backlog Trend cuối kỳ = Active Backlog summary card.
- [ ] Donut Source: top 8 + Others, tooltip có count + %.
- [ ] AE Workload bar: sort desc, stacked Active vs Cleared.
- [ ] Loading spinner + error panel hoạt động khi disconnect dev server.
- [ ] Console không error/warning lạ.

### Type Check
- [ ] `npx tsc --noEmit` pass cho toàn project (BE + FE).

### Spot Checks (data correctness)
- [ ] 1 AE cụ thể (vd "Phương Linh"): Per-AE row khớp manual count CRM `crm_call_history WHERE employee_user_id = X AND subscriber_id IS NOT NULL`.
- [ ] 1 ngày cụ thể: `daily[d].cleared` khớp manual `SELECT COUNT(*) FROM Lead WHERE DATE(resolvedDate AT TIME ZONE 'Asia/Ho_Chi_Minh') = d AND status IN ('Qualified','Unqualified')`.
- [ ] 1 source cụ thể: `bySource.find(s => s.source === 'agency-create-business').count` khớp manual count Lead.

## Related Code Files
**Read for verification:**
- All phase outputs.
- `prisma/schema.prisma`
- `prisma/crm-schema.prisma`

## Implementation Steps
1. Start dev server, hit từng endpoint qua curl, save output.
2. Compare invariants từ checklist trên.
3. Mở browser, test datepicker với 3 range: 7d, 30d, 90d.
4. Spot check 1 AE, 1 ngày, 1 source bằng psql vs response.
5. Run `npx tsc --noEmit` sau mỗi commit lớn.
6. Nếu gap nào fail → quay lại phase tương ứng fix, không patch tại Phase 09.

## Todo List
- [x] Backend smoke (3 endpoint)
- [x] Backend invariants check
- [x] Frontend visual check Sale tab
- [x] Datepicker switch behavior
- [x] Type-check pass
- [x] 3 spot checks data correctness
- [x] Fix gaps (nếu có) ở phase tương ứng

## Success Criteria
- Mọi mục checklist pass.
- Không có console error trong browser.
- Type-check clean.

## Risk Assessment
| Risk | Mitigation |
|---|---|
| Phát hiện logic sai sâu (vd timezone) | Isolate ở phase 04/05 fix, re-run verify |
| Data quá ít trong dev DB → không edge case | Test với production data nếu có quyền read-only |

## Security Considerations
- Không expose endpoint chưa auth ra public.
- Verify auth middleware đã wrap đủ 3 endpoint dashboard mới.

## Next Steps
- Update plan.md status → completed.
- Cập nhật `docs/system-architecture.md` nếu có endpoint/data flow mới đáng note.
- Update `docs/project-changelog.md` với entry mới.
- Run `/ck:journal` để ghi lại insight.
