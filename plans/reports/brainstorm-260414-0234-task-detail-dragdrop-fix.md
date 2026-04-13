# Brainstorm: Fix Task Details Modal & Kanban Drag-Drop

**Date:** 2026-04-14
**Status:** Approved for implementation

---

## Problem Statement

### Bug 1: View Details - Trang trắng (React Crash)
- **Symptom:** Click "View Details" trong TaskCard menu → trang trắng, không hiển thị gì
- **Root Cause:** Vi phạm React Hooks Rules trong `TaskDetailsModal.tsx`
- **Location:** `src/components/board/TaskDetailsModal.tsx:17-35`

```tsx
// ❌ Current code - WRONG
if (!isOpen || !task) return null;  // Line 17 - early return

useEffect(() => { ... }, []);  // Line 22 - hook AFTER early return
```

React requires hooks to be called in same order every render. Early return before hooks causes crash.

### Bug 2: Kanban Drag không drop được vào column khác  
- **Symptom:** Kéo card được nhưng thả vào column khác không hoạt động
- **Root Cause:** Columns chỉ có `SortableContext`, không có `useDroppable`
- **Location:** All board pages (TechBoard, MarketingBoard, SaleBoard, MediaBoard)

---

## Proposed Solution

### Fix 1: TaskDetailsModal Hooks Order

Move `useEffect` BEFORE early return, add guard inside:

```tsx
// ✅ Correct pattern
const [allObjectives, setAllObjectives] = useState<Objective[]>([]);

useEffect(() => {
  if (!isOpen) return;  // Guard inside hook
  const fetchObjectives = async () => { ... };
  fetchObjectives();
}, [isOpen]);

if (!isOpen || !task) return null;  // Early return AFTER hooks
```

**Files:** 1 file
- `src/components/board/TaskDetailsModal.tsx`

### Fix 2: Add DroppableColumn Component

Create wrapper component with `useDroppable` for columns:

```tsx
// New component: DroppableColumn.tsx
import { useDroppable } from '@dnd-kit/core';

interface DroppableColumnProps {
  id: string;
  children: React.ReactNode;
}

export function DroppableColumn({ id, children }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  
  return (
    <div ref={setNodeRef} className={isOver ? 'ring-2 ring-primary' : ''}>
      {children}
    </div>
  );
}
```

**Files:** 5 files
- `src/components/board/DroppableColumn.tsx` (new)
- `src/pages/TechBoard.tsx`
- `src/pages/MarketingBoard.tsx`
- `src/pages/SaleBoard.tsx`
- `src/pages/MediaBoard.tsx`

---

## Complexity Assessment

| Task | Complexity | Est. Time |
|------|-----------|-----------|
| Fix hooks order | Low | 5 min |
| Create DroppableColumn | Low | 5 min |
| Update 4 boards | Low | 10 min |
| **Total** | **Low** | **~20 min** |

---

## Risk Assessment

- **Risk Level:** Low
- **Breaking Changes:** None
- **Backward Compatibility:** Maintained

---

## Success Criteria

1. View Details modal opens without crash
2. Cards can be dragged and dropped between columns
3. Status updates persist after page refresh
4. No console errors

---

## Next Steps

Proceed with `/ck:plan` to create implementation phases.
