# Weekly Report Quick Actions Feature

**Date:** 2026-04-25  
**Type:** Feature

## Summary

Added bulk selection and quick actions to Weekly Report (SaturdaySync) page, mirroring existing DailySync pattern.

## Changes

| File | Change |
|------|--------|
| `src/pages/SaturdaySync.tsx` | Added exportMode, selectedIds state, filter panel, bulk action handlers |
| `src/components/board/ReportTableView.tsx` | Added optional checkbox column via props |
| `src/utils/export-weekly-report.ts` | New utility for markdown export |

## Features Added

- Quick Action toggle button (shows/hides checkboxes)
- Checkbox selection (single + select all)
- Filter panel: Assignee, Sprint, Week
- Export selected reports to markdown
- Bulk delete with confirmation dialog

## Design Decision

Copied DailySync pattern for consistency. ReportTableView uses optional props for checkbox support rather than creating a wrapper component.

## Known Limitations

Bulk delete silently fails on error (console.error only) - same as DailySync pattern. Consider adding toast notifications in future.
