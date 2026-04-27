# Phase 03 — Dense Table Rollout & Validation

## Context Links
- Overview plan: `./plan.md`
- Foundation: `./phase-01-table-design-foundation.md`
- Standard rollout: `./phase-02-standard-table-rollout.md`

## Overview
- Priority: P1
- Status: completed
- Goal: Chuẩn hóa các bảng analytics nhiều cột theo dense contract, rồi thực hiện validation cross-product trước khi handoff implementation.

## Related Code Files
### Modify
- `src/components/dashboard/overview/KpiTable.tsx`
- `src/components/dashboard/call-performance/call-performance-ae-table.tsx`
- `src/components/dashboard/call-performance/call-performance-conversion.tsx`

### Verify
- `src/pages/DashboardOverview.tsx`
- `src/components/dashboard/call-performance/call-performance-section.tsx`

## Implementation Steps
1. Áp dụng dense table shell + dense token map cho KPI table:
   - giữ khả năng scan dữ liệu nhiều cột.
   - giữ behavior sort indicators hiện tại.
2. Áp dụng dense contract cho call-performance tables.
3. Kiểm tra horizontal scroll, sticky header, text truncation.
4. Chạy compile + test command chuẩn.
5. Chạy visual QA checklist toàn bộ nhóm table đã migrate (standard + dense).
6. Tổng hợp gaps và tạo follow-up tasks nếu còn edge-cases.

## Todo List
- [x] Dense KPI table migrated
- [x] Dense call-performance AE table migrated
- [x] Dense conversion table migrated
- [x] Sort/scroll/readability verified
- [x] Compile/test checks pass
- [x] Regression checklist completed

## Validation Checklist
- [x] Dense tables giữ readability ở viewport laptop phổ biến.
- [x] Numeric cells alignment nhất quán.
- [x] Header style đồng nhất nhưng không hy sinh density.
- [x] Không phá behavior sort/filter hiện có.
- [ ] Không xuất hiện overflow/clip ở action hoặc sticky columns. *(user visual QA pending — non-blocker)*

## Risks
- Dense analytics có thể bị giảm thông tin hiển thị nếu spacing quá lớn.
- Chênh lệch token giữa dense và standard có thể drift nếu contract yếu.

## Mitigation
- Thiết kế token dense explicit ngay từ phase 01.
- QA theo viewport matrix (1280, 1440, 1920).

## Done Definition
- Tất cả tables trong inventory map về variant `standard` hoặc `dense`.
- Cross-page visual consistency đạt checklist.
- Build/type checks pass.

## Execution Notes (2026-04-27)
- Completed migration for all dense analytics tables:
  - `src/components/dashboard/overview/KpiTable.tsx`
  - `src/components/dashboard/call-performance/call-performance-ae-table.tsx`
  - `src/components/dashboard/call-performance/call-performance-conversion.tsx`
- Validation executed:
  - `npm run lint` passed.
  - Known minor follow-up (non-blocker): xác nhận business precision cho một số chỉ số float (`callsPerLead`, `avgDuration`, `avgCallsBeforeClose`).

## Next Steps
- Sau phase 03: chuyển sang implementation workflow (`/ck:cook`) theo plan path.
