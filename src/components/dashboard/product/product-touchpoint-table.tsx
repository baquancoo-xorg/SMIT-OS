// Touchpoint Table — top 50 business by event count, sortable + pagination 25/page

import { useMemo, useState } from 'react';
import { useProductOperational } from '../../../hooks/use-product-dashboard';
import type { DateRange } from '../../../types/dashboard-product';
import DashboardPanel from '../ui/dashboard-panel';

interface ProductTouchpointTableProps {
  range: DateRange;
}

type SortKey = 'count' | 'name' | 'last';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;

function formatRelative(iso: string | null): string {
  if (!iso) return '—';
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return 'just now';
  const min = Math.floor(ms / 60_000);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

export function ProductTouchpointTable({ range }: ProductTouchpointTableProps) {
  const { data, isLoading, error } = useProductOperational(range);
  const [sortKey, setSortKey] = useState<SortKey>('count');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!data) return [];
    const rows = [...data.touchpoints];
    rows.sort((a, b) => {
      const sign = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'count') return sign * (a.eventCount - b.eventCount);
      if (sortKey === 'last') {
        const at = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
        const bt = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
        return sign * (at - bt);
      }
      const an = a.businessName ?? a.businessId;
      const bn = b.businessName ?? b.businessId;
      return sign * an.localeCompare(bn);
    });
    return rows;
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageRows = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
    setPage(0);
  };

  const renderSortArrow = (key: SortKey) =>
    sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : '';

  return (
    <DashboardPanel className="p-4 md:p-5">
      <div className="mb-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
          Touchpoint Activity
        </h3>
        <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">
          Top 50 business by event count · sortable · {PAGE_SIZE} business/trang
        </p>
      </div>

      {isLoading ? (
        <div className="h-[340px] animate-pulse bg-slate-100 rounded-2xl" />
      ) : error || !data || sorted.length === 0 ? (
        <div className="h-[200px] rounded-2xl border border-slate-100 flex items-center justify-center text-sm text-slate-500">
          Chưa có touchpoint data
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left">
                    <button
                      type="button"
                      onClick={() => toggleSort('name')}
                      aria-label="Sort by business name"
                      className="font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700"
                    >
                      Business {renderSortArrow('name')}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort('count')}
                      aria-label="Sort by event count"
                      className="font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700"
                    >
                      Events {renderSortArrow('count')}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort('last')}
                      aria-label="Sort by last active"
                      className="font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700"
                    >
                      Last Active {renderSortArrow('last')}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
                  <tr key={row.businessId} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="px-3 py-2">
                      <div className="font-semibold text-slate-700 truncate max-w-[280px]">
                        {row.businessName ?? `#${row.businessId}`}
                      </div>
                      <div className="text-[10px] text-slate-400">#{row.businessId}</div>
                    </td>
                    <td className="px-3 py-2 text-right text-xs font-bold tabular-nums text-slate-700">
                      {row.eventCount.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right text-xs text-slate-500">
                      {formatRelative(row.lastActiveAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>
                Trang {page + 1}/{totalPages} · {sorted.length} business
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="rounded-full border border-slate-200 px-3 py-1 disabled:opacity-40 hover:bg-slate-50"
                >
                  ← Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="rounded-full border border-slate-200 px-3 py-1 disabled:opacity-40 hover:bg-slate-50"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardPanel>
  );
}
