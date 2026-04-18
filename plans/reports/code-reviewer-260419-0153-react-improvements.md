# Code Review: React Improvements Implementation

**Date:** 2026-04-19
**Reviewer:** code-reviewer
**Scope:** ErrorBoundary, useDailyReportForm hook, memoization, color-mappings, modal fix

---

## Summary

| Aspect | Score | Notes |
|--------|-------|-------|
| Correctness | 6/10 | Critical TS errors block build |
| React Best Practices | 8/10 | Good patterns, minor issues |
| Performance | 8/10 | Proper memoization applied |
| DRY/Maintainability | 9/10 | Hook extraction excellent |
| Security | 9/10 | No issues found |
| **Overall** | **7/10** | **BLOCKED by TS errors** |

---

## Critical Issues (BLOCKING)

### 1. ErrorBoundary TypeScript Errors

**File:** `src/components/ui/ErrorBoundary.tsx`

**Problem:** Missing `React.` prefix for class component properties causes TS2339 errors.

```
error TS2339: Property 'setState' does not exist on type 'ErrorBoundary'
error TS2339: Property 'props' does not exist on type 'ErrorBoundary'
```

**Root cause:** When using `import { Component }` instead of `import React, { Component }`, TypeScript cannot resolve `this.setState` and `this.props` on the class.

**Fix:** Add explicit import of React:
```tsx
import React, { Component, ReactNode } from 'react';
```

### 2. Missing `key` Prop in Component Interfaces

**Files:** 4 daily report forms, KpiTable, SummaryCards

**Problem:** TypeScript errors: `Property 'key' does not exist on type '...'`

When passing `key` to components, TypeScript validates against the props interface. The `key` is a React internal prop, but if the component interface doesn't extend properly, TS errors occur.

**Actual issue:** The interfaces are correct (don't include `key`), but the error messages indicate some component files have explicit `key` in props. Need to verify these aren't being destructured.

**Files affected:**
- TaskStatusCard, BlockerCard, TodayPlanCard (used in 4 daily forms)
- KpiTableRow, MetricCard

---

## High Priority

### 3. AuthContext useMemo Missing Dependency

**File:** `src/contexts/AuthContext.tsx:85`

```tsx
useEffect(() => {
  checkSession();
}, []); // Missing checkSession dependency
```

**Impact:** If checkSession changes reference, effect won't re-run. Currently safe since checkSession is wrapped in useCallback with empty deps, but violates exhaustive-deps rule.

**Recommendation:** Add to deps or disable lint rule with comment explaining why.

### 4. useDailyReportForm - Stale Closure Risk

**File:** `src/hooks/use-daily-report-form.ts:15-29`

```tsx
const handleTaskStatusChange = useCallback((taskId: string, status: 'done' | 'doing') => {
  // ...
  setTaskMetrics((prev) => {
    if (!prev[taskId]) {
      return { ...prev, [taskId]: options.defaultMetrics };
    }
    return prev;
  });
}, [options.defaultMetrics]); // options.defaultMetrics may be unstable
```

**Risk:** If caller passes object literal `{ defaultMetrics: {...} }`, creates new object each render, causing useCallback to recreate every render (defeating memoization).

**Recommendation:** Document that callers should memoize `options` or use `useMemo` internally:
```tsx
const stableDefaultMetrics = useMemo(() => options.defaultMetrics, [JSON.stringify(options.defaultMetrics)]);
```

### 5. TaskCard memo - Incomplete Dependency Checking

**File:** `src/components/board/TaskCard.tsx:17`

```tsx
export default memo(function TaskCard({ item, onUpdate, onDelete, onEdit, onViewDetails }: TaskCardProps) {
```

**Issue:** `memo` does shallow comparison. If parent re-creates callback functions without useCallback, TaskCard re-renders anyway.

**Verify:** Parent components must use stable callbacks (useCallback) for optimization to work.

---

## Medium Priority

### 6. ErrorBoundary - No Error Reporting

**File:** `src/components/ui/ErrorBoundary.tsx:22`

```tsx
componentDidCatch(error: Error, info: React.ErrorInfo) {
  console.error('[ErrorBoundary]', error, info.componentStack);
}
```

**Issue:** Only logs to console. No external error tracking (Sentry, LogRocket, etc.).

**Recommendation:** Add hook for error reporting service in production.

### 7. Modal Backdrop Click - No Escape Key Handler

**File:** `src/components/board/TaskDetailsModal.tsx:29`

Backdrop click closes modal, but no keyboard accessibility for Escape key.

**Recommendation:** Add:
```tsx
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [onClose]);
```

### 8. Color Mappings - Missing Index Signature Protection

**File:** `src/utils/color-mappings.ts`

```tsx
export const TYPE_COLORS: Record<string, string> = { ... };
```

**Issue:** Using `Record<string, string>` allows any key access without type safety.

**Better pattern:**
```tsx
const TYPE_COLORS = {
  Epic: '...',
  // ...
} as const satisfies Record<string, string>;
```

---

## Low Priority

### 9. Unused Icon Imports

**File:** `src/components/board/TaskCard.tsx:3`

```tsx
import { Clock, CheckCircle2, ChevronDown, ChevronUp, AlignLeft, ListTodo, CheckSquare, Square, Timer, AlertCircle, Link2, Target, MoreHorizontal, Edit2, Trash2, Eye } from 'lucide-react';
```

Many icons imported but not used (CheckCircle2, ChevronDown, ChevronUp, AlignLeft, ListTodo, CheckSquare, Square, Timer, AlertCircle).

### 10. adHocTasks Unused in Hook

**File:** `src/hooks/use-daily-report-form.ts:13`

```tsx
const [adHocTasks, setAdHocTasks] = useState<AdHocTask[]>([]);
```

Hook initializes adHocTasks but provides no add/update/remove functions like other state (blockers, todayPlans). Inconsistent API surface.

---

## Positive Observations

1. **DRY achievement:** useDailyReportForm extracts ~300 lines of duplicate logic across 4 forms
2. **Proper memoization patterns:** AuthContext value memoized, TaskCard wrapped in memo
3. **Clean error boundary:** Follows React best practices with getDerivedStateFromError + componentDidCatch
4. **Centralized constants:** color-mappings.ts eliminates magic strings
5. **Modal accessibility:** Backdrop click implemented with stopPropagation on content

---

## Required Actions (Ordered)

1. **[CRITICAL]** Fix ErrorBoundary TypeScript errors - add `import React`
2. **[CRITICAL]** Investigate `key` prop TS errors in component interfaces
3. **[HIGH]** Add checkSession to useEffect deps or document suppression
4. **[MEDIUM]** Add Escape key handler to TaskDetailsModal
5. **[LOW]** Clean unused icon imports

---

## TypeScript Error Summary

| File | Error Count | Category |
|------|-------------|----------|
| ErrorBoundary.tsx | 3 | Missing React namespace |
| Daily report forms (4) | 12 | key prop interface |
| KpiTable.tsx | 1 | key prop interface |
| SummaryCards.tsx | 3 | React namespace + key |
| settings-tabs.tsx | 1 | React namespace |
| LoginPage.tsx | 1 | React namespace |
| **Total** | **21** | |

---

## Unresolved Questions

1. Are the `key` prop errors from existing code or introduced in this change?
2. Is there an existing error tracking service to integrate with ErrorBoundary?
3. Should useDailyReportForm provide adHocTask mutation functions for consistency?
