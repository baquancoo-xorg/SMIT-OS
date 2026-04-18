# React Best Practices Review - SMIT-OS

**Date:** 2026-04-19
**Scope:** src/components/ (45 files)
**Focus Areas:** board/, daily-report/, dashboard/, layout/, ui/, settings/

---

## Executive Summary

Overall code quality is **GOOD** with consistent patterns. Key concerns: limited memoization (only 2 files use memo/useCallback), missing accessibility attributes in 40/45 files, and code duplication in daily-report forms. No critical security issues found.

---

## Critical Issues

### 1. Missing Error Boundary Components
**Location:** All component trees
**Impact:** Unhandled errors crash entire app
**Recommendation:** Add ErrorBoundary wrapper for major sections (board, dashboard, daily-report)

### 2. TaskDetailsModal Missing Click-Outside Handler
**Location:** `src/components/board/TaskDetailsModal.tsx:48`
```tsx
<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
```
**Issue:** Backdrop click does not close modal (unlike TaskModal.tsx)
**Fix:** Add `onClick={onClose}` to backdrop overlay

---

## High Priority

### 1. Limited Memoization (Performance)
**Stats:** Only 2/45 files use memo/useCallback/useMemo
- `KpiTable.tsx` - uses memo
- `SummaryCards.tsx` - uses memo

**Missing in high-render components:**
- `TaskCard.tsx` - re-renders on every parent state change
- `TaskTableView.tsx` - renders 100+ rows without virtualization
- `Sidebar.tsx` - NavItem recreated on each render

**Recommendation:**
```tsx
// TaskCard.tsx
import { memo } from 'react';
export default memo(function TaskCard({ item, onUpdate, onDelete }) {
  // Memoize expensive computations
  const linkedKr = useMemo(() => item.krLinks?.[0]?.keyResult, [item.krLinks]);
});
```

### 2. Duplicate State Management in Daily Report Forms
**Files:**
- `TechDailyForm.tsx` (lines 39-49)
- `MediaDailyForm.tsx` (lines 42-46)
- `SaleDailyForm.tsx` (lines 36-40)
- `MarketingDailyForm.tsx` (lines 38-42)

**Duplicate pattern:**
```tsx
const [taskStatuses, setTaskStatuses] = useState<Record<string, 'done' | 'doing'>>({});
const [taskMetrics, setTaskMetrics] = useState<Record<string, TMetrics>>({});
const [blockers, setBlockers] = useState<BlockerEntry[]>([]);
const [todayPlans, setTodayPlans] = useState<TodayPlanEntry[]>([]);
const [adHocTasks, setAdHocTasks] = useState<AdHocTask[]>([]);
```

**Recommendation:** Extract to custom hook `useDailyReportForm<T>()` to reduce 300+ lines of duplicate logic.

### 3. Missing Loading/Error States
**Files with fetch but no error UI:**
- `Header.tsx:23-36` - fetchAllWorkItems has console.error only
- `PMDashboard.tsx:29-43` - fetchStats catches error silently
- `TaskModal.tsx:62-78` - fetchParents shows "Loading..." but no error state

**Recommendation:** Add user-facing error states with retry buttons.

---

## Medium Priority

### 1. Accessibility (a11y) Gaps
**Stats:** Only 10 aria-* attributes across 5/45 files

**Missing:**
| Component | Missing |
|-----------|---------|
| `TaskTableView.tsx` | Table needs `role="grid"`, row selection aria-selected |
| `CustomSelect.tsx` | Using @headlessui (good), but custom animation may break screen readers |
| `TaskCard.tsx` | MoreHorizontal menu has aria-label (good) but menu items missing role="menuitem" |
| `DailyReportBase.tsx` | Modal missing `role="dialog"` and `aria-modal="true"` |

**Good:** `Modal.tsx` has proper focus trap and aria attributes.

