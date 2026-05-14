import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format, isToday, parseISO } from 'date-fns';
import { CalendarCheck, Users, History, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDailyReportsQuery, useInvalidateDailyReports } from '../../hooks/use-daily-reports';
import { Button, Card, EmptyState, PageSectionStack, PageToolbar, Skeleton, TabPill } from '../../components/v5/ui';
import type { TabPillItem } from '../../components/v5/ui';
import { DailyReportFormDialog } from '../../components/v5/execution/daily-report-form-dialog';
import { DailyReportDetailModal, type DailyReportData } from '../../components/v5/execution/daily-report-detail-modal';
import type { DailyReport } from '../../types';

type Tab = 'today' | 'team' | 'history';

const buildTabs = (isAdmin: boolean): TabPillItem<Tab>[] => [
  { value: 'today', label: 'Today', icon: <CalendarCheck /> },
  ...(isAdmin ? [{ value: 'team' as const, label: 'Team', icon: <Users /> }] : []),
  { value: 'history', label: 'History', icon: <History /> },
];

export default function DailySyncV5() {
  const { currentUser } = useAuth();
  const isAdmin = !!currentUser?.isAdmin;
  const today = format(new Date(), 'yyyy-MM-dd');
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') as Tab | null;
  const activeTab = rawTab === 'team' && !isAdmin ? 'today' : (rawTab ?? 'today');
  const [formOpen, setFormOpen] = useState(false);
  const [detailReport, setDetailReport] = useState<DailyReportData | null>(null);
  const tabs = useMemo(() => buildTabs(isAdmin), [isAdmin]);
  const invalidate = useInvalidateDailyReports();

  const { data: reports = [], isLoading } = useDailyReportsQuery();

  const myTodayReport = useMemo(() => reports.find(r => r.userId === currentUser?.id && isToday(parseISO(r.reportDate))), [reports, currentUser?.id]);
  const teamTodayReports = useMemo(() => reports.filter(r => isToday(parseISO(r.reportDate))), [reports]);
  const myHistory = useMemo(() => {
    const filtered = isAdmin ? reports : reports.filter(r => r.userId === currentUser?.id);
    return filtered.slice(0, 30);
  }, [reports, currentUser?.id, isAdmin]);

  const openDetail = (r: DailyReport) => setDetailReport(r as DailyReportData);

  function setActiveTab(next: Tab) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', next);
    setSearchParams(nextParams, { replace: true });
  }

  return (
    <PageSectionStack>
      <PageToolbar
        left={<TabPill<Tab> label="Daily sync tabs" value={activeTab} onChange={setActiveTab} items={tabs} size="page" />}
        right={<Button variant="primary" size="sm" className="h-8 text-[length:var(--text-body-sm)]" onClick={() => setFormOpen(true)} iconLeft={<FileText />} splitLabel={{ action: 'Create', object: 'Daily Report' }} />}
      />

      {isLoading ? (
        <Card><Skeleton className="h-32" /></Card>
      ) : (
        <>
          {activeTab === 'today' && <TodayTab report={myTodayReport} onOpenForm={() => setFormOpen(true)} onOpenDetail={openDetail} />}
          {activeTab === 'team' && isAdmin && <TeamTab reports={teamTodayReports} onOpenDetail={openDetail} />}
          {activeTab === 'history' && <HistoryTab reports={myHistory} onOpenDetail={openDetail} />}
        </>
      )}

      <DailyReportFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        userId={currentUser?.id ?? ''}
        reportDate={today}
        onSubmitted={() => { setFormOpen(false); invalidate(); }}
      />
      <DailyReportDetailModal
        open={!!detailReport}
        onClose={() => setDetailReport(null)}
        report={detailReport}
        currentUserId={currentUser?.id ?? ''}
        isAdmin={isAdmin}
      />
    </PageSectionStack>
  );
}

function TodayTab({ report, onOpenForm, onOpenDetail }: { report?: DailyReport; onOpenForm: () => void; onOpenDetail: (r: DailyReport) => void }) {
  if (!report) {
    return <EmptyState icon={<CalendarCheck />} title="No report submitted today" description="Share your progress with the team" actions={<Button variant="primary" onClick={onOpenForm} iconLeft={<FileText />} splitLabel={{ action: 'Create', object: 'Report Now' }} />} decorative />;
  }
  return (
    <Card glow className="cursor-pointer hover:border-accent/30" onClick={() => onOpenDetail(report)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[length:var(--text-body-sm)] text-on-surface-variant">Report submitted today</span>
        <StatusBadge status={report.status} />
      </div>
      <p className="text-[length:var(--text-body-sm)] text-on-surface line-clamp-2">{report.completedYesterday || '—'}</p>
    </Card>
  );
}

function TeamTab({ reports, onOpenDetail }: { reports: DailyReport[]; onOpenDetail: (r: DailyReport) => void }) {
  if (reports.length === 0) {
    return <EmptyState icon={<Users />} title="No reports today" description="No team members have submitted reports yet" variant="inline" />;
  }
  return (
    <Card padding="none" glow>
      <table className="w-full text-[length:var(--text-body-sm)]">
        <thead className="border-b border-outline-variant/40 bg-surface-container-low/50">
          <tr><th scope="col" className="px-4 py-3 text-left font-medium text-on-surface-variant">Member</th><th scope="col" className="px-4 py-3 text-left font-medium text-on-surface-variant">Status</th><th scope="col" className="px-4 py-3 text-left font-medium text-on-surface-variant">Submitted at</th></tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/20">
          {reports.map(r => (
            <tr key={r.id} className="cursor-pointer hover:bg-surface-container-low/30" onClick={() => onOpenDetail(r)}>
              <td className="px-4 py-3 text-on-surface">{r.user?.fullName ?? '—'}</td>
              <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
              <td className="px-4 py-3 text-on-surface-variant">{format(parseISO(r.createdAt), 'HH:mm')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function HistoryTab({ reports, onOpenDetail }: { reports: DailyReport[]; onOpenDetail: (r: DailyReport) => void }) {
  if (reports.length === 0) {
    return <EmptyState icon={<History />} title="No report history" description="Your reports will appear here" variant="inline" />;
  }
  return (
    <Card padding="none" glow>
      <table className="w-full text-[length:var(--text-body-sm)]">
        <thead className="border-b border-outline-variant/40 bg-surface-container-low/50">
          <tr><th scope="col" className="px-4 py-3 text-left font-medium text-on-surface-variant">Date</th><th scope="col" className="px-4 py-3 text-left font-medium text-on-surface-variant">Member</th><th scope="col" className="px-4 py-3 text-left font-medium text-on-surface-variant">Status</th></tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/20">
          {reports.map(r => (
            <tr key={r.id} className="cursor-pointer hover:bg-surface-container-low/30" onClick={() => onOpenDetail(r)}>
              <td className="px-4 py-3 text-on-surface">{format(parseISO(r.reportDate), 'dd/MM/yyyy')}</td>
              <td className="px-4 py-3 text-on-surface">{r.user?.fullName ?? '—'}</td>
              <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isApproved = status === 'Approved';
  return isApproved ? (
    <span className="inline-flex rounded-full bg-success-container px-2 py-0.5 text-[length:var(--text-caption)] text-on-success-container">Approved</span>
  ) : (
    <span className="inline-flex rounded-full bg-warning-container px-2 py-0.5 text-[length:var(--text-caption)] text-on-warning-container">Pending review</span>
  );
}
