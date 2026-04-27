# Phase 04 — LeadLog Actions

## Context Links
- Research: `research/researcher-02-permission-risks.md` (full delete flow + permission rules)
- Shared component: `phase-01-shared-action-component.md`
- Plan overview: `plan.md`

## Parallelization Info
- **Group:** B (parallel with 02, 03, 05)
- **Blocks:** Phase 06
- **Blocked by:** Phase 01
- **Can run in parallel with:** Phases 02, 03, 05

## Overview
- **Priority:** P2
- **Status:** pending
- **Effort:** ~1.5h (most complex phase — four-way delete flow)
- Standardize the edit button style in `lead-logs-tab.tsx` using `TableRowActions`.
- Fix UX inconsistency: hide bulk-delete button for non-`isAdminOrLeaderSale` users instead of alerting at runtime.
- The four-way delete flow (trash / approve+reject / pending / clock) remains domain-specific inline — NOT extracted to shared component.
- Do not change any permission logic or handler functions.

## Key Insights
- Four mutually exclusive delete UI branches exist per row based on role + `hasPendingDelete`. These are domain-specific and cannot be abstracted into `TableRowActions`. Leave them inline.
- Edit button has no permission gate — intentionally or not (unresolved Q). Do not add gates; preserve current behavior.
- Bulk-delete button is visible to Sale members (`isSale`) but blocked at runtime with an alert when `!isAdminOrLeaderSale`. Agreed decision: hide the button when `!isAdminOrLeaderSale` (hide > disable/alert).
- `TableRowActions` can own the edit button; the delete cell remains custom per-row logic.
- Checkbox column is shown only for `isSale` — leave unchanged.

## Requirements
- Replace the standalone edit icon button (`<Edit2>`) with `<TableRowActions onEdit={...} />`.
- The four delete UI states stay as inline JSX; do not pass `onDelete` to `TableRowActions`.
- Fix bulk-delete visibility: wrap the bulk-delete `<button>` with `{isAdminOrLeaderSale && ...}` (remove the `onClick` alert guard, keep the button hidden entirely when unauthorized).
- Do not add `onView` to any row — no view action exists in LeadLogs currently.
- Do not touch permission derivation logic (`isSale`, `isAdminOrLeaderSale`).
- Do not touch handler functions (`requestLeadDelete`, `approveLeadDeleteRequest`, etc.).

## Architecture
```
lead-logs-tab.tsx
  row: edit cell
    before: <button onClick={() => openEdit(lead)}><Edit2 /></button>
    after:  <TableRowActions onEdit={() => openEdit(lead)} size={14} />

  row: delete cell
    UNCHANGED — keep four-way conditional inline:
      branch 1: !hasPendingDelete           → Trash icon (gated by role)
      branch 2: hasPendingDelete + admin    → Approve(✓) + Reject(✗)
      branch 3: hasPendingDelete + requester → "Đang chờ" amber button
      branch 4: hasPendingDelete + other    → Clock icon read-only

  bulk-action bar:
    before: button visible to isSale, alert fires when !isAdminOrLeaderSale
    after:  {isAdminOrLeaderSale && <button onClick={handleBulkDelete}>...}
             remove alert guard inside handler (or keep handler, guard is now at render)
```

## Related Code Files
- **Modify:** `src/components/lead-tracker/lead-logs-tab.tsx`
- **Read only:** `src/components/ui/table-row-actions.tsx` (Phase 01 output)

## File Ownership
| File | Action |
|---|---|
| `src/components/lead-tracker/lead-logs-tab.tsx` | MODIFY — Phase 04 exclusively |

## Implementation Steps
1. Confirm Phase 01 complete.
2. Read `lead-logs-tab.tsx` in full to map current structure.
3. Add import: `import { TableRowActions } from '../ui/table-row-actions';`
   (adjust relative path based on actual file location).
4. Locate the edit button (`<Edit2>` icon, always visible). Replace with:
   `<TableRowActions onEdit={() => openEdit(lead)} size={14} />`
5. Verify the four delete branches are untouched. Do not wrap or extract them.
6. Locate the bulk-delete bar render condition. Currently it renders for `isSale`. Find the `onClick` handler that does `if (!isAdminOrLeaderSale) { alert(...); return; }`. Change render condition to `{isAdminOrLeaderSale && <bulk delete button>}` and remove the early-return alert inside the handler (the guard is now at the render level).
7. Do not remove `Edit2` import if still used elsewhere in the file; only remove if zero remaining usages.
8. Run `npx tsc --noEmit` — zero new errors.
9. Manually trace all four delete branches to confirm no regressions.

## Todo List
- [ ] Phase 01 complete (file exists)
- [ ] Read full lead-logs-tab.tsx
- [ ] Import TableRowActions
- [ ] Replace edit button with TableRowActions
- [ ] Confirm four delete branches untouched
- [ ] Fix bulk-delete visibility (isAdminOrLeaderSale render gate)
- [ ] Remove alert guard from bulk-delete handler
- [ ] Clean unused Edit2 import if applicable
- [ ] Compile check passes
- [ ] Four delete branch smoke-test documented

## Success Criteria
- `npx tsc --noEmit` zero new errors
- Edit button renders via `TableRowActions`; opens edit modal correctly
- Four delete branches render correctly per role + `hasPendingDelete` state
- Bulk-delete button hidden (not disabled, not alert) for non-`isAdminOrLeaderSale` users
- Bulk-delete button visible and functional for `isAdminOrLeaderSale` users
- No permission derivation logic changed
- No handler functions changed

## Conflict Prevention
- Phase 04 exclusively owns `lead-logs-tab.tsx`. Phases 02, 03, 05 never touch it.
- Settings.tsx is owned by Phase 05 (verify only) — no conflict.

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Four delete branches accidentally collapsed during refactor | Medium | High | Read + diff delete cell before and after; keep branches verbatim |
| Bulk-delete handler still has other logic beyond the alert guard | Low | Medium | Read handler fully before removing alert — only remove the alert+return, keep rest |
| Edit button used in multiple places in the file (e.g. modal header) | Low | Medium | Grep Edit2 usages; only replace row action instances |
| Relative import path wrong for table-row-actions | Low | Low | Check existing imports in file for path pattern |

## Security Considerations
- Bulk-delete hide (not just runtime block) improves security posture: Sale members no longer see a button they cannot use.
- Permission derivation (`isSale`, `isAdminOrLeaderSale`) unchanged — server remains authoritative.
- Edit button intentionally ungated per research; preserving current behavior. Unresolved Q flagged in plan.md.

## Next Steps
- Signal Phase 06 when complete.
- Unresolved Q: confirm with product owner whether LeadLogs edit is intentionally ungated for all users.
