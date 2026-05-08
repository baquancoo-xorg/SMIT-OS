import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserCircle, FileText } from 'lucide-react';
import { api } from '../../lib/api';
import type { Lead } from '../../types';
import DatePicker from '../ui/DatePicker';
import CustomSelect from '../ui/CustomSelect';

const STATUS_OPTIONS = [
  { value: 'Mới', label: 'New' },
  { value: 'Đang liên hệ', label: 'Attempting' },
  { value: 'Đang nuôi dưỡng', label: 'Nurturing' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'Unqualified', label: 'Unqualified' },
];

const LEAD_TYPE_OPTIONS = [
  { value: '', label: '— Select —' },
  { value: 'Việt Nam', label: 'Vietnam' },
  { value: 'Quốc Tế', label: 'International' },
];

const UQ_OPTIONS = [
  { value: '', label: '— Select —' },
  { value: 'Unreachable', label: 'Unreachable' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Bad Fit', label: 'Bad Fit' },
  { value: 'Timing', label: 'Timing' },
];

const STATUS_COLOR: Record<string, string> = {
  'Mới': 'text-purple-600 bg-purple-50 border-purple-100',
  'Qualified': 'text-emerald-600 bg-emerald-50 border-emerald-100',
  'Unqualified': 'text-rose-600 bg-rose-50 border-rose-100',
  'Đang liên hệ': 'text-blue-600 bg-blue-50 border-blue-100',
  'Đang nuôi dưỡng': 'text-amber-600 bg-amber-50 border-amber-100',
};

const INPUT_CLS = 'w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all';

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? 'col-span-2' : ''}>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-1.5">{label}</p>
      {children}
    </div>
  );
}

type FormData = {
  customerName: string;
  ae: string;
  receivedDate: string;
  resolvedDate: string;
  status: string;
  leadType: string;
  unqualifiedType: string;
  notes: string;
};

interface LeadLogDialogProps {
  mode: 'add' | 'edit';
  lead?: Lead;
  aeOptions: { id: string; fullName: string }[];
  onClose: () => void;
  onSaved: () => void;
}

