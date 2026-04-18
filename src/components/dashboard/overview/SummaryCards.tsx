import { memo } from 'react';
import { DollarSign, CreditCard, Users, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../../lib/formatters';
import type { SummaryMetrics, MetricWithTrend } from '../../../types/dashboard-overview';

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
}

function MetricCard({ label, value, icon: Icon, trend, trendDirection }: MetricCardProps) {
  const trendColor = trendDirection === 'up'
    ? 'text-[#0059B6]'
    : trendDirection === 'down'
      ? 'text-red-600'
      : 'text-slate-500';

  return (
    <div className="group bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-[#0059B6]/10">
          <Icon className="h-5 w-5 text-[#0059B6]" />
        </div>
      </div>

      <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
      <h4 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{value}</h4>

      {trend !== undefined && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${trendColor}`}>
            {trendDirection === 'up' ? '↗' : trendDirection === 'down' ? '↘' : '→'}
            {Math.abs(trend).toFixed(1)}%
          </span>
          <span className="text-xs text-slate-400">vs last period</span>
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 bg-slate-100 rounded-lg" />
        <div className="w-14 h-6 bg-slate-100 rounded-md" />
      </div>
      <div className="h-3 w-16 bg-slate-100 rounded mb-2" />
      <div className="h-7 w-28 bg-slate-200 rounded" />
    </div>
  );
}

interface SummaryCardsProps {
  data?: SummaryMetrics;
  isLoading: boolean;
  error?: Error | null;
  compareEnabled: boolean;
}

export const SummaryCards = memo(function SummaryCards({
  data,
  isLoading,
  error,
  compareEnabled,
}: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <p className="text-center text-red-600 font-medium">Lỗi: {error.message}</p>
      </div>
    );
  }

  if (!data) return null;

  const metrics: Array<{
    label: string;
    value: string;
    icon: React.ElementType;
    metric: MetricWithTrend;
  }> = [
    { label: 'Revenue', value: formatCurrency(data.revenue.value), icon: DollarSign, metric: data.revenue },
    { label: 'Ad Spend', value: formatCurrency(data.adSpend.value), icon: CreditCard, metric: data.adSpend },
    { label: 'Signups', value: data.signups.value.toLocaleString(), icon: Users, metric: data.signups },
    { label: 'ROAS', value: `${data.roas.value.toFixed(2)}x`, icon: TrendingUp, metric: data.roas },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => (
        <MetricCard
          key={m.label}
          label={m.label}
          value={m.value}
          icon={m.icon}
          trend={compareEnabled ? m.metric.trend : undefined}
          trendDirection={compareEnabled ? m.metric.trendDirection : undefined}
        />
      ))}
    </div>
  );
});
