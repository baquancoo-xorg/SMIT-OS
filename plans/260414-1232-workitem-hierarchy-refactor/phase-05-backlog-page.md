# Phase 5: Team Backlog Page

## Overview

Update ProductBacklog.tsx để chỉ hiển thị và tạo Epic, UserStory.

**Priority:** High | **Effort:** 30m | **Risk:** Low

## Context

- [ProductBacklog](../../src/pages/ProductBacklog.tsx)
- [Types](../../src/types/index.ts)

## Requirements

### Functional
- Filter items: only Epic, UserStory
- Type filter dropdown: only Epic, UserStory
- TaskModal: allowedTypes = ['Epic', 'UserStory']

### Non-functional
- Keep existing UI layout
- Update stats to reflect filtered types

## Implementation Steps

### Step 1: Import Constants

```typescript
import { WorkItem, WorkItemType, Priority, BACKLOG_TYPES } from '../types';
```

### Step 2: Update fetchData Filter

```typescript
const fetchData = async () => {
  try {
    const res = await fetch('/api/work-items');
    if (res.ok) {
      const data: WorkItem[] = await res.json();
      // Filter to Epic and UserStory only
      const backlogItems = data.filter((item: WorkItem) =>
        BACKLOG_TYPES.includes(item.type as WorkItemType)
      );
      setItems(backlogItems);
    }
  } catch (error) {
    console.error('Failed to fetch backlog items:', error);
  } finally {
    setLoading(false);
  }
};
```

### Step 3: Update Type Filter Dropdown

```tsx
<select
  value={typeFilter}
  onChange={(e) => setTypeFilter(e.target.value)}
>
  <option value="All">All Types</option>
  <option value="Epic">Epic</option>
  <option value="UserStory">User Story</option>
</select>
```

### Step 4: Update Stats Section

```tsx
<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
  <div className="text-center">
    <p>Total</p>
    <p>{filteredItems.length}</p>
  </div>
  <div className="text-center">
    <p>Epics</p>
    <p>{items.filter(i => i.type === 'Epic').length}</p>
  </div>
  <div className="text-center">
    <p>Stories</p>
    <p>{items.filter(i => i.type === 'UserStory').length}</p>
  </div>
</div>
```

### Step 5: Update TaskModal Props

```tsx
<TaskModal
  isOpen={isModalOpen}
  onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
  onSave={handleCreateTask}
  defaultType="Epic"
  defaultStatus="Todo"
  initialData={editingTask}
  allowedTypes={['Epic', 'UserStory']} // NEW
/>
```

### Step 6: Update Empty State Text

```tsx
<p>Create your first Epic or Story to get started.</p>
```

## Todo

- [ ] Import BACKLOG_TYPES constant
- [ ] Update fetchData filter
- [ ] Update type filter dropdown options
- [ ] Remove Task count from stats
- [ ] Pass allowedTypes to TaskModal
- [ ] Update empty state text

## Success Criteria

- [ ] Only Epic and UserStory visible
- [ ] Only Epic and UserStory can be created
- [ ] Stats show correct counts
