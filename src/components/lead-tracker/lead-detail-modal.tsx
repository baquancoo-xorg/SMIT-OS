import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { User } from 'lucide-react';
import { api } from '../../lib/api';
import type { Lead, LeadAuditLog } from '../../types';
import { Modal, Badge } from '../ui/v2';

/**
 * Lead detail modal — read-only view với audit trail timeline.
 *
 * Phase 8 follow-up batch 2 (2026-05-10): migrated to v2 Modal primitive
 * (in-place, API identical: `<LeadDetailModal lead={...} onClose={...} />`).
 *
 * Status badges use lead-specific Vietnamese labels — kept inline because
 * they map to a fixed business taxonomy không phải v2 Badge semantic.
 */

const STATUS_VARIANT: Record<string, 'primary' | 'success' | 'error' | 'info' | 'warning' | 'neutral'> = {
  'Mới': 'primary',
  'Qualified': 'success',
  'Unqualified': 'error',
  'Đang liên hệ': 'info',
  'Đang nuôi dưỡng': 'warning',
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
    api
      .getLeadAuditLogs(lead.id)
      .then(setAuditLogs)
      .catch(() => setAuditLogs([]))
      .finally(() => setAuditLoading(false));
  }, [lead?.id]);

  const Row = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div>
      <p className="text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">
        {label}
      </p>
      <p className="text-[length:var(--text-body-sm)] font-semibold text-on-surface">{value || '—'}</p>
    </div>
  );

  return (
    <Modal
      open={!!lead}
      onClose={onClose}
      title={lead?.customerName ?? 'Lead detail'}
      icon={<User />}
      iconAccent="primary"
      size="lg"
    >
      {lead && (
        <div className="flex flex-col gap-5">
          <div>
            <Badge variant={STATUS_VARIANT[lead.status] ?? 'neutral'}>{lead.status}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Row label="AE" value={lead.ae} />
            <Row label="Lead Type" value={lead.leadType} />
            <Row label="Received" value={lead.receivedDate.slice(0, 10)} />
            <Row label="Resolved" value={lead.resolvedDate ? lead.resolvedDate.slice(0, 10) : null} />
            {lead.status === 'Unqualified' && <Row label="UQ Reason" value={lead.unqualifiedType} />}
          </div>

          {lead.notes && (
            <div>
              <p className="text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-wide)] text-on-surface-variant mb-1.5">
                Notes
              </p>
              <p className="whitespace-pre-wrap rounded-card bg-surface-container-low p-3 text-[length:var(--text-body-sm)] text-on-surface">
                {lead.notes}
              </p>
            </div>
          )}

          {/* Change History Timeline */}
          <div className="border-t border-outline-variant/40 pt-4">
            <p className="text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-wide)] text-on-surface-variant mb-3">
              Lịch sử thay đổi
            </p>
            {auditLoading ? (
              <p className="animate-pulse text-[length:var(--text-body-sm)] text-on-surface-variant">Loading...</p>
            ) : auditLogs.length === 0 ? (
              <p className="text-[length:var(--text-body-sm)] text-on-surface-variant">Chưa có lịch sử thay đổi</p>
            ) : (
              <div className="flex flex-col gap-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="relative border-l-2 border-outline-variant/40 pl-4">
                    <p className="text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-wide)] text-on-surface-variant mb-1">
                      {format(new Date(log.createdAt), 'dd/MM/yyyy - HH:mm')}
                    </p>
                    {Object.entries(log.changes).map(([field, diff]) => {
                      const { from, to } = diff as { from: string | null; to: string | null };
                      return (
                        <p key={field} className="text-[length:var(--text-body-sm)] text-on-surface mb-0.5">
                          <span className="font-semibold">{FIELD_LABEL[field] ?? field}:</span>{' '}
                          <span className="text-on-surface-variant">{fmtDiffVal(from)}</span>
                          {' → '}
                          <span className="font-semibold">{fmtDiffVal(to)}</span>
                        </p>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
