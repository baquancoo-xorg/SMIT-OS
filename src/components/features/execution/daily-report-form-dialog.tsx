import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { format, parseISO } from 'date-fns';
import { FileText, Save, Calendar } from 'lucide-react';
import { FormDialog } from '../../ui/form-dialog';
import { useToast } from '../../ui/notification-toast';
import { Button } from '../../ui/button';
import { DraftRestoredBanner } from './draft-restored-banner';
import { useDraftAutosave } from '../../../hooks/use-draft-autosave';
import { loadDraft, clearDraft } from '../../../lib/draft-storage';
import { api } from '../../../lib/api';

interface DailyReportFormDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  reportDate: string; // initial date, ISO yyyy-MM-dd
  onSubmitted?: () => void;
}

type FormState = { completedYesterday: string; doingYesterday: string; blockers: string; planToday: string };
const emptyForm: FormState = { completedYesterday: '', doingYesterday: '', blockers: '', planToday: '' };

export function DailyReportFormDialog({ open, onClose, userId, reportDate, onSubmitted }: DailyReportFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [selectedDate, setSelectedDate] = useState<string>(reportDate);
  const [submitting, setSubmitting] = useState(false);
  const [restoredAt, setRestoredAt] = useState<string | null>(null);
  const { toast } = useToast();
  const now = new Date();
  const minDateStr = format(new Date(now.getTime() - 7 * 86_400_000), 'yyyy-MM-dd');
  const maxDateStr = format(new Date(now.getTime() + 1 * 86_400_000), 'yyyy-MM-dd');

  const { savedAt, flush, clear, available } = useDraftAutosave({ form, userId, date: selectedDate, enabled: open && !submitting });

  // Reset selected date whenever the dialog opens with a new initial reportDate
  useEffect(() => {
    if (open) setSelectedDate(reportDate);
  }, [open, reportDate]);

  // Load draft for whichever date is currently selected
  useEffect(() => {
    if (open && userId && selectedDate) {
      const draft = loadDraft(userId, selectedDate);
      if (draft) {
        setForm({ completedYesterday: draft.completedYesterday, doingYesterday: draft.doingYesterday, blockers: draft.blockers, planToday: draft.planToday });
        setRestoredAt(draft.savedAt);
      } else {
        setForm(emptyForm);
        setRestoredAt(null);
      }
    }
  }, [open, userId, selectedDate]);

  const handleClearDraft = useCallback(() => {
    clear();
    setForm(emptyForm);
    setRestoredAt(null);
  }, [clear]);

  const handleFlush = useCallback(() => {
    flush();
    toast({ tone: 'success', title: 'Đã lưu bản nháp tạm' });
  }, [flush, toast]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/daily-reports', { reportDate: selectedDate, ...form });
      clearDraft(userId, selectedDate);
      toast({ tone: 'success', title: 'Đã gửi báo cáo' });
      onSubmitted?.();
      onClose();
    } catch (err: any) {
      toast({ tone: 'error', title: err.message ?? 'Không thể gửi báo cáo' });
    } finally {
      setSubmitting(false);
    }
  };

  const update = (key: keyof FormState) => (e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(f => ({ ...f, [key]: e.target.value }));

  const prettyDate = (() => {
    try { return format(parseISO(selectedDate), 'dd/MM/yyyy'); } catch { return selectedDate; }
  })();

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Báo cáo hằng ngày"
      description={`Ngày ${prettyDate}`}
      icon={<FileText />}
      size="lg"
      submitLabel="Gửi báo cáo"
      isSubmitting={submitting}
      footerLeft={
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={handleFlush} disabled={submitting} iconLeft={<Save />}>Lưu nháp</Button>
          {available && savedAt && <span className="text-[length:var(--text-caption)] text-on-surface-variant">Đã lưu lúc {format(new Date(savedAt), 'HH:mm')}</span>}
        </div>
      }
    >
      <DateField
        label="Báo cáo cho ngày"
        value={selectedDate}
        min={minDateStr}
        max={maxDateStr}
        onChange={(v) => setSelectedDate(v)}
      />
      {restoredAt && <DraftRestoredBanner savedAt={restoredAt} onClear={handleClearDraft} />}
      <TextareaField label="Hôm qua đã làm gì?" value={form.completedYesterday} onChange={update('completedYesterday')} />
      <TextareaField label="Đang làm dở gì?" value={form.doingYesterday} onChange={update('doingYesterday')} />
      <TextareaField label="Có gì cản trở?" value={form.blockers} onChange={update('blockers')} />
      <TextareaField label="Hôm nay định làm gì?" value={form.planToday} onChange={update('planToday')} />
    </FormDialog>
  );
}

function TextareaField({ label, value, onChange }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[length:var(--text-label)] font-medium text-on-surface-variant">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        rows={4}
        className="w-full min-h-[112px] max-h-[420px] resize-y rounded-input border border-outline-variant bg-surface-container-lowest p-3 text-[length:var(--text-body)] leading-relaxed text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none"
      />
    </div>
  );
}

function DateField({ label, value, min, max, onChange }: { label: string; value: string; min?: string; max?: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-2 text-[length:var(--text-label)] font-medium text-on-surface-variant">
        <Calendar className="h-3.5 w-3.5" />
        {label}
      </label>
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="w-full max-w-[220px] rounded-input border border-outline-variant bg-surface-container-lowest p-3 text-[length:var(--text-body)] text-on-surface focus:border-primary focus:outline-none"
      />
    </div>
  );
}

DailyReportFormDialog.displayName = 'DailyReportFormDialog';
