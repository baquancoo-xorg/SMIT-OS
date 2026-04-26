import { formatDistanceToNow } from 'date-fns';

type LeadSyncStatus = {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  status: string;
};

interface LastSyncIndicatorProps {
  status: LeadSyncStatus | null | undefined;
}

export default function LastSyncIndicator({ status }: LastSyncIndicatorProps) {
  if (!status) {
    return <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">No sync yet</span>;
  }

  const when = status.finishedAt ?? status.startedAt;
  const distance = formatDistanceToNow(new Date(when), { addSuffix: true });

  const cls =
    status.status === 'failed'
      ? 'text-rose-600'
      : status.status === 'running'
        ? 'text-amber-600'
        : 'text-emerald-600';

  return (
    <span className={`text-[10px] font-black uppercase tracking-widest ${cls}`}>
      Last sync: {distance}
    </span>
  );
}
