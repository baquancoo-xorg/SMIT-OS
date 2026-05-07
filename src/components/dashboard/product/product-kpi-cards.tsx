import { useProductSummary } from '../../../hooks/use-product-dashboard';
import type { DateRange } from '../../../types/dashboard-product';
import DashboardPanel from '../ui/dashboard-panel';
import DashboardEmptyState from '../ui/dashboard-empty-state';

interface ProductKpiCardsProps {
  range: DateRange;
}

export function ProductKpiCards({ range }: ProductKpiCardsProps) {
  const { data, isLoading, error } = useProductSummary(range);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <DashboardPanel key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-16" />
          </DashboardPanel>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return <DashboardEmptyState description="Không thể tải KPI metrics" />;
  }

  const summary = data;
  const kpis = [
    { label: 'Business Created', value: summary.totalSignups.toLocaleString(), desc: 'Total Signup' },
    { label: 'First Sync', value: summary.firstSyncCount.toLocaleString(), desc: 'Đồng bộ lần đầu' },
    { label: 'PQL', value: summary.pqlCount.toLocaleString(), desc: 'Product Qualified Lead' },
    { label: 'Activation', value: summary.activationCount.toLocaleString(), desc: `≥2h online (${summary.activationRate}%)` },
    { label: 'DAU', value: summary.dau.toLocaleString(), desc: 'Active businesses/day' },
    { label: 'DAU/MAU', value: `${summary.dauMauRatio}%`, desc: `MAU: ${summary.mau.toLocaleString()}` },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((kpi) => (
        <DashboardPanel key={kpi.label} className="p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">{kpi.label}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{kpi.value}</p>
          <p className="text-xs text-gray-400 mt-1">{kpi.desc}</p>
        </DashboardPanel>
      ))}
    </div>
  );
}
