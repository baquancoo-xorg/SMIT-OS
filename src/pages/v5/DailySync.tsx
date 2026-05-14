import { useMemo, useState } from 'react';
import { format, isToday, parseISO } from 'date-fns';
import { CalendarCheck, Users, History, FileText, BadgeCheck, Search, Filter, CheckCircle2, Clock3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDailyReportsQuery, useInvalidateDailyReports } from '../../hooks/use-daily-reports';
import { Button, Card, EmptyState, PageSectionStack, PageToolbar, Skeleton, Badge, KpiCard, Input } from '../../components/v5/ui';
import { DailyReportFormDialog } from '../../components/v5/execution/daily-report-form-dialog';
import { DailyReportDetailModal, type DailyReportData } from '../../components/v5/execution/daily-report-detail-modal';
import type { DailyReport } from '../../types';

interface SubmissionStatus {
  label: string;
  detail: string;
  type: 'early' | 'ontime' | 'late';
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const hours = Math.floor(min / 60);
  const mins = min % 60;
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
}

function getSubmissionStatus(dateStr: string): SubmissionStatus {
  const d = new Date(dateStr);
  const totalMin = d.getHours() * 60 + d.getMinutes();
  const WINDOW_START = 18 * 60 + 30;
  const CUTOFF = 10 * 60;

  if (totalMin >= WINDOW_START) {
    const minutesEarly = (24 * 60 - totalMin) + CUTOFF;
    return { label: 'Early', detail: `${formatMinutes(minutesEarly)} early`, type: 'early' };
  }
  if (totalMin < CUTOFF) {
    const minutesEarly = CUTOFF - totalMin;
    return { label: 'Early', detail: `${formatMinutes(minutesEarly)} early`, type: 'early' };
  }
  if (totalMin === CUTOFF) {
    return { label: 'On Time', detail: '', type: 'ontime' };
  }
  const minutesLate = totalMin - CUTOFF;
  return { label: 'Late', detail: `+${formatMinutes(minutesLate)}`, type: 'late' };
}

function SubmissionBadge({ createdAt }: { createdAt: string }) {
  const { label, detail, type } = getSubmissionStatus(createdAt);
  const variant = type === 'early' ? 'info' : type === 'ontime' ? 'success' : 'error';
  return (
    <div className="flex flex-col gap-0.5">
      <Badge variant={variant} size="sm">{label}</Badge>
      {detail && <span className="text-[length:var(--text-caption)] text-on-surface-variant">{detail}</span>}
    </div>
  );
}

function ReportStatusBadge({ status }: { status: string }) {
  const approved = status === 'Approved';
  return approved ? (
    <Badge variant="success" size="sm">
      <span className="inline-flex items-center gap-1">
        <CheckCircle2 className="size-3" />
        Approved
      </span>
    </Badge>
  ) : (
    <Badge variant="warning" size="sm">
      <span className="inline-flex items-center gap-1">
        <Clock3 className="size-3" />
        Pending review
      </span>
    </Badge>
  );
}

