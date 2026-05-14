import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format, isToday, parseISO } from 'date-fns';
import { CalendarCheck, Users, History, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDailyReportsQuery, useInvalidateDailyReports } from '../../hooks/use-daily-reports';
import { Button, Card, TabPill, EmptyState, Skeleton, PageHeader } from '../../components/v5/ui';
import type { TabPillItem } from '../../components/v5/ui';
import { DailyReportFormDialog } from '../../components/v5/execution/daily-report-form-dialog';
import { DailyReportDetailModal, type DailyReportData } from '../../components/v5/execution/daily-report-detail-modal';
import type { DailyReport } from '../../types';

type Tab = 'today' | 'team' | 'history';

const buildTabs = (isAdmin: boolean): TabPillItem<Tab>[] => [
  { value: 'today', label: 'Hôm nay', icon: <CalendarCheck /> },
  ...(isAdmin ? [{ value: 'team' as const, label: 'Đội nhóm', icon: <Users /> }] : []),
  { value: 'history', label: 'Lịch sử', icon: <History /> },
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

  return (
    <div className="flex h-full flex-col gap-5 pb-8">
      <PageHeader
        title="Daily Sync"
        description="Báo cáo & trao đổi tiến độ hằng ngày"
        actions={<Button variant="primary" onClick={() => setFormOpen(true)} iconLeft={<FileText />}>Báo cáo hôm nay</Button>}
      />
      <TabPill<Tab> label="Daily sync tabs" value={activeTab} onChange={(v) => setSearchParams({ tab: v })} items={tabs} size="sm" />

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
    </div>
  );
}

function TodayTab({ report, onOpenForm, onOpenDetail }: { report?: DailyReport; onOpenForm: () => void; onOpenDetail: (r: DailyReport) => void }) {
  if (!report) {
    return <EmptyState icon={<CalendarCheck />} title="Bạn chưa báo cáo hôm nay" description="Chia sẻ tiến độ với team" actions={<Button variant="primary" onClick={onOpenForm}>Báo cáo ngay</Button>} decorative />;
  }
  return (
    <Card glow className="cursor-pointer hover:border-accent/30" onClick={() => onOpenDetail(report)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[length:var(--text-body-sm)] text-on-surface-variant">Báo cáo của bạn</span>
        <StatusBadge status={report.status} />
      </div>
      <p className="text-[length:var(--text-body-sm)] text-on-surface line-clamp-2">{report.completedYesterday || '—'}</p>
    </Card>
  );
}

function TeamTab({ reports, onOpenDetail }: { reports: DailyReport[]; onOpenDetail: (r: DailyReport) => void }) {
  if (reports.length === 0) {
    return <EmptyState icon={<Users />} title="Chưa có báo cáo nào hôm nay" description="Các thành viên chưa nộp báo cáo" variant="inline" />;
  }
  return (
    <Card padding="none" glow>
      <table className="w-full text-[length:var(--text-body-sm)]">
        <thead className="border-b border-outline-variant/40 bg-surface-container-low/50">
          <tr><th className="px-4 py-3 text-left font-medium text-on-surface-variant">Thành viên</th><th className="px-4 py-3 text-left font-medium text-on-surface-variant">Trạng thái</th><th className="px-4 py-3 text-left font-medium text-on-surface-variant">Gửi lúc</th></tr>
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
    return <EmptyState icon={<History />} title="Chưa có lịch sử báo cáo" description="Các báo cáo của bạn sẽ xuất hiện ở đây" variant="inline" />;
  }
  return (
    <Card padding="none" glow>
      <table className="w-full text-[length:var(--text-body-sm)]">
        <thead className="border-b border-outline-variant/40 bg-surface-container-low/50">
          <tr><th className="px-4 py-3 text-left font-medium text-on-surface-variant">Ngày</th><th className="px-4 py-3 text-left font-medium text-on-surface-variant">Thành viên</th><th className="px-4 py-3 text-left font-medium text-on-surface-variant">Trạng thái</th></tr>
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
    <span className="inline-flex rounded-full bg-success-container px-2 py-0.5 text-[length:var(--text-caption)] text-on-success-container">Đã duyệt</span>
  ) : (
    <span className="inline-flex rounded-full bg-warning-container px-2 py-0.5 text-[length:var(--text-caption)] text-on-warning-container">Chờ duyệt</span>
  );
}
