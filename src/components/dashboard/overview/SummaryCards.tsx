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
  iconColor: string;
}

function MetricCard({ label, value, icon: Icon, trend, trendDirection, iconColor }: MetricCardProps) {
  const trendColor = trendDirection === 'up' ? 'text-emerald-600' : trendDirection === 'down' ? 'text-red-500' : 'text-slate-400';

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-outline-variant/10 p-5 md:p-6 shadow-sm flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>

      <h4 className="text-lg md:text-xl font-black font-headline text-on-surface">{value}</h4>

      {trend !== undefined && (
        <div className={`text-xs font-semibold flex items-center gap-1 ${trendColor}`}>
          <span>{trendDirection === 'up' ? '↗' : trendDirection === 'down' ? '↘' : ''} {Math.abs(trend).toFixed(1)}%</span>
          <span className="text-slate-400 font-normal">vs last period</span>
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-outline-variant/10 p-5 md:p-6 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 w-16 bg-slate-200 rounded" />
        <div className="w-5 h-5 bg-slate-200 rounded" />
      </div>
      <div className="h-7 w-24 bg-slate-200 rounded mb-2" />
      <div className="h-4 w-28 bg-slate-100 rounded" />
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
      <div className="grid gap-4 md:gap-5 grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl md:rounded-3xl border border-error/20 p-5">
        <p className="text-center text-error font-medium">Lỗi: {error.message}</p>
      </div>
    );
  }

  if (!data) return null;

  const metrics: Array<{
    label: string;
    value: string;
    icon: React.ElementType;
    metric: MetricWithTrend;
    iconColor: string;
  }> = [
    {
      label: 'Doanh thu',
      value: formatCurrency(data.revenue.value),
      icon: DollarSign,
      metric: data.revenue,
      iconColor: 'text-emerald-500',
    },
    {
      label: 'Ad Spend',
      value: formatCurrency(data.adSpend.value),
      icon: CreditCard,
      metric: data.adSpend,
      iconColor: 'text-blue-500',
    },
    {
      label: 'Signups',
      value: data.signups.value.toLocaleString(),
      icon: Users,
      metric: data.signups,
      iconColor: 'text-violet-500',
    },
    {
      label: 'ROAS',
      value: `${data.roas.value.toFixed(2)}x`,
      icon: TrendingUp,
      metric: data.roas,
      iconColor: data.roas.value >= 1 ? 'text-emerald-500' : 'text-red-500',
    },
  ];

  return (
    <div className="grid gap-4 md:gap-5 grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => (
        <MetricCard
          key={m.label}
          label={m.label}
          value={m.value}
          icon={m.icon}
          trend={compareEnabled ? m.metric.trend : undefined}
          trendDirection={compareEnabled ? m.metric.trendDirection : undefined}
          iconColor={m.iconColor}
        />
      ))}
    </div>
  );
});
