# Code Review: PM Dashboard Redesign

**File:** `/Users/dominium/Documents/Project/SMIT-OS/src/pages/PMDashboard.tsx`
**Date:** 2026-04-14
**Reviewer:** code-reviewer

---

## Overall Assessment

The PM Dashboard is a well-structured 3-tier dashboard with solid separation of concerns. The code is readable and follows React patterns. However, there are several performance and error handling concerns that should be addressed.

**Overall Score: 7/10**

---

## Category Scores

### 1. Code Quality & React Best Practices: 7/10

**Positives:**
- Clear 3-tier organization with visual comment separators
- Consistent naming conventions
- Clean JSX structure with logical grouping

**Issues:**

| Severity | Issue | Location |
|----------|-------|----------|
| Medium | Missing `useMemo` for expensive computations | Lines 65-120 |
| Medium | `fetchData` function recreated on every render | Line 32 |
| Low | `handlePingUser` not memoized with `useCallback` | Line 206 |

**Detail:** Lines 65-120 perform multiple array filters/reduces on `workItems`, `objectives`, `users` during every render. These should be wrapped in `useMemo`.

```tsx
// Current: recalculates on every render
const l1Objectives = objectives.filter(obj => obj.level === 'L1' || obj.department === 'BOD');

// Should be:
const l1Objectives = useMemo(() => 
  objectives.filter(obj => obj.level === 'L1' || obj.department === 'BOD'),
  [objectives]
);
```

---

### 2. Performance: 6/10

**Issues:**

| Severity | Issue | Impact |
|----------|-------|--------|
| High | 12+ array iterations on each render | CPU waste, laggy UI with large datasets |
| Medium | Only `velocityData` uses `useMemo` | Inconsistent optimization |
| Medium | `new Date()` called repeatedly in render | Creates new objects each render |
| Low | `departmentData` and `statusData` computed inline | Re-renders cause recalculation |

**Critical computations lacking memoization:**
- `l1Objectives`, `companyOKRProgress` (line 65-68)
- `currentSprint`, `daysLeft`, `sprintProgress` (lines 71-84)
- `doneItems`, `flowEfficiency` (lines 87-90)
- `activeBlockers` (lines 93-96)
- `createdThisWeek`, `completedThisWeek` (lines 99-106)
- `departmentData` (lines 125-143)
- `statusData` (lines 146-152)
- `urgentItems` (lines 189-198)
- `criticalObjectives` (lines 201-204)

**Recommendation:** Extract computations into memoized hooks or wrap with `useMemo`.

---

### 3. Error Handling: 5/10

**Issues:**

| Severity | Issue | Location |
|----------|-------|----------|
| High | No error state shown to user | Line 51-54 |
| High | Silently fails - only logs to console | Line 52 |
| Medium | No response status checks | Lines 41-45 |
| Medium | No retry mechanism | `fetchData` |
| Low | `handlePingUser` uses `alert()` - not production-ready | Line 208 |

**Current error handling:**
```tsx
} catch (error) {
  console.error('Failed to fetch dashboard data:', error);
} finally {
  setLoading(false);
}
```

**Should add:**
- Error state: `const [error, setError] = useState<string | null>(null);`
- Response validation: `if (!itemsRes.ok) throw new Error(...)`
- Error UI: Display error message with retry button

---

### 4. Accessibility: 5/10

**Issues:**

| Severity | Issue | Location |
|----------|-------|----------|
| High | Progress bars lack ARIA attributes | Lines 247-249, etc. |
| High | No semantic landmarks | Overall structure |
| Medium | Color-only status indicators | Lines 292-293 |
| Medium | Chart lacks `aria-label` | Line 379 |
| Low | Button lacks descriptive `aria-label` | Line 451-455 |

**Required fixes:**

```tsx
// Progress bar needs ARIA
<div 
  role="progressbar" 
  aria-valuenow={companyOKRProgress} 
  aria-valuemin={0} 
  aria-valuemax={100}
  className="h-full bg-primary..."
/>

// Ping button needs context
<button aria-label={`Send reminder for ${item.title}`}>
  Ping
</button>
```

---

### 5. TypeScript Types: 8/10

**Positives:**
- Properly typed state variables
- Uses imported types from `../types`
- Type annotations on arrays

**Minor issues:**
- `departmentMap` uses `Record<string, number[]>` but could be `Record<Department, number[]>` for stricter typing
- Line 180: `Object.entries(weekMap).map(([, count], i)` - unused variable pattern is fine

---

## Critical Issues (Blocking)

1. **No user-visible error state** - Dashboard shows loading spinner forever if API fails
2. **Missing response validation** - `fetch` succeeded but status could be 500

## High Priority (Should Fix)

1. **Performance: Unmemoized computations** - Will cause lag with 100+ work items
2. **Accessibility: Missing ARIA on progress bars** - Screen readers cannot interpret
3. **Error handling: Add retry mechanism** - Users have no recovery path

## Medium Priority

1. Memoize `fetchData` with `useCallback` or move into `useEffect`
2. Add loading skeleton instead of spinner for better UX
3. Extract metric cards into separate components for maintainability

## Low Priority

1. Replace `alert()` with proper toast notification
2. Add `aria-live` region for dynamic updates
3. Consider extracting chart config to constants

---

## Positive Observations

- Clear visual separation of tiers with comments
- `velocityData` correctly memoized
- Handles empty states gracefully (e.g., "No Active Sprint", "All clear!")
- Responsive design with proper breakpoints
- Consistent styling patterns
- Proper conditional rendering

---

## Recommended Refactor

Extract expensive computations into custom hook:

```tsx
// hooks/usePMDashboardMetrics.ts
export function usePMDashboardMetrics(
  workItems: WorkItem[],
  objectives: Objective[],
  users: User[],
  sprints: Sprint[],
  weeklyReports: WeeklyReport[]
) {
  const now = useMemo(() => new Date(), []);
  
  const l1Objectives = useMemo(() => 
    objectives.filter(obj => obj.level === 'L1' || obj.department === 'BOD'),
    [objectives]
  );
  // ... rest of computations
  
  return { l1Objectives, companyOKRProgress, currentSprint, ... };
}
```

---

## Summary Table

| Category | Score | Notes |
|----------|-------|-------|
| Code Quality | 7/10 | Good structure, missing memoization |
| Performance | 6/10 | 12+ unmemoized array ops per render |
| Error Handling | 5/10 | Silent failures, no user feedback |
| Accessibility | 5/10 | Missing ARIA, color-only indicators |
| TypeScript | 8/10 | Well-typed, minor improvements possible |

**Final Score: 6.2/10**

---

## Unresolved Questions

1. Is real-time auto-refresh planned? If so, current architecture will multiply performance issues.
2. What is the expected data volume? Performance concerns scale with item count.
3. Should failed API calls trigger user notification or silent retry?

---

**Status:** DONE
**Summary:** PM Dashboard review complete. Main concerns: performance (unmemoized computations), error handling (silent failures), and accessibility (missing ARIA attributes).
