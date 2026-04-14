# Phase 6: Workspace Boards

## Overview

Update các Workspace boards (Tech, Marketing, Media, Sale) để chỉ tạo Task types.

**Priority:** High | **Effort:** 45m | **Risk:** Low

## Context

- [TechBoard](../../src/pages/TechBoard.tsx)
- [MarketingBoard](../../src/pages/MarketingBoard.tsx)
- [MediaBoard](../../src/pages/MediaBoard.tsx)
- [SaleBoard](../../src/pages/SaleBoard.tsx)

## Requirements

### Functional
- TaskModal: only show task types for each board
- Remove Epic/UserStory from creation options

### Non-functional
- Consistent behavior across all boards

## Implementation Steps

### Step 1: Define Board-Specific Types

```typescript
// Per-board task types
const TECH_TASK_TYPES: WorkItemType[] = ['TechTask'];
const MKT_TASK_TYPES: WorkItemType[] = ['Campaign', 'MktTask'];
const MEDIA_TASK_TYPES: WorkItemType[] = ['MediaTask'];
const SALE_TASK_TYPES: WorkItemType[] = ['Deal', 'SaleTask'];
```

### Step 2: Update TechBoard.tsx

```tsx
<TaskModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSave={handleCreateTask}
  defaultType="TechTask"
  defaultStatus="Todo"
  initialData={editingTask}
  allowedTypes={['TechTask']} // Only TechTask
/>
```

### Step 3: Update MarketingBoard.tsx

```tsx
<TaskModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSave={handleCreateTask}
  defaultType="MktTask"
  defaultStatus="Todo"
  initialData={editingTask}
  allowedTypes={['Campaign', 'MktTask']} // Marketing types
/>
```

### Step 4: Update MediaBoard.tsx

```tsx
<TaskModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSave={handleCreateTask}
  defaultType="MediaTask"
  defaultStatus="Todo"
  initialData={editingTask}
  allowedTypes={['MediaTask']} // Only MediaTask
/>
```

### Step 5: Update SaleBoard.tsx

```tsx
<TaskModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSave={handleCreateTask}
  defaultType="SaleTask"
  defaultStatus="Todo"
  initialData={editingTask}
  allowedTypes={['Deal', 'SaleTask']} // Sale types
/>
```

## Files to Update

| File | allowedTypes |
|------|--------------|
| TechBoard.tsx | `['TechTask']` |
| MarketingBoard.tsx | `['Campaign', 'MktTask']` |
| MediaBoard.tsx | `['MediaTask']` |
| SaleBoard.tsx | `['Deal', 'SaleTask']` |

## Todo

- [ ] Update TechBoard TaskModal props
- [ ] Update MarketingBoard TaskModal props
- [ ] Update MediaBoard TaskModal props
- [ ] Update SaleBoard TaskModal props
- [ ] Test each board creates correct type

## Success Criteria

- [ ] TechBoard only creates TechTask
- [ ] MarketingBoard only creates Campaign, MktTask
- [ ] MediaBoard only creates MediaTask
- [ ] SaleBoard only creates Deal, SaleTask
- [ ] No Epic/UserStory in any workspace board
