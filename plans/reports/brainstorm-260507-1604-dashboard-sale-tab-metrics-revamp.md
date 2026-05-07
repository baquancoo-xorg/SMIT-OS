# Brainstorm: Dashboard Sale Tab — Metrics Logic Revamp

**Date:** 2026-05-07 16:04
**Status:** DONE — design agreed, ready for plan

## Problem Statement

Tab Sale của Dashboard có 4 bảng/khu vực với logic tính chưa nhất quán hoặc chưa chuẩn:

1. **Per-AE Call Metrics** — AE identity ưu tiên SMIT OS thay vì CRM (thiếu AE), `Total Calls` và `Calls/Lead` lẫn cuộc gọi không link CRM.
2. **Call Distribution Heatmap** — logic OK, giữ nguyên.
3. **Call-to-Status Conversion** — logic OK, giữ nguyên (lưu ý dùng status hiện tại của subscriber, không phải status tại thời điểm call).
4. **Lead Flow & Clearance** — summary cards lệch định nghĩa với chart, công thức clearance rate sai bản chất, không tuân datepicker đầy đủ.
5. **Lead Distribution** — thiếu chart hữu ích cho team Sale/Marketing.

## Decisions

### 1. AE identity (Per-AE Call Metrics + Conversion table)

- Source-of-truth = CRM `smit_employee.lark_info` (`name` → `enterprise_email` → `email`).
- SMIT OS user map chỉ enrichment hiển thị (avatar, link profile), không định danh.
- Đảo chiều logic hiện tại trong `aggregatePerAe` / `aggregateConversion`.

### 2. Per-AE Call Metrics

- `Total Calls` = chỉ call có `subscriberId` (CRM-linked).
- `Answered`, `Answer Rate`, `Avg Duration` áp dụng trên cùng tập CRM-linked.
- `Leads Called` = số subscriber duy nhất có call trong kỳ (giữ nguyên).
- `Calls / Lead` = `Total Calls (CRM-linked) / Leads Called`.

### 3. Call-to-Status Conversion

- Giữ nguyên logic. Lưu ý cho user: status dùng là status hiện tại của subscriber (không phải tại thời điểm call). Chỉ tính lead đã close (mql_qualified hoặc mql_unqualified).

### 4. Heatmap

- Giữ nguyên — count call theo (day-of-week × hour) ở Asia/Ho_Chi_Minh, color scale tương đối theo max.

### 5. Lead Flow & Clearance — summary cards (định nghĩa mới)

Tất cả tuân filter datepicker `[dateFrom, dateTo]`:

- **Inflow** = lead có `receivedDate ∈ [dateFrom, dateTo]`.
- **Cleared** = lead có `resolvedDate ∈ [dateFrom, dateTo]` AND `status ∈ {Qualified, Unqualified}`.
- **Active Backlog** = snapshot tại `dateTo`: `receivedDate ≤ dateTo` AND (status không close OR `resolvedDate > dateTo`).
- **Clearance Rate** = `cleared / (cleared + active_backlog) × 100%`. Edge case: cả 2 = 0 → hiển thị `—`.

Note: Inflow và Active Backlog có thể overlap (lead nhận trong kỳ và còn pending cuối kỳ thuộc cả hai). Đây là hành vi đúng — 2 metric đo 2 thứ khác nhau.

### 6. Lead Flow & Clearance — chart logic

- **Weekly Performance bar**: inflow theo `receivedDate-of-day`, cleared theo `resolvedDate-of-day`, active backlog theo end-of-day snapshot. Tuân datepicker.
- **Backlog Trend line**: end-of-day backlog cho mỗi ngày trong kỳ.

### 7. Backend — endpoint dashboard riêng

Tạo `GET /api/dashboard/lead-flow?from=&to=` trả:

```
{
  summary: { inflow, cleared, activeBacklog, clearanceRate },
  daily: [{ date, inflow, cleared, activeBacklog }],
}
```

Lý do chọn phương án này thay vì mở rộng `getLeads`:

- Tính metric ở DB level → đúng cho lead nhận trước kỳ, cleared sau kỳ.
- Giảm payload về client (vài trăm KB → vài KB).
- Cache-able theo `(from, to)`.
- Frontend không cần fetch toàn bộ leads, không cần tự compute backlog trên client.

### 8. Lead Distribution — 2 chart mới

