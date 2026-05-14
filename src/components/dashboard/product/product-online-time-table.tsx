// Online Time Table — business × last 7 day session_duration (minutes)
// Sortable: total minutes / business name. Color cell theo minute count.

import { useMemo, useState } from 'react';
import { useProductOperational } from '../../../hooks/use-product-dashboard';
import type { DateRange } from '../../../types/dashboard-product';
import DashboardPanel from '../ui/dashboard-panel';
import { DataTable, EmptyState } from '../../v5/ui';
import type { DataTableColumn, SortState } from '../../v5/ui';

interface ProductOnlineTimeTableProps {
  range: DateRange;
}

type OnlineTimeRow = {
  businessId: string;
  businessName: string | null;
  dailyMinutes: number[];
  totalMinutes: number;
};

const ROW_LIMIT = 10;

function cellClass(minutes: number): string {
  if (minutes <= 0) return 'bg-surface-variant/40 text-on-surface-variant/40';
  if (minutes < 5) return 'bg-success-container/40 text-on-success-container';
  if (minutes < 30) return 'bg-success-container/70 text-on-success-container';
  if (minutes < 90) return 'bg-success/60 text-on-primary';
  if (minutes < 240) return 'bg-success/85 text-on-primary';
  return 'bg-success text-on-primary';
}

function shortDay(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

export function ProductOnlineTimeTable({ range }: ProductOnlineTimeTableProps) {
  const { data, isLoading, error } = useProductOperational(range);
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SortState | null>({ key: 'totalMinutes', direction: 'desc' });

  const rows = (data?.onlineTime ?? []) as OnlineTimeRow[];
  const days = data?.days ?? [];

  const columns: DataTableColumn<OnlineTimeRow>[] = useMemo(() => {
    const base: DataTableColumn<OnlineTimeRow>[] = [
      {
        key: 'business',
        label: 'Business',
        sortable: true,
        sort: (a, b) => (a.businessName ?? a.businessId).localeCompare(b.businessName ?? b.businessId),
        render: (row) => (
          <div>
            <div className="max-w-[180px] truncate font-semibold text-on-surface">
              {row.businessName ?? `#${row.businessId}`}
            </div>
            <div className="text-[length:var(--text-caption)] text-on-surface-variant/70">#{row.businessId}</div>
          </div>
        ),
      },
    ];
    const dayCols: DataTableColumn<OnlineTimeRow>[] = days.map((iso, idx) => ({
      key: `day_${idx}`,
      label: shortDay(iso),
      align: 'center',
      render: (row) => {
        const m = row.dailyMinutes[idx] ?? 0;
        return (
          <span
            className={`inline-flex h-7 w-10 items-center justify-center rounded-chip text-[length:var(--text-caption)] font-semibold tabular-nums ${cellClass(m)}`}
            title={`${m} phút`}
          >
            {m > 0 ? m : ''}
          </span>
        );
      },
    }));
    const total: DataTableColumn<OnlineTimeRow> = {
      key: 'totalMinutes',
      label: 'Total',
      align: 'right',
      sortable: true,
      sort: (a, b) => a.totalMinutes - b.totalMinutes,
      render: (row) => (
        <span className="font-semibold tabular-nums text-on-surface">{row.totalMinutes}</span>
      ),
    };
    return [...base, ...dayCols, total];
  }, [days]);

  const showError = !!error && !isLoading;

  return (
    <DashboardPanel className="p-4 md:p-5">
      <div className="mb-3">
        <h3 className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">
          Online Time (7 days)
        </h3>
        <p className="mt-0.5 text-[length:var(--text-caption)] font-medium italic text-on-surface-variant">
          Phút online per business per day · {ROW_LIMIT} business/trang
        </p>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        rowKey={(row) => row.businessId}
        loading={isLoading}
        density="compact"
        empty={
          <EmptyState
            title={showError ? 'Không tải được online time data' : 'Chưa có dữ liệu online time'}
            description={showError ? 'Vui lòng thử lại sau.' : undefined}
          />
        }
        sort={sort ?? undefined}
        onSortChange={(next) => {
          setSort(next);
          setPage(0);
        }}
        pagination={{ page, pageSize: ROW_LIMIT, total: rows.length }}
        onPaginationChange={setPage}
        label="Online time per business per day"
      />
    </DashboardPanel>
  );
}
