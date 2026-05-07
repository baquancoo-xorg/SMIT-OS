import { memo, useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, Medal, Award, Trophy, Activity, Users, TrendingUp, Layers } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '../../../lib/formatters';
import type { KpiMetricsResponse, KpiMetricsRow } from '../../../types/dashboard-overview';
import { type SortConfig, type SortField, sortData, handleSortClick, formatDateVN } from './kpi-table-utils';
import { DashboardPanel, DashboardSectionTitle, SegmentedTabs } from '../ui';
import { getTableContract } from '../../ui/table-contract';

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
  const denseTable = getTableContract('dense');

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={`inline-flex items-center gap-0.5 transition-colors whitespace-nowrap ${
        active ? 'text-primary' : 'text-slate-500 hover:text-slate-700'
      } ${denseTable.headerCell}`}
    >
      <span>{title}</span>
      <Icon className="h-3 w-3 flex-shrink-0" />
    </button>
  );
}

function RateBadge({ value, rate }: { value: number; rate: number }) {
  const style = rate >= 50
    ? 'bg-primary text-white'
    : rate >= 20
      ? 'bg-primary/70 text-white'
      : rate > 0
        ? 'bg-primary/20 text-primary'
        : 'bg-slate-100 text-slate-400';
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${style}`}>
        {formatPercent(rate)}
      </span>
      <span className="text-slate-700 tabular-nums">{value}</span>
    </span>
  );
}

interface MqlTiers {
  gold: number;
  silver: number;
  bronze: number;
}

function MqlBadgeWithTooltip({ value, rate, tiers, rowIndex }: { value: number; rate: number; tiers: MqlTiers; rowIndex?: number }) {
  const style = rate >= 50
    ? 'bg-primary text-white'
    : rate >= 20
      ? 'bg-primary/70 text-white'
      : rate > 0
        ? 'bg-primary/20 text-primary'
        : 'bg-slate-100 text-slate-400';
  const total = tiers.gold + tiers.silver + tiers.bronze;
  const bronzePercent = total > 0 ? (tiers.bronze / total) * 100 : 0;
  const silverPercent = total > 0 ? (tiers.silver / total) * 100 : 0;
  const goldPercent = total > 0 ? (tiers.gold / total) * 100 : 0;

  const showBelow = rowIndex !== undefined && rowIndex < 3;
  const tooltipPosition = showBelow
    ? 'top-full mt-2'
    : 'bottom-full mb-2';
  const arrowPosition = showBelow
    ? 'bottom-full border-b-white'
    : 'top-full border-t-white';

  return (
    <div className="relative group inline-flex items-center gap-1.5 cursor-pointer">
      <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${style}`}>
        {formatPercent(rate)}
      </span>
      <span className="text-slate-700 tabular-nums">{value}</span>

      <div className={`absolute ${tooltipPosition} right-0 p-3 bg-white shadow-sm text-slate-700 text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50 shadow-md pointer-events-none min-w-[180px]`}>
        <div className="font-semibold text-slate-800 mb-2 text-[11px]">MQL Tier Breakdown</div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Medal className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-slate-500">Bronze:</span>
            <span className="ml-auto font-medium tabular-nums">{tiers.bronze} <span className="text-slate-400 font-normal">({bronzePercent.toFixed(1)}%)</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-500">Silver:</span>
            <span className="ml-auto font-medium tabular-nums">{tiers.silver} <span className="text-slate-400 font-normal">({silverPercent.toFixed(1)}%)</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-slate-500">Gold:</span>
            <span className="ml-auto font-medium tabular-nums">{tiers.gold} <span className="text-slate-400 font-normal">({goldPercent.toFixed(1)}%)</span></span>
          </div>
        </div>
        <div className="border-t border-slate-100 mt-2 pt-2 flex items-center justify-between">
          <span className="font-semibold text-slate-700 text-[11px]">Total:</span>
          <span className="font-semibold tabular-nums">{total} <span className="text-slate-400 font-normal">({rate.toFixed(1)}%)</span></span>
        </div>
        <div className={`absolute ${arrowPosition} right-4 border-4 border-transparent`}></div>
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
  const denseTable = getTableContract('dense');
  const cellBase = denseTable.cell;
  const rowBg = isTotal ? 'bg-slate-50/50' : isEven ? 'bg-white/30' : 'bg-slate-50/20';
  const cellBg = isTotal ? 'bg-slate-50' : '';
  const cellStyle = isTotal ? `${cellBase} font-semibold ${cellBg}` : `${cellBase} text-slate-600`;
  const rightAlign = 'text-right';

  const signupRate = safeDivide(row.signups, row.sessions);
  const oppsRate = safeDivide(row.opportunities, row.signups);
  const orderRate = rateMode === 'top'
    ? safeDivide(row.orders, row.signups)
    : safeDivide(row.orders, row.opportunities);
  const mqlRate = safeDivide(row.mql, row.signups);
  const prePqlRate = safeDivide(row.prePql, row.signups);
  const pqlRate = safeDivide(row.pql, row.signups);
  const preSqlRate = safeDivide(row.preSql, row.signups);
  const sqlRate = safeDivide(row.sql, row.signups);

  return (
    <tr className={`${isTotal ? '' : 'border-b border-slate-100'} ${rowBg} hover:bg-primary/5 transition-colors`}>
      <td className={`${cellStyle} text-left font-medium text-slate-800 sticky left-0 ${isTotal ? 'bg-slate-50 z-30' : `${rowBg} z-10`}`}>
        {isTotal ? 'TOTAL' : formatDateVN(row.date)}
      </td>
      <td className={`${cellStyle} ${rightAlign}`}>{formatCurrency(row.adSpend)}</td>
      <td className={`${cellStyle} ${rightAlign}`}>{formatNumber(row.sessions)}</td>
      <td className={`${cellStyle} ${rightAlign}`}>{formatCurrency(row.costPerSession)}</td>
      <td className={`${cellStyle} ${rightAlign}`}>
        <RateBadge value={row.signups} rate={signupRate} />
      </td>
      <td className={`${cellStyle} ${rightAlign}`}>{formatCurrency(row.costPerSignup)}</td>
      <td className={`${cellStyle} ${rightAlign}`}>
        <RateBadge value={row.opportunities} rate={oppsRate} />
      </td>
      <td className={`${cellStyle} ${rightAlign}`}>{formatCurrency(row.costPerOpportunity)}</td>
      <td className={`${cellStyle} ${rightAlign}`}>
        <RateBadge value={row.orders} rate={orderRate} />
      </td>
      <td className={`${cellStyle} ${rightAlign}`}>{formatCurrency(row.costPerOrder)}</td>
      <td className={`${cellStyle} ${rightAlign}`}>
        <MqlBadgeWithTooltip
          value={row.mql}
          rate={mqlRate}
          tiers={{ gold: row.mqlGold, silver: row.mqlSilver, bronze: row.mqlBronze }}
          rowIndex={index}
        />
      </td>
      <td className={`${cellStyle} ${rightAlign}`}>
        <RateBadge value={row.prePql} rate={prePqlRate} />
      </td>
      <td className={`${cellStyle} ${rightAlign}`}>
        <RateBadge value={row.pql} rate={pqlRate} />
      </td>
      <td className={`${cellStyle} ${rightAlign}`}>
        <RateBadge value={row.preSql} rate={preSqlRate} />
      </td>
      <td className={`${cellStyle} ${rightAlign}`}>
        <RateBadge value={row.sql} rate={sqlRate} />
      </td>
      <td className={`${cellStyle} ${rightAlign} font-medium tabular-nums`}>{formatCurrency(row.revenue)}</td>
      <td className={`${cellStyle} ${rightAlign} font-bold tabular-nums ${row.roas >= 1 ? 'text-primary' : 'text-red-600'}`}>
        {row.roas.toFixed(2)}x
      </td>
      <td className={`${cellStyle} ${rightAlign}`}>
        {row.revenue > 0
          ? `${((row.adSpend / row.revenue) * 100).toFixed(1)}%`
          : <span className="text-slate-400">-</span>}
      </td>
    </tr>
  );
}

