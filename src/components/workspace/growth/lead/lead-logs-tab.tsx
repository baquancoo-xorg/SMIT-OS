import { useState } from 'react';
import { addDays, differenceInCalendarDays, parseISO } from 'date-fns';
import { Search, Check, X } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Lead } from '@/types';
import BulkActionBar, { type BulkEditFields } from './bulk-action-bar';
import LeadDetailModal from './lead-detail-modal';
import LeadLogDialog from './lead-log-dialog';
import { TableRowActions } from '@/components/ui/table-row-actions';
import { TableShell } from '@/components/ui/table-shell';
import { getTableContract } from '@/components/ui/table-contract';
import { formatTableDateTime } from '@/components/ui/table-date-format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { GlassCard } from '@/components/ui/glass-card';
import type { BadgeVariant } from '@/components/ui/badge';

export interface LeadFilters {
  ae: string;
  status: string;
  hasNote: string;
  noteDate: string;
  dateFrom: string;
  dateTo: string;
  q: string;
}

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  'Mới': 'primary',
  'Qualified': 'success',
  'Unqualified': 'error',
  'Đang liên hệ': 'info',
  'Đang nuôi dưỡng': 'warning',
};

const STATUS_LABEL: Record<string, string> = {
  'Mới': 'NEW',
  'Đang liên hệ': 'ATT',
  'Đang nuôi dưỡng': 'NUR',
  'Qualified': 'QLD',
  'Unqualified': 'UQLD',
};

const toStatusLabel = (status: string) => STATUS_LABEL[status] ?? status;

const isClosedLead = (status: string) => status === 'Qualified' || status === 'Unqualified';

/**
 * SLA badge — derived UI-only, không persist xuống DB.
 * Source: lead.status, lead.receivedDate.
 * Logic:
 *   - Closed: status ∈ {Qualified, Unqualified}
 *   - else: deadline = receivedDate + 7 days
 *     - daysLeft >= 0 → On-time (D-N)
 *     - daysLeft < 0  → Overdue (+N)
 */
function getLeadSla(lead: Lead, now: Date): { label: string; variant: BadgeVariant } {
  if (isClosedLead(lead.status)) {
    return { label: 'Closed', variant: 'neutral' };
  }

  const receivedDate = parseISO(String(lead.receivedDate).slice(0, 10));
  const deadline = addDays(receivedDate, 7);
  const daysLeft = differenceInCalendarDays(deadline, now);

  if (daysLeft >= 0) {
    return { label: `On-time (D-${daysLeft})`, variant: 'success' };
  }

  const overdueDays = Math.abs(daysLeft);
  return { label: `Overdue (+${overdueDays})`, variant: 'error' };
}

const COLS = [
  { label: 'Customer', key: 'customerName' },
  { label: 'AE', key: 'ae' },
  { label: 'Received', key: 'receivedDate' },
  { label: 'Resolved', key: 'resolvedDate' },
  { label: 'Status', key: 'status' },
  { label: 'SLA', key: 'sla' },
  { label: 'Lead Type', key: 'leadType' },
  { label: 'UQ Reason', key: 'unqualifiedType' },
  { label: 'Notes', key: 'notes' },
  { label: 'Modified', key: 'updatedAt' },
  { label: 'Actions', key: 'actions' },
];

interface LeadLogsTabProps {
  filters: LeadFilters;
}

