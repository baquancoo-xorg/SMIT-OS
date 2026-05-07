---
title: "Dashboard Sale Tab — Metrics Logic Revamp"
description: "Sửa logic AE identity, Per-AE Calls, Lead Flow & Clearance, thêm Lead Distribution by Source/AE và field Lead.source"
status: completed
priority: P1
effort: ~5h
branch: main
tags: [dashboard, sale-tab, lead-tracker, crm-sync, metrics]
created: 2026-05-07
completed: 2026-05-07
blockedBy: []
---

# Dashboard Sale Tab — Metrics Logic Revamp

## Context
- Brainstorm: [`../reports/brainstorm-260507-1604-dashboard-sale-tab-metrics-revamp.md`](../reports/brainstorm-260507-1604-dashboard-sale-tab-metrics-revamp.md)
- Scout: [`../reports/scout-260507-1325-dashboard-sale-tab.md`](../reports/scout-260507-1325-dashboard-sale-tab.md)
- Tiền đề (đã hoàn thành): [`../260429-1048-lead-sync-refactor-and-ae-mapping-fix/`](../260429-1048-lead-sync-refactor-and-ae-mapping-fix/) đã thiết lập CRM-direct AE mapping qua `smit_employee.lark_info`.
- Soft dependency: [`../260501-0051-resolved-date-auto-from-crm-activities/`](../260501-0051-resolved-date-auto-from-crm-activities/) — Phase 1+2 done, Phase 3 backfill pending. Plan này có thể implement song song nhưng dashboard data lịch sử chỉ chính xác khi Phase 3 (backfill resolvedDate) hoàn tất.

## Problem
Tab Sale Dashboard có 4 vùng logic chưa chuẩn:
1. **Per-AE Call Metrics**: AE identity ưu tiên SMIT OS thay vì CRM (thiếu AE), `Total Calls` lẫn cuộc gọi không link CRM gây nhiễu Calls/Lead.
2. **Lead Flow & Clearance — summary cards**: định nghĩa lệch với chart bên dưới, không tuân datepicker, công thức Clearance Rate sai bản chất.
3. **Lead Flow data fetching**: client tự fetch toàn bộ leads + tự compute → API filter theo 1 cột duy nhất gây undercount lead nhận trước kỳ nhưng cleared trong kỳ.
4. **Lead Distribution**: thiếu chart by Source và by AE Workload.

## Goals
- Per-AE table: AE identity = CRM source-of-truth, mọi metric chỉ tính call có `subscriberId`.
- Lead Flow & Clearance: 3 summary cards + 2 chart đồng nhất định nghĩa, Clearance Rate = `cleared / (cleared + active_backlog)`.
- Backend: endpoint `/api/dashboard/lead-flow` tính metric ở DB level, payload nhỏ, cache-able.
- Endpoint `/api/dashboard/lead-distribution` cấp data cho 2 chart mới.
- Lead model có field `source` sync từ `crm_subscribers.source`, backfill cho lead cũ.

## Phases

| # | Phase | Files | Status |
|---|---|---|---|
| 1 | [Schema + sync source field](./phase-01-schema-and-sync-source.md) | `prisma/schema.prisma`, `server/services/lead-sync/*` | completed |
| 2 | [Backfill source script](./phase-02-backfill-source-script.md) | `scripts/backfill-lead-source.ts` (new) | completed |
| 3 | [Revamp call-performance aggregators](./phase-03-revamp-call-performance-aggregators.md) | `call-performance.service.ts`, `call-performance-aggregators.ts` | completed |
| 4 | [Lead-flow endpoint + service](./phase-04-lead-flow-endpoint.md) | `dashboard-lead-flow.routes.ts`, `lead-flow.service.ts` (new) | completed |
| 5 | [Lead-distribution endpoint + service](./phase-05-lead-distribution-endpoint.md) | `dashboard-lead-distribution.routes.ts`, `lead-distribution.service.ts` (new) | completed |
| 6 | [Frontend hooks + types](./phase-06-frontend-hooks-and-types.md) | `use-lead-flow.ts`, `use-lead-distribution.ts`, types (new) | completed |
| 7 | [Dashboard-tab consume new endpoint](./phase-07-dashboard-tab-revamp.md) | `dashboard-tab.tsx` | completed |
| 8 | [Lead-distribution components](./phase-08-lead-distribution-components.md) | `lead-distribution/*` (new), wire vào Sale tab | completed |
| 9 | [Test + verify consistency](./phase-09-test-and-verify.md) | spot-check, type-check, manual e2e | completed |

## Key Dependencies
- CRM `smit_employee.lark_info` AE mapping (đã có từ plan 260429-1048).
- CRM `crm_subscribers.source` field — verified 98.4% coverage, 14 giá trị có ý nghĩa.
- `Lead.resolvedDate` được auto-fill (plan 260501-0051 done — Phase 3 backfill cần xong để metric lịch sử đúng).
- Recharts đã có (PieChart cho donut, BarChart cho horizontal stacked).

## Success Criteria
- [ ] Summary cards và Weekly Performance chart hiển thị **cùng** giá trị cho cùng datepicker.
- [ ] Per-AE table không còn dòng "Unmapped (CRM ID: X)" cho AE đã có trong CRM `smit_employee`.
- [ ] `Total Calls` = số call có subscriberId (verify spot-check 1 AE).
- [ ] Endpoint `/api/dashboard/lead-flow` p95 < 500ms cho range 30 ngày.
- [ ] 2 chart Lead Distribution (by Source, by AE Workload) render đúng top distribution với data thực.
- [ ] Backfill `Lead.source` chạy xong, NULL coverage < 5% trong các lead synced from CRM.
- [ ] Type-check pass, no compile errors.

## Risks
| Risk | Mitigation |
|---|---|
| Backfill source với hàng nghìn lead → lock DB | Batch 200 lead/iteration, có log progress |
| Active Backlog snapshot sai khi có lead chưa sync | Đảm bảo cron sync chạy trước; document caveat trong dashboard |
| AE đảo chiều mapping → tên hiển thị khác | UI vẫn link tới SMIT profile khi có; có thể rollback bằng env flag nếu cần |
| 14 source values → donut quá rối | Top 8 + "Others" group |
| Endpoint mới có bug → dashboard trống | Giữ logic cũ tạm thời ở client, feature flag bằng query param `?engine=v2` để rollback nhanh |

## Out of Scope
- UTM-level drill-down (`crm_subscribers_utm`) — coverage thấp, dirty, để pha sau.
- Conversion funnel chart (New → In Progress → Qualified) — có thể là plan riêng.
- Time-to-resolution histogram — plan riêng.
- Hourly inflow heatmap — plan riêng.

## Next Steps
- Implement theo thứ tự phase 1 → 9.
- Sau phase 5 (backend xong), có thể smoke-test API bằng curl trước khi vào FE.
- Sau phase 9, journal lại insight & cập nhật `docs/system-architecture.md` nếu cần.
