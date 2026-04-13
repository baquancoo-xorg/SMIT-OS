# Test Report: PM Dashboard Redesign

**Date:** 2026-04-14 01:58
**Component:** `src/pages/PMDashboard.tsx`
**Status:** FAIL - Critical API endpoint mismatch

---

## Test Results Overview

| Check | Result | Details |
|-------|--------|---------|
| TypeScript Compilation | PASS | `npx tsc --noEmit` - no errors |
| Vite Build | PASS | Built in 1.61s, 983KB bundle |
| API: `/api/sprints` | PASS | Returns 7 sprints |
| API: `/api/weekly-reports` | FAIL | Endpoint does NOT exist |
| Component Imports | PASS | All imports valid |

---

## Critical Issue

**API Endpoint Mismatch:**
- **PMDashboard.tsx line 39:** fetches `/api/weekly-reports`
- **Server (server.ts):** provides `/api/reports` (line 336-345)

This causes runtime failure - the fetch returns HTML (Vite 404 fallback) instead of JSON, causing `reportsRes.json()` to fail silently or throw.

**Impact:** Report Status card shows `0/N` submitted reports even when data exists.

---

## Fix Required

Change PMDashboard.tsx line 39:
```diff
-        fetch('/api/weekly-reports')
+        fetch('/api/reports')
```

---

## Verified Working

- `/api/sprints` - Returns array of 7 sprints with correct structure
- `/api/reports` - Returns WeeklyReport[] with user relations (tested manually)
- `/api/work-items`, `/api/objectives`, `/api/users` - All functional

---

## Build Warnings

1. **Chunk size:** 983KB > 500KB limit (code-splitting recommended)
2. No other warnings

---

## Recommendations

1. **Immediate:** Fix API endpoint mismatch (`/api/weekly-reports` -> `/api/reports`)
2. **Future:** Add API route constants to avoid hardcoded strings diverging
3. **Future:** Consider code-splitting for large bundle

---

## Unresolved Questions

None - root cause identified, fix is straightforward.
