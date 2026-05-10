import { useAcquisitionJourneyQuery } from '../../../hooks/use-acquisition-journey';
import JourneyFunnel from './journey-funnel';

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
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }
  if (journeyQuery.error || !j) {
    return (
      <div className="bg-error/5 border border-error/20 rounded-3xl p-6 text-error font-bold">
        Failed to load acquisition journey: {(journeyQuery.error as Error)?.message ?? 'unknown'}
      </div>
    );
  }

  return (
    <div className="space-y-[var(--space-lg)]">
      {/* KPI strip — grouped 3+3+2 by stage */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
          <KpiBand label="Reach" value={fmtNumber(j.totals.reach)} stage="pre" />
          <KpiBand label="Clicks" value={fmtNumber(j.totals.clicks)} stage="pre" />
          <KpiBand label="Visits" value={fmtNumber(j.totals.visits)} stage="in" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
          <KpiBand label="Leads" value={fmtNumber(j.totals.leads)} stage="in" />
          <KpiBand label="Trials" value={fmtNumber(j.totals.trials)} stage="in" />
          <KpiBand label="Active" value={fmtNumber(j.totals.activeUsers)} stage="post" />
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-2 gap-4">
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
      <div className="bg-primary text-white p-4 xl:p-6 rounded-3xl shadow-xl shadow-primary/20 flex flex-col gap-2 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-20 h-20 xl:w-32 xl:h-32 bg-white/10 rounded-full -mr-10 -mt-10 xl:-mr-16 xl:-mt-16 group-hover:scale-150 transition-transform duration-700" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 relative z-10">{label}</p>
        <h4 className="text-2xl xl:text-4xl font-black font-headline relative z-10">{value}</h4>
      </div>
    );
  }

  return (
    <div className={`backdrop-blur-md border p-4 xl:p-6 rounded-3xl shadow-sm flex flex-col gap-2 relative overflow-hidden ${stageStyle}`}>
      <div className="flex items-center gap-2 relative z-10">
        <div className={`w-1.5 h-1.5 rounded-full ${stageDot}`} />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
      </div>
      <h4 className="text-2xl xl:text-4xl font-black font-headline relative z-10">{value}</h4>
    </div>
  );
}
