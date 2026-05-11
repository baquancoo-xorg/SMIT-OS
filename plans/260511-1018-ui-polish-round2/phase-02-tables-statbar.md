# Phase 02 — Tables & Statbar (Bucket B)

## Context Links
- Parent plan: [`plan.md`](./plan.md)
- Brainstorm: [`../reports/brainstorm-260511-1018-ui-polish-issues.md`](../reports/brainstorm-260511-1018-ui-polish-issues.md)
- Reference (baseline): `src/components/lead-tracker/lead-logs-tab.tsx` — TableShell + getTableContract pattern, manual sort state
- TableShell primitive: `src/components/ui/table-shell.tsx`
- Table contract helper: `src/components/ui/table-contract.ts`

## Overview

| Field | Value |
|---|---|
| Date | 2026-05-11 |
| Priority | P2 |
| Effort | 3-4h |
| Status | completed |
| Review | not started |
| Depends on | Phase 01 (header pattern consumed) |

Migrate 3 tables (media-posts, campaigns, attribution) từ `DataTable v2` primitive → `TableShell` pattern để visual match với Lead Logs. Tách statbar Lead Logs ra row riêng force horizontal.

## Key Insights

1. **Lead Logs hiện đại + complete**: TableShell + getTableContract + sticky header + manual sort hook. Pattern proven.
2. **DataTable v2 vs TableShell tradeoff**:
   - DataTable v2: ergonomic API (declarative columns), built-in sort/pagination
   - TableShell: low-level primitive, full control, visual fidelity với Lead Logs
   - User chọn TableShell → mất built-in nhưng giành consistency
3. **Manual sort pattern** (from Lead Logs):
   ```tsx
   const [sortKey, setSortKey] = useState<SortKey>('createdAt');
   const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
   const sorted = useMemo(() => [...rows].sort(...), [rows, sortKey, sortDir]);
   ```
4. **Pagination**: Media/Ads tables hiện <50 rows → skip pagination, render full list. Document trade-off cho future.
5. **Statbar wrap root cause**: Lead Logs `<GlassCard>` chứa filters + datepicker + search + stats trong cùng `flex flex-wrap`. Quá nhiều children → wrap. Fix: tách 2 sub-rows, statbar `flex-nowrap overflow-x-auto`.

## Requirements

### Functional
- [ ] 3 tables render bằng TableShell, visual identical với Lead Logs table
- [ ] Sort headers click toggle asc/desc, hiển thị arrow indicator
- [ ] Empty state khi data rỗng (sử dụng EmptyState primitive)
- [ ] Statbar Lead Logs row riêng, dàn hàng ngang, overflow-x-auto khi cần

### Non-functional
- Manual sort hook reusable: extract `useSortableData` helper trong `lead-logs-tab.tsx` lift lên `components/ui/use-sortable-data.ts` (mới)
- Sticky header (top: 0) cho tất cả 3 tables
- Cell density: row height ~40px, padding `py-2 px-3`

## Architecture

### Sort hook (extract from Lead Logs)

`src/components/ui/use-sortable-data.ts`:
```ts
export function useSortableData<T, K extends string>(
  data: T[],
  initialKey: K,
  initialDir: 'asc' | 'desc' = 'desc',
  accessor: (row: T, key: K) => string | number | Date | null,
) {
  const [sortKey, setSortKey] = useState<K>(initialKey);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(initialDir);

  const sorted = useMemo(() => {
    const copy = [...data];
    copy.sort((a, b) => {
      const av = accessor(a, sortKey) ?? '';
      const bv = accessor(b, sortKey) ?? '';
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [data, sortKey, sortDir, accessor]);

  const toggleSort = (key: K) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  return { sorted, sortKey, sortDir, toggleSort };
}
```

### Table migration template

`media-posts-table.tsx` example:
```tsx
const TABLE_KEY = 'media-posts';
const contract = getTableContract(TABLE_KEY);

const { sorted, sortKey, sortDir, toggleSort } = useSortableData(
  posts,
  'date',
  'desc',
  (row, key) => /* accessor */
);

return (
  <TableShell contract={contract}>
    <TableShell.Head>
      <TableShell.Row>
        <SortableTh sortKey="type" current={sortKey} dir={sortDir} onClick={toggleSort}>Type</SortableTh>
        <SortableTh sortKey="title" current={sortKey} dir={sortDir} onClick={toggleSort}>Title</SortableTh>
        ...
      </TableShell.Row>
    </TableShell.Head>
    <TableShell.Body>
      {sorted.length === 0 ? <EmptyState ... /> : sorted.map(row => ...)}
    </TableShell.Body>
  </TableShell>
);
```

### Statbar split (giữ cùng GlassCard, separate sub-row)

**User decision 2026-05-11**: Statbar ở **cùng GlassCard** với filter row (không tách ra Card riêng), chỉ split thành 2 sub-row bên trong cùng container.

Lead Logs current structure:
```tsx
<GlassCard variant="surface" padding="sm" className="shrink-0 flex flex-wrap items-center gap-3">
  <DatePicker /> <DatePicker /> <FilterChip /> <FilterChip /> <FilterChip /> <DatePicker /> <Input search />
  <div className="ml-auto"> <StatBar /> </div>  ← wrap khi crowded — root cause
</GlassCard>
```

