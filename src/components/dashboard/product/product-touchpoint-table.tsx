// Touchpoint Table — top 50 business by event count, sortable + pagination 10/page

import { useState } from 'react';
import { useProductOperational } from '../../../hooks/use-product-dashboard';
import type { DateRange } from '../../../types/dashboard-product';
import DashboardPanel from '../ui/dashboard-panel';
import { DataTable, EmptyState } from '../../ui/v2';
import type { DataTableColumn, SortState } from '../../ui/v2';

interface ProductTouchpointTableProps {
  range: DateRange;
}

type TouchpointRow = {
  businessId: string;
  businessName: string | null;
  eventCount: number;
  lastActiveAt: string | null;
};

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
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SortState | null>({ key: 'eventCount', direction: 'desc' });

  const rows = (data?.touchpoints ?? []) as TouchpointRow[];

  const columns: DataTableColumn<TouchpointRow>[] = [
    {
      key: 'business',
      label: 'Business',
      sortable: true,
      sort: (a, b) => (a.businessName ?? a.businessId).localeCompare(b.businessName ?? b.businessId),
      render: (row) => (
        <div>
          <div className="max-w-[280px] truncate font-semibold text-on-surface">
            {row.businessName ?? `#${row.businessId}`}
          </div>
          <div className="text-[length:var(--text-caption)] text-on-surface-variant/70">#{row.businessId}</div>
        </div>
      ),
    },
    {
      key: 'eventCount',
      label: 'Events',
      align: 'right',
      sortable: true,
      sort: (a, b) => a.eventCount - b.eventCount,
      render: (row) => (
        <span className="font-semibold tabular-nums text-on-surface">{row.eventCount.toLocaleString()}</span>
      ),
    },
    {
      key: 'lastActiveAt',
      label: 'Last Active',
      align: 'right',
      sortable: true,
      sort: (a, b) => {
        const at = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
        const bt = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
        return at - bt;
      },
      render: (row) => <span className="text-on-surface-variant">{formatRelative(row.lastActiveAt)}</span>,
    },
  ];

  const showError = !!error && !isLoading;

  return (
    <DashboardPanel className="p-4 md:p-5">
      <div className="mb-3">
        <h3 className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">
          Touchpoint Activity
        </h3>
        <p className="mt-0.5 text-[length:var(--text-caption)] font-medium italic text-on-surface-variant">
          Top 50 business by event count · sortable · {PAGE_SIZE} business/trang
        </p>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        rowKey={(row) => row.businessId}
        loading={isLoading}
        empty={
          <EmptyState
            title={showError ? 'Không tải được touchpoint data' : 'Chưa có touchpoint data'}
            description={showError ? 'Vui lòng thử lại sau.' : undefined}
          />
        }
        sort={sort ?? undefined}
        onSortChange={(next) => {
          setSort(next);
          setPage(0);
        }}
        pagination={{ page, pageSize: PAGE_SIZE, total: rows.length }}
        onPaginationChange={setPage}
        label="Touchpoint activity"
      />
    </DashboardPanel>
  );
}
