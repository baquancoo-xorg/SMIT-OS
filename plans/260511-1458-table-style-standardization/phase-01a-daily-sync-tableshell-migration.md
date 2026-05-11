# Phase 1a — Daily Sync: DataTable v2 → TableShell

## Context Links
- Brainstorm: `plans/reports/brainstorm-260511-1458-table-style-standardization.md`
- Spec: STANDARD contract `src/components/ui/table-contract.ts`
- Reference (visual): `src/components/lead-tracker/lead-logs-tab.tsx`
- Reference (sortable pattern): `src/components/media-tracker/media-posts-table.tsx`
- File owned: `src/pages/DailySync.tsx`

## Parallelization Info
Runs in parallel with 1b, 2a, 2b, 3a, 3b. Zero file overlap with any other phase.

## Overview
- Priority: P2
- Status: complete
- Date: 2026-05-11
- Effort: HIGH

Replace `DataTable` v2 with inline `TableShell variant="standard"` + `useSortableData` + `SortableTh`. Wrap in `GlassCard variant="surface" padding="none"`. Drop pagination and `hideBelow`.

## Key Insights
- DataTable v2 abstraction differs from Lead Logs reference; replacing yields parity.
- `useSortableData` accessor closure handles Date columns (`createdAt`) cleanly.
- Glass-on-shell stacking causes double borders; flatten TableShell with override className.

## Requirements
- Inline thead/tbody using `getTableContract('standard')`.
- Sort works on Reporter, Date, Status, Submission, Created columns.
- Empty state via `EmptyState variant="inline"` inside a single full-span row.
- No pagination, no responsive `hideBelow` (out of scope).
- TypeScript clean compile (`npx tsc --noEmit`).

## Architecture

### Token references
```
Header row     contract.headerRow
Header cell    contract.headerCell           +  sticky top-0 z-20 bg-white
Body           contract.body
Row            contract.row
Cell           contract.cell
Empty state    contract.emptyState
```

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
type SortKey = 'reporter' | 'date' | 'status' | 'submission' | 'createdAt';

const { sorted, sortKey, sortDir, toggleSort } = useSortableData<DailySyncRow, SortKey>(
  rows,
  'createdAt',
  'desc',
  (row, key) => {
    if (key === 'date' || key === 'createdAt') return new Date(row[key]);
    return row[key] as SortableValue;
  },
);
```

Header cells: use `<SortableTh sortKey="..." current={sortKey} dir={sortDir} onClick={toggleSort} className={contract.headerCell + ' sticky top-0 z-20 bg-white'}>Label</SortableTh>`.

Actions column header: plain `<th className={contract.actionHeaderCell + ' sticky top-0 z-20 bg-white'}>Actions</th>` (no sort).

## Related Code Files
- Modify: `src/pages/DailySync.tsx` (sole owner)
- Read-only refs: table-shell.tsx, table-contract.ts, sortable-th.tsx, use-sortable-data.ts, glass-card.tsx, media-posts-table.tsx

## File Ownership
Phase 1a OWNS ONLY `src/pages/DailySync.tsx`. No other phase reads or writes this file.

## Implementation Steps
1. Read current `src/pages/DailySync.tsx` to map existing columns + data shape + handlers.
2. Remove `DataTable` import from `'../components/ui'` barrel.
3. Add imports: `TableShell`, `SortableTh`, `useSortableData` from `'../components/ui'` (or direct paths if not re-exported), `GlassCard`, plus `getTableContract` and `SortableValue` type.
4. Define `SortKey` union local to component: `'reporter' | 'date' | 'status' | 'submission' | 'createdAt'`.
5. Build accessor function (handle Date for `date` + `createdAt`).
6. Wire `useSortableData` with initial sort `('createdAt', 'desc')`.
7. Compute `contract = getTableContract('standard')`.
8. Replace `<DataTable />` block with:
   - `<GlassCard variant="surface" padding="none">`
   - `<TableShell variant="standard" className="bg-transparent border-0 shadow-none rounded-none">`
   - `<thead><tr className={contract.headerRow}>...</tr></thead>` with 5 `SortableTh` + 1 plain `actionHeaderCell` th.
   - `<tbody className={contract.body}>` rendering `sorted.map(row => <tr className={contract.row}>...<td className={contract.actionCell}>...</td></tr>)`.
   - Empty: `{sorted.length === 0 && (<tr><td colSpan={6} className={contract.emptyState}><EmptyState variant="inline" ... /></td></tr>)}`.
9. Preserve existing actions (edit/delete handlers) — only the markup changes.
10. Run `npx tsc --noEmit` and fix type errors until clean.
11. `npm run dev` and verify Daily Sync page renders, sort toggles work, empty state appears when filter returns 0 rows.

## Todo List
- [x] Remove `DataTable` import
- [x] Import TableShell + SortableTh + useSortableData + GlassCard + getTableContract
- [x] Define `SortKey` union + accessor
- [x] Call `useSortableData(...)` with `createdAt desc` init
- [x] Replace render with GlassCard + flattened TableShell
- [x] Build 5 SortableTh + 1 actions th (sticky header)
- [x] Map sorted rows to tr/td
- [x] Empty state row using `EmptyState variant="inline"`
- [x] Verify Storybook unaffected (`data-table.stories.tsx` independent)
- [x] `tsc --noEmit` clean
- [x] Smoke test in browser

## Success Criteria
- Visual: header / hover / divider matches Lead Logs.
- No double shadow or double border around table.
- All 5 sortable columns toggle asc/desc via header click; icon updates.
- TypeScript compile clean.
- Empty state shows inline EmptyState (not blank).

## Conflict Prevention
Phase 1a owns ONLY `src/pages/DailySync.tsx`. No other phase touches it. Safe parallel.

## Risk Assessment
- Risk: DataTable v2 removed elsewhere — Storybook story breaks. Mitigation: DataTable file untouched, story still imports cleanly.
- Risk: Sort handler regression on Date columns. Mitigation: accessor explicitly returns `new Date(...)` for date keys.
- Risk: Empty state misaligned. Mitigation: use `colSpan={6}` matching column count.

## Security Considerations
N/A — UI-only refactor, no auth/data-shape changes.

## Next Steps
After merge, no follow-up required for this phase. Final smoke test happens at rollup level.
