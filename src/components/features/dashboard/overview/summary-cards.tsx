import { CreditCard, DollarSign, TrendingUp, Users } from 'lucide-react';
import { formatCurrency } from '../../../../lib/formatters';
import type { SummaryMetrics, MetricWithTrend } from '../../../../types/dashboard-overview';
import { Card, KpiCard, Skeleton } from '../../../ui';

interface SummaryCardsProps {
  data?: SummaryMetrics;
  isLoading: boolean;
  error?: Error | null;
}

function trendFrom(metric: MetricWithTrend) {
  if (metric.trendDirection === 'up') return 'up';
  if (metric.trendDirection === 'down') return 'down';
  return 'flat';
}

export function SummaryCards({ data, isLoading, error }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <Skeleton key={item} variant="rect" className="h-36 rounded-card" />)}
      </div>
    );
  }

  if (error) {
    return (
      <Card padding="md">
        <p className="text-sm font-semibold text-error">Không tải được KPI: {error.message}</p>
      </Card>
    );
  }

  if (!data) return null;

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
