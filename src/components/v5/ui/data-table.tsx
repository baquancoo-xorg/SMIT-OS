import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from './skeleton';
import { EmptyState } from './empty-state';

export type SortDirection = 'asc' | 'desc';
export type ColumnAlign = 'left' | 'center' | 'right';
export type TableDensity = 'compact' | 'normal' | 'comfortable';

export interface DataTableColumn<T> {
  key: string;
  label: string;
  /** Cell renderer. Receives row + rowIndex. Default: row[key as keyof T]. */
  render?: (row: T, rowIndex: number) => ReactNode;
  /** Sort comparator. Required if `sortable: true`. */
  sort?: (a: T, b: T) => number;
  sortable?: boolean;
  align?: ColumnAlign;
  /** Tailwind width utility (e.g. 'w-32') or CSS string. */
  width?: string;
  /** Hide column at smaller breakpoints. */
  hideBelow?: 'sm' | 'md' | 'lg';
}

export interface SortState {
  key: string;
  direction: SortDirection;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  /** Stable row key — required for React reconciliation. */
  rowKey: (row: T, index: number) => string | number;
  density?: TableDensity;
  /** Loading state — renders skeleton rows. */
  loading?: boolean;
  loadingRows?: number;
  /** Empty-state slot rendered when data is empty + not loading. */
  empty?: ReactNode;
  /** Sort state. Controlled if both `sort` and `onSortChange` provided. Uncontrolled otherwise. */
  sort?: SortState;
  onSortChange?: (sort: SortState | null) => void;
  /** Pagination. Controlled if provided. */
  pagination?: PaginationState;
  onPaginationChange?: (page: number) => void;
  /** Row click handler. Adds hover + cursor styling. */
  onRowClick?: (row: T, rowIndex: number) => void;
  /** Optional aria-label for the table. */
  label?: string;
  className?: string;
}

const densityRowPadding: Record<TableDensity, string> = {
  compact: 'h-9',
  normal: 'h-12',
  comfortable: 'h-14',
};

const alignStyle: Record<ColumnAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const hideBelowStyle: Record<NonNullable<DataTableColumn<unknown>['hideBelow']>, string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
};

/**
 * DataTable v2 — generic typed table with sort + pagination + density.
 *
 * Sort: controlled via `sort` + `onSortChange`, or uncontrolled (internal state).
 * Pagination: pass `pagination` (caller manages slicing). Total page count derived from `total / pageSize`.
 *
 * @example
 * <DataTable
 *   data={leads}
 *   rowKey={(r) => r.id}
 *   columns={[
 *     { key: 'name', label: 'Name', sortable: true, sort: (a, b) => a.name.localeCompare(b.name) },
 *     { key: 'status', label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
 *     { key: 'value', label: 'Value', align: 'right', sortable: true, sort: (a, b) => a.value - b.value },
 *   ]}
 *   pagination={{ page, pageSize: 20, total: leads.length }}
 *   onPaginationChange={setPage}
 * />
 */
