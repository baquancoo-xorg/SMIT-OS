import { formatTableDate } from '../../ui/v2/table-date-format';
import type { KpiMetricsRow } from '../../../types/dashboard-overview';

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
    const av = (a as any)[cfg.field] ?? 0;
    const bv = (b as any)[cfg.field] ?? 0;
    if (typeof av === 'string') return av.localeCompare(bv) * dir;
    return (av - bv) * dir;
  });
}

export function handleSortClick(field: SortField, prev: SortConfig): SortConfig {
  if (prev.field !== field) return { field, direction: 'desc' };
  return { field, direction: prev.direction === 'desc' ? 'asc' : 'desc' };
}

export function formatDateVN(iso: string): string {
  if (!iso) return iso;
  return formatTableDate(iso);
}
