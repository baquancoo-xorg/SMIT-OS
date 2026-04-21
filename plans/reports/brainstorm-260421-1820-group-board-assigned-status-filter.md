# Brainstorm: Group Board Assigned + Status Filter

**Date:** 2026-04-21  
**Status:** Approved

## Problem Statement

Thêm 2 bộ lọc (Assigned, Status) vào 4 trang workspace group (TechBoard, MarketingBoard, MediaBoard, SaleBoard), đặt cạnh Sprint filter trong Stats bar. Cả 3 filter kết hợp AND, ảnh hưởng đến kanban view, stats counts, và table view.

## Requirements

- **Assigned filter**: Chỉ hiện member của dept tương ứng (ví dụ TechBoard chỉ hiện user có dept=Tech)
- **Status filter**: All / Todo / In Progress / Review / Done
- **Scope**: Cả 3 view — kanban board, stats counts, table view
- **Stats behavior**: Reflect tất cả filter đang active (sprint + assigned + status)
- **UI placement**: `[Sprint ▾] [Assigned ▾] [Status ▾]` trong Stats bar

## Approaches Evaluated

### A. Thêm thẳng vào 4 file
- Pro: Nhanh, ít risk
- Con: 4 boards đã 95% giống nhau → tăng duplication

### B. Extract `useGroupBoardFilters` hook ✅ **Chosen**
- Tạo `src/hooks/use-group-board-filters.ts`
- Encapsulate: sprint/status/assignee state, filteredItems, statsItems, assigneeOptions
- 4 boards dùng chung hook — DRY, maintainable

### C. Refactor `GroupBoardBase` component
- Over-scope, YAGNI — bỏ qua

## Solution Design

### Hook: `use-group-board-filters.ts`

```ts
useGroupBoardFilters({ dept: string, items: WorkItem[], sprints: Sprint[], users: User[] })
// Returns:
// - selectedSprintId, setSelectedSprintId
// - statusFilter, setStatusFilter  
// - assigneeFilter, setAssigneeFilter
// - sprintOptions, statusOptions, assigneeOptions
// - filteredItems (sprint + status + assignee)
// - statsItems (same as filteredItems for stats counts)
```

### Filter chain logic
```ts
filteredItems = items
  .filter(i => i.assignee?.departments?.includes(dept))  // dept filter (existing)
  .filter(i => !selectedSprintId || i.sprintId === selectedSprintId)
  .filter(i => statusFilter === 'All' || i.status === statusFilter)
  .filter(i => assigneeFilter === 'All' || i.assigneeId === assigneeFilter)
```

### Assignee options
```ts
assigneeOptions = [
  { value: 'All', label: 'All' },
  ...users.filter(u => u.departments?.includes(dept)).map(u => ({ value: u.id, label: u.name }))
]
```

### Bug fix
Table view hiện nhận `items` raw (bỏ qua sprint filter). Sau khi thêm hook, truyền `filteredItems` vào `TaskTableView`.

## Files to Modify

| File | Action |
|---|---|
| `src/hooks/use-group-board-filters.ts` | **Tạo mới** |
| `src/pages/TechBoard.tsx` | Dùng hook, thêm 2 CustomFilter, fix table view |
| `src/pages/MarketingBoard.tsx` | Như trên |
| `src/pages/MediaBoard.tsx` | Như trên |
| `src/pages/SaleBoard.tsx` | Như trên |

## Risks

- `users` từ `useAuth()` — cần verify context có expose `users` array với `departments` field
- Dept name phải match chính xác chuỗi trong `user.departments` array

## Success Criteria

- 2 filter xuất hiện cạnh Sprint filter trên cả 4 boards
- Chọn bất kỳ combo filter nào → kanban, stats, table đều update đồng bộ
- Assigned dropdown chỉ hiện member của dept board đó
- Stats counts reflect filter đang active
- Code không duplicate filter logic giữa 4 boards