export function DataTable<T>({
  data,
  columns,
  rowKey,
  density = 'normal',
  loading = false,
  loadingRows = 5,
  empty,
  sort: sortProp,
  onSortChange,
  pagination,
  onPaginationChange,
  onRowClick,
  label,
  className = '',
}: DataTableProps<T>) {
  const [internalSort, setInternalSort] = useState<SortState | null>(null);
  const isSortControlled = sortProp !== undefined && onSortChange !== undefined;
  const sort = isSortControlled ? sortProp : internalSort;

  const handleSort = (col: DataTableColumn<T>) => {
    if (!col.sortable || !col.sort) return;
    let nextSort: SortState | null;
    if (!sort || sort.key !== col.key) {
      nextSort = { key: col.key, direction: 'asc' };
    } else if (sort.direction === 'asc') {
      nextSort = { key: col.key, direction: 'desc' };
    } else {
      nextSort = null;
    }
    if (isSortControlled) {
      onSortChange!(nextSort);
    } else {
      setInternalSort(nextSort);
    }
  };

  const sortedData = useMemo(() => {
    if (!sort) return data;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sort) return data;
    const copy = [...data];
    copy.sort((a, b) => col.sort!(a, b) * (sort.direction === 'asc' ? 1 : -1));
    return copy;
  }, [data, sort, columns]);

  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) : 1;
  const showPagination = pagination !== undefined && totalPages > 1;

  const isEmpty = !loading && sortedData.length === 0;

  return (
    <div className={['flex flex-col gap-3', className].filter(Boolean).join(' ')}>
      <div className="overflow-hidden rounded-card border border-outline-variant/40 bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" aria-label={label}>
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-outline-variant/40 bg-surface-container-low/95 backdrop-blur-sm">
                {columns.map((col) => {
                  const isSorted = sort?.key === col.key;
                  const SortIcon = isSorted
                    ? sort?.direction === 'asc'
                      ? ChevronUp
                      : ChevronDown
                    : ChevronsUpDown;
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      style={col.width && !col.width.startsWith('w-') ? { width: col.width } : undefined}
                      className={[
                        'px-3 py-2 text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant',
                        alignStyle[col.align ?? 'left'],
                        col.width?.startsWith('w-') ? col.width : '',
                        col.hideBelow ? hideBelowStyle[col.hideBelow] : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-sort={isSorted ? (sort?.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                    >
                      {col.sortable ? (
                        <button
                          type="button"
                          onClick={() => handleSort(col)}
                          className="inline-flex items-center gap-1 hover:text-on-surface focus-visible:outline-none rounded-button"
                        >
                          {col.label}
                          <SortIcon aria-hidden="true" className="size-3.5" />
                        </button>
                      ) : (
                        col.label
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: loadingRows }).map((_, rowIdx) => (
                    <tr key={`skeleton-${rowIdx}`} className={[densityRowPadding[density], 'border-b border-outline-variant/30 last:border-0'].join(' ')}>
                      {columns.map((col) => (
                        <td key={col.key} className={['px-3', col.hideBelow ? hideBelowStyle[col.hideBelow] : ''].join(' ')}>
                          <Skeleton variant="text" width="80%" />
                        </td>
                      ))}
                    </tr>
                  ))
                : sortedData.map((row, rowIdx) => {
                    const interactive = Boolean(onRowClick);
                    return (
                      <tr
                        key={rowKey(row, rowIdx)}
                        onClick={interactive ? () => onRowClick!(row, rowIdx) : undefined}
                        className={[
                          densityRowPadding[density],
                          'border-b border-outline-variant/30 last:border-0',
                          interactive
                            ? 'cursor-pointer transition-colors motion-fast ease-standard hover:bg-surface-container-low'
                            : '',
                        ].join(' ')}
                      >
                        {columns.map((col) => (
                          <td
                            key={col.key}
                            className={[
                              'px-3 text-[length:var(--text-body-sm)] text-on-surface',
                              alignStyle[col.align ?? 'left'],
                              col.hideBelow ? hideBelowStyle[col.hideBelow] : '',
                            ].join(' ')}
                          >
                            {col.render
                              ? col.render(row, rowIdx)
                              : ((row as Record<string, unknown>)[col.key] as ReactNode) ?? '—'}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        {isEmpty && (
          <div className="border-t border-outline-variant/30 p-2">
            {empty ?? <EmptyState title="No data" description="No rows match the current filters." variant="inline" />}
          </div>
        )}
      </div>

      {showPagination && pagination && (
        <div className="flex items-center justify-between gap-3 px-1 text-[length:var(--text-body-sm)] text-on-surface-variant">
          <span>
            Page {pagination.page + 1} of {totalPages} · {pagination.total} rows
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPaginationChange?.(Math.max(0, pagination.page - 1))}
              disabled={pagination.page === 0}
              aria-label="Previous page"
              className="inline-flex size-8 items-center justify-center rounded-button text-on-surface-variant hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onPaginationChange?.(Math.min(totalPages - 1, pagination.page + 1))}
              disabled={pagination.page >= totalPages - 1}
              aria-label="Next page"
              className="inline-flex size-8 items-center justify-center rounded-button text-on-surface-variant hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

(DataTable as unknown as { displayName: string }).displayName = 'DataTable';
