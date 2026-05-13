import { BarChart3, DollarSign, Megaphone, TrendingUp, Users } from 'lucide-react';
import { formatCurrency, formatNumber, formatRoas } from '../../../lib/formatters';
import type { OverviewData } from '../../../types/dashboard-overview';
import { Card, KpiCard, Skeleton } from '../ui';

interface ReportsOverviewSectionProps {
  data?: OverviewData;
  isLoading: boolean;
  error?: Error | null;
}

function trendFrom(direction: 'up' | 'down' | 'neutral') {
  if (direction === 'up') return 'up';
  if (direction === 'down') return 'down';
  return 'flat';
}

export function ReportsOverviewSection({ data, isLoading, error }: ReportsOverviewSectionProps) {
  if (isLoading) {
    return (
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Business overview loading">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-36" />
        ))}
      </section>
    );
  }

  if (error || !data) {
    return (
      <Card padding="lg">
        <p className="text-sm font-semibold text-error">Không tải được dữ liệu intelligence.</p>
      </Card>
    );
  }

  const { summary, kpiMetrics } = data;
  const totals = kpiMetrics.totals;

  return (
    <section className="space-y-4" aria-label="Business overview">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Revenue"
          value={formatCurrency(summary.revenue.value)}
          icon={<DollarSign />}
          deltaPercent={summary.revenue.trend}
          trend={trendFrom(summary.revenue.trendDirection)}
          deltaLabel="vs previous"
          accent="success"
        />
        <KpiCard
          label="Ad Spend"
          value={formatCurrency(summary.adSpend.value)}
          icon={<Megaphone />}
          deltaPercent={summary.adSpend.trend}
          trend={trendFrom(summary.adSpend.trendDirection)}
          deltaLabel="vs previous"
          accent="warning"
        />
        <KpiCard
          label="Signups"
          value={formatNumber(summary.signups.value)}
          icon={<Users />}
          deltaPercent={summary.signups.trend}
          trend={trendFrom(summary.signups.trendDirection)}
          deltaLabel="vs previous"
          accent="info"
        />
        <KpiCard
          label="ROAS"
          value={formatRoas(summary.roas.value)}
          icon={<TrendingUp />}
          deltaPercent={summary.roas.trend}
          trend={trendFrom(summary.roas.trendDirection)}
          deltaLabel="vs previous"
          accent="primary"
        />
      </div>

      <Card padding="lg" glow>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Cross-workspace totals</p>
            <h2 className="mt-2 font-headline text-2xl font-black tracking-tight text-text-1">Business pulse</h2>
          </div>
          <BarChart3 className="size-6 text-accent-text" />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Orders" value={formatNumber(totals.orders)} />
          <Metric label="Trials" value={formatNumber(totals.trials)} />
          <Metric label="Opportunities" value={formatNumber(totals.opportunities)} />
          <Metric label="Sessions" value={formatNumber(totals.sessions)} />
        </div>
      </Card>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-border bg-surface-2 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">{label}</p>
      <p className="mt-2 font-headline text-2xl font-black text-text-1">{value}</p>
    </div>
  );
}
