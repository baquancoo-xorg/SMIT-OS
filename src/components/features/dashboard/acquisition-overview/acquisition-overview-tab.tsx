import { Activity, AlertCircle, CreditCard, DollarSign, Eye, FlaskConical, Globe, MousePointer2, UserPlus, Users } from 'lucide-react';
import { useAcquisitionJourneyQuery } from '../../../../hooks/use-acquisition-journey';
import JourneyFunnel from './journey-funnel';
import { EmptyState, KpiCard, SectionCard, Skeleton } from '../../../ui';

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
      <SectionCard eyebrow="Acquisition" title="Journey Funnel">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} variant="rect" className="h-32 rounded-card" />
          ))}
        </div>
      </SectionCard>
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

  const kpis = [
    { label: 'Reach', value: fmtNumber(j.totals.reach), icon: <Globe /> },
    { label: 'Clicks', value: fmtNumber(j.totals.clicks), icon: <MousePointer2 /> },
    { label: 'Visits', value: fmtNumber(j.totals.visits), icon: <Eye /> },
    { label: 'Leads', value: fmtNumber(j.totals.leads), icon: <UserPlus /> },
    { label: 'Trials', value: fmtNumber(j.totals.trials), icon: <FlaskConical /> },
    { label: 'Active', value: fmtNumber(j.totals.activeUsers), icon: <Activity /> },
    { label: 'Paid Customers', value: fmtNumber(j.totals.paidCustomers), icon: <Users /> },
    { label: 'Revenue', value: fmtMoney(j.totals.revenue), icon: <DollarSign /> },
  ];

  return (
    <SectionCard eyebrow="Acquisition" title="Journey Funnel">
      <div className="space-y-[var(--space-lg)]">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} />
          ))}
        </div>
        <JourneyFunnel journey={j} />
      </div>
    </SectionCard>
  );
}
