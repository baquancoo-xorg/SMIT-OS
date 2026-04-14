# Code Review: WorkItem Hierarchy Refactor

**Reviewer:** code-reviewer  
**Date:** 2026-04-14  
**Status:** DONE_WITH_CONCERNS

---

## Scope

- **Files reviewed:** 12+ files
- **Focus areas:** Data integrity, API design, type safety, breaking changes
- **Build status:** Passing (TypeScript: no errors, Vite build: success)

---

## Overall Assessment

The WorkItem hierarchy refactor is well-structured with proper junction table design (`WorkItemKrLink`) replacing the previous `linkedKrId` direct reference. The schema changes follow good database normalization practices. However, there are **production concerns** around circular reference prevention, cascade delete behavior, and API validation gaps.

---

## Critical Issues (Blocking)

### 1. Missing Circular Reference Validation for parentId

**Location:** `server/routes/work-item.routes.ts:42-59, 62-74`

**Problem:** No validation prevents a WorkItem from being assigned as its own parent or creating circular parent chains (A -> B -> C -> A).

**Impact:** Could corrupt data integrity, cause infinite loops in UI rendering, or crash hierarchy traversal.

**Fix required:**
```typescript
// Add before creating/updating WorkItem
async function validateParentId(prisma: PrismaClient, itemId: string | undefined, parentId: string | null): Promise<boolean> {
  if (!parentId) return true;
  if (itemId === parentId) return false; // Self-reference check
  
  // Check for circular chain
  let current = parentId;
  const visited = new Set<string>();
  while (current) {
    if (visited.has(current)) return false;
    if (current === itemId) return false;
    visited.add(current);
    const parent = await prisma.workItem.findUnique({
      where: { id: current },
      select: { parentId: true }
    });
    current = parent?.parentId || null;
  }
  return true;
}
```

---

## High Priority

### 2. DELETE Cascade May Orphan Children Silently

**Location:** `prisma/schema.prisma:80-82`

**Problem:** WorkItem hierarchy uses self-reference without explicit cascade rules. When deleting an Epic/UserStory, its children remain but with orphaned `parentId` references.

**Observed behavior:**
- `WorkItemKrLink` has `onDelete: Cascade` (good)
- WorkItem's `parentId` has no cascade rule (problematic)

**Impact:** Deleted parent leaves children with invalid `parentId`, frontend may break when rendering parent links.

**Fix options:**
1. Add `onDelete: SetNull` to clear parentId when parent deleted
2. Add `onDelete: Cascade` to delete entire subtree (risky)
3. Add API validation to prevent deleting items with children

### 3. TaskModal Parent Selection Filters Inadequately

**Location:** `src/components/board/TaskModal.tsx:67-69`

**Problem:** Available parents filter allows selecting siblings or inappropriate type combinations:
```typescript
const parents = items.filter(
  item => ['Epic', 'UserStory'].includes(item.type) && item.id !== initialData?.id
);
```

**Impact:** User could set a Task as parent of an Epic (invalid hierarchy), or create peer-to-peer relationships.

**Recommended validation:**
- Epic can have no parent or another Epic
- UserStory can have Epic as parent
- TechTask/other tasks can have Epic or UserStory as parent

### 4. N+1 Query in TaskCard/TaskDetailsModal

**Location:** `src/components/board/TaskCard.tsx:24-36`, `src/components/board/TaskDetailsModal.tsx:18-33`

**Problem:** Each TaskCard fetches `/api/objectives` independently for displaying linked KRs, even though `krLinks` already includes nested `keyResult.objective`.

**Impact:** For a board with 50 tasks, this triggers 50+ redundant API calls.

**Fix:** Remove `fetchObjectives()` calls - the `krLinks` data from workItemIncludes already contains objective info:
```typescript
// Already available in item.krLinks[0].keyResult.objective
const linkedKr = item.krLinks?.[0]?.keyResult;
```

---

## Medium Priority

### 5. Type Mismatch: Priority Enum

