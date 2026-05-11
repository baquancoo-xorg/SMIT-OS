# Phase 2b Report — KPI Metrics GlassCard Wrap + Token Sync

**Date:** 2026-05-11
**File:** `src/components/dashboard/overview/KpiTable.tsx`

---

## Status
DONE

---

## Wrap Approach Chosen
**No structural change needed.**

`DashboardPanel` already delegates to `GlassCard variant="surface" padding="none"` (confirmed in `dashboard-panel.tsx` line 19). The outer `<DashboardPanel>` on line 365 is already a GlassCard surface. Adding another GlassCard wrapper would double-nest glass containers — avoided per minimum-diff rule.

The task goal (output wrapped in `GlassCard variant="surface"`) is satisfied by the existing `DashboardPanel`.

---

## Token Changes Applied

| Location | Token | Before | After |
|---|---|---|---|
| All 18 `<th>` elements (lines 390–442) | header bg | `bg-surface-variant/60` | `bg-surface-variant/30` |
| `KpiTableRow` `<tr>` (line 165) | row hover | `hover:bg-primary/5` | `hover:bg-primary/[0.02]` |

**Preserved unchanged (correctly reverted after replace_all overshoot):**
- `RateBadge` zero-rate badge bg: `bg-surface-variant/60` (badge UI, not header)
- `MqlBadgeWithTooltip` zero-rate badge bg: `bg-surface-variant/60` (badge UI, not header)
- `cellBg` for total row: `bg-surface-variant/60` (total row emphasis, not header)
- Sticky Date column total cell bg: `bg-surface-variant/60` (total row emphasis, not header)

---

## Preserved Invariants
- Dense variant: all `px-3 py-2` cell padding retained
- Sticky Date column: `sticky left-0` on both `<th>` and data `<td>` untouched
- Striped rows: `isEven ? 'bg-surface/30' : 'bg-surface-variant/20'` unchanged
- Scroll-sync architecture (lines 271–311): completely untouched — refs, callbacks, handlers identical to original

---

## Type Check Result
`npx tsc --noEmit` — clean, no output.

---

## Unresolved Questions
None.
