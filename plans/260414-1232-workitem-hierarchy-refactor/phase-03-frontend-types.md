# Phase 3: Frontend Types

## Overview

Update TypeScript types để match schema mới.

**Priority:** High | **Effort:** 15m | **Risk:** Low

## Context

- [Types File](../../src/types/index.ts)

## Implementation Steps

### Step 1: Update WorkItem Interface

Edit `src/types/index.ts`:

```typescript
export interface WorkItemKrLink {
  id: string;
  workItemId: string;
  keyResultId: string;
  keyResult?: KeyResult & {
    objective?: { id: string; title: string; department: string };
  };
  createdAt: string;
}

export interface WorkItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  assigneeId?: string;
  sprintId?: string;
  
  // NEW: Hierarchy
  parentId?: string;
  parent?: { id: string; title: string; type: string };
  children?: { id: string; title: string; type: string; status: string }[];
  
  // NEW: KR links (replaces linkedKrId)
  krLinks?: WorkItemKrLink[];
  
  // DEPRECATED: Remove after migration
  // linkedKrId?: string;
  
  startDate?: string;
  dueDate?: string;
  estimatedTime?: string;
  storyPoints?: number;
  subtasks?: any[];
  createdAt: string;
  updatedAt: string;
  assignee?: User;
  sprint?: Sprint;
}
```

### Step 2: Add Helper Types

```typescript
// Task types for Workspace boards
export const TASK_TYPES: WorkItemType[] = ['TechTask', 'MktTask', 'MediaTask', 'SaleTask'];

// Epic/Story types for Team Backlog
export const BACKLOG_TYPES: WorkItemType[] = ['Epic', 'UserStory'];

// Type guards
export const isTaskType = (type: string): boolean => 
  TASK_TYPES.includes(type as WorkItemType);

export const isBacklogType = (type: string): boolean => 
  BACKLOG_TYPES.includes(type as WorkItemType);
```

## Todo

- [x] Add WorkItemKrLink interface
- [x] Update WorkItem with parentId, parent, children, krLinks
- [x] Remove linkedKrId from interface
- [x] Add TASK_TYPES and BACKLOG_TYPES constants
- [x] Add type guard helpers

## Success Criteria

- [x] No TypeScript errors
- [x] Types match API responses