export default function DailySyncV5() {
  const { currentUser } = useAuth();
  const isAdmin = !!currentUser?.isAdmin;
  const today = format(new Date(), 'yyyy-MM-dd');
  const [formOpen, setFormOpen] = useState(false);
  const [detailReport, setDetailReport] = useState<DailyReportData | null>(null);
  const [query, setQuery] = useState('');
  const invalidate = useInvalidateDailyReports();

  const { data: reports = [], isLoading } = useDailyReportsQuery();

  const visibleReports = useMemo(() => {
    const scoped = isAdmin ? reports : reports.filter((r) => r.userId === currentUser?.id);
    const filtered = query.trim()
      ? scoped.filter((r) => {
          const q = query.toLowerCase();
          return (
            r.user?.fullName?.toLowerCase().includes(q) ||
            format(parseISO(r.reportDate), 'dd/MM/yyyy').includes(q) ||
            format(parseISO(r.createdAt), 'HH:mm dd/MM/yyyy').includes(q) ||
            r.status.toLowerCase().includes(q)
          );
        })
      : scoped;

    return [...filtered].sort((a, b) => {
      const reportDateDiff = new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime();
      if (reportDateDiff !== 0) return reportDateDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [reports, currentUser?.id, isAdmin, query]);

  const stats = useMemo(() => {
    const todayStr = today;
    const submittedToday = visibleReports.filter((r) => r.reportDate.startsWith(todayStr)).length;
    const reviewing = visibleReports.filter((r) => r.status === 'Review').length;
    const approved = visibleReports.filter((r) => r.status === 'Approved').length;
    const lateToday = visibleReports
      .filter((r) => r.reportDate.startsWith(todayStr))
      .filter((r) => getSubmissionStatus(r.createdAt).type === 'late').length;
    return { submittedToday, reviewing, approved, lateToday };
  }, [visibleReports, today]);

  const openDetail = (r: DailyReport) => setDetailReport(r as DailyReportData);

  return (
    <PageSectionStack className="flex h-full min-h-0 flex-col">
      <PageToolbar
        left={
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[240px] flex-1 sm:flex-none sm:w-64">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search reports"
                iconLeft={<Search />}
                containerClassName="w-full"
                size="sm"
              />
            </div>
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-input border border-outline-variant bg-surface-container-lowest px-3 text-[length:var(--text-body-sm)] text-on-surface transition-colors hover:border-primary focus-visible:outline-none"
              aria-label="Open filters"
            >
              <Filter className="size-3.5" />
              <span className="font-medium">Filters</span>
            </button>
          </div>
        }
        right={
          <Button
            variant="primary"
            size="sm"
            className="h-8 text-[length:var(--text-body-sm)]"
            onClick={() => setFormOpen(true)}
            iconLeft={<FileText />}
          >Create Daily Report</Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <KpiCard label="Submitted today" value={stats.submittedToday} icon={<CalendarCheck />} accent="primary" />
        <KpiCard label="Pending review" value={stats.reviewing} icon={<BadgeCheck />} accent="warning" decorative={stats.reviewing > 0} />
        <KpiCard label="Approved" value={stats.approved} icon={<Users />} accent="success" />
        <KpiCard label="Late today" value={stats.lateToday} icon={<History />} accent="error" decorative={stats.lateToday > 0} />
      </div>

      <div className="flex-1 min-h-0">
        {isLoading ? (
          <Card><Skeleton className="h-32" /></Card>
        ) : visibleReports.length === 0 ? (
          <EmptyState
            icon={<CalendarCheck />}
            title="No reports available"
            description={isAdmin ? 'No daily reports have been submitted yet' : 'You have not submitted any reports yet'}
            actions={<Button variant="primary" onClick={() => setFormOpen(true)} iconLeft={<FileText />}>Create Report Now</Button>}
            decorative
          />
        ) : (
          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-card border border-outline-variant/30 bg-surface shadow-elevated">
            <div className="flex-1 min-h-0 overflow-hidden">
              <div className="h-full overflow-auto custom-scrollbar">
                <table className="w-full text-[length:var(--text-body-sm)]">
                  <thead className="sticky top-0 z-20 border-b border-outline-variant/40 bg-surface-container-low/90 backdrop-blur-sm">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left font-medium text-on-surface-variant">Member</th>
                      <th scope="col" className="px-4 py-3 text-left font-medium text-on-surface-variant">Báo cáo vào ngày</th>
                      <th scope="col" className="px-4 py-3 text-left font-medium text-on-surface-variant">Report Status</th>
                      <th scope="col" className="px-4 py-3 text-left font-medium text-on-surface-variant">Submission</th>
                      <th scope="col" className="px-4 py-3 text-left font-medium text-on-surface-variant">Submitted at</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {visibleReports.map((report) => (
                      <tr key={report.id} className="cursor-pointer hover:bg-surface-container-low/30" onClick={() => openDetail(report)}>
                        <td className="px-4 py-3 text-on-surface">{report.user?.fullName ?? '—'}</td>
                        <td className="px-4 py-3 text-on-surface">{format(parseISO(report.reportDate), 'dd/MM/yyyy')}</td>
                        <td className="px-4 py-3">
                          <ReportStatusBadge status={report.status} />
                        </td>
                        <td className="px-4 py-3">
                          <SubmissionBadge createdAt={report.createdAt} />
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">{format(parseISO(report.createdAt), 'HH:mm dd/MM/yyyy')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <DailyReportFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        userId={currentUser?.id ?? ''}
        reportDate={today}
        onSubmitted={() => {
          setFormOpen(false);
          invalidate();
        }}
      />
      <DailyReportDetailModal
        open={!!detailReport}
        onClose={() => setDetailReport(null)}
        report={detailReport}
        currentUserId={currentUser?.id ?? ''}
        isAdmin={isAdmin}
        onApproved={() => {
          setDetailReport(null);
          invalidate();
        }}
      />
    </PageSectionStack>
  );
}
