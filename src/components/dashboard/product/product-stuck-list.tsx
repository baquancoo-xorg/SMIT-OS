// Stuck Businesses List — TRACKING-ONLY (Master Plan §1.4 monitoring)
// Filter by page-level date range. No email/phone exposed. No copy/export.

import { useMemo, useState } from 'react';
import { useProductStuck } from '../../../hooks/use-product-dashboard';
import type { DateRange } from '../../../types/dashboard-product';
import DashboardPanel from '../ui/dashboard-panel';

interface ProductStuckListProps {
  range: DateRange;
}

const PAGE_SIZE = 10;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate().toString().padStart(2, '0')}/${(d.getUTCMonth() + 1)
    .toString()
    .padStart(2, '0')}/${d.getUTCFullYear()}`;
}

function severityClass(days: number): string {
  if (days >= 30) return 'bg-rose-100 text-rose-700';
  if (days >= 14) return 'bg-orange-100 text-orange-700';
  return 'bg-amber-100 text-amber-700';
}

export function ProductStuckList({ range }: ProductStuckListProps) {
  const { data, isLoading, error } = useProductStuck(range);
  const [page, setPage] = useState(0);

  const items = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [items, page],
  );

  return (
    <DashboardPanel className="p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
            Stuck Businesses
            <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 normal-case tracking-normal">
              tracking-only
            </span>
          </h3>
          <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">
            Signup &gt; {data?.thresholdDays ?? 7} ngày · chưa first sync · {PAGE_SIZE} business/trang · lọc theo khoảng ngày trên trang
          </p>
        </div>
        {data && (
          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black tabular-nums text-rose-700">
            {data.totalCount} stuck
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="h-[280px] animate-pulse bg-slate-100 rounded-2xl" />
      ) : error || !data ? (
        <div className="h-[200px] rounded-2xl border border-slate-100 flex items-center justify-center text-sm text-slate-500">
          Không tải được stuck list
        </div>
      ) : items.length === 0 ? (
        <div className="h-[200px] rounded-2xl border border-emerald-100 bg-emerald-50/30 flex items-center justify-center text-sm font-semibold text-emerald-700">
          ✓ Không có business nào bị stuck trong khoảng ngày này
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Business
                  </th>
                  <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Signup
                  </th>
                  <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Days Stuck
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item) => (
                  <tr key={item.businessId} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      <div className="font-semibold text-slate-700 truncate max-w-[320px]">
                        {item.businessName ?? `#${item.businessId}`}
                      </div>
                      <div className="text-[10px] text-slate-400">#{item.businessId}</div>
                    </td>
                    <td className="px-3 py-2 text-right text-xs text-slate-500 tabular-nums">
                      {formatDate(item.signupAt)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${severityClass(
                          item.daysStuck,
                        )}`}
                      >
                        {item.daysStuck}d
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>
                Trang {page + 1}/{totalPages} · {items.length} business
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
