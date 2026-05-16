import { Activity, BarChart3, Gauge, Layers, PieChart, RefreshCcw, Sparkles, TrendingUp } from 'lucide-react';
import { useProductSummary } from '../../../../hooks/use-product-dashboard';
import type { DateRange } from '../../../../types/dashboard-product';
import { Card, KpiCard, Skeleton } from '../../../ui';

interface ProductKpiCardsProps {
  range: DateRange;
}

export function ProductKpiCards({ range }: ProductKpiCardsProps) {
  const { data, isLoading, error } = useProductSummary(range);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} variant="rect" className="h-32 rounded-card" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card padding="md">
        <p className="text-sm font-semibold text-error">Không thể tải KPI metrics</p>
      </Card>
    );
  }

  const prePqlRate =
    data.totalSignups > 0
      ? Math.round((data.firstSyncCount / data.totalSignups) * 1000) / 10
      : 0;

  const kpis = [
    { label: 'Signup', value: data.totalSignups.toLocaleString(), icon: <Sparkles /> },
    { label: 'First Sync', value: data.firstSyncCount.toLocaleString(), icon: <RefreshCcw /> },
    { label: 'Pre-PQL Rate', value: `${prePqlRate}%`, icon: <Gauge /> },
    { label: 'PQL', value: data.pqlCount.toLocaleString(), icon: <BarChart3 /> },
    { label: 'Activation', value: data.activationCount.toLocaleString(), icon: <Activity /> },
    { label: 'DAU', value: data.dau.toLocaleString(), icon: <TrendingUp /> },
    { label: 'MAU', value: data.mau.toLocaleString(), icon: <Layers /> },
    { label: 'DAU/MAU', value: `${data.dauMauRatio}%`, icon: <PieChart /> },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} />
      ))}
    </div>
  );
}
