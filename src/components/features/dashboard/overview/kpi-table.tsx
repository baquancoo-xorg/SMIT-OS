import { memo, useMemo, useState, useCallback, useEffect } from 'react';
import { Activity, Users, TrendingUp, Layers } from 'lucide-react';
import type { KpiMetricsResponse, SummaryMetrics } from '../../../../types/dashboard-overview';
import { Card } from '../../../ui';
import { SegmentedTabs } from '../ui';
import { SummaryKpiRow } from './summary-cards';
import { KpiBreakdownTable } from './kpi-breakdown-table';
import { type SortConfig, type SortField, sortData, handleSortClick } from './kpi-table-utils';

type ViewMode = 'realtime' | 'cohort';
type RateMode = 'top' | 'step';

interface KpiTableProps {
  data?: KpiMetricsResponse;
  summary?: SummaryMetrics;
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

function SkeletonTable() {
  return (
    <Card padding="none" glow className="overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
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

export const KpiTable = memo(function KpiTable({
  data,
  summary,
  isLoading,
  error,
  viewMode,
  onViewModeChange,
}: KpiTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'date', direction: 'desc' });
  const [rateMode, setRateMode] = useState<RateMode>('top');
  const handleSort = useCallback((f: SortField) => setSortConfig((p) => handleSortClick(f, p)), []);

  useEffect(() => {
    if (viewMode === 'cohort' && rateMode === 'step') setRateMode('top');
  }, [viewMode, rateMode]);

  const isStepDisabled = viewMode === 'cohort';
  const sortedData = useMemo(() => (data ? sortData(data.data, sortConfig) : []), [data, sortConfig]);

  if (isLoading) return <SkeletonTable />;

  if (error) {
    return (
      <Card padding="md">
        <p className="text-sm font-semibold text-error">Không tải được bảng KPI: {error.message}</p>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card padding="none" glow className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 pb-2">
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

      {summary && (
        <div className="px-5 py-4">
          <SummaryKpiRow data={summary} />
        </div>
      )}

      <KpiBreakdownTable
        data={data}
        sortedData={sortedData}
        sortConfig={sortConfig}
        onSort={handleSort}
        rateMode={rateMode}
      />
    </Card>
  );
});
