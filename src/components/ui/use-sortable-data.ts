import { useMemo, useState, useCallback } from 'react';

export type SortDirection = 'asc' | 'desc';

export type SortableValue = string | number | Date | null | undefined;

export interface UseSortableDataResult<T, K extends string> {
  sorted: T[];
  sortKey: K;
  sortDir: SortDirection;
  toggleSort: (key: K) => void;
  setSort: (key: K, dir: SortDirection) => void;
}

/**
 * Generic manual sort hook for table data.
 *
 * Used by Media/Ads/Lead tables that ship without DataTable v2's built-in sort.
 * Closure-captured accessor allows composite keys (CTR = clicks/impressions).
 *
 * @example
 * const { sorted, sortKey, sortDir, toggleSort } = useSortableData(
 *   posts,
 *   'publishedAt',
 *   'desc',
 *   (row, key) => {
 *     if (key === 'publishedAt') return new Date(row.publishedAt);
 *     return row[key] as SortableValue;
 *   },
 * );
 */
export function useSortableData<T, K extends string>(
  data: T[],
  initialKey: K,
  initialDir: SortDirection = 'desc',
  accessor: (row: T, key: K) => SortableValue,
): UseSortableDataResult<T, K> {
  const [sortKey, setSortKey] = useState<K>(initialKey);
  const [sortDir, setSortDir] = useState<SortDirection>(initialDir);

  const sorted = useMemo(() => {
    const copy = [...data];
    copy.sort((a, b) => {
      const av = accessor(a, sortKey);
      const bv = accessor(b, sortKey);

      // Null/undefined push to the end regardless of direction
      const aNull = av == null;
      const bNull = bv == null;
      if (aNull && bNull) return 0;
      if (aNull) return 1;
      if (bNull) return -1;

      let cmp = 0;
      if (av instanceof Date && bv instanceof Date) {
        cmp = av.getTime() - bv.getTime();
      } else if (typeof av === 'number' && typeof bv === 'number') {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv));
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [data, sortKey, sortDir, accessor]);

  const toggleSort = useCallback(
    (key: K) => {
      if (key === sortKey) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDir('desc');
      }
    },
    [sortKey],
  );

  const setSort = useCallback((key: K, dir: SortDirection) => {
    setSortKey(key);
    setSortDir(dir);
  }, []);

  return { sorted, sortKey, sortDir, toggleSort, setSort };
}
