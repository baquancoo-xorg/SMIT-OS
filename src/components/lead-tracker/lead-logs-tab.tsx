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

const STATUSES = ['Mới', 'Đang liên hệ', 'Đang nuôi dưỡng', 'Qualified', 'Unqualified'];
const LEAD_TYPES = ['Việt Nam', 'Quốc Tế'];
const UNQUALIFIED_TYPES = ['Unreachable', 'Rejected', 'Bad Fit', 'Timing'];

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

type PendingRow = {
  _id: string; customerName: string; ae: string;
  receivedDate: string; resolvedDate: string;
  status: string; leadType: string; unqualifiedType: string; notes: string;
};

function parseExcelDate(s: string): string {
  if (!s) return '';
  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  return s;
}

function parseTsvRfc4180(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuote = false;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (inQuote) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i += 2; continue; }
      if (ch === '"') { inQuote = false; i++; continue; }
      cell += ch;
    } else {
      if (ch === '"') { inQuote = true; i++; continue; }
      if (ch === '\t') { row.push(cell); cell = ''; i++; continue; }
      if (ch === '\r' && text[i + 1] === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; i += 2; continue; }
      if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; i++; continue; }
      cell += ch;
    }
    i++;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim()));
}

function parseTsv(text: string): PendingRow[] {
  return parseTsvRfc4180(text.trim()).map((c) => ({
    _id: crypto.randomUUID(),
    customerName: c[0] ?? '',
    ae: c[1] ?? '',
    receivedDate: parseExcelDate(c[2] ?? '') || new Date().toISOString().slice(0, 10),
    resolvedDate: parseExcelDate(c[3] ?? ''),
    status: c[4] ?? 'Đang liên hệ',
    leadType: c[5] ?? '',
    unqualifiedType: c[6] ?? '',
    notes: c[7] ?? '',
  }));
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
];

interface LeadLogsTabProps {
  onReady?: (actions: { paste: () => void; addRow: () => void }) => void;
  extraControls?: ReactNode;
}

