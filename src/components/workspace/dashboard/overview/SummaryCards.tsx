import React, { memo } from 'react';
import { DollarSign, CreditCard, Users, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { SummaryMetrics, MetricWithTrend } from '@/types/dashboard-overview';
import { GlassCard } from '@/components/ui/glass-card';
import { KpiCard } from '@/components/ui/kpi-card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Dashboard Overview summary cards (Revenue / Ad Spend / Signups / ROAS).
 *
 * Phase 8 follow-up batch 14 (2026-05-11): migrated to v2 KpiCard (Bento
 * decorative + trend delta percent). Removed inline MetricCard + SkeletonCard
 * helpers (replaced bằng v2 KpiCard + Skeleton).
 *
 * KpiCard trend inference: deltaPercent positive → up arrow, negative → down,
 * zero → flat. Maps natural to MetricWithTrend.trendDirection.
 */

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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rect" className="h-32 rounded-card" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <GlassCard variant="surface" padding="md">
        <p className="text-center font-semibold text-error">Lỗi: {error.message}</p>
      </GlassCard>
    );
  }

  if (!data) return null;

  const metrics: Array<{
    label: string;
    value: string;
    icon: React.ReactNode;
    metric: MetricWithTrend;
  }> = [
    { label: 'Revenue', value: formatCurrency(data.revenue.value), icon: <DollarSign />, metric: data.revenue },
    { label: 'Ad Spend', value: formatCurrency(data.adSpend.value), icon: <CreditCard />, metric: data.adSpend },
    { label: 'Signups', value: data.signups.value.toLocaleString(), icon: <Users />, metric: data.signups },
    { label: 'ROAS', value: `${data.roas.value.toFixed(2)}x`, icon: <TrendingUp />, metric: data.roas },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {metrics.map((m) => (
        <KpiCard
          key={m.label}
          label={m.label}
          value={m.value}
          icon={m.icon}
          accent="primary"
          decorative
          deltaPercent={compareEnabled ? m.metric.trend : undefined}
          deltaLabel={compareEnabled ? 'vs last period' : undefined}
          trend={
            compareEnabled
              ? m.metric.trendDirection === 'up'
                ? 'up'
                : m.metric.trendDirection === 'down'
                  ? 'down'
                  : 'flat'
              : undefined
          }
        />
      ))}
    </div>
  );
});
