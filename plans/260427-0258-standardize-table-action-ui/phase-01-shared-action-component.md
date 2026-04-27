# Phase 01 — Shared `TableRowActions` Component

## Context Links
- Research: `research/researcher-01-action-patterns.md`
- Research: `research/researcher-02-permission-risks.md`
- Plan overview: `plan.md`
- Source of truth pattern: `src/pages/ProductBacklog.tsx` (BacklogTableView inline buttons)

## Parallelization Info
- **Group:** A (must complete before any other phase starts)
- **Blocks:** Phases 02, 03, 04, 05
- **Blocked by:** none
- **Can run in parallel with:** nothing — serial prerequisite

## Overview
- **Priority:** P1 (unblocks all consumers)
- **Status:** pending
- **Effort:** ~30 min
- Create `src/components/ui/table-row-actions.tsx` — pure presentational component, ~40 lines.
- No AuthContext, no API calls, no business logic.

## Key Insights
- Pattern A (ProductBacklog BacklogTableView) is the source of truth: `p-2 text-slate-400 hover:text-{color} hover:bg-{color}/5 rounded-lg transition-all`, icon size 14.
- Compact tree-row variant uses `p-1.5`, icon size 12, `opacity-0 group-hover:opacity-100` — expose via `compact` prop.
- Each action (view/edit/delete) is optional; render nothing if handler not provided.
- Delete uses `hover:text-error hover:bg-error/5`; view+edit use `hover:text-primary hover:bg-primary/5`.
- `rounded-xl` appears in Settings tabs (size 16); `rounded-lg` in ProductBacklog (size 14). Use `rounded-lg` as default; expose via prop if needed — YAGNI for now, keep one default.

## Requirements
- `onView?: () => void` — renders Eye icon button
- `onEdit?: () => void` — renders Edit2 icon button
- `onDelete?: () => void` — renders Trash2 icon button
- `size?: number` — icon size, default `14`
- `compact?: boolean` — `p-1.5` padding + `opacity-0 group-hover:opacity-100` when true
- `className?: string` — escape hatch for wrapper div
- No permission logic. Callers hide/show by conditionally passing handlers or not rendering the component.
- Component must be pure: same props → same output, no side effects.

## Architecture
```
src/components/ui/table-row-actions.tsx
  └── renders <div className="flex items-center justify-end gap-1 [opacity-0 group-hover:opacity-100]">
        ├── [onView]   → <button><Eye /></button>
        ├── [onEdit]   → <button><Edit2 /></button>
        └── [onDelete] → <button><Trash2 /></button>
```
Prop-driven visibility: each button only renders when its handler is defined.

## Related Code Files
- **Create:** `src/components/ui/table-row-actions.tsx`
- **Read for reference:** `src/pages/ProductBacklog.tsx` lines ~440–470 (BacklogTableView actions column)
- **Read for reference:** `src/components/ui/` (existing primitives for naming/import consistency)

## File Ownership
| File | Action |
|---|---|
| `src/components/ui/table-row-actions.tsx` | CREATE — Phase 01 exclusively |

No other file is touched in this phase.

## Implementation Steps
1. Read `src/components/ui/` directory to confirm no existing `table-row-actions.tsx`.
2. Read ProductBacklog.tsx actions column markup (exact classes) as reference.
3. Create `src/components/ui/table-row-actions.tsx`:
   - Import `Eye`, `Edit2`, `Trash2` from `lucide-react`.
   - Define `TableRowActionsProps` interface with all props above.
   - Wrapper div: `flex items-center justify-end gap-1` + compact opacity classes when `compact=true`.
   - Each button: `p-{2|1.5} text-slate-400 hover:text-{color} hover:bg-{color}/5 rounded-lg transition-all`.
   - Export named: `export function TableRowActions(...)`.
4. Run TypeScript compile check: `npx tsc --noEmit`.
5. Verify no import of AuthContext, useAuth, fetch, axios, or any API module.

## Todo List
- [ ] Confirm `src/components/ui/table-row-actions.tsx` does not exist
- [ ] Extract exact class strings from ProductBacklog BacklogTableView
- [ ] Create component file
- [ ] Compile check passes
- [ ] No auth/API imports verified

## Success Criteria
- File exists at `src/components/ui/table-row-actions.tsx`
- `npx tsc --noEmit` reports zero new errors
- Component renders subset of buttons based on which handlers are provided
- compact=true applies opacity-0 + group-hover:opacity-100 to wrapper
- Zero imports of auth context or HTTP client

## Conflict Prevention
- This phase creates a new file only — no existing file is modified.
- Phases 02–05 may import but never modify this file.

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `rounded-lg` vs `rounded-xl` inconsistency across consumers | Low | Low | Settings tabs use size-16 icons; accept minor visual delta; callers can override via className |
| Lucide-react version missing Eye/Edit2/Trash2 | Very Low | Medium | Already used in ProductBacklog — confirmed present |
| Consumer phases break if component API changes | Low | High | Freeze API before unblocking phases 02–05; no breaking changes after |

## Security Considerations
- Pure UI component — no auth reads, no data exposure risk.
- Callers are responsible for hiding actions based on permissions (hide, not disable).

## Next Steps
- After file committed, unblock Phases 02, 03, 04, 05 to run in parallel.
