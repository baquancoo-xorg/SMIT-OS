import { Database } from 'lucide-react';

interface SourceBadgeProps {
  synced?: boolean;
}

export default function SourceBadge({ synced }: SourceBadgeProps) {
  if (synced) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-blue-50 text-blue-600 border-blue-100">
        <Database size={10} /> CRM
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-slate-100 text-slate-600 border-slate-200">
      Manual
    </span>
  );
}
