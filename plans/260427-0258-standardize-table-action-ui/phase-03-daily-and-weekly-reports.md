# Phase 03 — DailySync + ReportTableView Actions

## Context Links
- Research: `research/researcher-01-action-patterns.md` (Pattern C details)
- Shared component: `phase-01-shared-action-component.md`
- Plan overview: `plan.md`

## Parallelization Info
- **Group:** B (parallel with 02, 04, 05)
- **Blocks:** Phase 06
- **Blocked by:** Phase 01
- **Can run in parallel with:** Phases 02, 04, 05

## Overview
- **Priority:** P2
- **Status:** pending
- **Effort:** ~45 min
- DailySync: replace single Eye-only button with `<TableRowActions onView={...} />`.
- ReportTableView: add an Eye-only Actions column wired to `onViewDetail(report)`; keep row-click behavior unless it conflicts.

## Key Insights
- DailySync Pattern C: single `<Eye size={16} />` button (`p-2 min-h-[44px] min-w-[44px]`). Preserve touch target if possible.
- ReportTableView previously used row click only. Validation decision: add explicit Eye action column for consistency with all data tables.
- DailySync also has a Trash2 import (bulk delete on reports). That is a different button context — do not touch.

## Requirements
- DailySync: replace Eye button inside report rows table with `<TableRowActions onView={...} />`.
- ReportTableView: add `Actions` header and row cell with `<TableRowActions onView={() => onViewDetail(report)} />`.
- Preserve existing row click in ReportTableView unless adding the button causes double-trigger; action button must stop propagation if nested inside clickable row.
- No edit/delete buttons added in this phase.

## Architecture
```
DailySync.tsx
  report row actions cell
    before: <button ...><Eye size={16} /></button>
    after:  <TableRowActions onView={() => handleView(report)} size={16} className="min-h-[44px] min-w-[44px]" />

ReportTableView.tsx
  header: add right-aligned Actions column
  row:    <TableRowActions onView={() => onViewDetail(report)} />
          if row remains clickable, wrap with onClick={(e) => e.stopPropagation()}
```

## Related Code Files
- **Modify:** `src/pages/DailySync.tsx`
- **Modify:** `src/components/board/ReportTableView.tsx`
- **Read only:** `src/components/ui/table-row-actions.tsx` (Phase 01 output)

## File Ownership
| File | Action |
|---|---|
| `src/pages/DailySync.tsx` | MODIFY — Phase 03 exclusively |
| `src/components/board/ReportTableView.tsx` | MODIFY — Phase 03 exclusively |

## Implementation Steps
1. Confirm Phase 01 complete.
2. **DailySync.tsx:**
   a. Locate the Eye button inside report table rows.
   b. Add import: `import { TableRowActions } from '../components/ui/table-row-actions';`
   c. Replace the Eye-only button with `TableRowActions` using the existing view handler.
   d. Check if `Eye` is still used elsewhere; remove import only if unused.
   e. Do NOT touch Trash2 usage.
3. **ReportTableView.tsx:**
   a. Add import: `import { TableRowActions } from '../ui/table-row-actions';`
   b. Add right-aligned `Actions` header matching table header style.
   c. Add right-aligned action cell per row with Eye-only `TableRowActions`.
   d. If row click remains on `<tr>`, stop propagation on the action wrapper/button so one click does not fire twice.
4. Run `npx tsc --noEmit` — zero new errors.

## Todo List
- [ ] Phase 01 complete (file exists)
- [ ] DailySync: import TableRowActions
- [ ] DailySync: replace Eye button in report rows
- [ ] DailySync: clean unused Eye import if applicable
- [ ] ReportTableView: import TableRowActions
- [ ] ReportTableView: add Actions header
- [ ] ReportTableView: add Eye action cell
- [ ] ReportTableView: prevent double row/action click if needed
- [ ] Compile check passes

## Success Criteria
- `npx tsc --noEmit` zero new errors
- DailySync report rows: Eye icon renders via `TableRowActions`; click handler fires correctly
- ReportTableView rows: explicit Actions column with Eye icon opens detail dialog
- Existing row-click detail UX remains intact unless intentionally replaced
- No edit/delete buttons added to either file

## Conflict Prevention
- Phase 03 exclusively owns both files; no other phase modifies them.
- DailySync bulk-delete Trash2 (unrelated to row actions) must not be touched.

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| ReportTableView row click + action click double-fire | Medium | Low | Stop propagation on action cell/wrapper |
| Eye import removed while still used by another element in DailySync | Low | Medium | Grep all Eye usages before removing import |
| Actions column affects export mode layout | Medium | Medium | Inspect `exportMode`; hide actions in export mode if existing export table should stay clean |

## Security Considerations
- Both actions are read-only view actions; no mutation risk.
- Do not add edit/delete actions for reports.

## Next Steps
- Signal Phase 06 when complete.
- Phase 06 should verify ReportTableView export mode still works.
