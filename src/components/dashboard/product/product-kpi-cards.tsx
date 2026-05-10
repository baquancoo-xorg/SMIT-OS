// 8 KPI cards · Pre-PQL Rate prominent (PLG Gate metric #1)

import { useProductSummary } from '../../../hooks/use-product-dashboard';
import type { DateRange } from '../../../types/dashboard-product';
import DashboardPanel from '../ui/dashboard-panel';
import { Skeleton } from '../../ui/v2';

interface ProductKpiCardsProps {
  range: DateRange;
}

interface KpiDef {
  label: string;
  value: string;
  desc: string;
  highlight?: boolean;
  tooltip?: string;
}

export function ProductKpiCards({ range }: ProductKpiCardsProps) {
  const { data, isLoading, error } = useProductSummary(range);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
        {[...Array(8)].map((_, i) => (
          <DashboardPanel key={i} className="p-4">
            <Skeleton variant="text" width="80%" className="mb-2" />
            <Skeleton variant="text" width="60%" className="mb-1 h-7" />
            <Skeleton variant="text" width="90%" />
          </DashboardPanel>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <DashboardPanel className="p-6 text-[length:var(--text-body-sm)] text-on-surface-variant">
        Không thể tải KPI metrics
      </DashboardPanel>
    );
  }

  const summary = data;
  const prePqlRate =
    summary.totalSignups > 0
      ? Math.round((summary.firstSyncCount / summary.totalSignups) * 1000) / 10
      : 0;

  const kpis: KpiDef[] = [
    { label: 'Signup', value: summary.totalSignups.toLocaleString(), desc: 'Business Created' },
    { label: 'First Sync', value: summary.firstSyncCount.toLocaleString(), desc: 'Đồng bộ TKQC lần đầu' },
    {
      label: 'Pre-PQL Rate',
      value: `${prePqlRate}%`,
      desc: 'PLG Gate #1 (FirstSync/Signup)',
      highlight: true,
      tooltip: 'PLG Gate metric #1 — Master Plan §3 (target ≥45%)',
    },
    { label: 'PQL', value: summary.pqlCount.toLocaleString(), desc: 'Product Qualified Lead' },
    { label: 'Activation', value: summary.activationCount.toLocaleString(), desc: `≥2h online (${summary.activationRate}%)` },
    { label: 'DAU', value: summary.dau.toLocaleString(), desc: 'Active business / day' },
    { label: 'MAU', value: summary.mau.toLocaleString(), desc: 'Active business / 30d' },
    { label: 'DAU/MAU', value: `${summary.dauMauRatio}%`, desc: 'Stickiness ratio' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
      {kpis.map((kpi) => (
        <div key={kpi.label} title={kpi.tooltip}>
          <DashboardPanel
            className={`p-4 ${kpi.highlight ? 'bg-info-container/30 ring-2 ring-info' : ''}`}
          >
            <p
              className={`text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] ${
                kpi.highlight ? 'text-on-info-container' : 'text-on-surface-variant'
              }`}
            >
              {kpi.label}
            </p>
            <p
              className={`mt-1 font-headline text-[length:var(--text-h5)] font-bold tabular-nums ${
                kpi.highlight ? 'text-info' : 'text-on-surface'
              }`}
            >
              {kpi.value}
            </p>
            <p className="mt-0.5 text-[length:var(--text-caption)] font-medium italic text-on-surface-variant">{kpi.desc}</p>
          </DashboardPanel>
        </div>
      ))}
    </div>
  );
}
