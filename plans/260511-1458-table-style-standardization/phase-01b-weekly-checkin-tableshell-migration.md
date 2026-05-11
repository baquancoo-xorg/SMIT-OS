# Phase 1b — Weekly Checkin: DataTable v2 → TableShell

## Context Links
- Brainstorm: `plans/reports/brainstorm-260511-1458-table-style-standardization.md`
- Spec: STANDARD contract `src/components/ui/table-contract.ts`
- Reference (visual): `src/components/lead-tracker/lead-logs-tab.tsx`
- Reference (sortable pattern): `src/components/media-tracker/media-posts-table.tsx`
- File owned: `src/pages/WeeklyCheckin.tsx`

## Parallelization Info
Runs in parallel with 1a, 2a, 2b, 3a, 3b. Zero file overlap.

## Overview
- Priority: P2
- Status: complete
- Date: 2026-05-11
- Effort: HIGH

Replace `DataTable` v2 with inline `TableShell variant="standard"` + sortable hook + SortableTh. Wrap in `GlassCard variant="surface" padding="none"`. Drop pagination and `hideBelow`. Columns: Reporter, Week, Status, Created, Actions.

## Key Insights
- 5 columns (vs Daily Sync 6) — `colSpan={5}` for empty row.
- `week` field may be string ISO or week-number — accessor must produce comparable value.
- Pattern mirrors phase 1a; only column set differs.

## Requirements
- Inline thead/tbody using `getTableContract('standard')`.
- Sort works on Reporter, Week, Status, Created columns.
- Empty state via `EmptyState variant="inline"` inside single full-span row.
- No pagination, no responsive `hideBelow`.
- TypeScript clean compile.

## Architecture

### Token references
Same as 1a — `headerRow`, `headerCell`, `body`, `row`, `cell`, `emptyState`, `actionHeaderCell`, `actionCell` from `getTableContract('standard')`.

### Glass flatten override
```jsx
<GlassCard variant="surface" padding="none">
  <TableShell
    variant="standard"
    className="bg-transparent border-0 shadow-none rounded-none"
  >
    ...
  </TableShell>
</GlassCard>
```

### Sortable hook usage
```ts
type SortKey = 'reporter' | 'week' | 'status' | 'createdAt';

const { sorted, sortKey, sortDir, toggleSort } = useSortableData<WeeklyRow, SortKey>(
  rows,
  'createdAt',
  'desc',
  (row, key) => {
    if (key === 'createdAt') return new Date(row.createdAt);
    if (key === 'week') return row.week; // string compare OK for ISO/week-number
    return row[key] as SortableValue;
  },
);
```

## Related Code Files
- Modify: `src/pages/WeeklyCheckin.tsx` (sole owner)
- Read-only refs: table-shell.tsx, table-contract.ts, sortable-th.tsx, use-sortable-data.ts, glass-card.tsx, media-posts-table.tsx

## File Ownership
Phase 1b OWNS ONLY `src/pages/WeeklyCheckin.tsx`. No other phase touches it.

## Implementation Steps
1. Read current `src/pages/WeeklyCheckin.tsx` to map data shape + handlers + week field type.
2. Remove `DataTable` import.
3. Import `TableShell`, `SortableTh`, `useSortableData`, `GlassCard`, `getTableContract`.
4. Define `SortKey` union: `'reporter' | 'week' | 'status' | 'createdAt'`.
5. Build accessor (Date for `createdAt`; week stays string).
6. Wire `useSortableData` with `('createdAt', 'desc')`.
7. Compute `contract = getTableContract('standard')`.
8. Replace `<DataTable />` block with GlassCard + flattened TableShell + thead (4 SortableTh + 1 plain actions th sticky) + tbody mapping sorted.
9. Empty state row: `colSpan={5}` with `<EmptyState variant="inline" ... />`.
10. `npx tsc --noEmit` and fix type errors.
11. `npm run dev` and verify rendering + sort toggle + empty state.

## Todo List
- [x] Remove `DataTable` import
- [x] Import TableShell + SortableTh + useSortableData + GlassCard + getTableContract
- [x] Define `SortKey` union + accessor
- [x] Call `useSortableData` with `createdAt desc` init
- [x] Replace render with GlassCard + flattened TableShell
- [x] Build 4 SortableTh + 1 actions th (sticky header)
- [x] Map sorted rows
- [x] Empty state via `EmptyState variant="inline"` (colSpan={5})
- [x] `tsc --noEmit` clean
- [x] Smoke test

## Success Criteria
- Visual parity with Lead Logs (header, hover, divider).
- No double border/shadow.
- 4 sortable columns toggle asc/desc, icon updates.
- TypeScript compile clean.
- Empty state inline EmptyState.

## Conflict Prevention
Phase 1b owns ONLY `src/pages/WeeklyCheckin.tsx`. Safe parallel with all other phases.

## Risk Assessment
- Risk: `week` field type variability breaks sort. Mitigation: string compare via `localeCompare` (built into hook fallback).
- Risk: Empty state colSpan mismatch. Mitigation: match exactly 5 (4 data + 1 actions).
- Risk: Storybook regression. Mitigation: DataTable v2 file untouched.

## Security Considerations
N/A — UI-only refactor.

## Next Steps
None after merge. Rollup smoke test covers sanity.
