# Phase 1: Backlog Rename + UI Fix

**Priority:** High
**Status:** completed
**Effort:** 1-2h

## Overview

Đổi tên "Product Backlog" → "Backlog" trên toàn bộ UI và sửa UX ở Grouped view.

## Requirements

### 1.1 Rename "Product Backlog" → "Backlog"

**Files cần sửa:**

| File | Line | Change |
|------|------|--------|
| `src/components/layout/Sidebar.tsx` | 76 | `label="Product Backlog"` → `label="Backlog"` |
| `src/pages/ProductBacklog.tsx` | 182 | Breadcrumb text |
| `src/pages/ProductBacklog.tsx` | 187 | Page title h2 |
| `src/pages/TechScrumBoard.tsx` | TBD | Column name |
| `src/pages/MarketingKanban.tsx` | TBD | Column name |
| `src/pages/MediaKanban.tsx` | TBD | Column name |
| `src/pages/SaleKanban.tsx` | TBD | Column name |

### 1.2 UI Fix - Always Show Action Buttons

**File:** `src/pages/ProductBacklog.tsx`

**Current (line ~514):**
```tsx
<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
```

**Change to:**
```tsx
<div className="flex items-center gap-1">
```

### 1.3 Add Description Column in Grouped View

**File:** `src/pages/ProductBacklog.tsx`

**In `BacklogItemRow` component:**
- Add description display after title
- Truncate if too long (max 100 chars)

```tsx
// After title span
{item.description && (
  <p className="text-xs text-slate-400 truncate max-w-[300px]">
    {item.description}
  </p>
)}
```

## Implementation Steps

1. [x] Search and replace "Product Backlog" → "Backlog" in Sidebar.tsx
2. [x] Update ProductBacklog.tsx breadcrumb and title
3. [x] Search each Kanban page for "Product Backlog" column, rename to "Backlog"
4. [x] Remove hover opacity classes from action buttons
5. [x] Add description display in BacklogItemRow
6. [x] Test all 4 department pages + main Backlog page
7. [x] Verify action buttons always visible in Grouped view

## Related Code

```tsx
// Sidebar.tsx:76
<NavItem
  icon={<Inbox size={18} />}
  label="Backlog"  // Changed from "Product Backlog"
  active={currentView === 'backlog'}
  onClick={() => onViewChange('backlog')}
/>
```

## Success Criteria

- [x] Sidebar shows "Backlog" not "Product Backlog"
- [x] Page title shows "Backlog"
- [x] All 4 Kanban boards show "Backlog" column
- [x] Action buttons (View/Edit/Delete) always visible in Grouped view
- [x] Description column shows in Grouped view items
