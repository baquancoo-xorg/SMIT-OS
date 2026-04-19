# Phase 5: Table & Kanban Optimization

## Overview
- **Priority:** Medium
- **Status:** pending
- **Estimated:** 2 hours

Tables và Kanban boards cần tối ưu cho tablet.

## Table Issues

- Quá nhiều columns, bị clipping
- Không scroll ngang được
- Row height có thể quá nhỏ

## Kanban Issues

- Tất cả columns cố hiện, không vừa màn
- Khó drag-drop trên touch
- Column width cố định

## Implementation

### Step 1: Table horizontal scroll wrapper

**File:** `src/components/ui/DataTable.tsx` (hoặc tương đương)

```tsx
<div className="overflow-x-auto -mx-4 px-4 tablet:-mx-6 tablet:px-6">
  <table className="min-w-full">
    {/* table content */}
  </table>
</div>
```

### Step 2: Sticky first column

```css
/* For important identifier columns */
.sticky-col {
  position: sticky;
  left: 0;
  background: inherit;
  z-index: 10;
}
```

### Step 3: Touch-friendly row height

```css
@media (max-width: 1439px) {
  tbody tr {
    min-height: 56px; /* larger than 44px for comfortable touch */
  }
  
  td {
    padding-block: 0.75rem;
  }
}
```

### Step 4: Kanban tablet layout

**Option A: Horizontal scroll**
```tsx
<div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4">
  {columns.map(col => (
    <div className="snap-start shrink-0 w-[300px] tablet:w-[280px]">
      {/* column content */}
    </div>
  ))}
</div>
```

**Option B: Show fewer columns (recommended)**
```tsx
// Mobile: 1 column carousel
// Tablet: 2-3 columns with scroll
// Desktop: all columns

<div className="grid grid-cols-1 tablet:grid-cols-2 lg:grid-cols-3 xl:flex gap-4">
```

### Step 5: Swipe indicators for Kanban

Add visual cues that more columns exist:
```tsx
{/* Gradient fade on edges */}
<div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-surface pointer-events-none tablet:block xl:hidden" />
```

### Step 6: Column collapse on tablet (optional)

Allow collapsing columns to icons:
```tsx
const [collapsedColumns, setCollapsedColumns] = useState<string[]>([]);

// Collapsed column render
{collapsed ? (
  <div className="w-12 h-full bg-slate-100 rounded-xl flex items-center justify-center">
    <span className="vertical-text">{column.title}</span>
  </div>
) : (
  // Full column
)}
```

## Todo

- [ ] Add horizontal scroll wrapper to tables
- [ ] Implement sticky first column
- [ ] Update row height for touch
- [ ] Choose Kanban approach (scroll vs grid)
- [ ] Add scroll indicators
- [ ] Test drag-drop on tablet
- [ ] Verify no content clipping

## Success Criteria

- Tables scroll horizontally, first column sticky
- Kanban usable on tablet (visible columns, scrollable)
- Touch-friendly row heights
- Visual indicators for hidden content
