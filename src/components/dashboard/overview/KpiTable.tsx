import { memo, useMemo, useState, useCallback } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, HelpCircle } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '../../../lib/formatters';
import type { KpiMetricsResponse, KpiMetricsRow } from '../../../types/dashboard-overview';
import { type SortConfig, type SortField, sortData, handleSortClick, formatDateVN } from './kpi-table-utils';

type ViewMode = 'realtime' | 'cohort';
type RateMode = 'top' | 'step';

interface SortableHeaderProps {
  field: SortField;
  title: string;
  sortConfig: SortConfig;
  onSort: (f: SortField) => void;
}

function SortableHeader({ field, title, sortConfig, onSort }: SortableHeaderProps) {
  const active = sortConfig.field === field;
  const Icon = active ? (sortConfig.direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={`inline-flex items-center gap-0.5 text-[11px] font-semibold transition-colors whitespace-nowrap ${
        active ? 'text-primary' : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      <span>{title}</span>
      <Icon className="h-3 w-3 flex-shrink-0" />
    </button>
  );
}

function RateBadge({ value, rate }: { value: number; rate: number }) {
  const bgColor = rate >= 50 ? 'bg-emerald-500' : rate >= 20 ? 'bg-emerald-400' : rate > 0 ? 'bg-emerald-300' : 'bg-slate-200';
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`px-1.5 py-0.5 text-[10px] font-bold text-white rounded ${bgColor}`}>
        {formatPercent(rate)}
      </span>
      <span className="text-slate-600">{value}</span>
    </span>
  );
}

interface KpiTableRowProps {
  row: KpiMetricsRow;
  isTotal?: boolean;
  rateMode: RateMode;
}

function KpiTableRow({ row, isTotal, rateMode }: KpiTableRowProps) {
  const cellBase = 'px-3 py-2.5 text-xs whitespace-nowrap';
  const cellStyle = isTotal ? `${cellBase} font-semibold bg-slate-50` : `${cellBase} text-slate-600`;
  const rightAlign = 'text-right';

  return (
    <tr className={isTotal ? 'border-t-2 border-slate-300' : 'border-b border-slate-100 hover:bg-slate-50/50'}>
      <td className={`${cellStyle} text-left font-medium text-on-surface sticky left-0 bg-white z-10`}>
        {isTotal ? 'TOTAL' : formatDateVN(row.date)}
      </td>
      <td className={`${cellStyle} ${rightAlign}`}>{formatCurrency(row.adSpend)}</td>
      <td className={`${cellStyle} ${rightAlign}`}>{formatNumber(row.sessions)}</td>
      <td className={`${cellStyle} ${rightAlign}`}>{formatCurrency(row.costPerSession)}</td>
      <td className={`${cellStyle} ${rightAlign}`}>
        <RateBadge value={row.signups} rate={rateMode === 'top' ? (row.signups / Math.max(row.sessions, 1)) * 100 : row.signups} />
      </td>
      <td className={`${cellStyle} ${rightAlign}`}>{formatCurrency(row.costPerSignup)}</td>
      <td className={`${cellStyle} ${rightAlign}`}>
        <RateBadge value={row.trials} rate={row.trialRate} />
      </td>
      <td className={`${cellStyle} ${rightAlign}`}>{formatCurrency(row.costPerTrial)}</td>
      <td className={`${cellStyle} ${rightAlign}`}>
        <RateBadge value={row.opportunities} rate={row.opportunityRate} />
      </td>
      <td className={`${cellStyle} ${rightAlign}`}>{formatCurrency(row.costPerOpportunity)}</td>
      <td className={`${cellStyle} ${rightAlign}`}>
        <RateBadge value={row.orders} rate={row.orderRate} />
      </td>
      <td className={`${cellStyle} ${rightAlign}`}>{formatCurrency(row.costPerOrder)}</td>
      <td className={`${cellStyle} ${rightAlign}`}>
        <RateBadge value={row.mql} rate={row.mqlRate} />
      </td>
      <td className={`${cellStyle} ${rightAlign}`}>
        <RateBadge value={row.prePql} rate={row.prePqlRate} />
      </td>
      <td className={`${cellStyle} ${rightAlign}`}>
        <RateBadge value={row.pql} rate={row.pqlRate} />
      </td>
      <td className={`${cellStyle} ${rightAlign}`}>
        <RateBadge value={row.sql} rate={row.sqlRate} />
      </td>
      <td className={`${cellStyle} ${rightAlign} font-medium`}>{formatCurrency(row.revenue)}</td>
      <td className={`${cellStyle} ${rightAlign} font-bold ${row.roas >= 1 ? 'text-emerald-600' : 'text-red-500'}`}>
        {row.roas.toFixed(2)}x
      </td>
      <td className={`${cellStyle} ${rightAlign}`}>
        {((row.revenue / Math.max(row.adSpend, 1) - 1) * 100).toFixed(1)}%
      </td>
    </tr>
  );
}

function SkeletonTable() {
  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-outline-variant/10 animate-pulse overflow-hidden">
      <div className="p-5 md:p-6">
        <div className="h-5 w-24 bg-slate-200 rounded" />
      </div>
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-slate-100 rounded" />
        ))}
      </div>
    </div>
  );
}

interface KpiTableProps {
  data?: KpiMetricsResponse;
  isLoading: boolean;
  error?: Error | null;
}

export const KpiTable = memo(function KpiTable({ data, isLoading, error }: KpiTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'date', direction: 'desc' });
  const [viewMode, setViewMode] = useState<ViewMode>('realtime');
  const [rateMode, setRateMode] = useState<RateMode>('top');
  const handleSort = useCallback((f: SortField) => setSortConfig((p) => handleSortClick(f, p)), []);

  const sortedData = useMemo(() => (data ? sortData(data.data, sortConfig) : []), [data, sortConfig]);

  if (isLoading) return <SkeletonTable />;

  if (error) {
    return (
      <div className="bg-white rounded-2xl md:rounded-3xl border border-error/20 p-5 md:p-6">
        <p className="text-center text-error font-medium">Lỗi: {error.message}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-5 md:p-6">
        <h3 className="font-bold text-on-surface">KPI Metrics</h3>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode('realtime')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'realtime' ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Realtime
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cohort')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'cohort' ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Cohort
            </button>
          </div>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setRateMode('top')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                rateMode === 'top' ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Top
            </button>
            <button
              type="button"
              onClick={() => setRateMode('step')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                rateMode === 'step' ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Step
            </button>
          </div>
          <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600">
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-3 py-3 text-left sticky left-0 bg-slate-50 z-10">
                <SortableHeader field="date" title="Date" sortConfig={sortConfig} onSort={handleSort} />
              </th>
              <th className="px-3 py-3 text-right">
                <SortableHeader field="adSpend" title="Ad Spend" sortConfig={sortConfig} onSort={handleSort} />
              </th>
              <th className="px-3 py-3 text-right">
                <SortableHeader field="sessions" title="Sessions" sortConfig={sortConfig} onSort={handleSort} />
              </th>
              <th className="px-3 py-3 text-right">
                <span className="text-[11px] font-semibold text-slate-500">CPSe</span>
              </th>
              <th className="px-3 py-3 text-right">
                <SortableHeader field="signups" title="Signups" sortConfig={sortConfig} onSort={handleSort} />
              </th>
              <th className="px-3 py-3 text-right">
                <span className="text-[11px] font-semibold text-slate-500">CPSI</span>
              </th>
              <th className="px-3 py-3 text-right">
                <SortableHeader field="trials" title="Trial" sortConfig={sortConfig} onSort={handleSort} />
              </th>
              <th className="px-3 py-3 text-right">
                <span className="text-[11px] font-semibold text-slate-500">CPTr</span>
              </th>
              <th className="px-3 py-3 text-right">
                <SortableHeader field="opportunities" title="Opps" sortConfig={sortConfig} onSort={handleSort} />
              </th>
              <th className="px-3 py-3 text-right">
                <span className="text-[11px] font-semibold text-slate-500">CPOpp</span>
              </th>
              <th className="px-3 py-3 text-right">
                <SortableHeader field="orders" title="Order" sortConfig={sortConfig} onSort={handleSort} />
              </th>
              <th className="px-3 py-3 text-right">
                <span className="text-[11px] font-semibold text-slate-500">CPOr</span>
              </th>
              <th className="px-3 py-3 text-right">
                <span className="text-[11px] font-semibold text-slate-500">MQL (3 tiers)</span>
              </th>
              <th className="px-3 py-3 text-right">
                <span className="text-[11px] font-semibold text-slate-500">Pre-PQL</span>
              </th>
              <th className="px-3 py-3 text-right">
                <span className="text-[11px] font-semibold text-slate-500">PQL</span>
              </th>
              <th className="px-3 py-3 text-right">
                <span className="text-[11px] font-semibold text-slate-500">SQL</span>
              </th>
              <th className="px-3 py-3 text-right">
                <SortableHeader field="revenue" title="Revenue" sortConfig={sortConfig} onSort={handleSort} />
              </th>
              <th className="px-3 py-3 text-right">
                <SortableHeader field="roas" title="ROAS" sortConfig={sortConfig} onSort={handleSort} />
              </th>
              <th className="px-3 py-3 text-right">
                <span className="text-[11px] font-semibold text-slate-500">ME/RE</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row) => (
              <KpiTableRow key={row.date} row={row} rateMode={rateMode} />
            ))}
          </tbody>
          <tfoot>
            <KpiTableRow row={data.totals} isTotal rateMode={rateMode} />
          </tfoot>
        </table>
      </div>
    </div>
  );
});
