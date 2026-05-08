// Online Time Table — business × last 7 day session_duration (minutes)
// Sortable: total minutes / business name. Color cell theo minute count.

import { useMemo, useState } from 'react';
import { useProductOperational } from '../../../hooks/use-product-dashboard';
import type { DateRange } from '../../../types/dashboard-product';
import DashboardPanel from '../ui/dashboard-panel';

interface ProductOnlineTimeTableProps {
  range: DateRange;
}

type SortKey = 'total' | 'name';
type SortDir = 'asc' | 'desc';

const ROW_LIMIT = 10;

function cellClass(minutes: number): string {
  if (minutes <= 0) return 'bg-slate-50 text-slate-300';
  if (minutes < 5) return 'bg-emerald-50 text-emerald-700';
  if (minutes < 30) return 'bg-emerald-100 text-emerald-800';
  if (minutes < 90) return 'bg-emerald-300 text-emerald-900';
  if (minutes < 240) return 'bg-emerald-500 text-white';
  return 'bg-emerald-700 text-white';
}

function shortDay(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

export function ProductOnlineTimeTable({ range }: ProductOnlineTimeTableProps) {
  const { data, isLoading, error } = useProductOperational(range);
  const [sortKey, setSortKey] = useState<SortKey>('total');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!data) return [];
    const rows = [...data.onlineTime];
    rows.sort((a, b) => {
      const sign = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'total') return sign * (a.totalMinutes - b.totalMinutes);
      const an = a.businessName ?? a.businessId;
      const bn = b.businessName ?? b.businessId;
      return sign * an.localeCompare(bn);
    });
    return rows;
  }, [data, sortKey, sortDir]);

  const pageRows = sorted.slice(page * ROW_LIMIT, (page + 1) * ROW_LIMIT);
  const totalPages = Math.max(1, Math.ceil(sorted.length / ROW_LIMIT));

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(key);
      setSortDir(key === 'total' ? 'desc' : 'asc');
    }
    setPage(0);
  };

  return (
    <DashboardPanel className="p-4 md:p-5">
      <div className="mb-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
          Online Time (7 days)
        </h3>
        <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">
          Phút online per business per day · {ROW_LIMIT} business/trang
        </p>
      </div>

      {isLoading ? (
        <div className="h-[340px] animate-pulse bg-slate-100 rounded-2xl" />
      ) : error || !data || sorted.length === 0 ? (
        <div className="h-[200px] rounded-2xl border border-slate-100 flex items-center justify-center text-sm text-slate-500">
          Chưa có dữ liệu online time
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="sticky left-0 z-10 bg-slate-50 px-3 py-2 text-left">
                    <button
                      type="button"
                      onClick={() => toggleSort('name')}
                      aria-label="Sort by business name"
                      className="font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700"
                    >
                      Business {sortKey === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </button>
                  </th>
                  {data.days.map((d) => (
                    <th key={d} className="px-1 py-2 text-center text-[10px] font-bold text-slate-400">
                      {shortDay(d)}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort('total')}
                      aria-label="Sort by total minutes"
                      className="font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700"
                    >
                      Total {sortKey === 'total' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
                  <tr key={row.businessId} className="border-t border-slate-100">
                    <td className="sticky left-0 z-10 bg-white px-3 py-1.5 text-left">
                      <div className="font-semibold text-slate-700 truncate max-w-[180px]">
                        {row.businessName ?? `#${row.businessId}`}
                      </div>
                      <div className="text-[10px] text-slate-400">#{row.businessId}</div>
                    </td>
                    {row.dailyMinutes.map((m, idx) => (
                      <td key={idx} className="px-1 py-1.5 text-center">
                        <span
                          className={`inline-flex h-7 w-10 items-center justify-center rounded text-[11px] font-bold tabular-nums ${cellClass(
                            m,
                          )}`}
                          title={`${m} phút`}
                        >
                          {m > 0 ? m : ''}
                        </span>
                      </td>
                    ))}
                    <td className="px-3 py-1.5 text-right text-xs font-bold text-slate-700 tabular-nums">
                      {row.totalMinutes}
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
