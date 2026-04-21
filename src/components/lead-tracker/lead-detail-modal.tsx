import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { api } from '../../lib/api';
import type { Lead, LeadAuditLog } from '../../types';

const STATUS_BADGE: Record<string, string> = {
  'Mới': 'bg-purple-50 text-purple-600 border-purple-100',
  'Qualified': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'Unqualified': 'bg-rose-50 text-rose-600 border-rose-100',
  'Đang liên hệ': 'bg-blue-50 text-blue-600 border-blue-100',
  'Đang nuôi dưỡng': 'bg-amber-50 text-amber-600 border-amber-100',
};

const FIELD_LABEL: Record<string, string> = {
  status: 'Trạng thái',
  ae: 'AE',
  leadType: 'Loại Lead',
  unqualifiedType: 'Lý do UQ',
  notes: 'Ghi chú',
  resolvedDate: 'Ngày xử lý',
  receivedDate: 'Ngày nhận',
};

function fmtDiffVal(val: string | null): string {
  if (!val) return '—';
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const [y, m, d] = val.split('-');
    return `${d}/${m}/${y}`;
  }
  return val;
}

interface Props {
  lead: Lead | null;
  onClose: () => void;
}

export default function LeadDetailModal({ lead, onClose }: Props) {
  const [auditLogs, setAuditLogs] = useState<LeadAuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    if (!lead) return;
    setAuditLoading(true);
    api.getLeadAuditLogs(lead.id)
      .then(setAuditLogs)
      .catch(() => setAuditLogs([]))
      .finally(() => setAuditLoading(false));
  }, [lead?.id]);

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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <h2 className="text-lg font-bold text-slate-800">{lead.customerName}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 pb-6">
          <div className="mb-4">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
              STATUS_BADGE[lead.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
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
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Notes</p>
              <p className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 rounded-xl p-3">{lead.notes}</p>
            </div>
          )}

          {/* Change History Timeline */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Lịch sử thay đổi</p>
            {auditLoading ? (
              <p className="text-xs text-slate-400 animate-pulse">Loading...</p>
            ) : auditLogs.length === 0 ? (
              <p className="text-xs text-slate-400">Chưa có lịch sử thay đổi</p>
            ) : (
              <div className="flex flex-col gap-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="relative pl-4 border-l-2 border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      {format(new Date(log.createdAt), 'dd/MM/yyyy - HH:mm')}
                    </p>
                    {Object.entries(log.changes).map(([field, diff]) => { const { from, to } = diff as { from: string | null; to: string | null }; return (
                      <p key={field} className="text-xs text-slate-600 mb-0.5">
                        <span className="font-bold">{FIELD_LABEL[field] ?? field}:</span>{' '}
                        <span className="text-slate-400">{fmtDiffVal(from)}</span>
                        {' → '}
                        <span className="font-semibold">{fmtDiffVal(to)}</span>
                      </p>
                    ); })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
