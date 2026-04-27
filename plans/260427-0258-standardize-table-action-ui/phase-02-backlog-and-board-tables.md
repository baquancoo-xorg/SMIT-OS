# Phase 02 — ProductBacklog + TaskTableView Actions

## Context Links
- Research: `research/researcher-01-action-patterns.md` (Pattern A + B details)
- Shared component: `phase-01-shared-action-component.md`
- Plan overview: `plan.md`

## Parallelization Info
- **Group:** B (parallel with 03, 04, 05)
- **Blocks:** Phase 06
- **Blocked by:** Phase 01
- **Can run in parallel with:** Phases 03, 04, 05

## Overview
- **Priority:** P2
- **Status:** pending
- **Effort:** ~1h
- Replace inline action buttons in `ProductBacklog.tsx` (BacklogTableView + StoryTreeRow + EpicTreeGroup) and `TaskTableView.tsx` (overflow dropdown) with `TableRowActions`.
- TaskTableView currently uses Pattern B (dropdown). Replace with Pattern A via `TableRowActions` — simpler, consistent. Dropdown + AnimatePresence + openMenuId state removed.

## Key Insights
- ProductBacklog has two action variants: table rows (`p-2`, size 14, always visible) and tree rows (`p-1.5`, size 12, `compact`). Both map cleanly to `TableRowActions` props.
- TaskTableView dropdown adds `openMenuId` state, `AnimatePresence`, and absolute positioning — all eliminated by switching to inline buttons via `TableRowActions`.
- Bulk-action bar in both files is not in scope (separate future task per research report).
- No permission gates in either file — all users see all actions.

## Requirements
- Replace all three inline action button groups in `ProductBacklog.tsx` with `<TableRowActions>`.
- Replace the `more_horiz` dropdown in `TaskTableView.tsx` with `<TableRowActions onView onEdit onDelete>`.
- Remove now-unused `openMenuId` state and its setter in TaskTableView.
- Remove now-unused `AnimatePresence` import if dropdown was its only consumer.
- All existing `onClick` handlers (view, edit, delete) must be wired unchanged.
- No behavior changes — only UI structure changes.

## Architecture
```
ProductBacklog.tsx
  BacklogTableView  → <TableRowActions onView onEdit onDelete size={14} />
  StoryTreeRow      → <TableRowActions onView onEdit onDelete size={12} compact />
  EpicTreeGroup     → <TableRowActions onView onEdit onDelete size={12} compact />

TaskTableView.tsx
  row actions cell  → <TableRowActions onView onEdit onDelete size={14} />
  [remove]          → openMenuId state, AnimatePresence dropdown, more_horiz button
```

## Related Code Files
- **Modify:** `src/pages/ProductBacklog.tsx`
- **Modify:** `src/components/board/TaskTableView.tsx`
- **Read only:** `src/components/ui/table-row-actions.tsx` (Phase 01 output)

## File Ownership
| File | Action |
|---|---|
| `src/pages/ProductBacklog.tsx` | MODIFY — Phase 02 exclusively |
| `src/components/board/TaskTableView.tsx` | MODIFY — Phase 02 exclusively |

## Implementation Steps
1. Confirm Phase 01 is complete: `src/components/ui/table-row-actions.tsx` exists.
2. **ProductBacklog.tsx:**
   a. Add import: `import { TableRowActions } from '../components/ui/table-row-actions';`
   b. Locate BacklogTableView actions `<td>` — replace the `<div className="flex...gap-1">` + 3 buttons with `<TableRowActions onView={...} onEdit={...} onDelete={...} />`.
   c. Locate StoryTreeRow action buttons — replace with `<TableRowActions onView onEdit onDelete compact />`.
   d. Locate EpicTreeGroup action buttons — same as StoryTreeRow.
   e. Remove now-unused individual icon imports (Eye, Edit2, Trash2) only if no longer used elsewhere in the file.
3. **TaskTableView.tsx:**
   a. Add import: `import { TableRowActions } from '../ui/table-row-actions';`
   b. Remove `openMenuId` state and `setOpenMenuId`.
   c. Remove `AnimatePresence` import if dropdown was its only usage (grep before removing).
   d. Locate the `more_horiz` button + dropdown block — replace entire block with `<TableRowActions onView={() => onViewDetails?.(item)} onEdit={() => onEdit?.(item)} onDelete={() => onDelete(item.id)} />`.
   e. Remove now-unused icon imports (Eye, Edit2, Trash2 from dropdown) only if unused elsewhere.
4. Run `npx tsc --noEmit` — zero new errors.
5. Visually verify: table rows show 3 icon buttons; tree rows show icons hidden until hover.

## Todo List
- [ ] Phase 01 complete (file exists)
- [ ] ProductBacklog: import TableRowActions
- [ ] ProductBacklog: replace BacklogTableView actions
- [ ] ProductBacklog: replace StoryTreeRow actions (compact)
- [ ] ProductBacklog: replace EpicTreeGroup actions (compact)
- [ ] ProductBacklog: clean unused imports
- [ ] TaskTableView: import TableRowActions
- [ ] TaskTableView: remove openMenuId state
- [ ] TaskTableView: remove AnimatePresence/dropdown block
- [ ] TaskTableView: wire TableRowActions handlers
- [ ] TaskTableView: clean unused imports
- [ ] Compile check passes

## Success Criteria
- `npx tsc --noEmit` zero new errors
- ProductBacklog table rows: Eye + Edit + Delete buttons visible inline
- ProductBacklog tree rows: buttons appear on row hover only (compact)
- TaskTableView: no more_horiz button or dropdown; 3 inline action buttons per row
- All existing handler logic (view detail, edit modal, delete confirm) still fires correctly
- No `openMenuId` state remains in TaskTableView

## Conflict Prevention
- Phase 02 exclusively owns `ProductBacklog.tsx` and `TaskTableView.tsx`.
- No other phase touches these files.
- Phase 02 only reads `table-row-actions.tsx` — never modifies it.

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| AnimatePresence used elsewhere in TaskTableView beyond dropdown | Low | Medium | Grep for AnimatePresence usages before removing import |
| Tree-row hover behavior breaks (group class required) | Medium | Low | Verify parent row has `group` class; if missing, add to `<tr>` — not the component |
| Handlers accidentally unbound during refactor | Medium | High | Test each action button click after replace; compare handler references before/after |
| openMenuId removal leaves dangling references | Low | Medium | Search full file for openMenuId before deleting state |

## Security Considerations
- No permission changes. Neither file had permission gates; standardization does not add or remove any.
- Destructive delete handlers remain unchanged — same confirm dialogs fire.

## Next Steps
- Signal Phase 06 when complete.
- If tree rows lack `group` class on `<tr>`, note as minor issue in Phase 06 report.
