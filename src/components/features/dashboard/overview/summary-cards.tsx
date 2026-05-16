import { CreditCard, DollarSign, TrendingUp, Users } from 'lucide-react';
import { formatCurrency } from '../../../../lib/formatters';
import type { SummaryMetrics, MetricWithTrend } from '../../../../types/dashboard-overview';
import { KpiCard } from '../../../ui';

interface SummaryKpiRowProps {
  data: SummaryMetrics;
}

function trendFrom(metric: MetricWithTrend) {
  if (metric.trendDirection === 'up') return 'up';
  if (metric.trendDirection === 'down') return 'down';
  return 'flat';
}

export function SummaryKpiRow({ data }: SummaryKpiRowProps) {
  const metrics = [
    { label: 'Revenue', value: formatCurrency(data.revenue.value), icon: <DollarSign />, metric: data.revenue },
    { label: 'Ad Spend', value: formatCurrency(data.adSpend.value), icon: <CreditCard />, metric: data.adSpend },
    { label: 'Signups', value: data.signups.value.toLocaleString('vi-VN'), icon: <Users />, metric: data.signups },
    { label: 'ROAS', value: `${data.roas.value.toFixed(2)}x`, icon: <TrendingUp />, metric: data.roas },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((item) => (
        <KpiCard
          key={item.label}
          label={item.label}
          value={item.value}
          icon={item.icon}
          deltaPercent={item.metric.trend}
          deltaLabel="vs last period"
          trend={trendFrom(item.metric)}
          sparkline={<div className="h-1.5 rounded-full bg-gradient-to-r from-accent/20 via-accent/70 to-accent/20" />}
        />
      ))}
    </div>
  );
}
