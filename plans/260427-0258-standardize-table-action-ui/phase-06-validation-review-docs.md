# Phase 06 u2014 Validation, Review, Docs

## Context Links
- Plan overview: `plan.md`
- All prior phase files: `phase-01` through `phase-05`
- Research: `research/researcher-02-permission-risks.md` (open security Qs)
- Docs: `docs/project-changelog.md`, `docs/system-architecture.md`

## Parallelization Info
- **Group:** C (final gate u2014 serial)
- **Blocks:** nothing (terminal phase)
- **Blocked by:** Phases 02, 03, 04, 05
- **Can run in parallel with:** nothing

## Overview
- **Priority:** P2
- **Status:** pending
- **Effort:** ~30 min
- Cross-file validation: confirm all action button patterns replaced, no raw inline duplicates remain.
- Compile + visual smoke-test checklist.
- Document open security questions.
- Update `docs/project-changelog.md`.
- No app code changes in this phase.

## Key Insights
- Phase 03 may produce a no-op on ReportTableView; confirm and record.
- Phase 05 introduces hide-vs-disable behavior delta for self-delete in UserManagement; document explicitly.
- Three unresolved security questions from research must be recorded for product owner follow-up.
- Docs impact: minor u2014 changelog entry only; system-architecture.md does not need update (no new layer added).

## Requirements
- Run full compile check across entire project: `npx tsc --noEmit`.
- Grep for raw `<Eye`, `<Edit2`, `<Trash2` inside the 6 consumer files to confirm zero remaining unextracted inline action buttons.
- Verify `TableRowActions` import exists in each file that was modified (Phases 02u201305).
- Confirm `ReportTableView.tsx` is unchanged (no accidental edit).
- Confirm `Settings.tsx` is unchanged.
- Write changelog entry in `docs/project-changelog.md`.
- Record all three unresolved questions in a Phase 06 report saved to `plans/reports/`.
- No code file modifications.

## Architecture
```
Phase 06 workflow (read + report only):
  1. tsc --noEmit (full project)
  2. grep audit (6 consumer files)
  3. import audit (modified files)
  4. unchanged-file audit (ReportTableView, Settings.tsx)
  5. write plans/reports/planner-260427-0304-standardize-table-action-validation.md
  6. update docs/project-changelog.md
```

## Related Code Files
- **Read only:** all 6 consumer files + `src/components/ui/table-row-actions.tsx`
- **Modify:** `docs/project-changelog.md`
- **Create:** `plans/reports/planner-260427-0304-standardize-table-action-validation.md`

## File Ownership
| File | Action |
|---|---|
| `docs/project-changelog.md` | MODIFY u2014 Phase 06 exclusively |
| `plans/reports/planner-260427-0304-standardize-table-action-validation.md` | CREATE u2014 Phase 06 exclusively |
| All app code files | READ ONLY u2014 no edits |

## Implementation Steps
1. Confirm Phases 02, 03, 04, 05 all complete.
2. Run `npx tsc --noEmit`; record result. If errors: block, report to lead.
3. Grep audit u2014 run for each consumer file:
   ```bash
   grep -n '<Eye\|<Edit2\|<Trash2' \
     src/pages/ProductBacklog.tsx \
     src/components/board/TaskTableView.tsx \
     src/pages/DailySync.tsx \
     src/components/board/ReportTableView.tsx \
     src/components/lead-tracker/lead-logs-tab.tsx \
     src/components/settings/user-management-tab.tsx \
     src/components/settings/fb-config-tab.tsx
   ```
   Expected: zero hits in action-button contexts (hits inside modal form buttons or non-row-action usages are acceptable u2014 evaluate case by case).
4. Import audit: confirm `TableRowActions` import present in ProductBacklog, TaskTableView, DailySync, lead-logs-tab, user-management-tab, fb-config-tab.
5. Unchanged-file audit: `git diff src/components/board/ReportTableView.tsx src/pages/Settings.tsx` u2014 expect no diff.
6. Write validation report to `plans/reports/planner-260427-0304-standardize-table-action-validation.md`:
   - tsc result
   - grep audit results
   - import audit results
   - unchanged-file audit results
   - behavior delta notes (self-delete hide vs disabled)
   - three unresolved questions (see Security Considerations)
7. Update `docs/project-changelog.md`:
   ```
   ### [2026-04-27] Standardize Table Row Action UI
   - Added shared `TableRowActions` component (`src/components/ui/table-row-actions.tsx`)
   - Replaced inline action buttons in ProductBacklog, TaskTableView, DailySync, LeadLogs, UserManagement, FbConfig
   - Fixed: LeadLogs bulk-delete button now hidden (not runtime-blocked) for non-admin/leader-sale users
   - ReportTableView: confirmed read-only, no change
   - Settings.tsx: confirmed no prop changes required
   ```

## Todo List
- [ ] Phases 02u201305 all confirmed complete
- [ ] `npx tsc --noEmit` passes (zero errors)
- [ ] Grep audit: zero raw action buttons in consumer files
- [ ] Import audit: TableRowActions imported in all 6 consumers
- [ ] Unchanged-file audit: ReportTableView + Settings.tsx unmodified
- [ ] Validation report written to plans/reports/
- [ ] docs/project-changelog.md updated

## Success Criteria
- Zero TypeScript errors project-wide
- Zero unextracted raw Eye/Edit2/Trash2 action buttons in consumer row-action contexts
- All modified files import `TableRowActions`
- ReportTableView and Settings.tsx show no diff
- Changelog entry committed
- Validation report documents all open questions

## Conflict Prevention
- Phase 06 modifies only `docs/project-changelog.md` and creates a report file.
- No app code file is modified; conflict with other phases is impossible.

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| tsc errors from a consumer phase regression | Low | High | Block and report to lead; do not close phase until zero errors |
| Grep finds residual inline buttons missed by an implementer | Low | Medium | Flag the specific file+line to lead; implementer fixes before phase closes |
| Changelog conflicts with concurrent docs updates | Very Low | Low | Read current changelog before writing; append only |

## Security Considerations
Three open questions must be recorded in the validation report for product owner follow-up:
1. **Settings route admin-gating:** Is the Settings route enforced as admin-only at the router level? If not, FbConfig and UserManagement tabs expose destructive buttons to all authenticated users.
2. **LeadLogs edit ungated:** Is the edit action intentionally available to all authenticated users, or should it be gated behind `isSale` or a role check?
3. **LeadLogs bulk-delete visibility:** The bulk-delete button being visible to Sale members was confirmed as a UX inconsistency. Phase 04 fixes it (hide when `!isAdminOrLeaderSale`). Confirm with product owner this behavioral change is accepted.

## Next Steps
- Plan complete upon Phase 06 sign-off.
- Docs impact: minor (changelog only). System-architecture.md: no update needed.
- Future: `BulkActionBar` extraction identified as a separate follow-up task (out of scope here).
- Future: `useLeadPermissions()` hook extraction if LeadLogs permission logic grows.
