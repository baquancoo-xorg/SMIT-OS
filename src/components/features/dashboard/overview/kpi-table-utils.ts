import type { KpiMetricsRow } from '../../../../types/dashboard-overview';

export type SortField =
  | 'date'
  | 'adSpend'
  | 'sessions'
  | 'signups'
  | 'opportunities'
  | 'orders'
  | 'revenue'
  | 'roas';

export interface SortConfig {
  field: SortField;
  direction: 'asc' | 'desc';
}

export function sortData(rows: KpiMetricsRow[], cfg: SortConfig): KpiMetricsRow[] {
  const dir = cfg.direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = (a as unknown as Record<string, unknown>)[cfg.field] ?? 0;
    const bv = (b as unknown as Record<string, unknown>)[cfg.field] ?? 0;
    if (typeof av === 'string' && typeof bv === 'string') return av.localeCompare(bv) * dir;
    return ((av as number) - (bv as number)) * dir;
  });
}

export function handleSortClick(field: SortField, prev: SortConfig): SortConfig {
  if (prev.field !== field) return { field, direction: 'desc' };
  return { field, direction: prev.direction === 'desc' ? 'asc' : 'desc' };
}

export function formatDateVN(iso: string): string {
  if (!iso || iso === 'Total') return iso;
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