### 2. Context Value Not Memoized
**File:** `src/contexts/AuthContext.tsx:109-121`
```tsx
<AuthContext.Provider value={{
  currentUser,
  setCurrentUser,
  users,
  loading,
  isAdmin: currentUser?.isAdmin || false,
  login,
  logout,
  refreshUsers: fetchUsers
}}>
```
**Issue:** New object created every render, causing unnecessary re-renders of all consumers.
**Fix:** Wrap value in `useMemo`.

### 3. Inline Function Definitions in JSX
**Common in:** TaskCard.tsx, TaskTableView.tsx, TechDailyForm.tsx

**Example (TaskCard.tsx:95):**
```tsx
onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
```
**Impact:** Creates new function on every render. Wrap with useCallback for performance.

### 4. Hardcoded Color Mappings Duplicated
**Files:**
- `TaskCard.tsx:55-72` - typeColors, priorityColors
- `TaskDetailsModal.tsx:23-40` - typeColors, priorityColors
- `TaskTableView.tsx:44-65` - priorityColors, statusColors

**Recommendation:** Extract to `src/utils/color-mappings.ts` constants.

---

## Low Priority

### 1. Inconsistent Import Patterns
- `Modal.tsx:3` uses `framer-motion`
- `TaskCard.tsx:4` uses `motion/react`

**Recommendation:** Standardize on `motion/react` across codebase.

### 2. Large Components
| File | Lines | Recommendation |
|------|-------|----------------|
| `KpiTable.tsx` | 387 | Split SortableHeader, RateBadge to separate files |
| `TaskTableView.tsx` | 380 | Extract MobileCardView to separate component |
| `TechDailyForm.tsx` | 363 | Extract render methods to child components |

### 3. Unused Imports
**File:** `Header.tsx`
```tsx
import { Bell, Search, ChevronRight, User as UserIcon, Calendar, Tag, Menu } from 'lucide-react';
```
- `Bell`, `Search`, `ChevronRight`, `Calendar` appear unused

---

## Best Practices Observed (Positive)

1. **TypeScript Usage:** All 45 components have proper interface definitions
2. **No Index Keys:** No `key={index}` anti-pattern found
3. **No dangerouslySetInnerHTML:** XSS-safe
4. **Consistent Component Structure:** Props interface -> Component -> Export pattern
5. **Good Modal Implementation:** `Modal.tsx` has focus trap, escape handler, body scroll lock
6. **Custom UI Components:** Well-abstracted CustomSelect, CustomDatePicker, CustomFilter
7. **Error Handling in Async:** try/catch in all async functions (53 occurrences)

---

## Unused/Redundant Components to Review

None identified as completely unused. All exports are consumed. However:

1. `src/components/ui/Skeleton.tsx` - Exists but most loading states use inline skeletons
2. `src/components/ui/EmptyState.tsx` - Only used in 1-2 places, consider using more consistently

---

## Recommended Actions (Prioritized)

### Immediate (This Sprint)
1. Add ErrorBoundary to major sections
2. Fix TaskDetailsModal backdrop click
3. Memoize AuthContext value

### Short-term (Next Sprint)
4. Extract useDailyReportForm custom hook (DRY)
5. Add error states to data fetching components
6. Extract color mappings to shared constants

### Long-term
7. Add virtualization to TaskTableView for large datasets
8. Improve accessibility coverage to meet WCAG 2.1 AA
9. Split large components (>300 lines)

---

## Metrics Summary

| Metric | Value | Target |
|--------|-------|--------|
| Components with memo | 2/45 (4%) | >30% |
| a11y attributes | 10 (5 files) | All interactive elements |
| TypeScript Props | 46/46 (100%) | 100% |
| try/catch coverage | 53 occurrences | Good |
| Index keys | 0 | 0 |
| dangerouslySetInnerHTML | 0 | 0 |

---

## Unresolved Questions

1. Is there a plan to add React Query or SWR for data fetching? Would help with caching, error states, loading states.
2. Should TaskTableView support virtualization given potential for 100+ items?
3. What is the accessibility compliance target (WCAG level)?

---

**Status:** DONE
**Summary:** Solid codebase with good TypeScript usage and consistent patterns. Main improvements needed: memoization, DRY refactoring of daily-report forms, and accessibility coverage.
