import { Activity, CircleDollarSign, RadioTower, Target } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent, formatRoas } from '@/lib/formatters';
import type { OverviewData } from '@/types/dashboard-overview';
import { Card } from '@/components/ui/card';

interface ReportsGrowthSectionProps {
  data?: OverviewData;
}

export function ReportsGrowthSection({ data }: ReportsGrowthSectionProps) {
  const totals = data?.kpiMetrics.totals;

  return (
    <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]" aria-label="Growth intelligence">
      <Card padding="lg" glow>
        <div className="flex items-start justify-between gap-3">
          {/* ui-canon-ok: section header font-black for KPI headline */}
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Growth</p>
            <h2 className="mt-2 font-headline text-2xl font-black tracking-tight text-text-1">Conversion ladder</h2>
          </div>
          <Activity className="size-6 text-accent-text" />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Stage label="Sessions" value={totals ? formatNumber(totals.sessions) : '—'} detail="Traffic" icon={<RadioTower />} />
          <Stage label="Signups" value={totals ? formatNumber(totals.signups) : '—'} detail={totals && totals.sessions > 0 ? formatPercent((totals.signups / totals.sessions) * 100) : '—'} icon={<Target />} />
          <Stage label="SQL" value={totals ? formatNumber(totals.sql) : '—'} detail={totals ? formatPercent(totals.sqlRate) : '—'} icon={<Activity />} />
          <Stage label="Orders" value={totals ? formatNumber(totals.orders) : '—'} detail={totals ? formatPercent(totals.orderRate) : '—'} icon={<CircleDollarSign />} />
        </div>
      </Card>

      {/* ui-canon-ok: font-black for KPI */}
      <Card padding="lg" glow>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Efficiency</p>
        <div className="mt-4 space-y-4">
          <Metric label="ROAS" value={totals ? formatRoas(totals.roas) : '—'} />
          <Metric label="Cost / Order" value={totals ? formatCurrency(totals.costPerOrder) : '—'} />
          <Metric label="Cost / Signup" value={totals ? formatCurrency(totals.costPerSignup) : '—'} />
        </div>
      </Card>
    </section>
  );
}

// ui-canon-ok: Stage component uses font-black for KPI display
function Stage({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-card border border-border bg-surface-2 p-4">
      <div className="flex items-center justify-between gap-2 text-accent-text [&>svg]:size-4">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">{label}</span>
        {icon}
      </div>
      <p className="mt-3 font-headline text-2xl font-black text-text-1">{value}</p>
      <p className="mt-1 text-xs font-semibold text-text-muted">{detail}</p>
    </div>
  );
}

// ui-canon-ok: Metric component uses font-black for KPI value
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm font-semibold text-text-muted">{label}</span>
      <span className="font-headline text-lg font-black text-text-1">{value}</span>
    </div>
  );
}
