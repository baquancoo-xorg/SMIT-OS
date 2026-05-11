# Phase 2b — KPI Metrics: GlassCard Wrap + Token Sync (Dense)

## Context Links
- Brainstorm: `plans/reports/brainstorm-260511-1458-table-style-standardization.md`
- Spec: DENSE contract `src/components/ui/table-contract.ts`
- Reference (visual hover/header bg): `src/components/lead-tracker/lead-logs-tab.tsx`
- File owned: `src/components/dashboard/overview/KpiTable.tsx`

## Parallelization Info
Runs in parallel with 1a, 1b, 2a, 3a, 3b. Zero file overlap.

## Overview
- Priority: P2
- Status: complete
- Date: 2026-05-11
- Effort: MEDIUM

KPI table stays `dense` variant (justified by 18 cols × 30+ rows + sticky Date col + striped rows). Wrap parent section in `GlassCard variant="surface" padding="md"`. Sync header bg + hover token. Preserve 3-table scroll-sync architecture (lines 271-311 — DO NOT TOUCH).

## Key Insights
- Dense is correct for KPI: information density requires tighter rhythm.
- Scroll-sync logic across 3 sub-tables is intricate — touching it risks regression; restrict scope to className tokens.
- Currently sits in bare `DashboardPanel` — adding GlassCard wrap matches the rest of the system.

## Requirements
- Wrap rendered output in `GlassCard variant="surface" padding="md"`.
- Sync header bg: `bg-surface-variant/60` → `bg-surface-variant/30`.
- Sync row hover: `hover:bg-primary/5` → `hover:bg-primary/[0.02]`.
- Preserve: dense cell padding `px-3 py-2`, sticky Date column, striped rows, 3-table scroll-sync split.
- Do NOT modify any scroll-sync handler (lines 271-311).

## Architecture

### Token sync
```
Header bg:    bg-surface-variant/60   → bg-surface-variant/30
Row hover:    hover:bg-primary/5      → hover:bg-primary/[0.02]
Padding:      px-3 py-2 (KEEP)
Sticky Date:  KEEP
Striped:      KEEP
```

### Glass wrap pattern
```jsx
<GlassCard variant="surface" padding="md">
  {/* existing DashboardPanel content + 3-table scroll-sync block unchanged */}
</GlassCard>
```

If `DashboardPanel` already provides padding, choose ONE: either keep `DashboardPanel` inside GlassCard with `padding="none"` to avoid double padding, or replace `DashboardPanel` with `GlassCard padding="md"`. Decide after reading current structure. Prefer minimum-diff approach.

## Related Code Files
- Modify: `src/components/dashboard/overview/KpiTable.tsx` (sole owner)
- Read-only refs: table-contract.ts, glass-card.tsx, lead-logs-tab.tsx

## File Ownership
Phase 2b OWNS ONLY `src/components/dashboard/overview/KpiTable.tsx`. No other phase touches it.

## Implementation Steps
1. Read current `src/components/dashboard/overview/KpiTable.tsx` end-to-end. Mark lines 271-311 (scroll-sync) as **DO NOT TOUCH**.
2. Locate header cells with `bg-surface-variant/60` → replace with `bg-surface-variant/30`. Preserve any other utility classes on the same element.
3. Locate row `hover:bg-primary/5` → replace with `hover:bg-primary/[0.02]`.
4. Identify outer wrapper:
   - If wrapped in `DashboardPanel`, wrap that in `GlassCard variant="surface" padding="md"` OR replace if appropriate to avoid double-padding.
   - Else wrap the top-level fragment with `GlassCard variant="surface" padding="md"`.
5. Verify 3-table split + scroll-sync still works (no className touched on the scroll containers themselves unless it's the hover/header bg).
6. `npx tsc --noEmit` and fix errors.
7. `npm run dev` and:
   - Confirm sticky Date column behavior.
   - Confirm horizontal scroll syncs across all 3 split tables.
   - Confirm striped rows remain.

## Todo List
- [x] Wrap output in `GlassCard variant="surface" padding="md"` (or refactor DashboardPanel host)
- [x] Replace `bg-surface-variant/60` → `bg-surface-variant/30` on header cells
- [x] Replace `hover:bg-primary/5` → `hover:bg-primary/[0.02]` on rows
- [x] Verify scroll-sync logic untouched (lines 271-311)
- [x] Verify sticky Date column intact
- [x] Verify striped rows intact
- [x] `tsc --noEmit` clean
- [x] Smoke test horizontal scroll sync

## Success Criteria
- KPI table sits inside `GlassCard variant="surface"`.
- Header bg + row hover match STANDARD tokens (despite dense variant otherwise).
- Scroll-sync across 3 sub-tables still functions.
- Sticky Date col still pins.
- Striped rows still alternate.
- TypeScript compile clean.

## Conflict Prevention
Phase 2b owns ONLY `src/components/dashboard/overview/KpiTable.tsx`. Safe parallel.

## Risk Assessment
- Risk: Adding GlassCard introduces extra padding causing layout shift. Mitigation: if `DashboardPanel` already pads, use `padding="none"` on inner DashboardPanel or remove duplicate.
- Risk: Touching scroll-sync container className breaks sync. Mitigation: edit only header `bg-*` and row `hover:*` classes; leave scroll containers untouched.
- Risk: Sticky Date col layering broken by new wrapper. Mitigation: sticky uses `position: sticky` with `z-index`; outer wrapper does not interfere.

## Security Considerations
N/A — UI-only token alignment + wrapper.

## Next Steps
None after merge.
