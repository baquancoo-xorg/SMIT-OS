# Phase 01 — Table Design Foundation

## Context Links
- Overview plan: `./plan.md`
- Related completed action standardization: `../260427-0258-standardize-table-action-ui/plan.md`

## Overview
- Priority: P1
- Status: completed
- Goal: Thiết lập table design tokens + shared primitives để mọi table migrate về 1 chuẩn mà không copy class trùng lặp.

## Requirements
- Tạo table style contract dùng chung cho 2 variants: `standard`, `dense`.
- Chuẩn hóa header typography, cell spacing, row hover, container shell, actions column classes.
- Tạo helpers format date/time display contract cho table-level rendering.

## Related Code Files
### Modify
- `src/components/ui/table-row-actions.tsx`
- `src/components/board/TaskTableView.tsx`
- `src/components/dashboard/overview/KpiTable.tsx`
- `src/components/dashboard/overview/kpi-table-utils.ts`

### Create
- `src/components/ui/table-shell.tsx`
- `src/components/ui/table-contract.ts`
- `src/components/ui/table-date-format.ts`

## Implementation Steps
1. Tạo `table-contract.ts` với class/token map cho shell/header/body/row/actions/empty state trên 2 variants.
2. Tạo `table-shell.tsx` nhận props `variant` để render container + scroll wrapper + `<table>` shell theo contract.
3. Tạo `table-date-format.ts` để chuẩn hóa formatter cho date-only và date-time.
4. Update `TableRowActions` để nhận `variant` và compact behavior cho dense table.
5. Pilot integration:
   - `src/components/board/TaskTableView.tsx` (standard): dùng `TableShell`, `getTableContract('standard')`, action header `Actions`, date formatter helper.
   - `src/components/dashboard/overview/KpiTable.tsx` + `kpi-table-utils.ts` (dense): map dense contract styles, giữ sort/scroll behavior cũ, remove `trials` khỏi `SortField`, dùng date formatter helper.

## Todo List
- [x] Add shared table contract tokens
- [x] Add shared table shell component
- [x] Add shared date/time formatter helpers
- [x] Integrate pilot standard table
- [x] Integrate pilot dense table
- [x] Compile check (`npm run lint`) + test gate (`npm run test`) via delegated tester/reviewer workflow
- [ ] UI visual verification (user tự thực hiện theo yêu cầu)

## Success Criteria
- Có shared primitive dùng lại được cho cả standard và dense tables.
- Pilot 2 bảng dùng contract mới mà không đổi business behavior.
- Không duplicate class string lớn ở pilot files.

## Risks
- Dense table có quá nhiều cột, contract overly rigid có thể làm giảm readability.
- Nếu token map quá phức tạp sẽ vi phạm KISS.

## Security Considerations
- Frontend-only; không thay đổi data path.

## Next Steps
- Chuyển Phase 02: migrate toàn bộ standard tables theo module waves.
