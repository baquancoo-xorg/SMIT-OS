import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Plus, Calendar, CheckCircle, ListChecks, AlertTriangle, Target, Zap, Eye, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { DailyReport } from '../types';
import {
  PageHeader,
  Button,
  Badge,
  GlassCard,
  EmptyState,
  KpiCard,
  Modal,
  FormDialog,
  DataTable,
} from '../components/ui/v2';
import type { DataTableColumn } from '../components/ui/v2';

function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

interface SubmissionStatus {
  label: string;
  detail: string;
  type: 'early' | 'ontime' | 'late';
}

function getSubmissionStatus(dateStr: string): SubmissionStatus {
  const d = new Date(dateStr);
  const totalMinutes = d.getHours() * 60 + d.getMinutes();
  const windowStart = 8 * 60 + 30;
  const windowEnd = 10 * 60;
  if (totalMinutes < windowStart) {
    const diff = windowStart - totalMinutes;
    return { label: 'Early', detail: `${diff} min early`, type: 'early' };
  }
  if (totalMinutes <= windowEnd) {
    return { label: 'On Time', detail: '', type: 'ontime' };
  }
  const diff = totalMinutes - windowEnd;
  return { label: 'Late', detail: `+${diff} min`, type: 'late' };
}

function SubmissionBadge({ createdAt }: { createdAt: string }) {
  const { label, detail, type } = getSubmissionStatus(createdAt);
  const variant = type === 'early' ? 'info' : type === 'ontime' ? 'success' : 'error';
  return (
    <div className="flex flex-col gap-0.5">
      <Badge variant={variant} size="sm">
        {label}
      </Badge>
      {detail && <span className="text-[length:var(--text-caption)] text-on-surface-variant">{detail}</span>}
    </div>
  );
}

interface FormState {
  reportDate: string;
  completedYesterday: string;
  doingYesterday: string;
  blockers: string;
  planToday: string;
}

const EMPTY_FORM: FormState = {
  reportDate: todayIso(),
  completedYesterday: '',
  doingYesterday: '',
  blockers: '',
  planToday: '',
};

interface FormBlockProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  tone?: 'default' | 'warning';
}

function FormBlock({ icon, label, value, onChange, placeholder, tone = 'default' }: FormBlockProps) {
  const tone_bg =
    tone === 'warning'
      ? 'bg-warning-container/40 border-warning/40 focus-visible:border-warning'
      : 'bg-surface-container-lowest border-outline-variant focus-visible:border-primary';
  return (
    <label className="flex flex-col gap-2">
      <span className="flex items-center gap-2 text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">
        <span className="text-primary [&>svg]:size-4">{icon}</span>
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={[
          'min-h-[120px] w-full resize-y rounded-input border px-3 py-2.5 text-[length:var(--text-body)] text-on-surface',
          'transition-colors motion-fast ease-standard',
          'placeholder:text-on-surface-variant/60',
          'focus-visible:outline-none',
          tone_bg,
        ].join(' ')}
      />
    </label>
  );
}

function DetailBlock({ title, body, tone = 'default' }: { title: string; body: string; tone?: 'default' | 'warning' }) {
  const bg = tone === 'warning' ? 'bg-warning-container/30 border-warning/30' : 'bg-surface-container-low border-outline-variant/40';
  return (
    <div className={`${bg} rounded-card border p-4`}>
      <h3 className="mb-2 text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">
        {title}
      </h3>
      <p className="whitespace-pre-wrap text-[length:var(--text-body-sm)] text-on-surface">
        {body || <span className="italic text-on-surface-variant">(trống)</span>}
      </p>
    </div>
  );
}

/**
 * DailySync v2 — Phase 6 medium pages migration.
 *
 * Mobile critical (daily checkin). Token-driven shell with v2 primitives:
 *  - PageHeader (italic accent + breadcrumb)
 *  - KpiCard for status overview
 *  - DataTable for list view (sortable, mobile-responsive via `hideBelow`)
 *  - FormDialog for create flow
 *  - Modal for detail view
 *  - Badge for status / submission state
 *
 * Approve gated by admin (matches v1 + backend RBAC.adminOnly).
 */
