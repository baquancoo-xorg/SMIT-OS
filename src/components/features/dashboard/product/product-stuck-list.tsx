// Stuck Businesses List — TRACKING-ONLY (Master Plan §1.4 monitoring)
// Filter by page-level date range. No email/phone exposed. No copy/export.

import { useMemo, useState } from 'react';
import { useProductStuck } from '../../../../hooks/use-product-dashboard';
import type { DateRange } from '../../../../types/dashboard-product';
import DashboardPanel from '../ui/dashboard-panel';
import { Badge, Skeleton } from '../../../ui';

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

function severityVariant(days: number): 'error' | 'warning' {
  if (days >= 14) return 'error';
  return 'warning';
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
          <h3 className="flex items-center text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">
            Stuck Businesses
            <Badge variant="warning" size="sm" className="ml-2 normal-case tracking-normal">
              tracking-only
            </Badge>
          </h3>
          <p className="mt-0.5 text-[length:var(--text-caption)] font-medium italic text-on-surface-variant">
            Signup &gt; {data?.thresholdDays ?? 7} ngày · chưa first sync · {PAGE_SIZE} business/trang · lọc theo khoảng ngày trên trang
          </p>
        </div>
        {data && (
          <Badge variant="error" size="md" className="tabular-nums">
            {data.totalCount} stuck
          </Badge>
        )}
      </div>

      {isLoading ? (
        <Skeleton variant="rect" className="h-[280px] rounded-card" />
      ) : error || !data ? (
        <div className="flex h-[200px] items-center justify-center rounded-card border border-outline-variant/40 text-[length:var(--text-body-sm)] text-on-surface-variant">
          Không tải được stuck list
        </div>
      ) : items.length === 0 ? (
        <div className="flex h-[200px] items-center justify-center rounded-card border border-success-container/60 bg-success-container/30 text-[length:var(--text-body-sm)] font-semibold text-on-success-container">
          ✓ Không có business nào bị stuck trong khoảng ngày này
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-card border border-outline-variant/40">
            <table className="min-w-full text-[length:var(--text-body-sm)]">
              <thead className="bg-surface-variant/40">
                <tr>
                  <th className="px-3 py-2 text-left text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">
                    Business
                  </th>
                  <th className="px-3 py-2 text-right text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">
                    Signup
                  </th>
                  <th className="px-3 py-2 text-right text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">
                    Days Stuck
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item) => (
                  <tr key={item.businessId} className="border-t border-outline-variant/40">
                    <td className="px-3 py-2">
                      <div className="max-w-[320px] truncate font-semibold text-on-surface">
                        {item.businessName ?? `#${item.businessId}`}
                      </div>
                      <div className="text-[length:var(--text-caption)] text-on-surface-variant/70">#{item.businessId}</div>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-on-surface-variant">
                      {formatDate(item.signupAt)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Badge variant={severityVariant(item.daysStuck)} size="sm" className="tabular-nums">
                        {item.daysStuck}d
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-3 flex items-center justify-between text-[length:var(--text-caption)] font-semibold text-on-surface-variant">
              <span>
                Trang {page + 1}/{totalPages} · {items.length} business
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="rounded-chip border border-outline-variant/40 px-3 py-1 transition-colors hover:bg-surface-variant/40 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                >
                  ← Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="rounded-chip border border-outline-variant/40 px-3 py-1 transition-colors hover:bg-surface-variant/40 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
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
