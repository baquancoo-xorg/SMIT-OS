---
title: "Standardize Table Row Action UI"
description: "Extract shared TableRowActions component and replace inline action buttons across all table views."
status: completed
priority: P2
effort: 5h
branch: main
tags: [ui, refactor, components, tables]
created: 2026-04-27
---

## Goal
Extract a single `TableRowActions` UI component; replace duplicated inline action buttons across 6 consumer files. Frontend-only. No backend changes.

## Dependency Graph

```
Phase 01 (shared component)
    └── Phase 02 (ProductBacklog + TaskTableView) ─┐
    └── Phase 03 (DailySync + ReportTableView)    ─┤──► Phase 06 (validation + docs)
    └── Phase 04 (LeadLogs)                       ─┤
    └── Phase 05 (Settings tabs)                  ─┘
```

## Execution Strategy
- **Sequential first:** Phase 01 must merge before consumers start.
- **Parallel block:** Phases 02–05 run in parallel (exclusive file ownership, zero overlap).
- **Sequential last:** Phase 06 runs after all consumers done.

## Phase List

| # | Phase | Status | Group | Effort | File |
|---|---|---|---|---|---|
| 01 | Shared `TableRowActions` component | completed | A | 30m | [phase-01](phase-01-shared-action-component.md) |
| 02 | ProductBacklog + TaskTableView | completed | B | 1h | [phase-02](phase-02-backlog-and-board-tables.md) |
| 03 | DailySync + ReportTableView | completed | B | 30m | [phase-03](phase-03-daily-and-weekly-reports.md) |
| 04 | LeadLog actions | completed | B | 1.5h | [phase-04](phase-04-leadlog-actions.md) |
| 05 | Settings actions | completed | B | 1h | [phase-05](phase-05-settings-actions.md) |
| 06 | Validation, review, docs | completed | C | 30m | [phase-06](phase-06-validation-review-docs.md) |

## File Ownership Matrix

| File | Phase | Touch type |
|---|---|---|
| `src/components/ui/table-row-actions.tsx` | 01 | CREATE |
| `src/pages/ProductBacklog.tsx` | 02 | MODIFY |
| `src/components/board/TaskTableView.tsx` | 02 | MODIFY |
| `src/pages/DailySync.tsx` | 03 | MODIFY |
| `src/components/board/ReportTableView.tsx` | 03 | MODIFY |
| `src/components/lead-tracker/lead-logs-tab.tsx` | 04 | MODIFY |
| `src/components/settings/user-management-tab.tsx` | 05 | MODIFY |
| `src/components/settings/fb-config-tab.tsx` | 05 | MODIFY |
| `src/pages/Settings.tsx` | 05 | VERIFY only (no edit unless required) |

## Unresolved Questions
1. Settings route admin-gated should be verified during Phase 05/06, but no UI guard changes unless current code proves route is exposed.
2. LeadLogs edit remains ungated; preserve current behavior unless product later requests permission change.

## Validation Summary

**Validated:** 2026-04-27
**Questions asked:** 4

### Confirmed Decisions
- Task tables: replace `TaskTableView` three-dot dropdown with inline Eye/Edit/Delete actions.
- Leadlog bulk delete: hide button for users without `isAdminOrLeaderSale`; no runtime alert UX.
- User Management self-delete: hide Delete action for current user by omitting `onDelete`.
- Weekly Report: add an Actions column with Eye icon instead of skipping `ReportTableView`.

### Action Items
- [x] Revise Phase 03 implementation details: `ReportTableView.tsx` is no longer verify/no-op; add Eye-only Actions column wired to `onViewDetail(report)`.
- [x] During Phase 05/06, verify Settings route admin gating and document result.
