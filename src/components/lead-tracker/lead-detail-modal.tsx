import type { Lead } from '../../types';

const STATUS_BADGE: Record<string, string> = {
  'Mới': 'bg-purple-50 text-purple-600 border-purple-100',
  'Qualified': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'Unqualified': 'bg-rose-50 text-rose-600 border-rose-100',
  'Đang liên hệ': 'bg-blue-50 text-blue-600 border-blue-100',
  'Đang nuôi dưỡng': 'bg-amber-50 text-amber-600 border-amber-100',
};

interface Props {
  lead: Lead | null;
  onClose: () => void;
}

export default function LeadDetailModal({ lead, onClose }: Props) {
  if (!lead) return null;

  const row = (label: string, value: string | null | undefined) => (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-700">{value || '—'}</p>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">{lead.customerName}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="mb-4">
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
              STATUS_BADGE[lead.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {lead.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {row('AE', lead.ae)}
          {row('Lead Type', lead.leadType)}
          {row('Received', lead.receivedDate.slice(0, 10))}
          {row('Resolved', lead.resolvedDate ? lead.resolvedDate.slice(0, 10) : null)}
          {lead.status === 'Unqualified' && row('UQ Reason', lead.unqualifiedType)}
        </div>

        {lead.notes && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Notes</p>
            <p className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 rounded-xl p-3">{lead.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
