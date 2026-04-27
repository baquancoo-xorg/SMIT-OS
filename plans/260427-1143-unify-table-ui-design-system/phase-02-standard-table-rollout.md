# Phase 02 — Standard Table Rollout

## Context Links
- Overview plan: `./plan.md`
- Foundation phase: `./phase-01-table-design-foundation.md`

## Overview
- Priority: P1
- Status: completed
- Goal: Migrate toàn bộ bảng nghiệp vụ (không dense analytics) sang standard table contract.

## Scope Buckets
1. Workspace/Product/Task tables
2. Lead/Report operational tables
3. Settings/Workspace Setting tables
4. Modal embedded tables

## Related Code Files
### Modify (primary)
- `src/components/board/TaskTableView.tsx`
- `src/components/board/ReportTableView.tsx`
- `src/pages/ProductBacklog.tsx`
- `src/pages/DailySync.tsx`
- `src/components/lead-tracker/lead-logs-tab.tsx`
- `src/components/lead-tracker/daily-stats-tab.tsx`
- `src/components/settings/user-management-tab.tsx`
- `src/components/settings/fb-config-tab.tsx`
- `src/components/settings/sprint-cycles-tab.tsx`
- `src/components/settings/okr-cycles-tab.tsx`
- `src/components/modals/ReportDetailDialog.tsx`
- `src/components/modals/WeeklyCheckinModal.tsx`
- `src/components/daily-report/components/AdHocTasksSection.tsx`

### Optional follow-ups
- `src/pages/Settings.tsx` (verify container consistency only)

## Implementation Steps
1. Migrate bucket 1 (workspace/product/task):
   - dùng `table-shell` standard.
   - enforce actions column contract.
2. Migrate bucket 2 (lead/report):
   - giữ behavior role gating hiện tại.
   - chuẩn hóa date/time theo helper.
3. Migrate bucket 3 (settings):
   - đồng bộ typography/header/container.
   - không đổi workflow CRUD.
4. Migrate bucket 4 (modals):
   - áp dụng contract ở mức hợp lý theo modal constraints.
5. Sau mỗi bucket:
   - compile check
   - spot-check UI regression.

## Todo List
- [x] Bucket 1 migrated
- [x] Bucket 2 migrated
- [x] Bucket 3 migrated
- [x] Bucket 4 migrated
- [x] Actions header/cell contract verified on all standard tables
- [x] Date/time format contract verified on all standard tables

## Acceptance Checklist
- [x] Không còn table header bị thiếu/blank actions header.
- [x] Font size/weight và row spacing đồng nhất trong standard variant.
- [ ] Empty/loading states đồng bộ visual language. *(user visual QA pending — non-blocker)*
- [x] Click handlers/edit/delete/view behavior không đổi.

## Risks
- Chạm nhiều file dễ phát sinh conflict với thay đổi feature song song.
- Một số bảng có logic custom class inline khó gom nhanh.

## Mitigation
- Rollout theo buckets nhỏ, không merge tất cả cùng lúc.
- Ưu tiên các bảng đang có churn thấp trước.

## Next Steps
- Proceed to phase 03 for dense analytics table migration and final validation.

## Execution Notes (2026-04-27)
- Completed migration for all listed standard-table files in this phase, including modal embedded tables:
  - `src/components/modals/WeeklyCheckinModal.tsx`
  - `src/components/modals/ReportDetailDialog.tsx`
- Validation executed:
  - `npm run lint` passed.
  - Reviewer noted a pre-existing shallow state mutation pattern in `WeeklyCheckinModal` KR update handlers (not introduced by this phase).