function SkeletonTable() {
  return (
    <section>
      <div className="h-5 w-24 bg-slate-200 rounded mb-3" />
      <DashboardPanel className="animate-pulse overflow-hidden">
        <div className="p-4 space-y-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-8 bg-slate-100 rounded" />
          ))}
        </div>
      </DashboardPanel>
    </section>
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
  const denseTable = getTableContract('dense');

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
    if (headerScrollRef.current) {
      syncScroll(headerScrollRef.current.scrollLeft, 'header');
    }
  }, [syncScroll]);

  const handleDataScroll = useCallback(() => {
    if (dataScrollRef.current) {
      syncScroll(dataScrollRef.current.scrollLeft, 'data');
    }
  }, [syncScroll]);

  const handleTotalScroll = useCallback(() => {
    if (totalScrollRef.current) {
      syncScroll(totalScrollRef.current.scrollLeft, 'total');
    }
  }, [syncScroll]);

  if (isLoading) return <SkeletonTable />;

  if (error) {
    return (
      <section>
        <DashboardSectionTitle>KPI Metrics</DashboardSectionTitle>
        <DashboardPanel className="p-6">
          <p className="text-center text-red-600 font-medium">Lỗi: {error.message}</p>
        </DashboardPanel>
      </section>
    );
  }

  if (!data) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-3 gap-3">
        <DashboardSectionTitle>KPI Metrics</DashboardSectionTitle>
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <SegmentedTabs value={viewMode} onChange={onViewModeChange} options={VIEW_MODE_OPTIONS} />
          </div>
          <div className={`hidden md:block ${isStepDisabled ? 'opacity-60' : ''}`} title={isStepDisabled ? 'Step mode không khả dụng trong Cohort view' : ''}>
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

      <div className="md:hidden flex items-center gap-2 mb-3">
        <div className="flex-1">
          <SegmentedTabs value={viewMode} onChange={onViewModeChange} options={VIEW_MODE_OPTIONS} />
        </div>
        <div className={`flex-1 ${isStepDisabled ? 'opacity-60' : ''}`} title={isStepDisabled ? 'Step mode không khả dụng trong Cohort view' : ''}>
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

      <DashboardPanel className={`${denseTable.shell} flex flex-col`}>
        <div ref={headerScrollRef} onScroll={handleHeaderScroll} className={`${denseTable.headerRow} overflow-x-auto`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <table className={`${denseTable.table} min-w-[1680px]`}>
            <colgroup>
              <col className="w-[100px]" />
              <col className="w-[100px]" />
              <col className="w-[80px]" />
              <col className="w-[70px]" />
              <col className="w-[90px]" />
              <col className="w-[80px]" />
              <col className="w-[70px]" />
              <col className="w-[80px]" />
              <col className="w-[70px]" />
              <col className="w-[80px]" />
              <col className="w-[100px]" />
              <col className="w-[80px]" />
              <col className="w-[70px]" />
              <col className="w-[80px]" />
              <col className="w-[70px]" />
              <col className="w-[100px]" />
              <col className="w-[70px]" />
              <col className="w-[70px]" />
            </colgroup>
            <thead>
              <tr>
                <th className="px-3 py-2.5 text-left sticky left-0 bg-slate-100 z-10">
                  <SortableHeader field="date" title="Date" sortConfig={sortConfig} onSort={handleSort} />
                </th>
                <th className="px-3 py-2.5 text-right bg-slate-100">
                  <SortableHeader field="adSpend" title="Ad Spend" sortConfig={sortConfig} onSort={handleSort} />
                </th>
                <th className="px-3 py-2.5 text-right bg-slate-100">
                  <SortableHeader field="sessions" title="Sessions" sortConfig={sortConfig} onSort={handleSort} />
                </th>
                <th className="px-3 py-2.5 text-right bg-slate-100">
                  <span className={denseTable.headerCell}>CPSe</span>
                </th>
                <th className="px-3 py-2.5 text-right bg-slate-100">
                  <SortableHeader field="signups" title="Signups" sortConfig={sortConfig} onSort={handleSort} />
                </th>
                <th className="px-3 py-2.5 text-right bg-slate-100">
                  <span className={denseTable.headerCell}>CPSi</span>
                </th>
                <th className="px-3 py-2.5 text-right bg-slate-100">
                  <SortableHeader field="opportunities" title="Opps" sortConfig={sortConfig} onSort={handleSort} />
                </th>
                <th className="px-3 py-2.5 text-right bg-slate-100">
                  <span className={denseTable.headerCell}>CPOpp</span>
                </th>
                <th className="px-3 py-2.5 text-right bg-slate-100">
                  <SortableHeader field="orders" title="Order" sortConfig={sortConfig} onSort={handleSort} />
                </th>
                <th className="px-3 py-2.5 text-right bg-slate-100">
                  <span className={denseTable.headerCell}>CPOr</span>
                </th>
                <th className="px-3 py-2.5 text-right bg-slate-100">
                  <span className={denseTable.headerCell}>MQL (3 tiers)</span>
                </th>
                <th className="px-3 py-2.5 text-right bg-slate-100">
                  <span className={denseTable.headerCell}>Pre-PQL</span>
                </th>
                <th className="px-3 py-2.5 text-right bg-slate-100">
                  <span className={denseTable.headerCell}>PQL</span>
                </th>
                <th className="px-3 py-2.5 text-right bg-slate-100">
                  <span className={denseTable.headerCell}>Pre-SQL</span>
                </th>
                <th className="px-3 py-2.5 text-right bg-slate-100">
                  <span className={denseTable.headerCell}>SQL</span>
                </th>
                <th className="px-3 py-2.5 text-right bg-slate-100">
                  <SortableHeader field="revenue" title="Revenue" sortConfig={sortConfig} onSort={handleSort} />
                </th>
                <th className="px-3 py-2.5 text-right bg-slate-100">
                  <SortableHeader field="roas" title="ROAS" sortConfig={sortConfig} onSort={handleSort} />
                </th>
                <th className="px-3 py-2.5 text-right bg-slate-100">
                  <span className={denseTable.headerCell}>ME/RE</span>
                </th>
              </tr>
            </thead>
          </table>
        </div>

        <div ref={dataScrollRef} onScroll={handleDataScroll} className="overflow-auto max-h-[500px] flex-1">
          <table className={`${denseTable.table} min-w-[1680px]`}>
            <colgroup>
              <col className="w-[100px]" />
              <col className="w-[100px]" />
              <col className="w-[80px]" />
              <col className="w-[70px]" />
              <col className="w-[90px]" />
              <col className="w-[80px]" />
              <col className="w-[70px]" />
              <col className="w-[80px]" />
              <col className="w-[70px]" />
              <col className="w-[80px]" />
              <col className="w-[100px]" />
              <col className="w-[80px]" />
              <col className="w-[70px]" />
              <col className="w-[80px]" />
              <col className="w-[70px]" />
              <col className="w-[100px]" />
              <col className="w-[70px]" />
              <col className="w-[70px]" />
            </colgroup>
            <tbody>
              {sortedData.map((row, idx) => (
                <KpiTableRow key={row.date} row={row} rateMode={rateMode} index={idx} />
              ))}
            </tbody>
          </table>
        </div>

        <div ref={totalScrollRef} onScroll={handleTotalScroll} className="border-t-2 border-slate-200 bg-slate-50 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <table className={`${denseTable.table} min-w-[1680px]`}>
            <colgroup>
              <col className="w-[100px]" />
              <col className="w-[100px]" />
              <col className="w-[80px]" />
              <col className="w-[70px]" />
              <col className="w-[90px]" />
              <col className="w-[80px]" />
              <col className="w-[70px]" />
              <col className="w-[80px]" />
              <col className="w-[70px]" />
              <col className="w-[80px]" />
              <col className="w-[100px]" />
              <col className="w-[80px]" />
              <col className="w-[70px]" />
              <col className="w-[80px]" />
              <col className="w-[70px]" />
              <col className="w-[100px]" />
              <col className="w-[70px]" />
              <col className="w-[70px]" />
            </colgroup>
            <tbody>
              <KpiTableRow row={data.totals} isTotal rateMode={rateMode} />
            </tbody>
          </table>
        </div>
      </DashboardPanel>
    </section>
  );
});

