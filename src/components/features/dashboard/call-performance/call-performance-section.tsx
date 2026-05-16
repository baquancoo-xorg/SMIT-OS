import { useCallPerformance } from '../../../../hooks/use-call-performance';
import CallPerformanceAeTable from './call-performance-ae-table';
import CallPerformanceHeatmap from './call-performance-heatmap';
import CallPerformanceConversion from './call-performance-conversion';
import CallPerformanceTrend from './call-performance-trend';
import { DashboardPanel } from '../ui';
import { SectionCard } from '../../../ui';

interface Props {
  from: string;
  to: string;
}

export default function CallPerformanceSection({ from, to }: Props) {
  const { data, isLoading, error } = useCallPerformance({ from, to });

  return (
    <SectionCard eyebrow="Call performance" title="Conversion Operations">
      {isLoading ? (
        <DashboardPanel className="p-6 text-[length:var(--text-body-sm)] text-on-surface-variant">
          Đang tải dữ liệu call performance...
        </DashboardPanel>
      ) : error ? (
        <DashboardPanel className="p-6 text-[length:var(--text-body-sm)] text-error">
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
    </SectionCard>
  );
}
