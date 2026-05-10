import { AlertCircle } from 'lucide-react';
import { useAcquisitionJourneyQuery } from '../../../hooks/use-acquisition-journey';
import JourneyFunnel from './journey-funnel';
import { Spinner, EmptyState } from '../../ui/v2';

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
      {/* KPI strip — grouped 3+3+2 by stage */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <KpiBand label="Reach" value={fmtNumber(j.totals.reach)} stage="pre" />
          <KpiBand label="Clicks" value={fmtNumber(j.totals.clicks)} stage="pre" />
          <KpiBand label="Visits" value={fmtNumber(j.totals.visits)} stage="in" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <KpiBand label="Leads" value={fmtNumber(j.totals.leads)} stage="in" />
          <KpiBand label="Trials" value={fmtNumber(j.totals.trials)} stage="in" />
          <KpiBand label="Active" value={fmtNumber(j.totals.activeUsers)} stage="post" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <KpiBand label="Paid Customers" value={fmtNumber(j.totals.paidCustomers)} stage="post" />
          <KpiBand label="Revenue" value={fmtMoney(j.totals.revenue)} stage="post" highlight />
        </div>
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
    in: 'border-amber-500/15 bg-amber-500/5',
    post: 'border-tertiary/15 bg-tertiary/5',
  }[stage];
  const stageDot = {
    pre: 'bg-[#0866FF]',
    in: 'bg-amber-500',
    post: 'bg-tertiary',
  }[stage];

  if (highlight) {
    return (
      <div className="group relative overflow-hidden rounded-card bg-primary p-4 text-on-primary shadow-xl shadow-primary/20 xl:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute -top-10 -right-10 size-20 rounded-full bg-white/10 transition-transform duration-700 group-hover:scale-150 xl:-top-16 xl:-right-16 xl:size-32" />
        <p className="relative text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] opacity-80">{label}</p>
        <h4 className="relative mt-2 font-headline text-[length:var(--text-h4)] font-bold xl:text-[length:var(--text-h3)]">{value}</h4>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-card border p-4 shadow-sm backdrop-blur-md xl:p-6 ${stageStyle}`}>
      <div className="relative flex items-center gap-2">
        <div className={`size-1.5 rounded-chip ${stageDot}`} aria-hidden="true" />
        <p className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">{label}</p>
      </div>
      <h4 className="relative mt-2 font-headline text-[length:var(--text-h4)] font-bold text-on-surface xl:text-[length:var(--text-h3)]">{value}</h4>
    </div>
  );
}