export default function LeadLogsTab({ filters }: LeadLogsTabProps) {
  const { currentUser } = useAuth();
  const isSale = currentUser?.departments?.includes('Sale');
  const isLeadAdmin = currentUser?.isAdmin || currentUser?.role === 'Admin';

  const queryClient = useQueryClient();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkEdit, setBulkEdit] = useState<BulkEditFields>({ notes: '', leadType: '', unqualifiedType: '' });
  const [bulkSaving, setBulkSaving] = useState(false);

  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null);
  const [dialogLead, setDialogLead] = useState<Lead | null>(null);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const standardTable = getTableContract('standard');

  const leadsQueryParams: Record<string, string> = {};
  if (filters.ae) leadsQueryParams.ae = filters.ae;
  if (filters.status) leadsQueryParams.status = filters.status;
  if (filters.dateFrom) leadsQueryParams.dateFrom = filters.dateFrom;
  if (filters.dateTo) leadsQueryParams.dateTo = filters.dateTo;
  if (filters.hasNote) leadsQueryParams.hasNote = filters.hasNote;
  if (filters.noteDate) leadsQueryParams.noteDate = filters.noteDate;

  const leadsQuery = useQuery<Lead[]>({
    queryKey: ['leads', leadsQueryParams],
    queryFn: () => api.getLeads(Object.keys(leadsQueryParams).length ? leadsQueryParams : undefined),
    staleTime: 30_000,
  });
  const leads = leadsQuery.data ?? [];
  const loading = leadsQuery.isLoading;

  const fetchLeads = () => void queryClient.invalidateQueries({ queryKey: ['leads'] });

  // AE options for dialog (LeadLogDialog needs full list). Cached query — parent also reads from same key.
  const aeQuery = useQuery<{ id: string; fullName: string }[]>({
    queryKey: ['lead-ae-list'],
    queryFn: () => api.getLeadAeList(),
    staleTime: 5 * 60_000,
  });
  const aeOptions = aeQuery.data ?? [];

  const allSelected = leads.length > 0 && selectedIds.size === leads.length;
  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(leads.map((l) => l.id)));
  };
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const clearSelection = () => {
    setSelectedIds(new Set());
    setBulkEditMode(false);
    setBulkEdit({ notes: '', leadType: '', unqualifiedType: '' });
  };

  const handleDelete = async (lead: Lead) => {
    if (!isLeadAdmin) return;
    if (!confirm(`Xóa lead "${lead.customerName}"?`)) return;
    await api.deleteLead(lead.id);
    fetchLeads();
  };

  const handleApproveDelete = async (lead: Lead) => {
    if (!isLeadAdmin) return;
    if (!confirm(`Duyệt xóa lead "${lead.customerName}"?`)) return;
    await api.approveLeadDeleteRequest(lead.id);
    fetchLeads();
  };

  const handleRejectDelete = async (lead: Lead) => {
    if (!isLeadAdmin) return;
    await api.rejectLeadDeleteRequest(lead.id);
    fetchLeads();
  };

  const bulkDelete = async () => {
    if (!confirm(`Xóa ${selectedIds.size} lead đã chọn?`)) return;
    setBulkSaving(true);
    try {
      await Promise.all([...selectedIds].map((id) => api.deleteLead(id)));
      clearSelection();
      fetchLeads();
    } catch (err: any) {
      alert(`Lỗi khi xóa: ${err?.message ?? 'Unknown error'}`);
    } finally { setBulkSaving(false); }
  };

  const applyBulkEdit = async () => {
    const payload: Record<string, string> = {};
    const trimmedNotes = bulkEdit.notes.trim();
    if (trimmedNotes) payload.notes = trimmedNotes;
    if (bulkEdit.leadType) payload.leadType = bulkEdit.leadType;
    if (bulkEdit.unqualifiedType) payload.unqualifiedType = bulkEdit.unqualifiedType;
    if (!Object.keys(payload).length) return;

    setBulkSaving(true);
    try {
      await Promise.all([...selectedIds].map((id) => api.updateLead(id, payload)));
      clearSelection();
      fetchLeads();
    } catch (err: any) {
      alert(`Lỗi khi cập nhật: ${err?.message ?? 'Unknown error'}`);
    } finally { setBulkSaving(false); }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <GlassCard variant="surface" padding="sm" className="shrink-0">
        {/* Statbar — luôn horizontal, scroll khi narrow. Filter UI giờ ở page header (LeadTracker.tsx). */}
        {!loading && (() => {
          const now = new Date();
          const filteredLeads = leads.filter(l => {
            if (!filters.q) return true;
            const q = filters.q.toLowerCase();
            return (
              l.customerName.toLowerCase().includes(q) ||
              l.ae.toLowerCase().includes(q) ||
              (l.notes?.toLowerCase() || '').includes(q)
            );
          });
          const c = (s: string) => filteredLeads.filter((l) => l.status === s).length;
          const vn = filteredLeads.filter((l) => l.leadType === 'Vietnam').length;
          const intl = filteredLeads.filter((l) => l.leadType && l.leadType !== 'Vietnam' && l.leadType !== 'Unknown').length;
          const onTime = filteredLeads.filter((l) => {
            if (isClosedLead(l.status)) return false;
            const sla = getLeadSla(l, now);
            return sla.label.startsWith('On-time');
          }).length;
          const overdue = filteredLeads.filter((l) => {
            if (isClosedLead(l.status)) return false;
            const sla = getLeadSla(l, now);
            return sla.label.startsWith('Overdue');
          }).length;
          const statCls = 'flex items-center gap-3 px-4 py-2 bg-surface-2 border border-outline-variant/40 rounded-card shadow-sm text-[10px] font-black uppercase tracking-widest whitespace-nowrap';
          const dot = (color: string) => <span className={`size-2 rounded-full inline-block ${color}`} />;
          const stat = (color: string, label: string, val: number) => (
            <span className="flex items-center gap-1.5 text-on-surface-variant whitespace-nowrap">{dot(color)}{label}: {val}</span>
          );
          return (
            <div className="flex w-full items-center justify-between gap-2 overflow-x-auto pb-1">
              <div className={`${statCls} shrink-0`}>
                {stat('bg-on-surface-variant', 'Total Leads', filteredLeads.length)}
                {stat('bg-primary/80', 'New Leads', c('Mới'))}
                {stat('bg-info', 'Attending Leads', c('Đang liên hệ'))}
                {stat('bg-warning/80', 'Nurturing Leads', c('Đang nuôi dưỡng'))}
                {stat('bg-success', 'Qualified Leads', c('Qualified'))}
                {stat('bg-error/80', 'Unqualified Leads', c('Unqualified'))}
                {stat('bg-success/80', 'On-time Leads', onTime)}
                {stat('bg-error', 'Overdue Leads', overdue)}
              </div>
              <div className={`${statCls} shrink-0`}>
                {stat('bg-error/80', 'Vietnam', vn)}
                {stat('bg-info/80', 'International', intl)}
              </div>
            </div>
          );
        })()}
      </GlassCard>

      <div className="flex-1 min-h-0 bg-surface border border-outline-variant/30 rounded-card shadow-lg overflow-hidden">
        <TableShell variant="standard" className="h-full bg-transparent border-0 shadow-none rounded-none" scrollClassName="h-full overflow-y-auto overflow-x-auto custom-scrollbar" tableClassName="min-w-[1180px]">
          <thead className="sticky top-0 z-20 bg-surface-2">
            <tr className={`${standardTable.headerRow} bg-surface-2`}>
              {isSale && (
                <th className={`${standardTable.headerCell} w-10 pl-6`}>
                  <button
                    onClick={toggleSelectAll}
                    className={`size-4 rounded-[4px] border-2 flex items-center justify-center transition-all cursor-pointer ${
                      allSelected ? 'bg-surface-container border-accent' : 'border-outline hover:border-accent/60 bg-surface-2'
                    }`}
                  >
                    {allSelected && <Check size={10} strokeWidth={3} className="text-white" />}
                  </button>
                </th>
              )}
              {COLS.map((c) => (
                <th key={c.key} className={c.key === 'actions' ? standardTable.actionHeaderCell : standardTable.headerCell}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={standardTable.body}>
            {loading && (
              <tr>
                <td colSpan={isSale ? 14 : 13} className={standardTable.emptyState}>
                  <p className="font-bold uppercase tracking-widest animate-pulse text-on-surface-variant">Loading...</p>
                </td>
              </tr>
            )}

            {!loading && leads
              .filter(l => {
                if (!filters.q) return true;
                const q = filters.q.toLowerCase();
                return (
                  l.customerName.toLowerCase().includes(q) ||
                  l.ae.toLowerCase().includes(q) ||
                  (l.notes?.toLowerCase() || '').includes(q)
                );
              })
              .map((lead) => {
              const isSelected = selectedIds.has(lead.id);
              const hasPendingDelete = !!lead.deleteRequestedBy;
              const sla = getLeadSla(lead, new Date());
              return (
                <tr
                  key={lead.id}
                  className={`${standardTable.row}
                    ${isSelected ? standardTable.rowSelected : ''}
                    ${hasPendingDelete && isLeadAdmin ? 'border-l-2 border-error/80' : ''}`}
                >
                  {isSale && (
                    <td className={`${standardTable.cell} pl-6`}>
                      <button onClick={() => toggleSelect(lead.id)} className={`size-4 rounded-[4px] border-2 flex items-center justify-center transition-all cursor-pointer ${isSelected ? 'bg-primary border-primary' : 'border-outline hover:border-primary/60 bg-surface-2'}`}>
                        {isSelected && <Check size={10} strokeWidth={3} className="text-white" />}
                      </button>
                    </td>
                  )}
                  <td className={`${standardTable.cell} font-semibold leading-5 text-on-surface`}>
                    <span>{lead.customerName}</span>
                  </td>
                  <td className={`${standardTable.cell} font-semibold text-on-surface-variant`}>{lead.ae}</td>
                  <td className={`${standardTable.cell} font-medium text-on-surface-variant whitespace-nowrap`}>{formatTableDateTime(lead.receivedDate)}</td>
                  <td className={`${standardTable.cell} font-medium text-on-surface-variant whitespace-nowrap`}>{formatTableDateTime(lead.resolvedDate)}</td>
                  <td className={standardTable.cell}>
                    <Badge variant={STATUS_VARIANT[lead.status] ?? 'neutral'}>
                      {toStatusLabel(lead.status)}
                    </Badge>
                  </td>
                  <td className={standardTable.cell}>
                    <Badge variant={sla.variant}>{sla.label}</Badge>
                  </td>
                  <td className={`${standardTable.cell} font-medium text-on-surface-variant`}>{lead.leadType ?? '-'}</td>
                  <td className={`${standardTable.cell} font-medium text-on-surface-variant`}>{lead.unqualifiedType ?? '-'}</td>
                  <td className={`${standardTable.cell} italic max-w-[150px]`}>
                    <span className="text-on-surface-variant truncate block">{lead.notes || '—'}</span>
                  </td>
                  <td className={`${standardTable.cell} text-on-surface-variant font-medium whitespace-nowrap`}>
                    {formatTableDateTime(lead.updatedAt)}
                  </td>
                  <td className={standardTable.actionCell}>
                    <div className="flex gap-0.5 items-center justify-end">
                      <TableRowActions
                        onView={() => setDetailLead(lead)}
                        onEdit={() => { setDialogMode('edit'); setDialogLead(lead); }}
                        onDelete={isLeadAdmin ? () => handleDelete(lead) : undefined}
                        size={14}
                        variant="standard"
                        className="!opacity-100"
                      />

                      {hasPendingDelete && isLeadAdmin && (
                        <div className="flex items-center gap-1 rounded-card border border-error-container bg-error-container/40 p-1">
                          <span className="max-w-[120px] truncate px-2 text-[length:var(--text-caption)] font-semibold text-on-error-container" title={lead.deleteReason || ''}>
                            Lý do: {lead.deleteReason || 'N/A'}
                          </span>
                          <Button variant="ghost" size="sm" iconLeft={<Check />} onClick={() => handleApproveDelete(lead)} title="Duyệt xóa" aria-label="Duyệt xóa" className="text-success" />
                          <Button variant="ghost" size="sm" iconLeft={<X />} onClick={() => handleRejectDelete(lead)} title="Từ chối" aria-label="Từ chối" className="text-error" />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {!loading && leads.length === 0 && (
              <tr>
                <td colSpan={isSale ? 14 : 13} className="p-0">
                  <EmptyState
                    icon={<Search />}
                    title="No leads found"
                    description="Adjust filters hoặc CRM sync để load leads."
                    variant="inline"
                  />
                </td>
              </tr>
            )}
          </tbody>
        </TableShell>
      </div>

      <AnimatePresence>
        {selectedIds.size > 0 && (
          <BulkActionBar
            count={selectedIds.size}
            editMode={bulkEditMode}
            bulkEdit={bulkEdit}
            saving={bulkSaving}
            onToggleEdit={() => setBulkEditMode((v) => !v)}
            onFieldChange={(k, v) => setBulkEdit((b) => ({ ...b, [k]: v }))}
            onApply={applyBulkEdit}
            onDelete={isLeadAdmin ? bulkDelete : undefined}
            onClear={clearSelection}
          />
        )}
      </AnimatePresence>

      {dialogMode && (
        <LeadLogDialog
          mode={dialogMode}
          lead={dialogLead ?? undefined}
          aeOptions={aeOptions}
          onClose={() => { setDialogMode(null); setDialogLead(null); }}
          onSaved={fetchLeads}
        />
      )}

      <LeadDetailModal lead={detailLead} onClose={() => setDetailLead(null)} />
    </div>
  );
}
