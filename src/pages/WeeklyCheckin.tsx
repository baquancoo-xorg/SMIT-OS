import { useEffect, useMemo, useState } from 'react';
import { Plus, CalendarCheck2, ClipboardCheck, Zap, Eye, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { WeeklyReport, KrCheckin, WeeklyPriority } from '../types';
import WeeklyCheckinModal from '../components/workspace/execution/checkin/WeeklyCheckinModal';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { EmptyState } from '../components/ui/empty-state';
import { GlassCard } from '../components/ui/glass-card';
import { KpiCard } from '../components/ui/kpi-card';
import { Modal } from '../components/ui/modal';
import { PageSectionStack } from '../components/ui/page-section-stack';
import { PageToolbar } from '../components/ui/page-toolbar';
import { SortableTh } from '../components/ui/sortable-th';
import { TableShell } from '../components/ui/table-shell';
import type { SortableValue } from '../components/ui/use-sortable-data';
import { useSortableData } from '../components/ui/use-sortable-data';
import { getTableContract } from '../components/ui/table-contract';

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

type SortKey = 'reporter' | 'week' | 'status' | 'createdAt';

const accessor = (row: WeeklyReport, key: SortKey): SortableValue => {
  switch (key) {
    case 'reporter':
      return row.user?.fullName ?? '';
    case 'week':
      return row.weekEnding;
    case 'status':
      return row.status;
    case 'createdAt':
      return new Date(row.createdAt);
    default:
      return null;
  }
};

/**
 * WeeklyCheckin v2 — Phase 6 medium pages migration.
 *
 * Token-driven shell:
 *  - PageHeader (italic accent + breadcrumb)
 *  - KpiCard for review/approved stats
 *  - TableShell variant="standard" + useSortableData (replaces DataTable v2)
 *  - WeeklyCheckinModal v1 reused for create flow (multi-step KR + priorities + risks)
 *  - v2 Modal for detail view
 *
 * Approve gated by admin (matches v1 + backend RBAC.adminOnly).
 */
export default function WeeklyCheckinV2() {
  const { currentUser, setCurrentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveComment, setApproveComment] = useState('');
  const [approving, setApproving] = useState(false);

  const canApprove = !!currentUser?.isAdmin;

  // Reset comment khi đổi report.
  useEffect(() => {
    setApproveComment('');
  }, [selectedReport?.id]);

  function handleSessionExpired() {
    setCurrentUser(null);
    alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    window.location.href = '/login';
  }

  async function fetchReports() {
    setLoading(true);
    try {
      const res = await fetch('/api/reports', { credentials: 'include' });
      if (res.status === 401) {
        handleSessionExpired();
        return;
      }
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
    const comment = approveComment.trim();
    if (!comment) {
      alert('Vui lòng nhập nhận xét trước khi duyệt.');
      return;
    }
    setApproving(true);
    try {
      const res = await fetch(`/api/reports/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ comment }),
      });
      if (res.status === 401) {
        handleSessionExpired();
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Approve thất bại: ${err.error || res.status}`);
        return;
      }
      await fetchReports();
      setApproveComment('');
      setSelectedReport(null);
    } catch (err) {
      console.error(err);
    } finally {
      setApproving(false);
    }
  }

  const { sorted, sortKey, sortDir, toggleSort } = useSortableData<WeeklyReport, SortKey>(
    reports,
    'createdAt',
    'desc',
    accessor,
  );

  const contract = getTableContract('standard');
  const parsed = selectedReport ? parseReport(selectedReport) : null;

  return (
    <PageSectionStack>
      <PageToolbar
        right={<Button variant="primary" size="sm" iconLeft={<Plus />} onClick={() => setIsModalOpen(true)}>Create Check-in</Button>}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <KpiCard label="Total" value={stats.total} icon={<CalendarCheck2 />} accent="primary" />
        <KpiCard label="Pending review" value={stats.review} icon={<ClipboardCheck />} accent="warning" decorative={stats.review > 0} />
        <KpiCard label="Approved" value={stats.approved} icon={<Zap />} accent="success" />
        <KpiCard label="Mine" value={stats.myReports} icon={<Target />} accent="info" />
      </div>

      <GlassCard variant="surface" padding="none">
        <TableShell variant="standard" className="bg-transparent border-0 shadow-none rounded-none">
          <thead>
            <tr className={`${contract.headerRow}`}>
              <SortableTh<SortKey>
                sortKey="reporter"
                current={sortKey}
                dir={sortDir}
                onClick={toggleSort}
                className={`${contract.headerCell} sticky top-0 z-20 bg-surface`}
              >
                Reporter
              </SortableTh>
              <SortableTh<SortKey>
                sortKey="week"
                current={sortKey}
                dir={sortDir}
                onClick={toggleSort}
                className={`${contract.headerCell} sticky top-0 z-20 bg-surface`}
              >
                Week
              </SortableTh>
              <SortableTh<SortKey>
                sortKey="status"
                current={sortKey}
                dir={sortDir}
                onClick={toggleSort}
                className={`${contract.headerCell} sticky top-0 z-20 bg-surface`}
              >
                Status
              </SortableTh>
              <SortableTh<SortKey>
                sortKey="createdAt"
                current={sortKey}
                dir={sortDir}
                onClick={toggleSort}
                className={`${contract.headerCell} sticky top-0 z-20 bg-surface hidden md:table-cell`}
              >
                Created
              </SortableTh>
              <th className={`${contract.actionHeaderCell} sticky top-0 z-20 bg-surface`}>Actions</th>
            </tr>
          </thead>
          <tbody className={contract.body}>
            {loading && (
              <tr>
                <td colSpan={5} className={contract.emptyState}>
                  <p className="font-bold uppercase tracking-widest animate-pulse text-on-surface-variant">Loading...</p>
                </td>
              </tr>
            )}

            {!loading && sorted.length === 0 && (
              <tr>
                <td colSpan={5} className="p-0">
                  <EmptyState
                    icon={<CalendarCheck2 />}
                    title="Chưa có check-in"
                    description="Tạo check-in đầu tiên để cập nhật tiến độ KR + priorities tuần này."
                    decorative
                    variant="inline"
                  />
                </td>
              </tr>
            )}

            {!loading && sorted.map((r) => {
              const we = new Date(r.weekEnding);
              return (
                <tr
                  key={r.id}
                  className={`${contract.row} cursor-pointer`}
                  onClick={() => setSelectedReport(r)}
                >
                  <td className={`${contract.cell} font-semibold text-on-surface`}>
                    {r.user?.fullName ?? 'Unknown'}
                  </td>
                  <td className={contract.cell}>
                    W{getWeekNumber(we)} · {we.toLocaleDateString('vi-VN')}
                  </td>
                  <td className={contract.cell}>
                    <Badge variant={r.status === 'Approved' ? 'success' : 'warning'}>
                      {r.status === 'Approved' ? 'Approved' : 'Review'}
                    </Badge>
                  </td>
                  <td className={`${contract.cell} hidden md:table-cell text-on-surface-variant`}>
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
              );
            })}
          </tbody>
        </TableShell>
      </GlassCard>

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
                disabled={!approveComment.trim() || approving}
              >
                {approving ? 'Đang duyệt...' : 'Duyệt'}
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

            {/* Đã duyệt → hiện nhận xét read-only */}
            {selectedReport?.status === 'Approved' && selectedReport.approvalComment && (
              <Section title={`Nhận xét từ ${selectedReport.approver?.fullName ?? 'admin'}`}>
                <p className="whitespace-pre-wrap text-[length:var(--text-body-sm)] text-on-surface">
                  {selectedReport.approvalComment}
                </p>
              </Section>
            )}

            {/* Admin đang review → textarea bắt buộc */}
            {canApprove && selectedReport?.status === 'Review' && (
              <label className="flex flex-col gap-2">
                <span className="flex items-center gap-2 text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">
                  <span className="text-primary">★</span>
                  Nhận xét (bắt buộc)
                </span>
                <textarea
                  value={approveComment}
                  onChange={(e) => setApproveComment(e.target.value)}
                  placeholder="Nhập nhận xét của bạn trước khi duyệt..."
                  className="min-h-[100px] w-full resize-y rounded-input border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-[length:var(--text-body)] text-on-surface placeholder:text-on-surface-variant/60 focus-visible:outline-none focus-visible:border-primary transition-colors motion-fast ease-standard"
                />
              </label>
            )}
          </div>
        )}
      </Modal>
    </PageSectionStack>
  );
}
