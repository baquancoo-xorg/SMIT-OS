# Phase 2: Add DroppableColumn Component

## Context

- **Problem:** Columns only have `SortableContext`, no `useDroppable` - cards can't drop into columns
- **Solution:** Create `DroppableColumn` wrapper with `useDroppable` hook
- **Effort:** 15 minutes

## Step 1: Create DroppableColumn Component

**New file:** `src/components/board/droppable-column.tsx`

```tsx
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface DroppableColumnProps {
  id: string;
  items: string[];
  children: React.ReactNode;
  className?: string;
}

export function DroppableColumn({ id, items, children, className = '' }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef} 
      className={`${className} ${isOver ? 'ring-2 ring-primary/50 bg-primary/5' : ''} transition-all duration-200`}
    >
      <SortableContext
        id={id}
        items={items}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </div>
  );
}
```

## Step 2: Update Board Pages

Apply same pattern to all 4 boards:

### Before (in each board)

```tsx
<SortableContext
  id={col}
  items={columnItems.map(i => i.id)}
  strategy={verticalListSortingStrategy}
>
  <div className="flex-1 p-3 space-y-4 overflow-y-auto custom-scrollbar">
    {columnItems.map(item => (
      <DraggableTaskCard ... />
    ))}
  </div>
</SortableContext>
```

### After

```tsx
import { DroppableColumn } from '../components/board/droppable-column';

// In JSX:
<DroppableColumn
  id={col}
  items={columnItems.map(i => i.id)}
  className="flex-1 p-3 space-y-4 overflow-y-auto custom-scrollbar min-h-[200px]"
>
  {columnItems.map(item => (
    <DraggableTaskCard ... />
  ))}
  {columnItems.length === 0 && (
    <div className="h-32 border-2 border-dashed ...">...</div>
  )}
</DroppableColumn>
```

## Files to Update

| File | Action |
|------|--------|
| `src/components/board/droppable-column.tsx` | CREATE |
| `src/pages/TechBoard.tsx` | UPDATE - import + replace SortableContext |
| `src/pages/MarketingBoard.tsx` | UPDATE - import + replace SortableContext |
| `src/pages/SaleBoard.tsx` | UPDATE - import + replace SortableContext |
| `src/pages/MediaBoard.tsx` | UPDATE - import + replace SortableContext |

## Implementation Checklist

### Create Component
- [ ] Create `src/components/board/droppable-column.tsx`
- [ ] Export `DroppableColumn` component

### Update TechBoard
- [ ] Add import for `DroppableColumn`
- [ ] Replace column `SortableContext` with `DroppableColumn`
- [ ] Test drag-drop between columns

### Update MarketingBoard
- [ ] Add import for `DroppableColumn`
- [ ] Replace column `SortableContext` with `DroppableColumn`

### Update SaleBoard
- [ ] Add import for `DroppableColumn`
- [ ] Replace column `SortableContext` with `DroppableColumn`

### Update MediaBoard
- [ ] Add import for `DroppableColumn`
- [ ] Replace column `SortableContext` with `DroppableColumn`

## Verification

```bash
# Test each board:
# 1. Go to Tech Workspace
# 2. Drag a card from "To Do" column
# 3. Drop into "In Progress" column
# 4. Verify: Card moves, visual feedback appears
# 5. Refresh page - status should persist
# 6. Repeat for Marketing, Sale, Media boards
```

## Visual Feedback

When dragging over a column:
- Ring border appears (`ring-2 ring-primary/50`)
- Background tints (`bg-primary/5`)
- Smooth transition (200ms)

## Notes

- `useDroppable` makes element a valid drop target
- `SortableContext` inside handles item ordering
- Both work together for full drag-drop experience
- Backlog column already uses similar pattern (keep as-is)
