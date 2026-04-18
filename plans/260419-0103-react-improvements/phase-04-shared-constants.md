# Phase 4: Shared Constants & Modal Fix

**Effort:** 1h | **Priority:** P2 | **Status:** completed

## Tasks

### 4.1 Extract Color Mappings

**Create src/utils/color-mappings.ts:**
```typescript
export const TYPE_COLORS: Record<string, string> = {
  Feature: 'bg-blue-100 text-blue-800 border-blue-200',
  Bug: 'bg-red-100 text-red-800 border-red-200',
  Task: 'bg-gray-100 text-gray-800 border-gray-200',
  Improvement: 'bg-purple-100 text-purple-800 border-purple-200',
  Documentation: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

export const PRIORITY_COLORS: Record<string, string> = {
  Urgent: 'bg-red-100 text-red-700 border-red-300',
  High: 'bg-orange-100 text-orange-700 border-orange-300',
  Medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  Low: 'bg-green-100 text-green-700 border-green-300',
};

export const STATUS_COLORS: Record<string, string> = {
  Backlog: 'bg-gray-100 text-gray-600',
  Todo: 'bg-blue-100 text-blue-600',
  'In Progress': 'bg-yellow-100 text-yellow-700',
  Review: 'bg-purple-100 text-purple-700',
  Done: 'bg-green-100 text-green-700',
};

export const TEAM_COLORS: Record<string, string> = {
  tech: 'border-blue-500',
  marketing: 'border-purple-500',
  media: 'border-pink-500',
  sale: 'border-green-500',
};
```

### 4.2 Update Components to Use Shared Constants

**TaskCard.tsx:**
```tsx
import { TYPE_COLORS, PRIORITY_COLORS } from '../../utils/color-mappings';

// Replace inline color objects
const typeClass = TYPE_COLORS[item.type] || TYPE_COLORS.Task;
const priorityClass = PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.Medium;
```

**TaskDetailsModal.tsx:**
```tsx
import { TYPE_COLORS, PRIORITY_COLORS } from '../../utils/color-mappings';
// Same pattern
```

**TaskTableView.tsx:**
```tsx
import { PRIORITY_COLORS, STATUS_COLORS } from '../../utils/color-mappings';
// Same pattern
```

### 4.3 Fix TaskDetailsModal Backdrop Click

**Update src/components/board/TaskDetailsModal.tsx:**

**Current (broken):**
```tsx
<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
  <div className="bg-white ...">
```

**Fix (add onClick handler):**
```tsx
<div 
  className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
  onClick={onClose}
>
  <div 
    className="bg-white ..."
    onClick={(e) => e.stopPropagation()}
  >
```

### 4.4 Standardize framer-motion Import

**Check and update inconsistent imports:**
```bash
grep -r "from 'framer-motion'" src/
grep -r "from 'motion/react'" src/
```

Standardize all to `motion/react` (newer API).

## Checklist

- [ ] color-mappings.ts created
- [ ] TaskCard uses shared constants
- [ ] TaskDetailsModal uses shared constants
- [ ] TaskTableView uses shared constants
- [ ] TaskDetailsModal backdrop click works
- [ ] framer-motion imports standardized
- [ ] No duplicate color definitions remain
