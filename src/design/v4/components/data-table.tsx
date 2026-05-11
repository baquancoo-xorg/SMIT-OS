import { useMemo, useState, type ReactNode } from 'react';
import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react';
import { cn } from '../lib/cn';

export type SortDirection = 'asc' | 'desc' | null;

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  /** Accessor returning cell content. Receives row + index. */
  cell: (row: T, index: number) => ReactNode;
  /** Enable client-side sort. Provide `sortValue` or use comparator. */
  sortable?: boolean;
  /** Returns a comparable scalar for sorting. Default: column.cell result coerced to string. */
  sortValue?: (row: T) => string | number | Date;
  /** Tailwind width hint, e.g. 'w-32'. */
  width?: string;
  align?: 'left' | 'right' | 'center';
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  /** Stable row key. Required for React reconciliation. */
  rowKey: (row: T, index: number) => string;
  /** Empty-state message. */
  emptyMessage?: ReactNode;
  /** Loading skeleton. */
  loading?: boolean;
  /** Hover highlight + cursor pointer. */
  onRowClick?: (row: T, index: number) => void;
  /** Sticky header. Default true. */
  stickyHeader?: boolean;
  className?: string;
}

const alignClass = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
} as const;

/**
 * v4 DataTable — client-only sortable table with row actions slot.
 *
 * @example
 *   <DataTable
 *     columns={[
 *       { key: 'id', header: 'ID', cell: r => r.id, sortable: true },
 *       { key: 'name', header: 'Name', cell: r => r.name, sortable: true },
 *     ]}
 *     rows={data}
 *     rowKey={r => r.id}
 *   />
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = 'No data',
  loading = false,
  onRowClick,
  stickyHeader = true,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);

  const sortedRows = useMemo(() => {
    if (!sortKey || !sortDir) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortable) return rows;
    const getValue =
      col.sortValue ?? ((r: T) => String(col.cell(r, 0) ?? ''));
    const sign = sortDir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      if (va < vb) return -1 * sign;
      if (va > vb) return 1 * sign;
      return 0;
    });
  }, [rows, columns, sortKey, sortDir]);

  const onHeaderClick = (col: DataTableColumn<T>) => {
    if (!col.sortable) return;
    if (sortKey !== col.key) {
      setSortKey(col.key);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else {
      setSortKey(null);
      setSortDir(null);
    }
  };

  return (
    <div
      className={cn(
        'overflow-auto rounded-card border border-outline-subtle bg-surface-elevated',
        className,
      )}
    >
      <table className="w-full border-collapse text-body-sm">
        <thead className={cn('bg-surface-overlay', stickyHeader && 'sticky top-0 z-sticky')}>
          <tr>
            {columns.map((col) => {
              const isSorted = sortKey === col.key && sortDir !== null;
              const SortIcon = !isSorted ? ChevronsUpDown : sortDir === 'asc' ? ChevronUp : ChevronDown;
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={
                    isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
                  }
                  onClick={() => onHeaderClick(col)}
                  className={cn(
                    'px-cozy py-snug font-semibold uppercase tracking-widest text-caption text-fg-subtle',
                    'border-b border-outline-subtle',
                    col.width,
                    alignClass[col.align ?? 'left'],
                    col.sortable && 'cursor-pointer select-none hover:text-fg-muted',
                  )}
                >
                  <span className="inline-flex items-center gap-tight">
                    {col.header}
                    {col.sortable && <SortIcon size={12} aria-hidden="true" className={cn('shrink-0', isSorted ? 'text-fg-muted' : 'text-fg-faint')} />}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-cozy py-wide text-center text-fg-subtle">
                Loading…
              </td>
            </tr>
          ) : sortedRows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-cozy py-wide text-center text-fg-subtle">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedRows.map((row, i) => (
              <tr
                key={rowKey(row, i)}
                onClick={onRowClick ? () => onRowClick(row, i) : undefined}
                className={cn(
                  'border-b border-outline-subtle last:border-b-0 transition-colors duration-fast',
                  onRowClick && 'cursor-pointer hover:bg-surface-overlay',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-cozy py-snug text-fg-muted',
                      col.width,
                      alignClass[col.align ?? 'left'],
                    )}
                  >
                    {col.cell(row, i)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