export default function LeadLogsTab({ onReady, extraControls }: LeadLogsTabProps) {
  const { currentUser } = useAuth();
  const isSale = currentUser?.departments?.includes('Sale');
  const isAdminOrLeaderSale = (
    currentUser?.isAdmin ||
    currentUser?.role === 'Admin' ||
    (currentUser?.role === 'Leader' && currentUser?.departments?.includes('Sale'))
  );

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingRow[]>([]);
  const [saving, setSaving] = useState(false);
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

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkEdit, setBulkEdit] = useState<BulkEditFields>({ status: '', ae: '', leadType: '' });
  const [bulkSaving, setBulkSaving] = useState(false);

  // Dialog & detail modal
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

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const rows = parseTsv(text);
      if (rows.length) setPending((prev) => [...prev, ...rows]);
    } catch { alert('Cannot read clipboard. Please allow clipboard permissions in your browser.'); }
  };

  useEffect(() => {
    onReady?.({ paste: pasteFromClipboard, addRow: () => setDialogMode('add') });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Selection helpers ---
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
  const clearSelection = () => { setSelectedIds(new Set()); setBulkEditMode(false); setBulkEdit({ status: '', ae: '', leadType: '' }); };

  // --- Delete handlers ---
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

  // --- Bulk actions ---
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
    if (bulkEdit.status) payload.status = bulkEdit.status;
    if (bulkEdit.ae) payload.ae = bulkEdit.ae;
    if (bulkEdit.leadType) payload.leadType = bulkEdit.leadType;
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

  // --- Pending save (from paste) ---
  const savePending = async () => {
    const valid = pending.filter((r) => r.customerName && r.ae && r.receivedDate && r.status);
    if (!valid.length) return;
    setSaving(true);
    try {
      await Promise.all(valid.map((r) => api.createLead({
        customerName: r.customerName, ae: r.ae, receivedDate: r.receivedDate,
        resolvedDate: r.resolvedDate || null, status: r.status,
        leadType: r.leadType || null,
        unqualifiedType: r.status === 'Unqualified' ? (r.unqualifiedType || null) : null,
        notes: r.notes || null,
      })));
      setPending([]);
      fetchLeads();
    } catch (err: any) {
      alert(`Lỗi khi lưu: ${err?.message ?? 'Unknown error'}. Kiểm tra lại dữ liệu.`);
    } finally { setSaving(false); }
  };

  const setPR = (id: string, k: keyof PendingRow, v: string) =>
    setPending((prev) => prev.map((r) => r._id === id ? { ...r, [k]: v } : r));

  const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all';
  const cellCls = 'px-4 py-4 text-xs';

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Filters */}
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
          {extraControls && <div>{extraControls}</div>}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl shadow-sm overflow-hidden">
        <div className="h-full overflow-y-auto overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1100px]">
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
                <tr><td colSpan={isSale ? 12 : 11} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Loading...</td></tr>
              )}

              {/* Lead rows */}
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

              {/* Pending rows from paste */}
              <AnimatePresence>
                {pending.map((row, idx) => (
                  <motion.tr key={row._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="bg-amber-50/40 border-l-4 border-amber-400">
                    {isSale && <td className="pl-6" />}
                    <td className={cellCls}><input className={inputCls} placeholder="Customer *" value={row.customerName} onChange={(e) => setPR(row._id, 'customerName', e.target.value)} /></td>
                    <td className={cellCls}><input className={inputCls} placeholder="AE *" value={row.ae} onChange={(e) => setPR(row._id, 'ae', e.target.value)} /></td>
                    <td className={cellCls}><input type="date" className={inputCls} value={row.receivedDate} onChange={(e) => setPR(row._id, 'receivedDate', e.target.value)} /></td>
                    <td className={cellCls}><input type="date" className={inputCls} value={row.resolvedDate} onChange={(e) => setPR(row._id, 'resolvedDate', e.target.value)} /></td>
                    <td className={cellCls}><select className={inputCls} value={row.status} onChange={(e) => setPR(row._id, 'status', e.target.value)}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></td>
                    <td className={cellCls}><span className="text-slate-300">-</span></td>
                    <td className={cellCls}><select className={inputCls} value={row.leadType} onChange={(e) => setPR(row._id, 'leadType', e.target.value)}><option value="">-</option>{LEAD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></td>
                    <td className={cellCls}>
                      {row.status === 'Unqualified'
                        ? <select className={inputCls} value={row.unqualifiedType} onChange={(e) => setPR(row._id, 'unqualifiedType', e.target.value)}><option value="">-</option>{UNQUALIFIED_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
                        : <span className="text-slate-300">-</span>}
                    </td>
                    <td className={cellCls}><input className={inputCls} placeholder="Notes" value={row.notes} onChange={(e) => setPR(row._id, 'notes', e.target.value)} /></td>
                    <td className={cellCls} />
                    <td className={cellCls}><button onClick={() => setPending((prev) => prev.filter((_, i) => i !== idx))} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button></td>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {!loading && leads.length === 0 && pending.length === 0 && (
                <tr><td colSpan={isSale ? 12 : 11} className="py-32 text-center">
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

      {/* Pending bar (paste results) */}
      <AnimatePresence>
        {pending.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="shrink-0 flex items-center justify-between p-6 bg-amber-50 border border-amber-200 rounded-[2rem] shadow-lg shadow-amber-200/20">
            <div className="flex items-center gap-4">
              <div className="size-10 bg-amber-400 text-white rounded-full flex items-center justify-center font-black shadow-lg shadow-amber-400/20">{pending.length}</div>
              <div>
                <p className="text-sm font-black text-amber-900 tracking-tight">Pending leads</p>
                <p className="text-[11px] font-bold text-amber-700/70 uppercase tracking-widest">Review before saving</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setPending([])} className="px-6 py-2.5 text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all">Discard All</button>
              <button onClick={savePending} disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all font-black text-xs uppercase tracking-widest disabled:opacity-50">
                {saving ? 'Saving...' : <><Check size={18} /> Save All ({pending.length})</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk action bar */}
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

      {/* Lead log dialog (add/edit) */}
      {dialogMode && (
        <LeadLogDialog
          mode={dialogMode}
          lead={dialogLead ?? undefined}
          aeOptions={aeOptions}
          onClose={() => { setDialogMode(null); setDialogLead(null); }}
          onSaved={fetchLeads}
        />
      )}

      {/* Lead detail modal */}
      <LeadDetailModal lead={detailLead} onClose={() => setDetailLead(null)} />
    </div>
  );
}
