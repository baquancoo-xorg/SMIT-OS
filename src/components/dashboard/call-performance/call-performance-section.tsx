import { useState } from 'react';
import { useCallPerformance } from '../../../hooks/use-call-performance';
import CallPerformanceAeTable from './call-performance-ae-table';
import CallPerformanceHeatmap from './call-performance-heatmap';
import CallPerformanceConversion from './call-performance-conversion';
import CallPerformanceTrend from './call-performance-trend';
import { DashboardPanel, DashboardSectionTitle } from '../ui';

interface Props {
  from: string;
  to: string;
}

export default function CallPerformanceSection({ from, to }: Props) {
  const [aeId, setAeId] = useState('');
  const { data, isLoading, error } = useCallPerformance({ from, to, aeId: aeId || undefined });

  return (
    <section className="space-y-3">
      <DashboardSectionTitle
        action={
          <input
            value={aeId}
            onChange={(e) => setAeId(e.target.value)}
            placeholder="Filter theo AE ID (optional)"
            className="h-9 w-60 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-700 placeholder:text-slate-400"
          />
        }
      >
        Call Performance
      </DashboardSectionTitle>

      {isLoading ? (
        <DashboardPanel className="p-6 text-sm text-slate-500">
          Đang tải dữ liệu call performance...
        </DashboardPanel>
      ) : error ? (
        <DashboardPanel className="p-6 text-sm text-rose-600">
          Lỗi tải dữ liệu: {(error as Error).message}
        </DashboardPanel>
      ) : (
        <div className="space-y-3">
          <CallPerformanceAeTable data={data?.perAe ?? []} />
          <CallPerformanceHeatmap data={data?.heatmap ?? []} />
          <CallPerformanceConversion data={data?.conversion ?? []} />
          <CallPerformanceTrend data={data?.trend ?? []} />
        </div>
      )}
    </section>
  );
}
