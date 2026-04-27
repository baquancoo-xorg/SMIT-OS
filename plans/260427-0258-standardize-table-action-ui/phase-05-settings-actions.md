# Phase 05 — Settings Actions

## Context Links
- Research: `research/researcher-02-permission-risks.md` (UserManagement + FbConfig permission analysis)
- Shared component: `phase-01-shared-action-component.md`
- Plan overview: `plan.md`

## Parallelization Info
- **Group:** B (parallel with 02, 03, 04)
- **Blocks:** Phase 06
- **Blocked by:** Phase 01
- **Can run in parallel with:** Phases 02, 03, 04

## Overview
- **Priority:** P2
- **Status:** pending
- **Effort:** ~1h
- Replace inline Edit2 + Trash2 button pairs in `user-management-tab.tsx` and `fb-config-tab.tsx` with `TableRowActions`.
- `Settings.tsx`: verify only — do not modify unless a prop signature change forces it (YAGNI).
- Both tabs have no client-side permission gates beyond self-delete prevention; preserve as-is.

## Key Insights
- `user-management-tab.tsx`: Edit + Delete buttons at lines ~243-244 (table view) and ~269-270 (list view) — two render locations for the same row actions. Both need replacement.
- Delete button has `disabled={user.id === currentUser?.id}` for self-delete prevention. `TableRowActions` does not support `disabled` prop per Phase 01 spec. Options: (a) pass `onDelete` conditionally (`onDelete={user.id !== currentUser?.id ? () => onDeleteConfirm(...) : undefined}`) so button is hidden when self; (b) add `disabled` prop to component. Prefer (a) — hide > disable, aligns with agreed decision.
- `fb-config-tab.tsx`: Edit + Delete at line ~284-285. No permission gate. Straightforward replacement.
- Both files use icon size 16, not 14. Pass `size={16}` to `TableRowActions`.
- `Settings.tsx` only passes callbacks into tab components; adding no new props means no change needed there.

## Requirements
- Replace both instances of Edit2+Trash2 buttons in `user-management-tab.tsx` with `<TableRowActions onEdit onDelete size={16} />`.
- Self-delete prevention: pass `onDelete` as `undefined` when `user.id === currentUser?.id` (button hidden, not disabled).
- Replace Edit2+Trash2 buttons in `fb-config-tab.tsx` with `<TableRowActions onEdit onDelete size={16} />`.
- No new props added to tab component interfaces (avoid touching Settings.tsx).
- No permission logic added or removed in either file.
- `Settings.tsx`: read to verify no signature change needed, then leave untouched.

## Architecture
```
user-management-tab.tsx
  table view row (line ~243-244):
    before: <Edit2 button> + <Trash2 button disabled={self}>
    after:  <TableRowActions
              onEdit={() => openEditUser(user)}
              onDelete={user.id !== currentUser?.id ? () => onDeleteConfirm('user', user.id) : undefined}
              size={16}
            />
  list view row (line ~269-270): same replacement

fb-config-tab.tsx
  row actions (line ~284-285):
    before: <Edit2 button> + <Trash2 button>
    after:  <TableRowActions
              onEdit={() => openEdit(acc)}
              onDelete={() => handleDeleteAccount(acc.id)}
              size={16}
            />

Settings.tsx
  VERIFY ONLY — no change
```

## Related Code Files
- **Modify:** `src/components/settings/user-management-tab.tsx`
- **Modify:** `src/components/settings/fb-config-tab.tsx`
- **Verify (no edit):** `src/pages/Settings.tsx`
- **Read only:** `src/components/ui/table-row-actions.tsx` (Phase 01 output)

## File Ownership
| File | Action |
|---|---|
| `src/components/settings/user-management-tab.tsx` | MODIFY — Phase 05 exclusively |
| `src/components/settings/fb-config-tab.tsx` | MODIFY — Phase 05 exclusively |
| `src/pages/Settings.tsx` | VERIFY only — Phase 05 exclusively (no edit) |

## Implementation Steps
1. Confirm Phase 01 complete.
2. **Settings.tsx (verify, ~5 min):**
   a. Read file; confirm it does not need new props to support tab changes.
   b. Document: "Settings.tsx verified: no prop changes required."
3. **user-management-tab.tsx:**
   a. Read file fully; locate both action button instances (table + list view).
   b. Add import: `import { TableRowActions } from '../ui/table-row-actions';`
   c. Replace table-view action buttons with `TableRowActions` (size={16}, conditional onDelete).
   d. Replace list-view action buttons with same pattern.
   e. Remove `Edit2`, `Trash2` imports only if unused elsewhere in the file.
4. **fb-config-tab.tsx:**
   a. Add import: `import { TableRowActions } from '../ui/table-row-actions';`
   b. Replace the Edit2+Trash2 button pair at line ~284-285 with `TableRowActions`.
   c. Remove `Edit2`, `Trash2` imports only if unused elsewhere.
5. Run `npx tsc --noEmit` — zero new errors.

## Todo List
- [ ] Phase 01 complete (file exists)
- [ ] Settings.tsx verified (no change)
- [ ] user-management-tab: import TableRowActions
- [ ] user-management-tab: replace table-view action buttons
- [ ] user-management-tab: replace list-view action buttons
- [ ] user-management-tab: self-delete hidden via undefined onDelete
- [ ] user-management-tab: clean unused imports
- [ ] fb-config-tab: import TableRowActions
- [ ] fb-config-tab: replace row action buttons
- [ ] fb-config-tab: clean unused imports
- [ ] Compile check passes

## Success Criteria
- `npx tsc --noEmit` zero new errors
- UserManagement table + list views: Edit + Delete buttons render via TableRowActions (size 16)
- Self-user row: Delete button absent (hidden, not disabled)
- Other users: Edit + Delete buttons functional; handlers fire correctly
- FbConfig rows: Edit + Delete buttons render via TableRowActions; handlers unchanged
- Settings.tsx unmodified
- No permission logic added or removed in either tab

## Conflict Prevention
- Phase 05 exclusively owns both settings tab files and Settings.tsx verification.
- No other phase touches these files.
- Phase 04 owns lead-logs-tab.tsx — no overlap.

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| user-management-tab has two render locations (table + list); missing one | Medium | Medium | Grep for Edit2 after replacement to confirm zero remaining raw buttons |
| Self-delete: hiding button (undefined) vs original disabled u2014 behavior delta | Low | Low | Agreed decision: hide > disable. Document in Phase 06 report |
| fb-config-tab Edit2/Trash2 used in inline editing form (not just row actions) | Low | Medium | Read full file; only replace the row-action buttons at ~284-285, not form buttons |
| Settings.tsx prop signature actually needs update | Very Low | Medium | Verify step catches this; escalate to lead if found |

## Security Considerations
- No permission guards added or removed. Server enforces authorization on `/api/users/:id` DELETE and `/api/admin/*`.
- Self-delete prevention preserved via conditional `onDelete` (hide approach).
- Unresolved Q: Settings route admin-gating not verified in this phase — flagged in plan.md for Phase 06 to document.

## Next Steps
- Signal Phase 06 when complete.
- Phase 06 should document the open question about Settings route admin-gating.
