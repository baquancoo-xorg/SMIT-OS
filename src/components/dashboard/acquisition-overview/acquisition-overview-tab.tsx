import { AlertCircle } from 'lucide-react';
import { useAcquisitionJourneyQuery } from '../../../hooks/use-acquisition-journey';
import JourneyFunnel from './journey-funnel';
import { Spinner, EmptyState } from '../../ui';

/**
 * Acquisition Overview tab — KPI strip (reach/clicks/visits/leads/trials/active/paid/revenue)
 * + horizontal journey funnel.
 *
 * Phase 8 follow-up batch 15 (2026-05-11): Spinner v2 + EmptyState v2 + token
 * modernization. KpiBand keeps stage-specific brand tints (3 stages: Pre/In/Post)
 * vì v2 KpiCard chỉ có 5 semantic accents (primary/success/warning/error/info).
 */

interface Props {
  from: string;
  to: string;
}

function fmtNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString('en-US');
}

function fmtMoney(n: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n) + ' VND';
}

export default function AcquisitionOverviewTab({ from, to }: Props) {
  const journeyQuery = useAcquisitionJourneyQuery({ from, to });
  const j = journeyQuery.data;

  if (journeyQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }
  if (journeyQuery.error || !j) {
    return (
      <EmptyState
        icon={<AlertCircle />}
        title="Failed to load acquisition journey"
        description={(journeyQuery.error as Error)?.message ?? 'unknown'}
        variant="card"
      />
    );
  }

  return (
    <div className="space-y-[var(--space-lg)]">
      {/* KPI strip — condensed: 4 cols × 2 rows */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <KpiBand label="Reach" value={fmtNumber(j.totals.reach)} stage="pre" />
        <KpiBand label="Clicks" value={fmtNumber(j.totals.clicks)} stage="pre" />
        <KpiBand label="Visits" value={fmtNumber(j.totals.visits)} stage="in" />
        <KpiBand label="Leads" value={fmtNumber(j.totals.leads)} stage="in" />
        <KpiBand label="Trials" value={fmtNumber(j.totals.trials)} stage="in" />
        <KpiBand label="Active" value={fmtNumber(j.totals.activeUsers)} stage="post" />
        <KpiBand label="Paid Customers" value={fmtNumber(j.totals.paidCustomers)} stage="post" />
        <KpiBand label="Revenue" value={fmtMoney(j.totals.revenue)} stage="post" highlight />
      </div>

      {/* Funnel viz */}
      <JourneyFunnel journey={j} />
    </div>
  );
}

function KpiBand({
  label,
  value,
  stage,
  highlight,
}: {
  label: string;
  value: string;
  stage: 'pre' | 'in' | 'post';
  highlight?: boolean;
}) {
  const stageStyle = {
    pre: 'border-[#0866FF]/15 bg-[#0866FF]/5',
    in: 'border-warning/15 bg-warning/5',
    post: 'border-tertiary/15 bg-tertiary/5',
  }[stage];
  const stageDot = {
    pre: 'bg-[#0866FF]',
    in: 'bg-warning-container/300',
    post: 'bg-tertiary',
  }[stage];

  if (highlight) {
    return (
      <div className="group relative overflow-hidden rounded-card bg-primary p-3 text-on-primary shadow-md shadow-primary/20">
        <div aria-hidden="true" className="pointer-events-none absolute -top-8 -right-8 size-16 rounded-full bg-white/10 transition-transform duration-700 group-hover:scale-150" />
        <p className="relative text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] opacity-80">{label}</p>
        <h4 className="relative mt-1 font-headline text-[length:var(--text-h5)] font-bold">{value}</h4>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-card border p-3 shadow-sm backdrop-blur-md ${stageStyle}`}>
      <div className="relative flex items-center gap-2">
        <div className={`size-1.5 rounded-chip ${stageDot}`} aria-hidden="true" />
        <p className="text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">{label}</p>
      </div>
      <h4 className="relative mt-1 font-headline text-[length:var(--text-h5)] font-bold text-on-surface">{value}</h4>
    </div>
  );
}