New structure (single GlassCard, 2 flex column sub-rows):
```tsx
<GlassCard variant="surface" padding="sm" className="shrink-0 flex flex-col gap-2">
  {/* Sub-row 1: Filter & controls */}
  <div className="flex flex-wrap items-center gap-3">
    <DateRangePicker size="sm" />   {/* Phase 03 replace */}
    <FilterChip size="sm" /> <FilterChip size="sm" /> <FilterChip size="sm" />
    <DatePicker /> {/* noteDate single */}
    <Input search />
  </div>
  {/* Sub-row 2: Statbar — luôn horizontal */}
  <div className="flex items-center gap-2 overflow-x-auto flex-nowrap pb-1">
    {/* 10 stat chips */}
  </div>
</GlassCard>
```

Benefit: cùng visual container (single card) — UI nhất quán, KHÔNG thêm card thừa. Statbar `flex-nowrap overflow-x-auto` đảm bảo luôn horizontal, scroll khi narrow.

DatePicker filters (dateFrom + dateTo) — Phase 03 sẽ thay bằng DateRangePicker, Phase 02 tạm giữ.

## Related Code Files

**Modify (3 tables):**
- `src/components/media-tracker/media-posts-table.tsx` (160 LOC) — DataTable → TableShell
- `src/components/ads-tracker/campaigns-table.tsx` (173 LOC) — DataTable → TableShell
- `src/components/ads-tracker/attribution-table.tsx` (105 LOC) — DataTable → TableShell

**Modify (1 stat layout):**
- `src/components/lead-tracker/lead-logs-tab.tsx` — split GlassCard children, force statbar horizontal

**Create (1 new helper):**
- `src/components/ui/use-sortable-data.ts` (~30 LOC)

**Reference (no change):**
- `src/components/ui/table-shell.tsx`
- `src/components/ui/table-contract.ts`
- `src/components/ui/table-date-format.ts`

## Implementation Steps

1. **Extract sort hook** vào `components/ui/use-sortable-data.ts`
2. **Refactor lead-logs-tab.tsx** thay inline sort logic bằng hook (verify identical behavior)
3. **Migrate media-posts-table.tsx**:
   - Remove DataTable + columns array
   - Use TableShell + manual `<table>` markup
   - SortableTh helper (small inline component)
   - Type badges (KOL/KOC/PR/ORGANIC) giữ brand colors
4. **Migrate campaigns-table.tsx**:
   - TableShell + sort by spend desc default
   - Status badges Badge v2 variants
5. **Migrate attribution-table.tsx**:
   - TableShell, đơn giản nhất (3 cols)
6. **Lead Logs statbar split**:
   - Split GlassCard children thành 2 rows
   - Statbar row: `flex-nowrap overflow-x-auto`
7. **vite build verify**
8. **Visual smoke test** — verify 3 tables render đúng + Lead Logs stat layout đúng

## Todo List

- [x] Create `use-sortable-data.ts` hook
- [x] Refactor lead-logs-tab.tsx sort logic dùng hook (no visual change)
- [x] Migrate media-posts-table.tsx → TableShell
- [x] Migrate campaigns-table.tsx → TableShell
- [x] Migrate attribution-table.tsx → TableShell
- [x] Split Lead Logs GlassCard children thành 2 sub-rows (cùng card, flex-col gap-2)
- [x] Statbar sub-row: overflow-x-auto, flex-nowrap, pb-1 cho scroll affordance
- [x] vite build clean
- [x] Visual smoke test 4 pages affected
- [x] Commit: `refactor(ui): migrate Media/Ads tables to TableShell + split Lead Logs statbar horizontal`

## Success Criteria

- [x] 3 tables visual identical với Lead Logs (border, padding, hover, sticky header)
- [x] Sort click toggle asc/desc với arrow indicator
- [x] EmptyState render khi 0 rows
- [x] Lead Logs statbar luôn horizontal, không bao giờ wrap dọc
- [x] No regression cho Lead Logs sort/filter/search behavior
- [x] vite build 0 errors
- [x] Manual smoke test 4 pages pass

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Mất pagination khi >50 rows | 🟡 Medium | Document trong code: `// TODO: add pagination when row count grows`. Future: extract usePagination từ DataTable. |
| Sort accessor function khó cho composite keys (CTR = clicks/impressions) | 🟡 Medium | Accessor closure capture computation (e.g., `(row) => row.clicks / row.impressions`) |
| TableShell không có sticky left col (cho Media has Image thumbnail) | 🟢 Low | Media table không cần sticky left, skip |
| Statbar overflow-x scroll trên mobile ảnh hưởng UX | 🟢 Low | Mobile breakpoint: stat compact hơn (single line items) |
| Type badges Media (KOL/KOC/PR/ORGANIC) mất brand colors khi switch primitive | 🟡 Medium | Giữ inline tailwind classes, không dùng Badge v2 cho type này |

## Security Considerations
None — pure UI refactor.

## Next Steps
After Phase 02:
- Phase 03 hoàn tất DateRangePicker → Lead Logs dateFrom/dateTo replace bằng DateRangePicker (xoá 2 DatePicker single)
- Verify Phase 01+02+03 together: vite build + 5-page smoke test
