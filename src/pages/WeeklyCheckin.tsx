import { useEffect, useMemo, useState } from 'react';
import { Plus, CalendarCheck2, ClipboardCheck, AlertTriangle, HelpCircle, Zap, Eye, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { WeeklyReport, KrCheckin, WeeklyPriority } from '../types';
import WeeklyCheckinModal from '../components/modals/WeeklyCheckinModal';
import {
  PageHeader,
  Button,
  Badge,
  EmptyState,
  KpiCard,
  Modal,
  DataTable,
} from '../components/ui/v2';
import type { DataTableColumn } from '../components/ui/v2';

interface ParsedReport {
  krProgress: KrCheckin[];
  priorities: WeeklyPriority[];
  topThree: string[];
  risks: string;
  helpNeeded: string;
}

function safeParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function parseReport(report: WeeklyReport): ParsedReport {
  const kr = safeParse<KrCheckin[]>(report.krProgress, []);
  const progress = safeParse<{ priorities: WeeklyPriority[] }>(report.progress, { priorities: [] });
  const plans = safeParse<{ topThree: string[] }>(report.plans, { topThree: [] });
  const blockers = safeParse<{ risks: string; helpNeeded: string }>(report.blockers, { risks: '', helpNeeded: '' });
  return {
    krProgress: kr,
    priorities: progress.priorities ?? [],
    topThree: plans.topThree ?? [],
    risks: blockers.risks ?? '',
    helpNeeded: blockers.helpNeeded ?? '',
  };
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

interface SectionProps {
  title: string;
  tone?: 'default' | 'warning' | 'help';
  children: React.ReactNode;
}

function Section({ title, tone = 'default', children }: SectionProps) {
  const bg =
    tone === 'warning'
      ? 'bg-warning-container/30 border-warning/30'
      : tone === 'help'
        ? 'bg-info-container/30 border-info/30'
        : 'bg-surface-container-low border-outline-variant/40';
  return (
    <div className={`${bg} rounded-card border p-4`}>
      <h3 className="mb-3 text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">
        {title}
      </h3>
      {children}
    </div>
  );
}

function EmptyMark() {
  return <p className="text-[length:var(--text-body-sm)] italic text-on-surface-variant">(trống)</p>;
}

/**
 * WeeklyCheckin v2 — Phase 6 medium pages migration.
 *
 * Token-driven shell:
 *  - PageHeader (italic accent + breadcrumb)
 *  - KpiCard for review/approved stats
 *  - DataTable for list (reuses parsed week info)
 *  - WeeklyCheckinModal v1 reused for create flow (multi-step KR + priorities + risks)
 *  - v2 Modal for detail view
 *
 * Approve gated by admin (matches v1 + backend RBAC.adminOnly).
 */
export default function WeeklyCheckinV2() {
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);

  const canApprove = !!currentUser?.isAdmin;

  async function fetchReports() {
    setLoading(true);
    try {
      const res = await fetch('/api/reports', { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setReports(await res.json());
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReports();
  }, []);

  const stats = useMemo(() => {
    const review = reports.filter((r) => r.status === 'Review').length;
    const approved = reports.filter((r) => r.status === 'Approved').length;
    const myReports = reports.filter((r) => r.userId === currentUser?.id).length;
    return { review, approved, myReports, total: reports.length };
  }, [reports, currentUser]);

  async function handleApprove(id: string) {
    try {
      const res = await fetch(`/api/reports/${id}/approve`, { method: 'POST', credentials: 'include' });
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

  const sortedReports = useMemo(
    () => [...reports].sort((a, b) => new Date(b.weekEnding).getTime() - new Date(a.weekEnding).getTime()),
    [reports],
  );

  const columns: DataTableColumn<WeeklyReport>[] = [
    {
      key: 'reporter',
      label: 'Reporter',
      sortable: true,
      sort: (a, b) => (a.user?.fullName ?? '').localeCompare(b.user?.fullName ?? ''),
      render: (r) => <span className="font-semibold text-on-surface">{r.user?.fullName ?? 'Unknown'}</span>,
    },
    {
      key: 'week',
      label: 'Week',
      sortable: true,
      sort: (a, b) => new Date(a.weekEnding).getTime() - new Date(b.weekEnding).getTime(),
      render: (r) => {
        const we = new Date(r.weekEnding);
        return <span>W{getWeekNumber(we)} · {we.toLocaleDateString('vi-VN')}</span>;
      },
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
      key: 'createdAt',
      label: 'Created',
      hideBelow: 'md',
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

  const parsed = selectedReport ? parseReport(selectedReport) : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: 'Cadence' }, { label: 'Weekly Check-in' }]}
        title="Weekly "
        accent="Check-in"
        description="5-block Wodtke: KR confidence + priorities + top 3 + risks + help."
        actions={
          <Button variant="primary" iconLeft={<Plus />} onClick={() => setIsModalOpen(true)}>
            New check-in
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <KpiCard label="Total" value={stats.total} icon={<CalendarCheck2 />} accent="primary" />
        <KpiCard label="Pending review" value={stats.review} icon={<ClipboardCheck />} accent="warning" decorative={stats.review > 0} />
        <KpiCard label="Approved" value={stats.approved} icon={<Zap />} accent="success" />
        <KpiCard label="Mine" value={stats.myReports} icon={<Target />} accent="info" />
      </div>

      <DataTable<WeeklyReport>
        label="Weekly check-ins"
        data={sortedReports}
        columns={columns}
        rowKey={(r) => r.id}
        loading={loading}
        density="comfortable"
        onRowClick={(r) => setSelectedReport(r)}
        empty={
          <EmptyState
            icon={<CalendarCheck2 />}
            title="Chưa có check-in"
            description="Tạo check-in đầu tiên để cập nhật tiến độ KR + priorities tuần này."
            actions={
              <Button variant="primary" iconLeft={<Plus />} onClick={() => setIsModalOpen(true)}>
                Create check-in
              </Button>
            }
            decorative
            variant="inline"
          />
        }
      />

      {/* Reuse v1 form modal — multi-step KR loading + priorities is non-trivial; defer rewrite. */}
      <WeeklyCheckinModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchReports}
      />

      {/* Detail modal — v2 */}
      <Modal
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title={selectedReport?.user?.fullName ?? 'Check-in'}
        description={
          selectedReport
            ? `Week ending ${new Date(selectedReport.weekEnding).toLocaleDateString('vi-VN')} · ${selectedReport.status}`
            : undefined
        }
        icon={<CalendarCheck2 />}
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
        {parsed && (
          <div className="flex flex-col gap-4">
            <Section title="① OKR Check-in">
              {parsed.krProgress.length === 0 ? (
                <EmptyMark />
              ) : (
                <ul className="flex flex-col gap-2">
                  {parsed.krProgress.map((c, i) => {
                    const variant = c.confidence0to10 >= 7 ? 'success' : c.confidence0to10 >= 4 ? 'warning' : 'error';
                    return (
                      <li
                        key={i}
                        className="flex flex-col gap-1 rounded-card border border-outline-variant/40 bg-surface-container-lowest p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[length:var(--text-body-sm)] font-medium text-on-surface">
                            KR: {c.krId.slice(0, 8)}…
                          </span>
                          <Badge variant={variant}>{c.confidence0to10}/10</Badge>
                        </div>
                        <p className="text-[length:var(--text-body-sm)] text-on-surface-variant">
                          Current: {c.currentValue}
                        </p>
                        {c.note && (
                          <p className="text-[length:var(--text-body-sm)] italic text-on-surface-variant">{c.note}</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Section>

            <Section title="② Ưu tiên tuần trước">
              {parsed.priorities.length === 0 ? (
                <EmptyMark />
              ) : (
                <ul className="flex flex-col gap-1.5 text-[length:var(--text-body-sm)]">
                  {parsed.priorities.map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <input type="checkbox" checked={p.done} readOnly className="mt-1 accent-primary" />
                      <span className={p.done ? 'text-on-surface-variant line-through' : 'text-on-surface'}>{p.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title="③ Top 3 ưu tiên tuần tới">
              {parsed.topThree.length === 0 ? (
                <EmptyMark />
              ) : (
                <ol className="ml-5 list-decimal space-y-1 text-[length:var(--text-body-sm)] text-on-surface">
                  {parsed.topThree.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ol>
              )}
            </Section>

            <Section title="④ Rủi ro & Blockers" tone="warning">
              {parsed.risks ? (
                <p className="whitespace-pre-wrap text-[length:var(--text-body-sm)] text-on-surface">{parsed.risks}</p>
              ) : (
                <EmptyMark />
              )}
            </Section>

            <Section title="⑤ Cần hỗ trợ" tone="help">
              {parsed.helpNeeded ? (
                <p className="whitespace-pre-wrap text-[length:var(--text-body-sm)] text-on-surface">{parsed.helpNeeded}</p>
              ) : (
                <EmptyMark />
              )}
            </Section>

            <span className="sr-only">
              <HelpCircle aria-hidden="true" />
              <AlertTriangle aria-hidden="true" />
            </span>
          </div>
        )}
      </Modal>
    </div>
  );
}
