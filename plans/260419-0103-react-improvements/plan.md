---
status: completed
created: 2026-04-19
completed: 2026-04-19
scope: React Best Practices - Fix Critical/High issues
priority: P1
effort: 6h
blockedBy: []
blocks: []
tags: [react, performance, dry, accessibility, error-handling]
---

# React Improvements Plan

## Overview

Fix critical React issues: ErrorBoundary, memoization, code duplication, error states.

**Reference:** [React Review Report](../reports/react-review-260419-0103-audit.md)

## Goals

1. **Add ErrorBoundary** — Prevent full app crash on errors
2. **Extract useDailyReportForm hook** — DRY: reduce 300+ duplicate lines
3. **Improve performance** — Memoize high-render components
4. **Better UX** — Add error UI states with retry

## Phases

| Phase | Description | Effort | Files |
|-------|-------------|--------|-------|
| [Phase 1](phase-01-error-handling.md) | ErrorBoundary + error UI states | 1.5h | New component + 3 files |
| [Phase 2](phase-02-daily-report-hook.md) | Extract useDailyReportForm | 2h | 4 daily-report forms |
| [Phase 3](phase-03-memoization.md) | Memo + useCallback optimization | 1.5h | TaskCard, Sidebar, AuthContext |
| [Phase 4](phase-04-shared-constants.md) | Extract color mappings + fix modal | 1h | 3 files + TaskDetailsModal |

## Success Criteria

- [x] App shows error UI instead of white screen on crash
- [x] Daily report forms share common hook (<50 lines each)
- [x] TaskCard, Sidebar wrapped in memo
- [x] AuthContext value memoized
- [x] Color mappings in single constants file
- [x] TaskDetailsModal backdrop click closes modal

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Hook extraction breaks forms | Keep existing tests, manual test each form |
| Memoization causes stale data | Only memo pure display components |
| ErrorBoundary hides real errors | Log errors to console/monitoring |
