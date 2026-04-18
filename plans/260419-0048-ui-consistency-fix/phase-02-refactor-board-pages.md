# Phase 2: Refactor Board Pages

**Status:** completed
**Effort:** 45 minutes
**Priority:** High

## Overview

Refactor 4 board pages để sử dụng shared components.

## Files to Modify

| File | Current Issues |
|------|----------------|
| `src/pages/TechBoard.tsx` | Inline header, button styling |
| `src/pages/MarketingBoard.tsx` | Same pattern |
| `src/pages/MediaBoard.tsx` | Same pattern |
| `src/pages/SaleBoard.tsx` | Same pattern |

## Tasks

### 2.1 Refactor TechBoard.tsx

**Before:**
```tsx
<div className="h-full flex flex-col py-6 lg:py-10 space-y-6 w-full">
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <nav>...</nav>
      <h2>...</h2>
    </div>
    <div className="flex items-center gap-3">
      <div className="flex p-1 bg-surface-container-high...">...</div>
      <button className="flex items-center...">+ New Task</button>
    </div>
  </div>
```

**After:**
```tsx
import PageLayout from '../components/layout/PageLayout';
import PrimaryActionButton from '../components/ui/PrimaryActionButton';
import ViewToggle from '../components/ui/ViewToggle';

// In render:
<PageLayout
  breadcrumb={{ parent: 'Workspaces', current: 'Tech & Product' }}
  title={<><span className="text-[#0059B6] italic">Tech & Product</span> Workspace</>}
  actions={
    <>
      <ViewToggle value={view} onChange={setView} />
      <PrimaryActionButton onClick={() => setIsModalOpen(true)}>
        New Task
      </PrimaryActionButton>
    </>
  }
>
  {/* Sprint filter bar and board content */}
</PageLayout>
```

### 2.2 Refactor MarketingBoard.tsx

Same pattern, change:
- `breadcrumb.current`: "Marketing"
- `title`: `<><span className="text-[#F54A00] italic">Marketing</span> Workspace</>`

### 2.3 Refactor MediaBoard.tsx

Same pattern, change:
- `breadcrumb.current`: "Media"
- `title`: `<><span className="text-[#E60076] italic">Media</span> Workspace</>`

### 2.4 Refactor SaleBoard.tsx

Same pattern, change:
- `breadcrumb.current`: "Sales"
- `title`: `<><span className="text-[#009966] italic">Sales</span> Workspace</>`

## Validation

- [x] All 4 boards render correctly
- [x] View toggle works
- [x] New Task button works
- [x] Sprint filter still visible
- [x] No visual regression

## Implementation Notes

- Board pages use ViewToggle + PrimaryActionButton directly (not full PageLayout wrapper)
- Shared components reduce code duplication across TechBoard, MarketingBoard, MediaBoard, SaleBoard