**Location:** `src/types/index.ts:60` vs `server/schemas/work-item.schema.ts:19`

**Problem:** Frontend defines `'Urgent'` as priority, backend schema defines `'Critical'`. 

```typescript
// Frontend (types/index.ts:60)
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

// Backend (work-item.schema.ts:19)
priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium')
```

**Impact:** Tasks created with 'Urgent' priority will fail backend validation.

### 6. Inconsistent Status Values

**Location:** `src/components/board/TaskModal.tsx:216-220` vs `server/schemas/work-item.schema.ts:19`

**Problem:** Frontend status dropdown uses `'In Progress'`, backend expects `'InProgress'`:
```typescript
// Frontend
<option value="In Progress">In Progress</option>

// Backend schema
status: z.enum(['Backlog', 'Todo', 'InProgress', 'Review', 'Done'])
```

### 7. WorkItem.type Inconsistency

**Location:** `src/types/index.ts:58`

**Problem:** Frontend type includes `'Task'` but backend schema (`work-item.schema.ts:4-13`) doesn't include it.
```typescript
export type WorkItemType = '...' | 'Task'; // 'Task' not in backend enum
```

---

## Low Priority

### 8. Duplicate storyPoint/storyPoints Fields

**Location:** `src/types/index.ts:103-104`

**Problem:** WorkItem interface has both `storyPoints` and `storyPoint` for compatibility - technical debt.
```typescript
storyPoints?: number;
storyPoint?: number; // Added for compatibility with some components
```

**Recommendation:** Clean up by migrating all components to use `storyPoints`.

### 9. Parent Selection UX: Only in Edit Mode

**Location:** `src/components/board/TaskModal.tsx:134`

**Problem:** Parent selection only shows when `initialData` exists (edit mode). Users cannot set parent when creating new items.
```typescript
const showParentSelect = initialData && type !== 'Epic';
```

---

## Positive Observations

1. **Junction table design:** `WorkItemKrLink` with unique constraint `@@unique([workItemId, keyResultId])` prevents duplicate links
2. **Cascade deletes on links:** Both WorkItem and KeyResult deletions properly cascade to `WorkItemKrLink`
3. **Consistent API includes:** `workItemIncludes` object ensures all queries return consistent nested data
4. **Type guards added:** `isTaskType()` and `isBacklogType()` helpers for type-safe filtering
5. **Build passes:** TypeScript compilation and Vite build both succeed

---

## Edge Cases Found

| Scenario | Current Behavior | Risk Level |
|----------|------------------|------------|
| Delete Epic with child Stories | Stories orphaned with invalid parentId | High |
| Set parentId = self.id | No validation, creates broken reference | Critical |
| Create circular: A -> B -> A | No validation, infinite loop risk | Critical |
| Create task with 'Urgent' priority | Backend rejects (expects 'Critical') | Medium |
| Set 'In Progress' status | Backend rejects (expects 'InProgress') | Medium |

---

## Recommended Actions

1. **[Critical]** Add circular reference validation to POST/PUT work-item routes
2. **[High]** Add `onDelete: SetNull` to parentId relation in schema
3. **[High]** Remove redundant `/api/objectives` fetches in TaskCard/TaskDetailsModal
4. **[Medium]** Align Priority enum: change backend 'Critical' to 'Urgent' OR frontend
5. **[Medium]** Align Status values: 'InProgress' vs 'In Progress'
6. **[Low]** Add parent selection to create mode in TaskModal

---

## Metrics

| Metric | Value |
|--------|-------|
| Build Status | Pass |
| TypeScript Errors | 0 |
| Files Changed | 12+ |
| New Models | 1 (WorkItemKrLink) |
| Breaking Changes | 1 (linkedKrId removed) |

---

## Unresolved Questions

1. Was there a migration script to convert existing `linkedKrId` references to `WorkItemKrLink` entries?
2. Are existing WorkItems with old `linkedKrId` values still in the database?
3. Should hierarchy depth be limited (e.g., max 3 levels: Epic -> Story -> Task)?
