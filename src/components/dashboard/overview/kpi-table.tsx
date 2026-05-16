import { DataTable } from '../../v5/ui';
import type { DataTableColumn } from '../../v5/ui';
import { formatCurrency, formatNumber, formatPercent } from '../../../lib/formatters';
import type { KpiMetricsResponse, KpiMetricsRow } from '../../../types/dashboard-overview';
import { Card } from '../../v5/ui';

interface KpiTableProps {
  data?: KpiMetricsResponse;
  isLoading: boolean;
  error?: Error | null;
}

function safeRate(value: number, base: number) {
  return base === 0 ? 0 : (value / base) * 100;
}

function formatDate(iso: string) {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

const columns: DataTableColumn<KpiMetricsRow>[] = [
  { key: 'date', label: 'Ngày', render: (row) => formatDate(row.date), sortable: true, sort: (a, b) => a.date.localeCompare(b.date) },
  { key: 'adSpend', label: 'Ad spend', align: 'right', render: (row) => formatCurrency(row.adSpend), sortable: true, sort: (a, b) => a.adSpend - b.adSpend },
  { key: 'sessions', label: 'Sessions', align: 'right', render: (row) => formatNumber(row.sessions), sortable: true, sort: (a, b) => a.sessions - b.sessions },
  { key: 'signups', label: 'Signups', align: 'right', render: (row) => `${formatNumber(row.signups)} · ${formatPercent(safeRate(row.signups, row.sessions))}`, sortable: true, sort: (a, b) => a.signups - b.signups },
  { key: 'opportunities', label: 'Opps', align: 'right', render: (row) => `${formatNumber(row.opportunities)} · ${formatPercent(safeRate(row.opportunities, row.signups))}`, sortable: true, sort: (a, b) => a.opportunities - b.opportunities },
  { key: 'orders', label: 'Orders', align: 'right', render: (row) => `${formatNumber(row.orders)} · ${formatPercent(safeRate(row.orders, row.opportunities))}`, sortable: true, sort: (a, b) => a.orders - b.orders },
  { key: 'revenue', label: 'Revenue', align: 'right', render: (row) => formatCurrency(row.revenue), sortable: true, sort: (a, b) => a.revenue - b.revenue },
  { key: 'roas', label: 'ROAS', align: 'right', render: (row) => <span className={row.roas >= 1 ? 'text-accent-text' : 'text-error'}>{row.roas.toFixed(2)}x</span>, sortable: true, sort: (a, b) => a.roas - b.roas },
];

export function KpiTable({ data, isLoading, error }: KpiTableProps) {
  if (error) {
    return (
      <Card padding="md">
        <p className="text-sm font-semibold text-error">Không tải được bảng KPI: {error.message}</p>
      </Card>
    );
  }

  return (
    <Card padding="none" glow className="overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border px-5 py-4">
        {/* ui-canon-ok: section header font-black for KPI headline */}
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-accent-text">Daily breakdown</p>
          <h2 className="mt-1 font-headline text-2xl font-black tracking-tight text-text-1">KPI Metrics</h2>
        </div>
        {data?.totals && <p className="text-sm font-semibold text-text-2">Total revenue {formatCurrency(data.totals.revenue)}</p>}
      </div>
      <DataTable
        data={data?.data ?? []}
        columns={columns}
        rowKey={(row) => row.date}
        loading={isLoading}
        loadingRows={8}
        density="compact"
        label="KPI metrics by day"
        className="p-4"
      />
    </Card>
  );
}