export default function DailySyncV2() {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const canApprove = !!currentUser?.isAdmin;

  async function fetchReports() {
    setLoading(true);
    try {
      const res = await fetch('/api/daily-reports', { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setReports(await res.json());
    } catch (err) {
      console.error('Failed to load daily reports:', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReports();
  }, []);

  const sortedReports = useMemo(
    () => [...reports].sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()),
    [reports],
  );

  const stats = useMemo(() => {
    const todayStr = todayIso();
    const submittedToday = reports.filter((r) => r.reportDate.startsWith(todayStr)).length;
    const reviewing = reports.filter((r) => r.status === 'Review').length;
    const approved = reports.filter((r) => r.status === 'Approved').length;
    const lateToday = reports
      .filter((r) => r.reportDate.startsWith(todayStr))
      .filter((r) => getSubmissionStatus(r.createdAt).type === 'late').length;
    return { submittedToday, reviewing, approved, lateToday };
  }, [reports]);

  function openForm() {
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitting(true);
    try {
      const payload = { userId: currentUser.id, ...form };
      const res = await fetch('/api/daily-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Lỗi: ${err.error || 'Submit thất bại'}`);
        return;
      }
      setIsFormOpen(false);
      await fetchReports();
    } catch (err) {
      console.error(err);
      alert('Submit thất bại. Thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApprove(id: string) {
    try {
      const res = await fetch(`/api/daily-reports/${id}/approve`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Approve thất bại: ${err.error || res.status}`);
        return;
      }
      await fetchReports();
      setSelectedReport(null);
    } catch (err) {
      console.error(err);
    }
  }

  const columns: DataTableColumn<DailyReport>[] = [
    {
      key: 'reporter',
      label: 'Reporter',
      sortable: true,
      sort: (a, b) => (a.user?.fullName ?? '').localeCompare(b.user?.fullName ?? ''),
      render: (r) => <span className="font-semibold text-on-surface">{r.user?.fullName ?? 'Unknown'}</span>,
    },
    {
      key: 'reportDate',
      label: 'Date',
      sortable: true,
      sort: (a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime(),
      render: (r) => new Date(r.reportDate).toLocaleDateString('vi-VN'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <Badge variant={r.status === 'Approved' ? 'success' : 'warning'}>
          {r.status === 'Approved' ? 'Approved' : 'Review'}
        </Badge>
      ),
    },
    {
      key: 'submission',
      label: 'Submission',
      hideBelow: 'md',
      render: (r) => <SubmissionBadge createdAt={r.createdAt} />,
    },
    {
      key: 'createdAt',
      label: 'Created',
      hideBelow: 'lg',
      sortable: true,
      sort: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (r) => new Date(r.createdAt).toLocaleString('vi-VN'),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      width: 'w-20',
      render: (r) => (
        <Button
          variant="ghost"
          size="sm"
          iconLeft={<Eye />}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedReport(r);
          }}
          aria-label="View report"
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: 'Cadence' }, { label: 'Daily Sync' }]}
        title="Daily "
        accent="Sync"
        description="Báo cáo 4 mục mỗi ngày: hoàn thành, đang làm, blocker, kế hoạch."
        actions={
          <Button variant="primary" iconLeft={<Plus />} onClick={openForm}>
            New report
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <KpiCard label="Submitted today" value={stats.submittedToday} icon={<Sun />} accent="primary" />
        <KpiCard label="Pending review" value={stats.reviewing} icon={<Moon />} accent="warning" decorative={stats.reviewing > 0} />
        <KpiCard label="Approved" value={stats.approved} icon={<CheckCircle />} accent="success" />
        <KpiCard label="Late today" value={stats.lateToday} icon={<AlertTriangle />} accent="error" decorative={stats.lateToday > 0} />
      </div>

      <DataTable<DailyReport>
        label="Daily reports"
        data={sortedReports}
        columns={columns}
        rowKey={(r) => r.id}
        loading={loading}
        density="comfortable"
        onRowClick={(r) => setSelectedReport(r)}
        empty={
          <EmptyState
            icon={<Calendar />}
            title="Chưa có báo cáo"
            description="Bắt đầu bằng cách tạo báo cáo hằng ngày đầu tiên."
            actions={
              <Button variant="primary" iconLeft={<Plus />} onClick={openForm}>
                Create report
              </Button>
            }
            decorative
            variant="inline"
          />
        }
      />

      {/* Submit form */}
      <FormDialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        title="Báo cáo hằng ngày"
        description="Điền 4 mục — system phát hiện early/on-time/late tự động."
        icon={<Calendar />}
        size="lg"
        submitLabel={submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
        cancelLabel="Huỷ"
        isSubmitting={submitting}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-[length:var(--text-label)] font-medium text-on-surface-variant">Ngày</span>
          <input
            type="date"
            value={form.reportDate}
            onChange={(e) => setForm({ ...form, reportDate: e.target.value })}
            className="h-10 rounded-input border border-outline-variant bg-surface-container-lowest px-3 text-[length:var(--text-body)] text-on-surface focus-visible:outline-none focus-visible:border-primary"
          />
        </label>

        <FormBlock
          icon={<CheckCircle />}
          label="① Hoàn thành hôm qua"
          value={form.completedYesterday}
          onChange={(v) => setForm({ ...form, completedYesterday: v })}
          placeholder="Liệt kê việc đã hoàn thành..."
        />

        <FormBlock
          icon={<ListChecks />}
          label="② Đang thực hiện hôm qua"
          value={form.doingYesterday}
          onChange={(v) => setForm({ ...form, doingYesterday: v })}
          placeholder="Việc còn dang dở, chưa xong..."
        />

        <FormBlock
          icon={<AlertTriangle />}
          label="③ Khó khăn / Vấn đề (kèm đề xuất)"
          value={form.blockers}
          onChange={(v) => setForm({ ...form, blockers: v })}
          placeholder="Blocker, rủi ro, yêu cầu hỗ trợ..."
          tone="warning"
        />

        <FormBlock
          icon={<Target />}
          label="④ Sẽ thực hiện hôm nay"
          value={form.planToday}
          onChange={(v) => setForm({ ...form, planToday: v })}
          placeholder="Plan cho ngày hôm nay..."
        />
      </FormDialog>

      {/* Detail modal */}
      <Modal
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title={selectedReport?.user?.fullName ?? 'Daily report'}
        description={
          selectedReport
            ? `${new Date(selectedReport.reportDate).toLocaleDateString('vi-VN')} · ${selectedReport.status}`
            : undefined
        }
        icon={<Calendar />}
        size="lg"
        footer={
          <>
            {canApprove && selectedReport?.status === 'Review' && (
              <Button
                variant="primary"
                iconLeft={<Zap />}
                onClick={() => selectedReport && handleApprove(selectedReport.id)}
              >
                Duyệt
              </Button>
            )}
            <Button variant="ghost" onClick={() => setSelectedReport(null)}>
              Đóng
            </Button>
          </>
        }
      >
        {selectedReport && (
          <div className="flex flex-col gap-4">
            <DetailBlock title="① Hoàn thành hôm qua" body={selectedReport.completedYesterday} />
            <DetailBlock title="② Đang thực hiện hôm qua" body={selectedReport.doingYesterday} />
            <DetailBlock title="③ Khó khăn / Vấn đề" body={selectedReport.blockers} tone="warning" />
            <DetailBlock title="④ Sẽ thực hiện hôm nay" body={selectedReport.planToday} />
          </div>
        )}
      </Modal>
    </div>
  );
}
