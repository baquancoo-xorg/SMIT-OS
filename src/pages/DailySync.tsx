import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Plus, Calendar, CheckCircle, ListChecks, AlertTriangle, Target, Zap, Eye, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { DailyReport } from '../types';
import {
  Button,
  Badge,
  GlassCard,
  EmptyState,
  KpiCard,
  Modal,
  FormDialog,
  TableShell,
  SortableTh,
  useSortableData,
  type SortableValue,
} from '../components/ui';
import { getTableContract } from '../components/ui/table-contract';

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

type SortKey = 'reporter' | 'date' | 'status' | 'submission' | 'createdAt';

const accessor = (row: DailyReport, key: SortKey): SortableValue => {
  switch (key) {
    case 'reporter':
      return row.user?.fullName ?? '';
    case 'date':
      return new Date(row.reportDate);
    case 'status':
      return row.status;
    case 'submission':
      return row.createdAt;
    case 'createdAt':
      return new Date(row.createdAt);
    default:
      return null;
  }
};

/**
 * DailySync v2 — Phase 6 medium pages migration.
 *
 * Mobile critical (daily checkin). Token-driven shell with v2 primitives:
 *  - PageHeader (italic accent + breadcrumb)
 *  - KpiCard for status overview
 *  - TableShell (inline) for list view — migrated from DataTable
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
  const contract = getTableContract('standard');

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

  const { sorted, sortKey, sortDir, toggleSort } = useSortableData<DailyReport, SortKey>(
    reports,
    'createdAt',
    'desc',
    accessor,
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


  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-headline text-[length:var(--text-h2)] font-bold leading-tight text-on-surface min-w-0">
          Daily <em className="font-medium text-primary italic">Sync</em>
        </h2>
        <Button variant="primary" size="sm" iconLeft={<Plus />} onClick={openForm}>
          New report
        </Button>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <KpiCard label="Submitted today" value={stats.submittedToday} icon={<Sun />} accent="primary" />
        <KpiCard label="Pending review" value={stats.reviewing} icon={<Moon />} accent="warning" decorative={stats.reviewing > 0} />
        <KpiCard label="Approved" value={stats.approved} icon={<CheckCircle />} accent="success" />
        <KpiCard label="Late today" value={stats.lateToday} icon={<AlertTriangle />} accent="error" decorative={stats.lateToday > 0} />
      </div>

      <GlassCard variant="surface" padding="none">
        <TableShell variant="standard" className="bg-transparent border-0 shadow-none rounded-none">
          <thead>
            <tr className={contract.headerRow}>
              <SortableTh<SortKey>
                sortKey="reporter"
                current={sortKey}
                dir={sortDir}
                onClick={toggleSort}
                className={`${contract.headerCell} sticky top-0 z-20 bg-white`}
              >
                Reporter
              </SortableTh>
              <SortableTh<SortKey>
                sortKey="date"
                current={sortKey}
                dir={sortDir}
                onClick={toggleSort}
                className={`${contract.headerCell} sticky top-0 z-20 bg-white`}
              >
                Date
              </SortableTh>
              <SortableTh<SortKey>
                sortKey="status"
                current={sortKey}
                dir={sortDir}
                onClick={toggleSort}
                className={`${contract.headerCell} sticky top-0 z-20 bg-white`}
              >
                Status
              </SortableTh>
              <SortableTh<SortKey>
                sortKey="submission"
                current={sortKey}
                dir={sortDir}
                onClick={toggleSort}
                className={`${contract.headerCell} sticky top-0 z-20 bg-white hidden md:table-cell`}
              >
                Submission
              </SortableTh>
              <SortableTh<SortKey>
                sortKey="createdAt"
                current={sortKey}
                dir={sortDir}
                onClick={toggleSort}
                className={`${contract.headerCell} sticky top-0 z-20 bg-white hidden lg:table-cell`}
              >
                Created
              </SortableTh>
              <th className={`${contract.actionHeaderCell} sticky top-0 z-20 bg-white`}>Actions</th>
            </tr>
          </thead>
          <tbody className={contract.body}>
            {loading ? (
              <tr>
                <td colSpan={6} className={contract.emptyState}>
                  <span className="text-on-surface-variant text-[length:var(--text-body-sm)]">Loading...</span>
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className={contract.emptyState}>
                  <EmptyState
                    icon={<Calendar />}
                    title="Chưa có báo cáo"
                    description="Bắt đầu bằng cách tạo báo cáo hằng ngày đầu tiên."
                    decorative
                    variant="inline"
                  />
                </td>
              </tr>
            ) : (
              sorted.map((r) => (
                <tr
                  key={r.id}
                  className={`${contract.row} cursor-pointer`}
                  onClick={() => setSelectedReport(r)}
                >
                  <td className={contract.cell}>
                    <span className="font-semibold text-on-surface">{r.user?.fullName ?? 'Unknown'}</span>
                  </td>
                  <td className={contract.cell}>
                    {new Date(r.reportDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className={contract.cell}>
                    <Badge variant={r.status === 'Approved' ? 'success' : 'warning'}>
                      {r.status === 'Approved' ? 'Approved' : 'Review'}
                    </Badge>
                  </td>
                  <td className={`${contract.cell} hidden md:table-cell`}>
                    <SubmissionBadge createdAt={r.createdAt} />
                  </td>
                  <td className={`${contract.cell} hidden lg:table-cell`}>
                    {new Date(r.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className={contract.actionCell}>
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </TableShell>
      </GlassCard>

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
