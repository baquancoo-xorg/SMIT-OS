import React, { useState, useEffect, useRef } from 'react';
import { UserCircle, FileText } from 'lucide-react';
import { api } from '../../lib/api';
import type { Lead } from '../../types';
import DatePicker from '../ui/DatePicker';
import CustomSelect from '../ui/CustomSelect';
import { FormDialog, Input, Badge } from '../ui/v2';

/**
 * Add/Edit lead form dialog với CRM sync lock support.
 *
 * Phase 8 follow-up batch 7 (2026-05-10): migrated to v2 FormDialog + Input
 * primitives. CustomSelect (v1) + DatePicker (v1) reused — chúng có complex
 * dropdown logic, deep migration là follow-up.
 *
 * isCrmLocked = mode === 'edit' && lead.syncedFromCrm: hầu hết field disabled
 * (CRM source of truth) — chỉ leadType + unqualifiedType + notes editable.
 */

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

const STATUS_VARIANT: Record<string, 'primary' | 'success' | 'error' | 'info' | 'warning' | 'neutral'> = {
  'Mới': 'primary',
  'Qualified': 'success',
  'Unqualified': 'error',
  'Đang liên hệ': 'info',
  'Đang nuôi dưỡng': 'warning',
};

function FieldLabel({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`flex flex-col gap-1.5 ${wide ? 'col-span-2' : ''}`}>
      <span className="text-[length:var(--text-label)] font-medium text-on-surface-variant">{label}</span>
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
  const initialForm: FormData =
    mode === 'edit' && lead
      ? {
          customerName: lead.customerName,
          ae: lead.ae,
          receivedDate: lead.receivedDate.slice(0, 10),
          resolvedDate: lead.resolvedDate?.slice(0, 10) ?? '',
          status: lead.status,
          leadType: lead.leadType ?? '',
          unqualifiedType: lead.unqualifiedType ?? '',
          notes: lead.notes ?? '',
        }
      : {
          customerName: '',
          ae: '',
          receivedDate: new Date().toISOString().slice(0, 10),
          resolvedDate: '',
          status: 'Đang liên hệ',
          leadType: '',
          unqualifiedType: '',
          notes: '',
        };

  const [form, setForm] = useState<FormData>(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    autoResizeNotes();
  }, []);

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
        unqualifiedType: form.status === 'Unqualified' ? form.unqualifiedType || null : null,
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

  const dialogTitle = mode === 'add' ? 'Add new lead' : 'Edit lead';

  return (
    <FormDialog
      open={true}
      onClose={onClose}
      onSubmit={handleSave}
      title={dialogTitle}
      icon={mode === 'add' ? <UserCircle /> : <FileText />}
      iconAccent="primary"
      size="lg"
      submitLabel={saving ? 'Saving...' : 'Save'}
      isSubmitting={saving}
      footerLeft={error ? <span className="text-error font-medium">{error}</span> : undefined}
      description={
        mode === 'edit' && lead ? (
          <span className="inline-flex items-center gap-2">
            <Badge variant={STATUS_VARIANT[lead.status] ?? 'neutral'}>{lead.status}</Badge>
            {isCrmLocked && (
              <span className="text-on-surface-variant italic">(synced from CRM — most fields locked)</span>
            )}
          </span>
        ) as any : undefined
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Customer Name *"
          containerClassName="col-span-2"
          value={form.customerName}
          onChange={(e) => set('customerName', e.target.value)}
          placeholder="Enter customer name..."
          disabled={isCrmLocked}
          title={isCrmLocked ? 'Synced from CRM' : undefined}
          autoFocus
        />

        <FieldLabel label="AE *">
          <div title={isCrmLocked ? 'Synced from CRM' : undefined}>
            <CustomSelect
              value={form.ae}
              onChange={(v) => set('ae', v)}
              options={aeSelectOptions}
              placeholder="Chọn AE"
              disabled={isCrmLocked}
            />
          </div>
        </FieldLabel>

        <FieldLabel label="Status *">
          <div title={isCrmLocked ? 'Synced from CRM' : undefined}>
            <CustomSelect
              value={form.status}
              onChange={(v) => set('status', v)}
              options={STATUS_OPTIONS}
              disabled={isCrmLocked}
            />
          </div>
        </FieldLabel>

        <FieldLabel label="Received Date *">
          <div title={isCrmLocked ? 'Synced from CRM' : undefined}>
            <DatePicker
              value={form.receivedDate}
              onChange={(v) => set('receivedDate', v)}
              placeholder="Select date"
              className={`!w-full !rounded-input !bg-surface-container-lowest !border !border-outline-variant !h-10 !px-3 hover:!border-outline ${
                isCrmLocked ? '!bg-surface-container !text-on-surface/50 pointer-events-none' : ''
              }`}
            />
          </div>
        </FieldLabel>

        <FieldLabel label="Resolved Date">
          <DatePicker
            value={form.resolvedDate}
            onChange={(v) => set('resolvedDate', v)}
            placeholder="Select date"
            disabled={isCrmLocked}
            className={`!w-full !rounded-input !bg-surface-container-lowest !border !border-outline-variant !h-10 !px-3 hover:!border-outline ${
              isCrmLocked ? '!bg-surface-container !text-on-surface/50 pointer-events-none' : ''
            }`}
          />
        </FieldLabel>

        <FieldLabel label="Lead Type">
          <CustomSelect
            value={form.leadType}
            onChange={(v) => set('leadType', v)}
            options={LEAD_TYPE_OPTIONS}
          />
        </FieldLabel>

        {form.status === 'Unqualified' && (
          <FieldLabel label="UQ Reason">
            <CustomSelect
              value={form.unqualifiedType}
              onChange={(v) => set('unqualifiedType', v)}
              options={UQ_OPTIONS}
            />
          </FieldLabel>
        )}

        <FieldLabel label="Notes" wide>
          <textarea
            ref={notesRef}
            rows={2}
            className="min-h-[56px] max-h-[200px] w-full resize-none overflow-y-auto rounded-input border border-outline-variant bg-surface-container-lowest px-3 py-2 text-[length:var(--text-body)] text-on-surface placeholder:text-on-surface-variant/60 focus-visible:outline-none focus-visible:border-primary"
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
        </FieldLabel>
      </div>
    </FormDialog>
  );
}
