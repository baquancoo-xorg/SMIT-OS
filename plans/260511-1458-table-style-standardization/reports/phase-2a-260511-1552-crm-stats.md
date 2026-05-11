# Phase 2a Report — CRM Stats Token Alignment

**Status:** DONE

## Token Replacements Applied

| Token (before) | Token (after) | Occurrences |
|---|---|---|
| `px-3 py-3` | `px-4 py-2.5` | 5 td cells |
| `text-[9px]` | `text-[length:var(--text-caption)]` | 5 sub-header th cells |
| `text-xs` (body td/p) | `text-[length:var(--text-body-sm)]` | 6 td + 1 empty-state p |
| `font-black` (headers/date col) | `font-semibold` | 3 th + 1 td + 1 p |
| `tracking-[0.2em]` | `tracking-[var(--tracking-wide)]` | 1 (AE group header) |
| `tracking-widest` | `tracking-[var(--tracking-wide)]` | 5 + 1 (sub-headers + empty) |
| `px-3 py-2` (sub-headers) | `px-4 py-2.5` | 5 th cells |
| `py-3` in AE group header | `py-2.5` | 1 |

## Bug Fixes

- `border-outline-variant/40/50` → `border-outline-variant/40` — all 9 occurrences removed
- `bg-surface-variant/30/30` → `bg-surface-variant/30` — 1 occurrence in date column td

## Preservation

- Pivot 2-row header: `rowSpan={2}` on Date th, `colSpan={5}` on AE group headers — unchanged
- Sticky positioning: `sticky top-0 z-30` / `sticky top-[46px] z-30` / `sticky left-0` — unchanged
- Semantic colors: `text-emerald-600` (processed), `text-error` (high remaining), `text-primary/60` (totalRate) — unchanged
- `font-bold` preserved on body td cells where spec kept semantic distinction (added/processed/dr/tr columns)
- No GlassCard wrap added — parent LeadTracker.tsx owns that

## Bug Fix Verification

```
grep -n 'border-outline-variant/40/50' src/components/lead-tracker/daily-stats-tab.tsx
→ (no output) CLEAN
```

## Type Check Result

`npx tsc --noEmit` — 0 errors in `daily-stats-tab.tsx`.  
Pre-existing errors in `src/pages/DailySync.tsx` (lines 253, 331 — missing `DataTableColumn`/`DataTable` names) — out of scope for this phase.

## Deviations

- `font-black` on high-remaining td (conditional class) converted to `font-semibold` per spec. The semantic "alert" weight is now carried purely by `text-error` color — acceptable per STANDARD contract.
- AE group header had `text-xs font-black` — converted to `text-[length:var(--text-body-sm)] font-semibold` consistent with other header cells.

## Unresolved Questions

None.
