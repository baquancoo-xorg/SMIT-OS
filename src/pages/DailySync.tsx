import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Calendar, CheckCircle, X, Download, AlertTriangle, Target, ListChecks, Zap, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { TableRowActions } from '../components/ui/table-row-actions';
import { DailyReport, WorkItem, DailyReportTasksData } from '../types';
import { BlockerEntry, TodayPlanEntry, TaskEntry, AdHocTask } from '../types/daily-report-metrics';
import TeamFormSelector from '../components/daily-report/TeamFormSelector';
import DailySyncStatsBar from '../components/daily-report/DailySyncStatsBar';
import { getTeamDisplayName } from '../utils/team-detection';
import {
  exportReportsAsMarkdown,
  getSprintWeek,
  ExportFilters,
} from '../utils/export-daily-report';
import { Card } from '../components/ui';
import PrimaryActionButton from '../components/ui/PrimaryActionButton';
import { TableShell } from '../components/ui/table-shell';
import { getTableContract } from '../components/ui/table-contract';
import { formatTableDate, formatTableDateTime } from '../components/ui/table-date-format';

interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

function getWeekRange() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  };
}

function getSubmissionStatus(dateStr: string): { label: string; detail: string; type: 'early' | 'ontime' | 'late' } {
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

function SubmissionStatusBadge({ createdAt }: { createdAt: string }) {
  const { label, detail, type } = getSubmissionStatus(createdAt);
  const styles = {
    early: 'bg-blue-100 text-blue-700',
    ontime: 'bg-emerald-100 text-emerald-700',
    late: 'bg-red-100 text-red-700',
  };
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit ${styles[type]}`}>
        {label}
      </span>
      {detail && <span className="text-[10px] text-slate-400 font-medium pl-1">{detail}</span>}
    </div>
  );
}

export default function DailySync() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [tasks, setTasks] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [dateRange, setDateRange] = useState(getWeekRange);

  const [exportMode, setExportMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [exportFilters, setExportFilters] = useState<ExportFilters>({
    assignUserId: '',
    sprintId: '',
    week: '',
  });
  const [sprints, setSprints] = useState<Sprint[]>([]);

  const { currentUser } = useAuth();
  const canExport = currentUser?.isAdmin || currentUser?.role?.includes('Leader');
  const standardTable = getTableContract('standard');

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams({
        userId: currentUser?.id || '',
        userRole: currentUser?.role || '',
        userDepartment: currentUser?.departments?.[0] || '',
      });
      const res = await fetch(`/api/daily-reports?${params}`);
      const data = await res.json();
      setReports(data);
    } catch (error) {
      console.error('Failed to fetch daily reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/work-items');
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const fetchSprints = async () => {
    try {
      const res = await fetch('/api/sprints');
      const data = await res.json();
      setSprints(data);
    } catch (error) {
      console.error('Failed to fetch sprints:', error);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchTasks();
  }, [currentUser?.id]);

  const handleApprove = async (reportId: string) => {
    try {
      const res = await fetch(`/api/daily-reports/${reportId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approverId: currentUser?.id }),
      });
      if (res.ok) {
        await fetchReports();
        setIsDetailOpen(false);
      }
    } catch (error) {
      console.error('Failed to approve report:', error);
    }
  };

  const toggleExportMode = () => {
    if (!exportMode && sprints.length === 0) fetchSprints();
    setExportMode(v => !v);
    setSelectedIds(new Set());
    setExportFilters({ assignUserId: '', sprintId: '', week: '' });
  };

  const toggleSelectReport = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (ids: string[]) => {
    const allSelected = ids.every(id => selectedIds.has(id));
    setSelectedIds(allSelected ? new Set() : new Set(ids));
  };

  const assigneeOptions = useMemo(() => {
    const map = new Map<string, string>();
    reports.forEach(r => {
      if (r.userId && r.user?.fullName) map.set(r.userId, r.user.fullName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [reports]);

  const displayedReports = useMemo(() => {
    if (!exportMode) return reports;
    return reports.filter(r => {
      if (exportFilters.assignUserId && r.userId !== exportFilters.assignUserId) return false;
      if (exportFilters.sprintId) {
        const sprint = sprints.find(s => s.id === exportFilters.sprintId);
        if (!sprint) return false;
        const date = new Date(r.reportDate);
        const start = new Date(sprint.startDate);
        const end = new Date(sprint.endDate);
        if (date < start || date > end) return false;
        if (exportFilters.week) {
          const week = getSprintWeek(r.reportDate, sprint);
          if (week !== Number(exportFilters.week)) return false;
        }
      }
      return true;
    });
  }, [reports, exportMode, exportFilters, sprints]);

  const handleExport = () => {
    exportReportsAsMarkdown(selectedIds, reports, tasks, sprints, exportFilters);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Xóa ${selectedIds.size} báo cáo đã chọn? Không thể hoàn tác.`)) return;
    setDeleting(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map(id =>
          fetch(`/api/daily-reports/${id}`, { method: 'DELETE' })
        )
      );
      await fetchReports();
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Failed to delete reports:', error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  const todayReports = reports.filter(r =>
    new Date(r.reportDate).toDateString() === new Date().toDateString()
  );
  const approvedCount = reports.filter(r => r.status === 'Approved').length;
  const pendingCount = reports.filter(r => r.status === 'Review').length;

  const displayedIds = displayedReports.map(r => r.id);
  const allDisplayedSelected = displayedIds.length > 0 && displayedIds.every(id => selectedIds.has(id));

  return (
    <div className="h-full flex flex-col gap-[var(--space-lg)] w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-[var(--space-md)] shrink-0">
        <div>
          <nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
            <span className="hover:text-primary cursor-pointer transition-colors">Rituals</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">Daily Sync</span>
          </nav>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
            Daily <span className="text-primary italic">Sync</span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {canExport && (
            <button
              onClick={toggleExportMode}
              className={`flex items-center justify-center gap-2 h-10 px-5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${
                exportMode
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  : 'bg-surface-container-high text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Zap size={13} />
              {exportMode ? 'Hủy' : 'Quick Action'}
            </button>
          )}
          <PrimaryActionButton onClick={() => setIsModalOpen(true)} icon={<Plus size={14} />}>
            New Report
          </PrimaryActionButton>
        </div>
      </div>

      <DailySyncStatsBar dateRange={dateRange} onDateRangeChange={setDateRange} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[var(--space-md)] shrink-0">
        <Card className="p-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Today's Reports</p>
          <h4 className="text-3xl font-black font-headline mt-2">{todayReports.length}</h4>
        </Card>
        <Card className="p-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approved</p>
          <h4 className="text-3xl font-black font-headline text-emerald-600 mt-2">{approvedCount}</h4>
        </Card>
        <Card className="p-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Review</p>
          <h4 className="text-3xl font-black font-headline text-amber-600 mt-2">{pendingCount}</h4>
        </Card>
        <Card className="p-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Reports</p>
          <h4 className="text-3xl font-black font-headline mt-2">{reports.length}</h4>
        </Card>
      </div>

      {exportMode && (
        <div className="bg-white/70 backdrop-blur-md border border-white/20 rounded-3xl px-6 py-4 shadow-sm shrink-0">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
              Bộ lọc:
            </span>

            <select
              value={exportFilters.assignUserId}
              onChange={e => setExportFilters(f => ({ ...f, assignUserId: e.target.value }))}
              className="text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Tất cả assignee</option>
              {assigneeOptions.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>

            <select
              value={exportFilters.sprintId}
              onChange={e => setExportFilters(f => ({ ...f, sprintId: e.target.value, week: '' }))}
              className="text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Tất cả sprint</option>
              {sprints.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            {exportFilters.sprintId && (
              <select
                value={exportFilters.week}
                onChange={e => setExportFilters(f => ({ ...f, week: e.target.value as ExportFilters['week'] }))}
                className="text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Cả 2 tuần</option>
                <option value="1">Tuần 1</option>
                <option value="2">Tuần 2</option>
              </select>
            )}

            <div className="ml-auto flex items-center gap-3">
              <span className="text-[10px] text-slate-400 font-medium">
                {selectedIds.size} báo cáo đã chọn
              </span>
              <button
                onClick={handleBulkDelete}
                disabled={selectedIds.size === 0 || deleting}
                className="flex items-center gap-2 h-9 bg-red-500 text-white px-5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                <Trash2 size={12} />
                {deleting ? 'Đang xóa...' : `Xóa (${selectedIds.size})`}
              </button>
              <button
                onClick={handleExport}
                disabled={selectedIds.size === 0}
                className="flex items-center gap-2 h-9 bg-primary text-white px-5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                <Download size={12} />
                Export ({selectedIds.size})
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <TableShell variant="standard" className="bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl shadow-sm" scrollClassName="overflow-x-auto">
          <thead>
            <tr className={standardTable.headerRow}>
              {exportMode && (
                <th className={`${standardTable.headerCell} w-10 px-6 pr-2`}>
                  <input
                    type="checkbox"
                    checked={allDisplayedSelected}
                    onChange={() => toggleSelectAll(displayedIds)}
                    className="rounded accent-primary cursor-pointer"
                  />
                </th>
              )}
              <th className={`${standardTable.headerCell} min-w-[160px]`}>Created Date</th>
              <th className={`${standardTable.headerCell} min-w-[130px]`}>Submission</th>
              <th className={`${standardTable.headerCell} min-w-[150px]`}>Reporter</th>
              <th className={`${standardTable.headerCell} min-w-[80px]`}>Team</th>
              <th className={`${standardTable.headerCell} min-w-[100px]`}>Status</th>
              <th className={`${standardTable.headerCell} min-w-[120px]`}>Report Date</th>
              <th className={standardTable.actionHeaderCell}>Actions</th>
            </tr>
          </thead>
          <tbody className={standardTable.body}>
            {displayedReports.map(report => (
              <tr key={report.id} className={standardTable.row}>
                {exportMode && (
                  <td className={`${standardTable.cell} px-6 pr-2`}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(report.id)}
                      onChange={() => toggleSelectReport(report.id)}
                      className="rounded accent-primary cursor-pointer"
                    />
                  </td>
                )}
                <td className={standardTable.cell}>
                  <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
                    <Calendar size={14} className="text-slate-400" />
                    {formatTableDateTime(report.createdAt)}
                  </div>
                </td>
                <td className={standardTable.cell}>
                  <SubmissionStatusBadge createdAt={report.createdAt} />
                </td>
                <td className={standardTable.cell}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black">
                      {report.user?.fullName?.split(' ').map(n => n[0]).join('') || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">{report.user?.fullName || 'Unknown'}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">{report.user?.role}</p>
                    </div>
                  </div>
                </td>
                <td className={standardTable.cell}>
                  {report.teamType ? (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      report.teamType === 'tech' ? 'bg-indigo-100 text-indigo-700' :
                      report.teamType === 'marketing' ? 'bg-orange-100 text-orange-700' :
                      report.teamType === 'media' ? 'bg-pink-100 text-pink-700' :
                      report.teamType === 'sale' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {getTeamDisplayName(report.teamType as any)}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-sm">-</span>
                  )}
                </td>
                <td className={standardTable.cell}>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    report.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {report.status}
                  </span>
                </td>
                <td className={standardTable.cell}>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Calendar size={14} className="text-slate-400" />
                    {formatTableDate(report.reportDate)}
                  </div>
                </td>
                <td className={standardTable.actionCell}>
                  <TableRowActions
                    onView={() => { setSelectedReport(report); setIsDetailOpen(true); }}
                    size={16}
                    buttonClassName="min-h-[44px] min-w-[44px]"
                    variant="standard"
                  />
                </td>
              </tr>
            ))}
            {displayedReports.length === 0 && (
              <tr>
                <td colSpan={exportMode ? 8 : 7} className={standardTable.emptyState}>
                  <p className="text-slate-400 font-medium">
                    {exportMode ? 'Không có báo cáo nào khớp bộ lọc' : 'No daily reports yet'}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </TableShell>
        <p className="text-[10px] text-slate-400 text-center py-2 tablet:hidden">← Scroll horizontally →</p>
      </div>

      {isModalOpen && (
        <TeamFormSelector
          tasks={tasks}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { fetchReports(); setIsModalOpen(false); }}
        />
      )}

      {isDetailOpen && selectedReport && (
        <DailyReportDetailModal
          report={selectedReport}
          onClose={() => setIsDetailOpen(false)}
          onApprove={handleApprove}
          canApprove={
            (currentUser?.isAdmin || currentUser?.role?.includes('Leader')) &&
            selectedReport.status !== 'Approved'
          }
          tasks={tasks}
        />
      )}
    </div>
  );
}

function DailyReportDetailModal({
  report,
  onClose,
  onApprove,
  canApprove,
  tasks,
}: {
  report: DailyReport;
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  canApprove: boolean;
  tasks: WorkItem[];
}) {
  const [approving, setApproving] = useState(false);

  const tasksData: DailyReportTasksData = (() => {
    try { return report.tasksData ? JSON.parse(report.tasksData) : {}; } catch { return {}; }
  })();

  const richMetrics: {
    yesterdayTasks?: TaskEntry[];
    blockers?: BlockerEntry[];
    todayPlans?: TodayPlanEntry[];
    adHocTasks?: AdHocTask[];
  } | null = (() => {
    if (!report.teamMetrics) return null;
    if (typeof report.teamMetrics === 'string') {
      try { return JSON.parse(report.teamMetrics); } catch { return null; }
    }
    return report.teamMetrics as typeof richMetrics;
  })();

  const parsedBlockers: BlockerEntry[] = (() => {
    if (richMetrics?.blockers?.length) return richMetrics.blockers;
    if (!report.blockers) return [];
    try { return JSON.parse(report.blockers); } catch { return []; }
  })();

  const completedIds: string[] = tasksData.completedYesterday || [];
  const doingIds: string[] = tasksData.doingYesterday || [];
  const todayIds: string[] = tasksData.doingToday || [];

  const handleApprove = async () => {
    setApproving(true);
    await onApprove(report.id);
    setApproving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />
      <div
        className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black font-headline">{report.user?.fullName}</h3>
            <p className="text-sm text-slate-400">
              {new Date(report.reportDate).toLocaleDateString('vi-VN', {
                weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {report.teamType && (
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                report.teamType === 'tech' ? 'bg-indigo-100 text-indigo-700' :
                report.teamType === 'marketing' ? 'bg-orange-100 text-orange-700' :
                report.teamType === 'media' ? 'bg-pink-100 text-pink-700' :
                'bg-emerald-100 text-emerald-700'
              }`}>{report.teamType}</span>
            )}
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
              report.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>{report.status}</span>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <DetailTaskSection
            label="Hoàn thành hôm qua"
            icon={<ListChecks size={14} />}
            color="emerald"
            ids={completedIds}
            tasks={tasks}
            yesterdayTasks={richMetrics?.yesterdayTasks}
            teamType={report.teamType || undefined}
          />

          <DetailTaskSection
            label="Vẫn đang làm"
            icon={<Zap size={14} />}
            color="amber"
            ids={doingIds}
            tasks={tasks}
            yesterdayTasks={richMetrics?.yesterdayTasks}
            teamType={report.teamType || undefined}
          />

          <TodaySection
            todayPlans={richMetrics?.todayPlans || []}
            ids={todayIds}
            tasks={tasks}
          />

          {richMetrics?.adHocTasks && richMetrics.adHocTasks.length > 0 && (
            <AdHocSection adHocTasks={richMetrics.adHocTasks} />
          )}

          {parsedBlockers.length > 0 && (
            <div>
              <h4 className="text-xs font-black uppercase text-red-500 tracking-widest mb-3 flex items-center gap-1.5">
                <AlertTriangle size={13} /> Khó khăn &amp; Rủi ro
              </h4>
              <div className="space-y-2">
                {parsedBlockers.map((b, i) => (
                  <div key={i} className="p-4 bg-red-50 border border-red-100 rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-red-700 flex-1">{b.description}</p>
                      {b.impact !== 'none' && (
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          b.impact === 'high' ? 'bg-red-200 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>{b.impact}</span>
                      )}
                    </div>
                    {b.taskTitle && (
                      <p className="text-xs text-red-400 mt-1">Task: {b.taskTitle}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.impactLevel && report.impactLevel !== 'none' && (
            <div>
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Mức độ ảnh hưởng</h4>
              <span className={`px-4 py-2 rounded-xl font-bold text-sm ${
                report.impactLevel === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {report.impactLevel === 'high' ? 'Cao' : 'Thấp'}
              </span>
            </div>
          )}
        </div>

        {canApprove && (
          <div className="px-8 py-6 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleApprove}
              disabled={approving}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-95 transition-all disabled:opacity-50"
            >
              <CheckCircle size={18} />
              {approving ? 'Approving...' : 'Approve Report'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const SECTION_STYLES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  emerald: { label: 'text-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
  amber: { label: 'text-amber-600', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
};

const TEST_STATUS_LABEL: Record<string, string> = {
  local: 'Pass Local', staging: 'Đã lên Staging', prod: 'Đã lên Production',
};
const BLOCKED_BY_LABEL: Record<string, string> = {
  design: 'Chờ Design', qa: 'Chờ QA', devops: 'Chờ DevOps', external: 'Chờ External',
};
const CAMP_STATUS_LABEL: Record<string, string> = {
  normal: 'Ổn định', testing: 'Đang Test mẫu mới', waiting_media: 'Chờ Media',
  expensive: 'Camp bị đắt', banned: 'Chết TKQC',
};
const CHANNEL_LABEL: Record<string, string> = { fb: 'Facebook', google: 'Google', tiktok: 'TikTok' };
const VERSION_LABEL: Record<string, string> = { demo: 'Bản Nháp', final: 'Bản Final', published: 'Đã Đăng tải' };
const PROD_STATUS_LABEL: Record<string, string> = {
  editing: 'Đang quay/dựng', rendering: 'Đang Render', feedback: 'Đang sửa Feedback',
};
const FOLLOWUP_LABEL: Record<string, string> = {
  following: 'Đang bám sát / Gọi lại',
  waiting_customer: 'Chờ khách phản hồi',
  waiting_internal: 'Chờ Tech/Mkt hỗ trợ',
};

const formatVND = (v: number) => new Intl.NumberFormat('vi-VN').format(v) + '₫';

function MetricTag({ label, value, color = 'slate' }: { label: string; value: React.ReactNode; color?: string }) {
  const colorMap: Record<string, string> = {
    slate: 'bg-white border-slate-200 text-slate-600',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    amber: 'bg-amber-100 border-amber-200 text-amber-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    pink: 'bg-pink-50 border-pink-200 text-pink-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  };
  return (
    <span className={`px-2 py-0.5 border rounded-full text-[10px] font-bold ${colorMap[color] || colorMap.slate}`}>
      {label}: <strong>{value}</strong>
    </span>
  );
}

function renderTaskMetrics(metrics: Record<string, unknown>, teamType: string, status: 'done' | 'doing') {
  const m = metrics;

  if (teamType === 'tech') {
    if (status === 'done') return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {m.taskType && <MetricTag label="Loại" value={m.taskType === 'bug' ? 'Bug Fix' : 'Feature mới'} color={m.taskType === 'bug' ? 'red' : 'indigo'} />}
        {m.testStatus && <MetricTag label="Test" value={TEST_STATUS_LABEL[String(m.testStatus)] || String(m.testStatus)} color="indigo" />}
        {m.prLink && (
          <a href={String(m.prLink)} target="_blank" rel="noopener noreferrer"
            className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded-full text-[10px] font-bold text-indigo-700 truncate max-w-[200px] hover:underline">
            PR: {String(m.prLink)}
          </a>
        )}
      </div>
    );
    if (status === 'doing') return m.blockedBy ? (
      <div className="mt-2"><MetricTag label="Blocked by" value={BLOCKED_BY_LABEL[String(m.blockedBy)] || String(m.blockedBy)} color="amber" /></div>
    ) : null;
  }

  if (teamType === 'marketing') {
    if (status === 'done') return (
      <div className="mt-2 space-y-2">
        {m.link && (
          <a href={String(m.link)} target="_blank" rel="noopener noreferrer"
            className="block text-xs text-orange-600 font-medium hover:underline truncate">🔗 {String(m.link)}</a>
        )}
        {(m.spend != null || m.mqls != null || m.cpa != null || m.adsTested != null) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-orange-50/60 p-3 rounded-xl border border-orange-100">
            {m.spend != null && <div className="text-center"><p className="text-[9px] font-black text-slate-400 uppercase">Spend</p><p className="text-sm font-black text-orange-700">{formatVND(Number(m.spend))}</p></div>}
            {m.mqls != null && <div className="text-center"><p className="text-[9px] font-black text-slate-400 uppercase">MQLs</p><p className="text-sm font-black text-orange-700">{String(m.mqls)}</p></div>}
            {m.cpa != null && <div className="text-center"><p className="text-[9px] font-black text-slate-400 uppercase">CPA</p><p className="text-sm font-black text-orange-700">{formatVND(Number(m.cpa))}</p></div>}
            {m.adsTested != null && <div className="text-center"><p className="text-[9px] font-black text-slate-400 uppercase">Ads Test</p><p className="text-sm font-black text-purple-700">{String(m.adsTested)}</p></div>}
          </div>
        )}
      </div>
    );
    if (status === 'doing') return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {m.channel && <MetricTag label="Channel" value={CHANNEL_LABEL[String(m.channel)] || String(m.channel)} color="orange" />}
        {m.campStatus && <MetricTag label="Camp" value={CAMP_STATUS_LABEL[String(m.campStatus)] || String(m.campStatus)} color="orange" />}
      </div>
    );
  }

  if (teamType === 'media') {
    if (status === 'done') return (
      <div className="mt-2 space-y-2">
        {m.link && (
          <a href={String(m.link)} target="_blank" rel="noopener noreferrer"
            className="block text-xs text-pink-600 font-medium hover:underline truncate">🔗 {String(m.link)}</a>
        )}
        <div className="flex flex-wrap gap-1.5">
          {m.version && <MetricTag label="Loại" value={VERSION_LABEL[String(m.version)] || String(m.version)} color="pink" />}
          {m.publicationsCount != null && <MetricTag label="Số ấn phẩm" value={String(m.publicationsCount)} color="pink" />}
          {m.views && <MetricTag label="Lượt xem" value={String(m.views)} color="slate" />}
          {m.engagement && <MetricTag label="Tương tác" value={String(m.engagement)} color="slate" />}
          {m.followers != null && Number(m.followers) > 0 && <MetricTag label="Follower mới" value={`+${m.followers}`} color="pink" />}
        </div>
      </div>
    );
    if (status === 'doing') return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {m.prodStatus && <MetricTag label="Tình trạng" value={PROD_STATUS_LABEL[String(m.prodStatus)] || String(m.prodStatus)} color="pink" />}
        {m.revisionCount && <MetricTag label="Vòng sửa" value={String(m.revisionCount)} color="amber" />}
      </div>
    );
  }

  if (teamType === 'sale') {
    if (status === 'done') return (
      <div className="mt-2 space-y-2">
        {m.note && <p className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-1.5 rounded-lg">📝 {String(m.note)}</p>}
        {(m.leadsReceived != null || m.leadsAttempted != null || m.leadsQualified != null || m.demosBooked != null || m.leadsUnqualified != null) && (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
            {m.leadsReceived != null && <div className="text-center"><p className="text-[9px] font-black text-slate-400 uppercase">Lead nhận</p><p className="text-sm font-black text-slate-700">{String(m.leadsReceived)}</p></div>}
            {m.leadsAttempted != null && <div className="text-center"><p className="text-[9px] font-black text-blue-400 uppercase">Đang xử lý</p><p className="text-sm font-black text-blue-600">{String(m.leadsAttempted)}</p></div>}
            {m.leadsQualified != null && <div className="text-center"><p className="text-[9px] font-black text-emerald-500 uppercase">SQL</p><p className="text-sm font-black text-emerald-700">{String(m.leadsQualified)}</p></div>}
            {m.demosBooked != null && <div className="text-center"><p className="text-[9px] font-black text-amber-500 uppercase">Demo</p><p className="text-sm font-black text-amber-700">{String(m.demosBooked)}</p></div>}
            {m.leadsUnqualified != null && <div className="text-center"><p className="text-[9px] font-black text-red-400 uppercase">Hủy/Rác</p><p className="text-sm font-black text-red-600">{String(m.leadsUnqualified)}</p></div>}
          </div>
        )}
        <div className="flex flex-wrap gap-1.5">
          {m.oppValue != null && Number(m.oppValue) > 0 && <MetricTag label="Cơ hội mới" value={formatVND(Number(m.oppValue))} color="slate" />}
          {m.revenue != null && Number(m.revenue) > 0 && <MetricTag label="Doanh thu WON" value={formatVND(Number(m.revenue))} color="emerald" />}
          {m.ticketsResolved != null && <MetricTag label="Ticket đã giải q." value={String(m.ticketsResolved)} color="indigo" />}
        </div>
      </div>
    );
    if (status === 'doing') return m.followupStatus ? (
      <div className="mt-2"><MetricTag label="Chăm sóc" value={FOLLOWUP_LABEL[String(m.followupStatus)] || String(m.followupStatus)} color="emerald" /></div>
    ) : null;
  }

  return null;
}

function DetailTaskSection({
  label, icon, color, ids, tasks, yesterdayTasks, teamType,
}: {
  label: string;
  icon: React.ReactElement;
  color: 'emerald' | 'amber';
  ids: string[];
  tasks: WorkItem[];
  yesterdayTasks?: TaskEntry[];
  teamType?: string;
}) {
  const style = SECTION_STYLES[color];
  const sectionStatus: 'done' | 'doing' = color === 'emerald' ? 'done' : 'doing';
  return (
    <div>
      <h4 className={`text-xs font-black uppercase ${style.label} tracking-widest mb-3 flex items-center gap-1.5`}>
        {icon} {label}
      </h4>
      <div className="space-y-2">
        {ids.length > 0 ? ids.map((id, i) => {
          const task = tasks.find(t => t.id === id);
          const entry = yesterdayTasks?.find(e => e.taskId === id);
          const metrics = entry?.metrics as Record<string, unknown> | undefined;
          return (
            <div key={i} className={`p-4 ${style.bg} border ${style.border} rounded-lg`}>
              <p className={`text-sm font-semibold ${style.text}`}>
                {task?.title || `Task: ${id.slice(0, 8)}...`}
              </p>
              {metrics && teamType && renderTaskMetrics(metrics, teamType, sectionStatus)}
            </div>
          );
        }) : (
          <p className="text-slate-400 text-sm italic">Không có task</p>
        )}
      </div>
    </div>
  );
}

function TodaySection({
  todayPlans, ids, tasks,
}: {
  todayPlans: TodayPlanEntry[];
  ids: string[];
  tasks: WorkItem[];
}) {
  return (
    <div>
      <h4 className="text-xs font-black uppercase text-primary tracking-widest mb-3 flex items-center gap-1.5">
        <Target size={13} /> Mục tiêu hôm nay
      </h4>
      <div className="space-y-2">
        {todayPlans.length > 0 ? (
          todayPlans.map((plan, i) => {
            const task = plan.taskId ? tasks.find(t => t.id === plan.taskId) : null;
            return (
              <div key={i} className="p-3 bg-primary/5 border border-primary/10 rounded-xl">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-primary">
                      {task?.title || plan.output || `Kế hoạch ${i + 1}`}
                    </p>
                    {plan.output && task && plan.output !== task.title && (
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{plan.output}</p>
                    )}
                    {plan.output && !task && (
                      <p className="text-xs text-slate-500 mt-0.5">{plan.output}</p>
                    )}
                  </div>
                  {plan.isPriority && (
                    <span className="shrink-0 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase">🔥 Priority</span>
                  )}
                </div>
              </div>
            );
          })
        ) : ids.length > 0 ? (
          ids.map((id, i) => {
            const task = tasks.find(t => t.id === id);
            return (
              <div key={i} className="p-3 bg-primary/5 border border-primary/10 rounded-xl">
                <p className="text-sm font-semibold text-primary">{task?.title || `Task: ${id.slice(0, 8)}...`}</p>
              </div>
            );
          })
        ) : (
          <p className="text-slate-400 text-sm italic">Chưa có kế hoạch</p>
        )}
      </div>
    </div>
  );
}

function AdHocSection({ adHocTasks }: { adHocTasks: AdHocTask[] }) {
  if (!adHocTasks?.length) return null;
  const IMPACT_STYLE: Record<string, string> = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <div>
      <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest mb-3 flex items-center gap-1.5">
        <Zap size={13} /> Công việc Phát sinh
      </h4>
      <div className="space-y-2">
        {adHocTasks.map((t, i) => (
          <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-slate-700 flex-1">{t.name}</p>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${IMPACT_STYLE[t.impact] || IMPACT_STYLE.low}`}>
                  {t.impact === 'high' ? 'Cao' : t.impact === 'medium' ? 'Trung bình' : 'Thấp'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  t.status === 'done' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {t.status === 'done' ? 'Xong' : 'Đang làm'}
                </span>
              </div>
            </div>
            <div className="flex gap-3 mt-1.5 text-[10px] text-slate-400 font-medium">
              {t.requester && <span>Yêu cầu bởi: <strong className="text-slate-600">{t.requester}</strong></span>}
              {t.hoursSpent > 0 && <span>⏱ {t.hoursSpent}h</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
