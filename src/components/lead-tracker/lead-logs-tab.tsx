import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { Search, Check, Trash2, Edit2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Lead } from '../../types';
import CustomFilter from '../ui/CustomFilter';
import DatePicker from '../ui/date-picker';
import BulkActionBar, { type BulkEditFields } from './bulk-action-bar';

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

type PendingRow = {
  _id: string; customerName: string; ae: string;
  receivedDate: string; resolvedDate: string;
  status: string; leadType: string; unqualifiedType: string; notes: string;
};

function emptyPending(): PendingRow {
  return { _id: crypto.randomUUID(), customerName: '', ae: '', receivedDate: new Date().toISOString().slice(0, 10), resolvedDate: '', status: 'Đang liên hệ', leadType: '', unqualifiedType: '', notes: '' };
}

// Convert dd/mm/yyyy to yyyy-mm-dd for HTML date inputs
function parseExcelDate(s: string): string {
  if (!s) return '';
  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  return s;
}

// RFC 4180-compliant TSV parser — handles quoted cells with embedded newlines
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
  { label: 'Lead Type', key: 'leadType' },
  { label: 'UQ Reason', key: 'unqualifiedType' },
  { label: 'Notes', key: 'notes' },
];

interface LeadLogsTabProps {
  onReady?: (actions: { paste: () => void; addRow: () => void }) => void;
  extraControls?: ReactNode;
}

