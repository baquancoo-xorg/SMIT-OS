// 8 KPI cards · Pre-PQL Rate prominent (PLG Gate metric #1)

import { useProductSummary } from '../../../hooks/use-product-dashboard';
import type { DateRange } from '../../../types/dashboard-product';
import DashboardPanel from '../ui/dashboard-panel';

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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {[...Array(8)].map((_, i) => (
          <DashboardPanel key={i} className="p-4 animate-pulse">
            <div className="h-3 bg-slate-200 rounded w-20 mb-2" />
            <div className="h-7 bg-slate-200 rounded w-16 mb-1" />
            <div className="h-3 bg-slate-100 rounded w-24" />
          </DashboardPanel>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <DashboardPanel className="p-6 text-sm text-slate-500">
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
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {kpis.map((kpi) => (
        <div key={kpi.label} title={kpi.tooltip}>
          <DashboardPanel
            className={`p-4 ${
              kpi.highlight ? 'ring-2 ring-sky-500 bg-sky-50/60' : ''
            }`}
          >
            <p
              className={`text-[10px] font-black uppercase tracking-widest ${
                kpi.highlight ? 'text-sky-700' : 'text-slate-400'
              }`}
            >
              {kpi.label}
            </p>
            <p
              className={`text-2xl font-black mt-1 tabular-nums ${
                kpi.highlight ? 'text-sky-900' : 'text-slate-700'
              }`}
            >
              {kpi.value}
            </p>
            <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">{kpi.desc}</p>
          </DashboardPanel>
        </div>
      ))}
    </div>
  );
}
