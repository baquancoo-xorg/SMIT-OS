# Weekly/Daily Report Bugs Fix

**Date:** 2026-04-25  
**Commit:** de835c3  
**Impact:** Bug Fix

## Summary

Fixed 2 bugs in the reporting system that caused data display and persistence issues.

## Bug 1: Weekly Report Dialog Empty

**Root Cause:** JSON format mismatch between submit and display.
- Submit sent raw arrays: `[{krId, title, ...}]`
- `ReportDetailDialog.tsx` expected wrapped objects: `{keyResults: [{...}]}`

**Fix:** Updated `WeeklyCheckinModal.tsx` payload to wrap arrays in expected structures:
- `progress` → `{keyResults: [...]}`
- `plans` → `{items: [...]}`
- `blockers` → `{items: [...]}`

## Bug 2: Daily Report Tasks Persist

**Root Cause:** POST handler saved DailyReport but never updated WorkItem status.

**Fix:** Added `prisma.workItem.updateMany()` after report creation to mark `completedYesterday` tasks as "Done".

**Error Handling:** Wrapped in try-catch to prevent report creation rollback on malformed tasksData.

## Files Changed

- `src/components/modals/WeeklyCheckinModal.tsx`
- `server/routes/daily-report.routes.ts`

## Testing Notes

- Weekly: Submit report → View → Verify all sections render
- Daily: Submit with done task → Check WorkItem.status in DB → Reload next day
