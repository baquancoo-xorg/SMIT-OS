# Phase 2a — CRM Stats: Token Alignment + Bug Fix

## Context Links
- Brainstorm: `plans/reports/brainstorm-260511-1458-table-style-standardization.md`
- Spec: STANDARD contract `src/components/ui/table-contract.ts`
- Reference (visual): `src/components/lead-tracker/lead-logs-tab.tsx`
- File owned: `src/components/lead-tracker/daily-stats-tab.tsx`

## Parallelization Info
Runs in parallel with 1a, 1b, 2b, 3a, 3b. Zero file overlap.

## Overview
- Priority: P2
- Status: complete
- Date: 2026-05-11
- Effort: MEDIUM

Align typography + padding + tracking tokens to STANDARD contract. Fix malformed `border-outline-variant/40/50` double-slash bug. Preserve pivot 2-row header structure, sticky positioning, and semantic accent colors. Parent in `LeadTracker.tsx:132` already wraps with GlassCard — do NOT add a second wrap here.

## Key Insights
- Pivot table 2-row header carries product UX value (at-a-glance AE compare) — keep rowSpan/colSpan.
- Semantic colors (emerald-600 done, error high-remaining, primary/60 total%) carry meaning — keep.
- Bug `border-outline-variant/40/50` is invalid Tailwind opacity — silently no-ops.

## Requirements
- Replace cell padding `px-3 py-3` → `px-4 py-2.5`.
- Replace font sizes:
  - `text-[9px]` → `text-[length:var(--text-caption)]`
  - `text-xs` → `text-[length:var(--text-body-sm)]` (only where it's content text — not the uppercase header label which should stay caption)
- Replace weights `font-black` → `font-semibold`.
- Replace tracking `tracking-[0.2em]` / `tracking-widest` → `tracking-[var(--tracking-wide)]`.
- Fix bug: `border-outline-variant/40/50` → `border-outline-variant/40`.
- Replace custom empty state (`font-black uppercase tracking-widest text-xs opacity-30`) with `standardTable.emptyState` class string (i.e., the contract's `emptyState` token, `p-8 text-center`).
- Sticky header background `bg-white` consistent across all sticky header cells.
- Preserve: pivot 2-row header (rowSpan/colSpan), sticky positioning, semantic colors.
- Do NOT add GlassCard here (parent already wraps).

## Architecture

### Token mapping
```
Padding:   px-3 py-3              → px-4 py-2.5
Caption:   text-[9px]             → text-[length:var(--text-caption)]
Body sm:   text-xs (body)         → text-[length:var(--text-body-sm)]
Weight:    font-black             → font-semibold
Tracking:  tracking-[0.2em]       → tracking-[var(--tracking-wide)]
           tracking-widest        → tracking-[var(--tracking-wide)]
Border:    border-outline-variant/40/50 (BUG) → border-outline-variant/40
Empty:     custom                 → getTableContract('standard').emptyState
Sticky bg: ad-hoc                 → bg-white (consistent)
```

### Header cell pattern (preserved)
```jsx
<th rowSpan={2} className={`${contract.headerCell} sticky left-0 top-0 z-30 bg-white`}>
  Account Executive
</th>
```

### Semantic colors (preserved)
- Status DONE → `text-emerald-600`
- High remaining → `text-error`
- Total% accent → `text-primary/60`

## Related Code Files
- Modify: `src/components/lead-tracker/daily-stats-tab.tsx` (sole owner)
- Read-only refs: table-contract.ts, lead-logs-tab.tsx
- DO NOT TOUCH: `src/pages/LeadTracker.tsx` (parent wrapper already present)

## File Ownership
Phase 2a OWNS ONLY `src/components/lead-tracker/daily-stats-tab.tsx`. No other phase touches it.

## Implementation Steps
1. Read current `src/components/lead-tracker/daily-stats-tab.tsx` to inventory all drifted classes.
2. Search-and-replace tokens (be surgical, preserve semantic-color classes):
   - `px-3 py-3` → `px-4 py-2.5`
   - `text-[9px]` → `text-[length:var(--text-caption)]`
   - `text-xs` → `text-[length:var(--text-body-sm)]` only on body content; KEEP if used for icon-only badges.
   - `font-black` → `font-semibold`
   - `tracking-[0.2em]` → `tracking-[var(--tracking-wide)]`
   - `tracking-widest` → `tracking-[var(--tracking-wide)]`
   - `border-outline-variant/40/50` → `border-outline-variant/40` (BUG FIX)
3. Replace custom empty state `<div className="font-black uppercase tracking-widest text-xs opacity-30">`-style block with `getTableContract('standard').emptyState` styling — or inline its tokens `p-8 text-center`. Use shared `EmptyState` component if pattern matches.
4. Ensure all sticky header cells share `bg-white` (no `bg-surface-variant/...` inconsistency for sticky row).
5. Verify rowSpan/colSpan still produce pivot 2-row header.
6. `npx tsc --noEmit` and fix any errors.
7. `npm run dev` and verify CRM Stats tab visually — pivot layout intact, typography matches Lead Logs density.

## Todo List
- [x] Replace `px-3 py-3` cell padding
- [x] Replace font-size tokens (caption + body-sm)
- [x] Replace `font-black` → `font-semibold`
- [x] Replace tracking tokens
- [x] Fix `border-outline-variant/40/50` bug
- [x] Replace custom empty state styling
- [x] Sticky header bg unified `bg-white`
- [x] Confirm pivot 2-row header preserved
- [x] Confirm semantic colors preserved (emerald-600, error, primary/60)
- [x] `tsc --noEmit` clean
- [x] Smoke test CRM Stats tab

## Success Criteria
- Visual parity with Lead Logs typography (caption + body-sm).
- Pivot 2-row header intact.
- No malformed border classes remain (`grep -n 'border-outline-variant/40/50' file` returns 0).
- Semantic colors unchanged.
- TypeScript compile clean.
- Parent GlassCard wrap untouched.

## Conflict Prevention
Phase 2a owns ONLY `src/components/lead-tracker/daily-stats-tab.tsx`. Parent `LeadTracker.tsx` is read-only context, not modified. Safe parallel with all other phases.

## Risk Assessment
- Risk: Over-zealous `text-xs` replacement breaks badge sizing. Mitigation: scope replace to body-text contexts only; preserve `text-xs` on icon badges if any.
- Risk: Sticky cell bg change reveals layered transparency under glass. Mitigation: `bg-white` is opaque — matches Lead Logs sticky pattern.
- Risk: rowSpan/colSpan inadvertently removed during refactor. Mitigation: leave structural attrs untouched, edit className only.

## Security Considerations
N/A — UI-only token alignment.

## Next Steps
None after merge.