export default function LeadLogDialog({ mode, lead, aeOptions, onClose, onSaved }: LeadLogDialogProps) {
  const initialForm: FormData = mode === 'edit' && lead ? {
    customerName: lead.customerName,
    ae: lead.ae,
    receivedDate: lead.receivedDate.slice(0, 10),
    resolvedDate: lead.resolvedDate?.slice(0, 10) ?? '',
    status: lead.status,
    leadType: lead.leadType ?? '',
    unqualifiedType: lead.unqualifiedType ?? '',
    notes: lead.notes ?? '',
  } : {
    customerName: '', ae: '',
    receivedDate: new Date().toISOString().slice(0, 10),
    resolvedDate: '', status: 'Đang liên hệ',
    leadType: '', unqualifiedType: '', notes: '',
  };

  const [form, setForm] = useState<FormData>(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const isCrmLocked = mode === 'edit' && !!lead?.syncedFromCrm;

  const autoResizeNotes = () => {
    const el = notesRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    nameInputRef.current?.focus();
    autoResizeNotes();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = (k: keyof FormData, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const aeSelectOptions = [
    { value: '', label: '— Select AE —' },
    ...aeOptions.map((a) => ({ value: a.fullName, label: a.fullName })),
  ];

  const handleSave = async () => {
    if (!form.customerName.trim() || !form.ae || !form.receivedDate || !form.status) {
      setError('Please fill in all required fields (*)');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        customerName: form.customerName.trim(),
        ae: form.ae,
        receivedDate: form.receivedDate,
        resolvedDate: form.resolvedDate || null,
        leadType: form.leadType || null,
        status: form.status,
        unqualifiedType: form.status === 'Unqualified' ? (form.unqualifiedType || null) : null,
        notes: form.notes.trim() || null,
      };
      if (mode === 'add') await api.createLead(payload);
      else await api.updateLead(lead!.id, payload);
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message ?? 'Error saving. Try again.');
    } finally {
      setSaving(false);
    }
  };


  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-white rounded-[2rem] shadow-2xl shadow-slate-300/40 w-full max-w-[520px] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-2xl bg-primary/10 flex items-center justify-center">
                {mode === 'add'
                  ? <UserCircle size={18} className="text-primary" />
                  : <FileText size={18} className="text-primary" />}
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.15em] text-slate-700">
                  {mode === 'add' ? 'Add New Lead' : 'Edit Lead'}
                </h2>
                {mode === 'edit' && lead && (
                  <span className={`inline-flex items-center mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    STATUS_COLOR[lead.status] ?? 'text-slate-500 bg-slate-50 border-slate-100'
                  }`}>{lead.status}</span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="size-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            >
              <X size={15} />
            </button>
          </div>

          <div className="px-7 py-5 grid grid-cols-2 gap-x-4 gap-y-4 max-h-[70vh] overflow-y-auto">
            <Field label="Customer Name *" wide>
              <input
                ref={nameInputRef}
                className={`${INPUT_CLS} ${isCrmLocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}`}
                value={form.customerName}
                onChange={(e) => set('customerName', e.target.value)}
                placeholder="Enter customer name..."
                disabled={isCrmLocked}
                title={isCrmLocked ? 'Synced from CRM' : undefined}
              />
            </Field>

            <Field label="AE *">
              <div title={isCrmLocked ? 'Synced from CRM' : undefined}>
                <CustomSelect
                  value={form.ae}
                  onChange={(v) => set('ae', v)}
                  options={aeSelectOptions}
                  placeholder="Chọn AE"
                  disabled={isCrmLocked}
                />
              </div>
            </Field>

            <Field label="Status *">
              <div title={isCrmLocked ? 'Synced from CRM' : undefined}>
                <CustomSelect
                  value={form.status}
                  onChange={(v) => set('status', v)}
                  options={STATUS_OPTIONS}
                  disabled={isCrmLocked}
                />
              </div>
            </Field>

            <Field label="Received Date *">
              <div className="relative" title={isCrmLocked ? 'Synced from CRM' : undefined}>
                <DatePicker
                  value={form.receivedDate}
                  onChange={(v) => set('receivedDate', v)}
                  placeholder="Select date"
                  className={`!w-full !rounded-2xl !bg-white !border !border-slate-200 !h-[42px] !px-4 hover:!border-primary/40 ${
                    isCrmLocked ? '!bg-slate-100 !text-slate-400 pointer-events-none' : ''
                  }`}
                />
              </div>
            </Field>

            <Field label="Resolved Date">
              <div className="relative">
                <DatePicker
                  value={form.resolvedDate}
                  onChange={(v) => set('resolvedDate', v)}
                  placeholder="Select date"
                  disabled={isCrmLocked}
                  className={`!w-full !rounded-2xl !bg-white !border !border-slate-200 !h-[42px] !px-4 ${
                    isCrmLocked ? '!bg-slate-100 !text-slate-400 pointer-events-none' : ''
                  }`}
                />
              </div>
            </Field>

            <Field label="Lead Type">
              <CustomSelect
                value={form.leadType}
                onChange={(v) => set('leadType', v)}
                options={LEAD_TYPE_OPTIONS}
              />
            </Field>

            {form.status === 'Unqualified' && (
              <Field label="UQ Reason">
                <CustomSelect
                  value={form.unqualifiedType}
                  onChange={(v) => set('unqualifiedType', v)}
                  options={UQ_OPTIONS}
                />
              </Field>
            )}

            <Field label="Notes" wide>
              <textarea
                ref={notesRef}
                rows={2}
                className={`${INPUT_CLS} resize-none min-h-[56px] max-h-[200px] overflow-y-auto`}
                value={form.notes}
                onChange={(e) => {
                  set('notes', e.target.value);
                  autoResizeNotes();
                }}
                onInput={autoResizeNotes}
                placeholder="Add notes..."
                onKeyDown={(e) => {
                  e.stopPropagation();
                }}
              />
            </Field>
          </div>

          <div className="flex items-center justify-between px-7 py-4 border-t border-slate-100 bg-slate-50/60">
            <div className="text-xs font-bold text-rose-500">{error}</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-5 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="h-9 px-7 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
