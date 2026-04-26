import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';
import { Search, Check, Trash2, Edit2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Lead } from '../../types';
import CustomFilter from '../ui/CustomFilter';
import DatePicker from '../ui/date-picker';
import BulkActionBar, { type BulkEditFields } from './bulk-action-bar';
import LeadDetailModal from './lead-detail-modal';
import LeadLogDialog from './lead-log-dialog';
import SyncFromCrmButton from './sync-from-crm-button';
import LastSyncIndicator from './last-sync-indicator';
import SourceBadge from './source-badge';
import { useSyncNowMutation, useSyncStatusQuery } from '../../hooks/use-lead-sync';

const STATUSES = ['Mới', 'Đang liên hệ', 'Đang nuôi dưỡng', 'Qualified', 'Unqualified'];

const STATUS_BADGE: Record<string, string> = {
  'Mới': 'bg-purple-50 text-purple-600 border-purple-100',
  'Qualified': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'Unqualified': 'bg-rose-50 text-rose-600 border-rose-100',
  'Đang liên hệ': 'bg-blue-50 text-blue-600 border-blue-100',
  'Đang nuôi dưỡng': 'bg-amber-50 text-amber-600 border-amber-100',
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

function getLeadSla(lead: Lead, now: Date) {
  if (isClosedLead(lead.status)) {
    return { label: 'Closed', className: 'bg-slate-100 text-slate-600 border-slate-200' };
  }

  const receivedDate = parseISO(String(lead.receivedDate).slice(0, 10));
  const deadline = addDays(receivedDate, 7);
  const daysLeft = differenceInCalendarDays(deadline, now);

  if (daysLeft >= 0) {
    return {
      label: `On-time (D-${daysLeft})`,
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }

  const overdueDays = Math.abs(daysLeft);
  return {
    label: `Overdue (+${overdueDays})`,
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  };
}

const COLS = [
  { label: 'Customer', key: 'customerName' },
  { label: 'Source', key: 'source' },
  { label: 'AE', key: 'ae' },
  { label: 'Received', key: 'receivedDate' },
  { label: 'Resolved', key: 'resolvedDate' },
  { label: 'Status', key: 'status' },
  { label: 'SLA', key: 'sla' },
  { label: 'Lead Type', key: 'leadType' },
  { label: 'UQ Reason', key: 'unqualifiedType' },
  { label: 'Notes', key: 'notes' },
  { label: 'Modified', key: 'updatedAt' },
];

interface LeadLogsTabProps {
  extraControls?: ReactNode;
}

export default function LeadLogsTab({ extraControls }: LeadLogsTabProps) {
  const { currentUser } = useAuth();
  const isSale = currentUser?.departments?.includes('Sale');
  const isAdminOrLeaderSale = (
    currentUser?.isAdmin ||
    currentUser?.role === 'Admin' ||
    (currentUser?.role === 'Leader' && currentUser?.departments?.includes('Sale'))
  );

  const syncNow = useSyncNowMutation();
  const syncStatus = useSyncStatusQuery(!!currentUser?.isAdmin);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [aeOptions, setAeOptions] = useState<{ id: string; fullName: string }[]>([]);
  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const [filters, setFilters] = useState({
    ae: '',
    status: '',
    hasNote: '',
    noteDate: '',
    dateFrom: sevenDaysAgo.toISOString().slice(0, 10),
    dateTo: today,
    q: '',
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkEdit, setBulkEdit] = useState<BulkEditFields>({ notes: '', leadType: '', unqualifiedType: '' });
  const [bulkSaving, setBulkSaving] = useState(false);

  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null);
  const [dialogLead, setDialogLead] = useState<Lead | null>(null);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);

  const sf = (k: string, v: string) => setFilters((f) => ({ ...f, [k]: v }));

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const p: Record<string, string> = {};
      if (filters.ae) p.ae = filters.ae;
      if (filters.status) p.status = filters.status;
      if (filters.dateFrom) p.dateFrom = filters.dateFrom;
      if (filters.dateTo) p.dateTo = filters.dateTo;
      if (filters.hasNote) p.hasNote = filters.hasNote;
      if (filters.noteDate) p.noteDate = filters.noteDate;
      setLeads(await api.getLeads(Object.keys(p).length ? p : undefined));
    } finally { setLoading(false); }
  }, [filters.ae, filters.status, filters.dateFrom, filters.dateTo, filters.hasNote, filters.noteDate]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);
  useEffect(() => { api.getLeadAeList().then(setAeOptions); }, []);

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
    if (isAdminOrLeaderSale) {
      if (!confirm(`Xóa lead "${lead.customerName}"?`)) return;
      await api.deleteLead(lead.id);
    } else {
      const reason = prompt(`Lý do gửi yêu cầu xóa lead "${lead.customerName}"?`);
      if (reason === null) return;
      if (!reason.trim()) return alert('Vui lòng nhập lý do xóa');
      await api.requestLeadDelete(lead.id, reason);
    }
    fetchLeads();
  };

  const handleCancelDeleteRequest = async (lead: Lead) => {
    await api.cancelLeadDeleteRequest(lead.id);
    fetchLeads();
  };

  const handleApproveDelete = async (lead: Lead) => {
    if (!confirm(`Duyệt xóa lead "${lead.customerName}"?`)) return;
    await api.approveLeadDeleteRequest(lead.id);
    fetchLeads();
  };

  const handleRejectDelete = async (lead: Lead) => {
    await api.rejectLeadDeleteRequest(lead.id);
    fetchLeads();
  };

  const bulkDelete = async () => {
    if (!isAdminOrLeaderSale) {
      alert('Chỉ Admin hoặc Leader Sale mới có thể xóa hàng loạt');
      return;
    }
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
  const triggerSyncNow = async () => {
    try {
      await syncNow.mutateAsync();
      alert('Đã trigger sync từ CRM. Dữ liệu sẽ cập nhật trong ít phút.');
      await syncStatus.refetch();
      await fetchLeads();
    } catch (err: any) {
      alert(err?.message ?? 'Không thể trigger sync CRM');
    }
  };

  const cellCls = 'px-4 py-4 text-xs';

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="shrink-0 flex flex-wrap gap-3 items-center p-4 bg-white/50 backdrop-blur-md rounded-3xl shadow-sm">
        <div className="flex items-center gap-1.5">
          <DatePicker value={filters.dateFrom} onChange={(v) => sf('dateFrom', v)} placeholder="Từ ngày" />
          <span className="text-slate-300 text-xs">&#8212;</span>
          <DatePicker value={filters.dateTo} onChange={(v) => sf('dateTo', v)} placeholder="Đến ngày" />
        </div>
        <CustomFilter value={filters.ae} onChange={(v) => sf('ae', v)} options={[{ value: '', label: 'All AE' }, ...aeOptions.map((a) => ({ value: a.fullName, label: a.fullName }))]} buttonClassName="!h-9 !px-3 !text-[11px] !tracking-normal !normal-case" />
        <CustomFilter value={filters.status} onChange={(v) => sf('status', v)} options={[{ value: '', label: 'All Status' }, ...STATUSES.map((s) => ({ value: s, label: toStatusLabel(s) }))]} buttonClassName="!h-9 !px-3 !text-[11px] !tracking-normal !normal-case" />
        <CustomFilter
          value={filters.hasNote}
          onChange={(v) => sf('hasNote', v)}
          options={[
            { value: '', label: 'All Notes' },
            { value: 'yes', label: 'With note' },
            { value: 'no', label: 'Without note' },
          ]}
          buttonClassName="!h-9 !px-3 !text-[11px] !tracking-normal !normal-case"
        />
        <DatePicker value={filters.noteDate} onChange={(v) => sf('noteDate', v)} placeholder="Note changed" />
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads..."
            value={filters.q}
            onChange={(e) => sf('q', e.target.value)}
            className="h-9 pl-9 pr-4 bg-white border border-slate-200 rounded-full text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-48"
          />
        </div>
        <div className="ml-auto flex items-center gap-3">
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
            const vn = filteredLeads.filter((l) => l.leadType === 'Việt Nam').length;
            const intl = filteredLeads.filter((l) => l.leadType === 'Quốc Tế').length;
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
            const statCls = 'flex items-center gap-4 px-4 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm text-[10px] font-black uppercase tracking-widest';
            const dot = (color: string) => <span className={`size-2 rounded-full inline-block ${color}`} />;
            const stat = (color: string, label: string, val: number) => (
              <span className="flex items-center gap-1.5 text-slate-500">{dot(color)}{label}: {val}</span>
            );
            return (
              <div className="flex items-center gap-2">
                <div className={statCls}>
                  {stat('bg-slate-400', 'Total', filteredLeads.length)}
                  {stat('bg-violet-400', 'NEW', c('Mới'))}
                  {stat('bg-blue-400', 'ATT', c('Đang liên hệ'))}
                  {stat('bg-amber-400', 'NUR', c('Đang nuôi dưỡng'))}
                  {stat('bg-emerald-500', 'QLD', c('Qualified'))}
                  {stat('bg-rose-400', 'UQLD', c('Unqualified'))}
                  {stat('bg-emerald-400', 'OT', onTime)}
                  {stat('bg-red-500', 'OVD', overdue)}
                </div>
                <div className={statCls}>
                  {stat('bg-red-400', 'VN', vn)}
                  {stat('bg-sky-400', 'QT', intl)}
                </div>
              </div>
            );
          })()}
          {isSale && !!currentUser?.isAdmin && (
            <div className="flex items-center gap-2">
              <LastSyncIndicator status={syncStatus.data} />
              <SyncFromCrmButton
                canSync={true}
                isSyncing={syncNow.isPending}
                isRunning={syncStatus.data?.status === 'running'}
                onSync={triggerSyncNow}
              />
            </div>
          )}
          {extraControls && <div>{extraControls}</div>}
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl shadow-sm overflow-hidden">
        <div className="h-full overflow-y-auto overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1180px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-white border-b border-slate-100">
                {isSale && (
                  <th className="pl-6 py-5 w-10">
                    <button
                      onClick={toggleSelectAll}
                      className={`size-4 rounded-[4px] border-2 flex items-center justify-center transition-all cursor-pointer ${
                        allSelected ? 'bg-primary border-primary' : 'border-slate-300 hover:border-primary/60 bg-white'
                      }`}
                    >
                      {allSelected && <Check size={10} strokeWidth={3} className="text-white" />}
                    </button>
                  </th>
                )}
                {COLS.map((c) => (
                  <th key={c.key} className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    {c.label}
                  </th>
                ))}
                <th className="px-4 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && (
                <tr><td colSpan={isSale ? 14 : 13} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Loading...</td></tr>
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
                    className={`hover:bg-slate-50/80 transition-colors group
                      ${isSelected ? 'bg-primary/[0.04]' : ''}
                      ${hasPendingDelete && isAdminOrLeaderSale ? 'border-l-2 border-rose-400' : ''}
                    `}
                  >
                    {isSale && (
                      <td className="pl-6">
                        <button onClick={() => toggleSelect(lead.id)} className={`size-4 rounded-[4px] border-2 flex items-center justify-center transition-all cursor-pointer ${isSelected ? 'bg-primary border-primary' : 'border-slate-300 hover:border-primary/60 bg-white'}`}>
                          {isSelected && <Check size={10} strokeWidth={3} className="text-white" />}
                        </button>
                      </td>
                    )}
                    <td className={`${cellCls} font-black text-on-surface`}>
                      <span className="cursor-pointer hover:text-primary hover:underline transition-colors" onClick={() => setDetailLead(lead)}>{lead.customerName}</span>
                    </td>
                    <td className={cellCls}>
                      <SourceBadge synced={lead.syncedFromCrm} />
                    </td>
                    <td className={`${cellCls} font-bold text-slate-600`}>{lead.ae}</td>
                    <td className={`${cellCls} text-slate-500 font-medium`}>{lead.receivedDate.slice(0, 10)}</td>
                    <td className={`${cellCls} text-slate-500`}>{lead.resolvedDate ? lead.resolvedDate.slice(0, 10) : '-'}</td>
                    <td className={cellCls}>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${STATUS_BADGE[lead.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {toStatusLabel(lead.status)}
                      </span>
                    </td>
                    <td className={cellCls}>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${sla.className}`}>
                        {sla.label}
                      </span>
                    </td>
                    <td className={`${cellCls} text-slate-500`}>{lead.leadType === 'Việt Nam' ? 'VN' : lead.leadType === 'Quốc Tế' ? 'QT' : (lead.leadType ?? '-')}</td>
                    <td className={`${cellCls} text-slate-500 font-medium`}>{lead.unqualifiedType ?? '-'}</td>
                    <td className={`${cellCls} italic max-w-[150px]`}>
                      <span className="text-slate-400 truncate block">{lead.notes || '—'}</span>
                    </td>
                    <td className={`${cellCls} text-slate-400 text-[11px] font-medium whitespace-nowrap`}>
                      {format(new Date(lead.updatedAt), 'dd/MM/yyyy - HH:mm')}
                    </td>
                    <td className={cellCls}>
                      <div className="flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setDialogMode('edit'); setDialogLead(lead); }}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                        ><Edit2 size={16} /></button>

                        {hasPendingDelete ? (
                          isAdminOrLeaderSale ? (
                            <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-xl border border-rose-100">
                              <span className="text-[10px] font-bold text-rose-600 px-2 max-w-[120px] truncate" title={lead.deleteReason || ''}>
                                Lý do: {lead.deleteReason || 'N/A'}
                              </span>
                              <button onClick={() => handleApproveDelete(lead)} className="p-1.5 text-emerald-500 hover:bg-white rounded-lg transition-all" title="Duyệt xóa"><Check size={14} /></button>
                              <button onClick={() => handleRejectDelete(lead)} className="p-1.5 text-rose-400 hover:bg-white rounded-lg transition-all" title="Từ chối"><X size={14} /></button>
                            </div>
                          ) : lead.deleteRequestedBy === currentUser?.id ? (
                            <button onClick={() => handleCancelDeleteRequest(lead)} className="flex items-center gap-1 px-2 py-1 text-amber-600 bg-amber-50 rounded-xl text-[10px] font-black" title="Hủy yêu cầu xóa">⏳ Đang chờ</button>
                          ) : (
                            <span className="px-2 py-1 text-slate-400 text-[10px] font-black">⏳</span>
                          )
                        ) : (
                          <button onClick={() => handleDelete(lead)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title={isAdminOrLeaderSale ? 'Xóa' : 'Yêu cầu xóa'}><Trash2 size={16} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && leads.length === 0 && (
                <tr><td colSpan={isSale ? 14 : 13} className="py-32 text-center">
                  <div className="flex flex-col items-center opacity-30">
                    <Search className="size-12 mb-4" />
                    <p className="font-black uppercase tracking-[0.2em] text-sm">No leads found</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
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
            onDelete={bulkDelete}
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
