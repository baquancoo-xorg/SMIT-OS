# Phase E — Targeted Virtualization

**Priority:** P1 | **Status:** pending | **Effort:** 2-3h

## Overview
Virtualize ONLY `raw_ads_facebook` table (4202 rows). Skip Notification (219), Lead (36), DailyReport (11) — quá nhỏ.

## Implementation
1. `npm install @tanstack/react-virtual`
2. Update `src/components/ui/data-table.tsx` (279 lines) thêm optional `virtual` prop:
```tsx
interface DataTableProps<T> {
  // existing props
  virtual?: boolean;
  estimateRowHeight?: number; // default 48
}
```
3. Inside `DataTable`, nếu `virtual={true}`:
```tsx
const rowVirtualizer = useVirtualizer({
  count: rows.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => estimateRowHeight ?? 48,
  overscan: 10,
});
```
4. Render: parent với fixed height + scroll, inner div `height={totalSize}`, map `virtualItems`
5. **Sticky header:** keep `<thead>` outside virtual container
6. **Horizontal scroll:** wrap container `overflow-x: auto`, virtualize rows only

## Files
- Modify: `src/components/ui/data-table.tsx`
- Modify: `src/pages/AdsTracker.tsx` (pass `virtual={true}`)
- New: `src/components/ui/data-table-virtual-row.tsx` (extract row component nếu >200 lines)

## Todo
- [ ] Install `@tanstack/react-virtual`
- [ ] Add `virtual` prop + `useVirtualizer` logic
- [ ] Preserve sticky header behavior
- [ ] Preserve sort/filter UX (re-render entire virtual list khi sort change)
- [ ] Enable on AdsTracker page only
- [ ] Test: scroll 4k rows ≥60fps (Chrome DevTools Performance tab)
- [ ] Test: filter/sort vẫn work
- [ ] Test: keyboard nav (Tab through rows) không break

## Success
- Ads page scroll 60fps với 4202 rows
- DataTable backward compat (other pages không bị ảnh hưởng)
- DOM nodes <100 thay vì 4202+ rows

## Risks
- Variable row height → cần `measureElement` callback (more complex)
- Filter UI break vì virtualized rows không trong DOM ban đầu → handle search/filter ở data layer, không DOM
- Print/export break → có thể disable virtual khi export mode
- Sticky positioning conflict với `transform: translateY` của virtualizer → test kỹ