export default function LeadLogsTab({ onReady, extraControls }: LeadLogsTabProps) {
  const { currentUser } = useAuth();
  const isSale = currentUser?.departments?.includes('Sale');

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingRow[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Lead>>({});
  const [saving, setSaving] = useState(false);
  const [aeOptions, setAeOptions] = useState<{ id: string; fullName: string }[]>([]);
  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const [filters, setFilters] = useState({ ae: '', status: '', dateFrom: sevenDaysAgo.toISOString().slice(0, 10), dateTo: today });

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkEdit, setBulkEdit] = useState<BulkEditFields>({ status: '', ae: '', leadType: '' });
  const [bulkSaving, setBulkSaving] = useState(false);

  const sf = (k: string, v: string) => setFilters((f) => ({ ...f, [k]: v }));

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const p: Record<string, string> = {};
      if (filters.ae) p.ae = filters.ae;
      if (filters.status) p.status = filters.status;
      if (filters.dateFrom) p.dateFrom = filters.dateFrom;
      if (filters.dateTo) p.dateTo = filters.dateTo;
      setLeads(await api.getLeads(Object.keys(p).length ? p : undefined));
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);
  useEffect(() => { api.getLeadAeList().then(setAeOptions); }, []);

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const rows = parseTsv(text);
      if (rows.length) setPending((prev) => [...prev, ...rows]);
    } catch { alert('Cannot read clipboard. Please allow clipboard permissions in your browser.'); }
  };

  const addRow = () => setPending((prev) => [...prev, emptyPending()]);

  useEffect(() => {
    onReady?.({ paste: pasteFromClipboard, addRow });
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

  // --- Bulk delete ---
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

  // --- Bulk edit apply ---
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

  // --- Pending save ---
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
      alert(`Lỗi khi lưu: ${err?.message ?? 'Unknown error'}. Kiểm tra lại dữ liệu (ngày tháng, trạng thái).`);
    } finally { setSaving(false); }
  };

  const saveEdit = async () => {
    if (!editId) return;
    await api.updateLead(editId, draft);
    setEditId(null); setDraft({});
    fetchLeads();
  };

  const del = async (id: string) => {
    if (!confirm('Delete this lead?')) return;
    await api.deleteLead(id); fetchLeads();
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
        <CustomFilter value={filters.status} onChange={(v) => sf('status', v)} options={[{ value: '', label: 'All Status' }, ...STATUSES.map((s) => ({ value: s, label: s }))]} buttonClassName="!h-9 !px-3 !text-[11px] !tracking-normal !normal-case" />
        <div className="ml-auto flex items-center gap-3">
          {/* Stat bars */}
          {!loading && (() => {
            const c = (s: string) => leads.filter((l) => l.status === s).length;
            const vn = leads.filter((l) => l.leadType === 'Việt Nam').length;
            const intl = leads.filter((l) => l.leadType === 'Quốc Tế').length;
            const statCls = 'flex items-center gap-4 px-4 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm text-[10px] font-black uppercase tracking-widest';
            const dot = (color: string) => <span className={`size-2 rounded-full inline-block ${color}`} />;
            const stat = (color: string, label: string, val: number) => (
              <span className="flex items-center gap-1.5 text-slate-500">{dot(color)}{label}: {val}</span>
            );
            return (
              <div className="flex items-center gap-2">
                <div className={statCls}>
                  {stat('bg-slate-400', 'Total', leads.length)}
                  {stat('bg-violet-400', 'New', c('Mới'))}
                  {stat('bg-blue-400', 'Approaching', c('Đang liên hệ'))}
                  {stat('bg-amber-400', 'Nurturing', c('Đang nuôi dưỡng'))}
                  {stat('bg-emerald-500', 'Qualified', c('Qualified'))}
                  {stat('bg-rose-400', 'Unqualified', c('Unqualified'))}
                </div>
                <div className={statCls}>
                  {stat('bg-red-400', 'Việt Nam', vn)}
                  {stat('bg-sky-400', 'Quốc Tế', intl)}
                </div>
              </div>
            );
          })()}
          {extraControls && <div>{extraControls}</div>}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-slate-100 overflow-hidden">
        <div className="h-full overflow-y-auto overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
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
                <tr><td colSpan={isSale ? 10 : 9} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Loading...</td></tr>
              )}

              {/* Existing rows */}
              {!loading && leads.map((lead) => {
                const isSelected = selectedIds.has(lead.id);
                if (editId === lead.id) return (
                  <tr key={lead.id} className="bg-primary/[0.03]">
                    {isSale && <td className="pl-6"><button onClick={() => toggleSelect(lead.id)} className={`size-4 rounded-[4px] border-2 flex items-center justify-center transition-all cursor-pointer ${isSelected ? 'bg-primary border-primary' : 'border-slate-300 hover:border-primary/60 bg-white'}`}>{isSelected && <Check size={10} strokeWidth={3} className="text-white" />}</button></td>}
                    <td className={cellCls}><input className={inputCls} value={draft.customerName ?? ''} onChange={(e) => setDraft((d) => ({ ...d, customerName: e.target.value }))} /></td>
                    <td className={cellCls}><input className={inputCls} value={draft.ae ?? ''} onChange={(e) => setDraft((d) => ({ ...d, ae: e.target.value }))} /></td>
                    <td className={cellCls}><input type="date" className={inputCls} value={draft.receivedDate?.slice(0, 10) ?? ''} onChange={(e) => setDraft((d) => ({ ...d, receivedDate: e.target.value }))} /></td>
                    <td className={cellCls}><input type="date" className={inputCls} value={draft.resolvedDate?.slice(0, 10) ?? ''} onChange={(e) => setDraft((d) => ({ ...d, resolvedDate: e.target.value }))} /></td>
                    <td className={cellCls}><select className={inputCls} value={draft.status ?? ''} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></td>
                    <td className={cellCls}><select className={inputCls} value={draft.leadType ?? ''} onChange={(e) => setDraft((d) => ({ ...d, leadType: e.target.value }))}><option value="">-</option>{LEAD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></td>
                    <td className={cellCls}>
                      {draft.status === 'Unqualified'
                        ? <select className={inputCls} value={draft.unqualifiedType ?? ''} onChange={(e) => setDraft((d) => ({ ...d, unqualifiedType: e.target.value }))}><option value="">-</option>{UNQUALIFIED_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
                        : <span className="text-slate-300">-</span>}
                    </td>
                    <td className={cellCls}><input className={inputCls} value={draft.notes ?? ''} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} /></td>
                    <td className={cellCls}>
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200 transition-colors"><Check size={16} /></button>
                        <button onClick={() => { setEditId(null); setDraft({}); }} className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors"><X size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
                return (
                  <tr key={lead.id} className={`hover:bg-slate-50/80 transition-colors group ${isSelected ? 'bg-primary/[0.04]' : ''}`}>
                    {isSale && (
                      <td className="pl-6">
                        <button onClick={() => toggleSelect(lead.id)} className={`size-4 rounded-[4px] border-2 flex items-center justify-center transition-all cursor-pointer ${isSelected ? 'bg-primary border-primary' : 'border-slate-300 hover:border-primary/60 bg-white'}`}>
                          {isSelected && <Check size={10} strokeWidth={3} className="text-white" />}
                        </button>
                      </td>
                    )}
                    <td className={`${cellCls} font-black text-on-surface group-hover:text-primary transition-colors`}>{lead.customerName}</td>
                    <td className={`${cellCls} font-bold text-slate-600`}>{lead.ae}</td>
                    <td className={`${cellCls} text-slate-500 font-medium`}>{lead.receivedDate.slice(0, 10)}</td>
                    <td className={`${cellCls} text-slate-500 font-medium`}>{lead.resolvedDate ? lead.resolvedDate.slice(0, 10) : '-'}</td>
                    <td className={cellCls}>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${STATUS_BADGE[lead.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className={`${cellCls} text-slate-500 font-medium`}>{lead.leadType ?? '-'}</td>
                    <td className={`${cellCls} text-slate-500 font-medium`}>{lead.status === 'Unqualified' ? (lead.unqualifiedType ?? '-') : '-'}</td>
                    <td className={`${cellCls} text-slate-400 font-medium italic max-w-[150px] truncate`}>{lead.notes || '—'}</td>
                    <td className={cellCls}>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditId(lead.id); setDraft({ ...lead }); }} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all" title="Edit"><Edit2 size={16} /></button>
                        <button onClick={() => del(lead.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Pending rows */}
              <AnimatePresence>
                {pending.map((row, idx) => (
                  <motion.tr key={row._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="bg-amber-50/40 border-l-4 border-amber-400">
                    {isSale && <td className="pl-6" />}
                    <td className={cellCls}><input className={inputCls} placeholder="Customer *" value={row.customerName} onChange={(e) => setPR(row._id, 'customerName', e.target.value)} /></td>
                    <td className={cellCls}><input className={inputCls} placeholder="AE *" value={row.ae} onChange={(e) => setPR(row._id, 'ae', e.target.value)} /></td>
                    <td className={cellCls}><input type="date" className={inputCls} value={row.receivedDate} onChange={(e) => setPR(row._id, 'receivedDate', e.target.value)} /></td>
                    <td className={cellCls}><input type="date" className={inputCls} value={row.resolvedDate} onChange={(e) => setPR(row._id, 'resolvedDate', e.target.value)} /></td>
                    <td className={cellCls}><select className={inputCls} value={row.status} onChange={(e) => setPR(row._id, 'status', e.target.value)}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></td>
                    <td className={cellCls}><select className={inputCls} value={row.leadType} onChange={(e) => setPR(row._id, 'leadType', e.target.value)}><option value="">-</option>{LEAD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></td>
                    <td className={cellCls}>
                      {row.status === 'Unqualified'
                        ? <select className={inputCls} value={row.unqualifiedType} onChange={(e) => setPR(row._id, 'unqualifiedType', e.target.value)}><option value="">-</option>{UNQUALIFIED_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
                        : <span className="text-slate-300">-</span>}
                    </td>
                    <td className={cellCls}><input className={inputCls} placeholder="Notes" value={row.notes} onChange={(e) => setPR(row._id, 'notes', e.target.value)} /></td>
                    <td className={cellCls}><button onClick={() => setPending((prev) => prev.filter((_, i) => i !== idx))} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button></td>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {!loading && leads.length === 0 && pending.length === 0 && (
                <tr><td colSpan={isSale ? 10 : 9} className="py-32 text-center">
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

      {/* Pending bar - shrink-0 dưới bảng */}
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

      {/* Floating bulk action bubble */}
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
    </div>
  );
}