- **Leads by Source (donut)**: dùng `crm_subscribers.source` làm field nguồn. Top 8 + "Others". Toggle theo datepicker.
- **Leads by AE / Workload (horizontal bar)**: bar stack 2 màu (Active vs Cleared), sắp theo total desc. Dùng field `lead.ae` đã có.

### 9. Field `source` mới trên Lead

- Add `source String?` vào schema Lead (`prisma/schema.prisma`).
- Sync from `crm_subscribers.source` trong `crm-lead-sync.service.ts`.
- Backfill script cho lead cũ.

## CRM DB Findings (cho field source)

`crm_subscribers.source`: coverage 98.4% (NULL 95/6047), 14 giá trị có ý nghĩa, đã chuẩn hóa. Top values: `agency-create-business` (3524), `original-website` (1763), `countdown-agency` (537), `agency-demo` (80), `marketing-social-media` (15), `pricing-agency` (12), `marketing-paid-ads` (9), …

`crm_subscribers_utm`: coverage 15%, dirty (`Home`/`fb`/`Facebook`/`Faceboookads` không chuẩn hóa) → không dùng làm primary, có thể drill-down `utm_campaign` sau này.

## Files Affected (preview)

**Backend:**
- `server/services/dashboard/call-performance.service.ts` — đảo chiều load CRM employee map trước, lọc CRM-linked calls.
- `server/services/dashboard/call-performance-aggregators.ts` — `aggregatePerAe` siết theo `subscriberId !== null` cho `totalCalls` và các metric phụ.
- `server/routes/dashboard-lead-flow.routes.ts` (mới).
- `server/services/dashboard/lead-flow.service.ts` (mới) — query Postgres SMIT-OS, tính summary + daily series.
- `server/services/dashboard/lead-distribution.service.ts` (mới) — aggregate theo source + AE.
- `prisma/schema.prisma` — thêm `Lead.source`.
- `server/services/lead-sync/crm-lead-sync.service.ts` — copy `source`.
- `scripts/backfill-lead-source.ts` (mới).

**Frontend:**
- `src/components/lead-tracker/dashboard-tab.tsx` — thay self-compute bằng hook gọi `/api/dashboard/lead-flow`.
- `src/components/dashboard/lead-distribution/` (mới) — `lead-distribution-by-source.tsx`, `lead-distribution-by-ae.tsx`, `lead-distribution-section.tsx`.
- `src/components/dashboard/call-performance/call-performance-ae-table.tsx` — không đổi UI, chỉ tiêu thụ data đã sửa.
- `src/hooks/use-lead-flow.ts`, `src/hooks/use-lead-distribution.ts` (mới).
- `src/types/lead-flow.ts`, `src/types/lead-distribution.ts` (mới).

## Risks

- **Backfill source**: với ~hàng nghìn lead, cần batch tránh lock CRM/SMIT DB.
- **Active Backlog snapshot** chỉ chính xác khi backend có toàn bộ lịch sử lead — nếu có lead chưa sync từ CRM về SMIT-OS sẽ undercount. Cần đảm bảo cron sync chạy đều trước khi user xem dashboard.
- **AE đảo chiều**: có rủi ro thay đổi tên hiển thị của một số AE quen mắt → giải pháp: khi cùng employee_user_id có cả CRM name và SMIT user mapped, ưu tiên CRM name nhưng vẫn link tới SMIT profile. Có thể dùng feature flag để rollback nếu cần.
- **Donut "Leads by Source"**: 14 giá trị raw → top 8 + "Others" để biểu đồ readable. Cần thiết kế label tương ứng UI.

## Success Metrics

- Summary cards và bar chart trong Lead Flow & Clearance hiển thị **cùng** giá trị cho cùng datepicker.
- Per-AE table không còn dòng "Unmapped (CRM ID: X)" cho các AE đã có trong CRM.
- `Total Calls` = số call có subscriberId (verify với spot-check 1 AE).
- 2 chart Lead Distribution mới render đúng top distribution với data thực.
- Endpoint `/api/dashboard/lead-flow` p95 latency < 500ms cho range 30 ngày.

## Open Questions (đã clear)

Không còn — tất cả các điểm đã được user confirm.

## Next Steps

User chọn:
1. Chuyển sang `/ck:plan` để lên implementation plan chi tiết theo phase.
2. Hoặc end session, implement sau.
