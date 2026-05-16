import { memo, useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, Medal, Award, Trophy, Activity, Users, TrendingUp, Layers } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '../../../../lib/formatters';
import type { KpiMetricsResponse, KpiMetricsRow } from '../../../../types/dashboard-overview';
import { Card } from '../../../ui';
import { SegmentedTabs } from '../ui';
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
      className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[var(--tracking-wide)] transition-colors whitespace-nowrap ${
        active ? 'text-accent-text' : 'text-text-2 hover:text-text-1'
      }`}
    >
      <span>{title}</span>
      <Icon className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
    </button>
  );
}

function rateBadgeStyle(rate: number) {
  if (rate >= 50) return 'bg-accent text-white';
  if (rate >= 20) return 'bg-accent/70 text-white';
  if (rate > 0) return 'bg-accent/20 text-accent-text';
  return 'bg-surface-2 text-text-muted';
}

function RateBadge({ value, rate }: { value: number; rate: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-button ${rateBadgeStyle(rate)}`}>
        {formatPercent(rate)}
      </span>
      <span className="text-text-1 tabular-nums">{value}</span>
    </span>
  );
}

interface MqlTiers {
  gold: number;
  silver: number;
  bronze: number;
}

function MqlBadgeWithTooltip({ value, rate, tiers, rowIndex }: { value: number; rate: number; tiers: MqlTiers; rowIndex?: number }) {
  const total = tiers.gold + tiers.silver + tiers.bronze;
  const bronzePercent = total > 0 ? (tiers.bronze / total) * 100 : 0;
  const silverPercent = total > 0 ? (tiers.silver / total) * 100 : 0;
  const goldPercent = total > 0 ? (tiers.gold / total) * 100 : 0;

  const showBelow = rowIndex !== undefined && rowIndex < 3;
  const tooltipPosition = showBelow ? 'top-full mt-2' : 'bottom-full mb-2';
  const arrowPosition = showBelow ? 'bottom-full border-b-surface' : 'top-full border-t-surface';

  return (
    <div className="relative group inline-flex items-center gap-1.5 cursor-pointer">
      <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-button ${rateBadgeStyle(rate)}`}>
        {formatPercent(rate)}
      </span>
      <span className="text-text-1 tabular-nums">{value}</span>

      <div className={`absolute ${tooltipPosition} right-0 p-3 bg-surface text-text-1 text-xs rounded-input border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50 shadow-card pointer-events-none min-w-[180px]`}>
        <div className="font-semibold text-text-1 mb-2 text-[11px]">MQL Tier Breakdown</div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Medal className="h-3.5 w-3.5 text-accent-text" aria-hidden="true" />
            <span className="text-text-2">Bronze:</span>
            <span className="ml-auto font-medium tabular-nums">
              {tiers.bronze} <span className="text-text-muted font-normal">({bronzePercent.toFixed(1)}%)</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
            <span className="text-text-2">Silver:</span>
            <span className="ml-auto font-medium tabular-nums">
              {tiers.silver} <span className="text-text-muted font-normal">({silverPercent.toFixed(1)}%)</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span className="text-text-2">Gold:</span>
            <span className="ml-auto font-medium tabular-nums">
              {tiers.gold} <span className="text-text-muted font-normal">({goldPercent.toFixed(1)}%)</span>
            </span>
          </div>
        </div>
        <div className="border-t border-border mt-2 pt-2 flex items-center justify-between">
          <span className="font-semibold text-text-1 text-[11px]">Total:</span>
          <span className="font-semibold tabular-nums">
            {total} <span className="text-text-muted font-normal">({rate.toFixed(1)}%)</span>
          </span>
        </div>
        <div className={`absolute ${arrowPosition} right-4 border-4 border-transparent`} />
      </div>
    </div>
  );
}

interface KpiTableRowProps {
  row: KpiMetricsRow;
  isTotal?: boolean;
  rateMode: RateMode;
  index?: number;
}

function safeDivide(n: number, d: number): number {
  return d === 0 ? 0 : (n / d) * 100;
}

function KpiTableRow({ row, isTotal, rateMode, index = 0 }: KpiTableRowProps) {
  const isEven = index % 2 === 0;
  const cellBase = 'px-3 py-2 text-xs whitespace-nowrap';
  const rowBg = isTotal ? 'bg-surface-2' : isEven ? 'bg-surface' : 'bg-surface-container-low';
  const cellBg = isTotal ? 'bg-surface-2' : '';
  const cellStyle = isTotal ? `${cellBase} font-semibold text-text-1 ${cellBg}` : `${cellBase} text-text-2`;
  const rightAlign = 'text-right';

  const signupRate = safeDivide(row.signups, row.sessions);
  const oppsRate = safeDivide(row.opportunities, row.signups);
  const orderRate = rateMode === 'top'
    ? safeDivide(row.orders, row.signups)
    : safeDivide(row.orders, row.opportunities);
  const mqlRate = safeDivide(row.mql ?? 0, row.signups);
  const prePqlRate = safeDivide(row.prePql ?? 0, row.signups);
  const pqlRate = safeDivide(row.pql ?? 0, row.signups);
  const preSqlRate = safeDivide(row.preSql ?? 0, row.signups);
  const sqlRate = safeDivide(row.sql ?? 0, row.signups);

  const stickyBg = isTotal ? 'bg-surface-2' : rowBg;

  return (
    <tr className={`${isTotal ? '' : 'border-b border-border'} ${rowBg} hover:bg-accent/5 transition-colors`}>
      <td className={`${cellStyle} text-left font-medium text-text-1 sticky left-0 ${stickyBg} z-10`}>
        {isTotal ? 'TOTAL' : formatDateVN(row.date)}
      </td>
      <td className={`${cellStyle} ${rightAlign} tabular-nums`}>{formatCurrency(row.adSpend)}</td>
      <td className={`${cellStyle} ${rightAlign} tabular-nums`}>{formatNumber(row.sessions)}</td>
      <td className={`${cellStyle} ${rightAlign} tabular-nums`}>{formatCurrency(row.costPerSession)}</td>
      <td className={`${cellStyle} ${rightAlign}`}>
        <RateBadge value={row.signups} rate={signupRate} />
      </td>
      <td className={`${cellStyle} ${rightAlign} tabular-nums`}>{formatCurrency(row.costPerSignup)}</td>
      <td className={`${cellStyle} ${rightAlign}`}>
        <RateBadge value={row.opportunities} rate={oppsRate} />
      </td>
      <td className={`${cellStyle} ${rightAlign} tabular-nums`}>{formatCurrency(row.costPerOpportunity)}</td>
      <td className={`${cellStyle} ${rightAlign}`}>
        <RateBadge value={row.orders} rate={orderRate} />
      </td>
      <td className={`${cellStyle} ${rightAlign} tabular-nums`}>{formatCurrency(row.costPerOrder)}</td>
      <td className={`${cellStyle} ${rightAlign}`}>
        <MqlBadgeWithTooltip
          value={row.mql ?? 0}
          rate={mqlRate}
          tiers={{ gold: row.mqlGold ?? 0, silver: row.mqlSilver ?? 0, bronze: row.mqlBronze ?? 0 }}
          rowIndex={index}
        />
      </td>
      <td className={`${cellStyle} ${rightAlign}`}>
        <RateBadge value={row.prePql ?? 0} rate={prePqlRate} />
      </td>
      <td className={`${cellStyle} ${rightAlign}`}>
        <RateBadge value={row.pql ?? 0} rate={pqlRate} />
      </td>
      <td className={`${cellStyle} ${rightAlign}`}>
        <RateBadge value={row.preSql ?? 0} rate={preSqlRate} />
      </td>
      <td className={`${cellStyle} ${rightAlign}`}>
        <RateBadge value={row.sql ?? 0} rate={sqlRate} />
      </td>
      <td className={`${cellStyle} ${rightAlign} font-medium tabular-nums text-text-1`}>{formatCurrency(row.revenue)}</td>
      <td className={`${cellStyle} ${rightAlign} font-bold tabular-nums ${row.roas >= 1 ? 'text-accent-text' : 'text-error'}`}>
        {row.roas.toFixed(2)}x
      </td>
      <td className={`${cellStyle} ${rightAlign} tabular-nums`}>
        {(row.revenue === 0 ? 0 : (row.adSpend / row.revenue) * 100).toFixed(1)}%
      </td>
    </tr>
  );
}

function SkeletonTable() {
  return (
    <Card padding="none" glow className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-accent-text">Daily breakdown</p>
          <h2 className="mt-1 font-headline text-2xl font-black tracking-tight text-text-1">KPI Metrics</h2>
        </div>
      </div>
      <div className="animate-pulse p-4 space-y-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-8 bg-surface-2 rounded-input" />
        ))}
      </div>
    </Card>
  );
}

interface KpiTableProps {
  data?: KpiMetricsResponse;
  isLoading: boolean;
  error?: Error | null;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const VIEW_MODE_OPTIONS: Array<{ label: string; value: ViewMode; icon: React.ReactNode }> = [
  { label: 'Realtime', value: 'realtime', icon: <Activity size={10} /> },
  { label: 'Cohort', value: 'cohort', icon: <Users size={10} /> },
];

const RATE_MODE_OPTIONS: Array<{ label: string; value: RateMode; icon: React.ReactNode }> = [
  { label: 'Top', value: 'top', icon: <TrendingUp size={10} /> },
  { label: 'Step', value: 'step', icon: <Layers size={10} /> },
];

const COLGROUP = (
  <colgroup>
    <col className="w-[100px]" />
    <col className="w-[110px]" />
    <col className="w-[80px]" />
    <col className="w-[80px]" />
    <col className="w-[100px]" />
    <col className="w-[80px]" />
    <col className="w-[90px]" />
    <col className="w-[80px]" />
    <col className="w-[90px]" />
    <col className="w-[80px]" />
    <col className="w-[110px]" />
    <col className="w-[90px]" />
    <col className="w-[80px]" />
    <col className="w-[90px]" />
    <col className="w-[80px]" />
    <col className="w-[110px]" />
    <col className="w-[80px]" />
    <col className="w-[80px]" />
  </colgroup>
);

export const KpiTable = memo(function KpiTable({
  data,
  isLoading,
  error,
  viewMode,
  onViewModeChange,
}: KpiTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'date', direction: 'desc' });
  const [rateMode, setRateMode] = useState<RateMode>('top');
  const handleSort = useCallback((f: SortField) => setSortConfig((p) => handleSortClick(f, p)), []);

  useEffect(() => {
    if (viewMode === 'cohort' && rateMode === 'step') {
      setRateMode('top');
    }
  }, [viewMode, rateMode]);

  const isStepDisabled = viewMode === 'cohort';
  const sortedData = useMemo(() => (data ? sortData(data.data, sortConfig) : []), [data, sortConfig]);

  const headerScrollRef = useRef<HTMLDivElement>(null);
  const dataScrollRef = useRef<HTMLDivElement>(null);
  const totalScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingScrollRef = useRef(false);

  const syncScroll = useCallback((scrollLeft: number, source: 'header' | 'data' | 'total') => {
    if (isSyncingScrollRef.current) return;
    isSyncingScrollRef.current = true;

    if (source !== 'header' && headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = scrollLeft;
    }
    if (source !== 'data' && dataScrollRef.current) {
      dataScrollRef.current.scrollLeft = scrollLeft;
    }
    if (source !== 'total' && totalScrollRef.current) {
      totalScrollRef.current.scrollLeft = scrollLeft;
    }

    requestAnimationFrame(() => {
      isSyncingScrollRef.current = false;
    });
  }, []);

  const handleHeaderScroll = useCallback(() => {
    if (headerScrollRef.current) syncScroll(headerScrollRef.current.scrollLeft, 'header');
  }, [syncScroll]);
  const handleDataScroll = useCallback(() => {
    if (dataScrollRef.current) syncScroll(dataScrollRef.current.scrollLeft, 'data');
  }, [syncScroll]);
  const handleTotalScroll = useCallback(() => {
    if (totalScrollRef.current) syncScroll(totalScrollRef.current.scrollLeft, 'total');
  }, [syncScroll]);

  if (isLoading) return <SkeletonTable />;

  if (error) {
    return (
      <Card padding="md">
        <p className="text-sm font-semibold text-error">Không tải được bảng KPI: {error.message}</p>
      </Card>
    );
  }

  if (!data) return null;

  const headerCellBase = 'px-3 py-2.5 text-right bg-surface-2';

  return (
    <Card padding="none" glow className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-accent-text">Daily breakdown</p>
          <h2 className="mt-1 font-headline text-2xl font-black tracking-tight text-text-1">KPI Metrics</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedTabs value={viewMode} onChange={onViewModeChange} options={VIEW_MODE_OPTIONS} />
          <div className={isStepDisabled ? 'opacity-60' : ''} title={isStepDisabled ? 'Step mode không khả dụng trong Cohort view' : ''}>
            <SegmentedTabs
              value={rateMode}
              onChange={(mode) => {
                if (mode === 'step' && isStepDisabled) return;
                setRateMode(mode);
              }}
              options={RATE_MODE_OPTIONS}
            />
          </div>
        </div>
      </div>

      <div ref={headerScrollRef} onScroll={handleHeaderScroll} className="bg-surface-2 border-b border-border overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <table className="w-full text-sm table-fixed min-w-[1680px]">
          {COLGROUP}
          <thead>
            <tr>
              <th className="px-3 py-2.5 text-left sticky left-0 bg-surface-2 z-20">
                <SortableHeader field="date" title="Date" sortConfig={sortConfig} onSort={handleSort} />
              </th>
              <th className={headerCellBase}>
                <SortableHeader field="adSpend" title="Ad Spend" sortConfig={sortConfig} onSort={handleSort} />
              </th>
              <th className={headerCellBase}>
                <SortableHeader field="sessions" title="Sessions" sortConfig={sortConfig} onSort={handleSort} />
              </th>
              <th className={headerCellBase}>
                <span className="text-[11px] font-semibold uppercase tracking-[var(--tracking-wide)] text-text-2">CPSe</span>
              </th>
              <th className={headerCellBase}>
                <SortableHeader field="signups" title="Signups" sortConfig={sortConfig} onSort={handleSort} />
              </th>
              <th className={headerCellBase}>
                <span className="text-[11px] font-semibold uppercase tracking-[var(--tracking-wide)] text-text-2">CPSi</span>
              </th>
              <th className={headerCellBase}>
                <SortableHeader field="opportunities" title="Opps" sortConfig={sortConfig} onSort={handleSort} />
              </th>
              <th className={headerCellBase}>
                <span className="text-[11px] font-semibold uppercase tracking-[var(--tracking-wide)] text-text-2">CPOpp</span>
              </th>
              <th className={headerCellBase}>
                <SortableHeader field="orders" title="Order" sortConfig={sortConfig} onSort={handleSort} />
              </th>
              <th className={headerCellBase}>
                <span className="text-[11px] font-semibold uppercase tracking-[var(--tracking-wide)] text-text-2">CPOr</span>
              </th>
              <th className={headerCellBase}>
                <span className="text-[11px] font-semibold uppercase tracking-[var(--tracking-wide)] text-text-2">MQL (3 tiers)</span>
              </th>
              <th className={headerCellBase}>
                <span className="text-[11px] font-semibold uppercase tracking-[var(--tracking-wide)] text-text-2">First Sync</span>
              </th>
              <th className={headerCellBase}>
                <span className="text-[11px] font-semibold uppercase tracking-[var(--tracking-wide)] text-text-2">PQL</span>
              </th>
              <th className={headerCellBase}>
                <span className="text-[11px] font-semibold uppercase tracking-[var(--tracking-wide)] text-text-2">First Touch</span>
              </th>
              <th className={headerCellBase}>
                <span className="text-[11px] font-semibold uppercase tracking-[var(--tracking-wide)] text-text-2">SQL</span>
              </th>
              <th className={headerCellBase}>
                <SortableHeader field="revenue" title="Revenue" sortConfig={sortConfig} onSort={handleSort} />
              </th>
              <th className={headerCellBase}>
                <SortableHeader field="roas" title="ROAS" sortConfig={sortConfig} onSort={handleSort} />
              </th>
              <th className={headerCellBase}>
                <span className="text-[11px] font-semibold uppercase tracking-[var(--tracking-wide)] text-text-2">ME/RE</span>
              </th>
            </tr>
          </thead>
        </table>
      </div>

      <div ref={dataScrollRef} onScroll={handleDataScroll} className="overflow-auto max-h-[500px]">
        <table className="w-full text-sm table-fixed min-w-[1680px]">
          {COLGROUP}
          <tbody>
            {sortedData.map((row, idx) => (
              <KpiTableRow key={row.date} row={row} rateMode={rateMode} index={idx} />
            ))}
          </tbody>
        </table>
      </div>

      <div ref={totalScrollRef} onScroll={handleTotalScroll} className="border-t-2 border-border bg-surface-2 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <table className="w-full text-sm table-fixed min-w-[1680px]">
          {COLGROUP}
          <tbody>
            <KpiTableRow row={data.totals} isTotal rateMode={rateMode} />
          </tbody>
        </table>
      </div>
    </Card>
  );
});
