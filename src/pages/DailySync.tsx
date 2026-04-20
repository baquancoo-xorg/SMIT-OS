import { useState, useEffect, useMemo } from 'react';
import { Plus, Calendar, CheckCircle, Eye, X, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DailyReport, WorkItem, DailyReportTasksData } from '../types';
import TeamFormSelector from '../components/daily-report/TeamFormSelector';
import DailySyncStatsBar from '../components/daily-report/DailySyncStatsBar';
import { getTeamDisplayName } from '../utils/team-detection';
import {
  exportReportsAsMarkdown,
  findSprintForReport,
  getSprintWeek,
  ExportFilters,
} from '../utils/export-daily-report';

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

export default function DailySync() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [tasks, setTasks] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [dateRange, setDateRange] = useState(getWeekRange);

  // Export state
  const [exportMode, setExportMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exportFilters, setExportFilters] = useState<ExportFilters>({
    assignUserId: '',
    sprintId: '',
    week: '',
  });
  const [sprints, setSprints] = useState<Sprint[]>([]);

  const { currentUser } = useAuth();
  const canExport = currentUser?.isAdmin || currentUser?.role?.includes('Leader');

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

  // Unique assignees from reports for filter dropdown
  const assigneeOptions = useMemo(() => {
    const map = new Map<string, string>();
    reports.forEach(r => {
      if (r.userId && r.user?.fullName) map.set(r.userId, r.user.fullName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [reports]);

  // Apply export filters to reports for table display
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-[var(--space-md)] shrink-0">
        <div>
          <nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
            <span className="hover:text-primary cursor-pointer">Rituals</span>
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
              <Download size={13} />
              {exportMode ? 'Hu\u1ef7 Export' : 'Export'}
            </button>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 h-10 bg-primary text-white px-5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-95 transition-all min-w-[130px] whitespace-nowrap"
          >
            <Plus size={14} />
            New Report
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <DailySyncStatsBar dateRange={dateRange} onDateRangeChange={setDateRange} />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 shrink-0">
        <div className="bg-white/50 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Today's Reports</p>
          <h4 className="text-3xl font-black font-headline mt-2">{todayReports.length}</h4>
        </div>
        <div className="bg-white/50 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approved</p>
          <h4 className="text-3xl font-black font-headline text-emerald-600 mt-2">{approvedCount}</h4>
        </div>
        <div className="bg-white/50 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Review</p>
          <h4 className="text-3xl font-black font-headline text-amber-600 mt-2">{pendingCount}</h4>
        </div>
        <div className="bg-white/50 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Reports</p>
          <h4 className="text-3xl font-black font-headline mt-2">{reports.length}</h4>
        </div>
      </div>

      {/* Export Filter Panel */}
      {exportMode && (
        <div className="bg-white/70 backdrop-blur-md border border-white/20 rounded-3xl px-6 py-4 shadow-sm shrink-0">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
              Bộ lọc:
            </span>

            {/* Assign filter */}
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

            {/* Sprint filter */}
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

            {/* Week filter - only if sprint selected */}
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

      {/* Reports Table */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <div className="min-w-[700px]">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-outline-variant/10">
                    {exportMode && (
                      <th className="pl-6 pr-2 py-5 w-10">
                        <input
                          type="checkbox"
                          checked={allDisplayedSelected}
                          onChange={() => toggleSelectAll(displayedIds)}
                          className="rounded accent-primary cursor-pointer"
                        />
                      </th>
                    )}
                    <th className="px-4 md:px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left min-w-[100px]">Date</th>
                    <th className="px-4 md:px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left min-w-[150px]">Reporter</th>
                    <th className="px-4 md:px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left min-w-[80px]">Team</th>
                    <th className="px-4 md:px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left min-w-[100px]">Status</th>
                    <th className="px-4 md:px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left min-w-[80px]">Impact</th>
                    <th className="px-4 md:px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left min-w-[120px]">Blockers</th>
                    <th className="px-4 md:px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right min-w-[80px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {displayedReports.map(report => (
                    <tr key={report.id} className="hover:bg-primary/[0.02] transition-colors">
                      {exportMode && (
                        <td className="pl-6 pr-2 py-5">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(report.id)}
                            onChange={() => toggleSelectReport(report.id)}
                            className="rounded accent-primary cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="px-4 md:px-8 py-5">
                        <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
                          <Calendar size={14} className="text-slate-400" />
                          {new Date(report.reportDate).toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                      <td className="px-4 md:px-8 py-5">
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
                      <td className="px-4 md:px-8 py-5">
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
                      <td className="px-4 md:px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          report.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-4 md:px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          report.impactLevel === 'high' ? 'bg-red-100 text-red-700' :
                          report.impactLevel === 'low' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {report.impactLevel || 'none'}
                        </span>
                      </td>
                      <td className="px-4 md:px-8 py-5">
                        <p className="text-sm text-slate-500 truncate max-w-[200px]">
                          {report.blockers || '-'}
                        </p>
                      </td>
                      <td className="px-4 md:px-8 py-5 text-right">
                        <button
                          onClick={() => { setSelectedReport(report); setIsDetailOpen(true); }}
                          className="p-2 min-h-[44px] min-w-[44px] text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {displayedReports.length === 0 && (
                    <tr>
                      <td colSpan={exportMode ? 8 : 7} className="px-8 py-16 text-center">
                        <p className="text-slate-400 font-medium">
                          {exportMode ? 'Không có báo cáo nào khớp bộ lọc' : 'No daily reports yet'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 text-center py-2 md:hidden">← Scroll horizontally →</p>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <TeamFormSelector
          tasks={tasks}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { fetchReports(); setIsModalOpen(false); }}
        />
      )}

      {/* Detail Modal */}
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

// ─── Detail Modal ─────────────────────────────────────────────────────────────
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

  const tasksData: DailyReportTasksData = report.tasksData
    ? JSON.parse(report.tasksData)
    : { completedYesterday: [], doingYesterday: [], doingToday: [] };

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
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
              report.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {report.status}
            </span>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <TaskSection
            label="Completed Yesterday"
            color="emerald"
            ids={tasksData.completedYesterday}
            tasks={tasks}
          />
          <TaskSection
            label="Still Working On"
            color="amber"
            ids={tasksData.doingYesterday}
            tasks={tasks}
          />
          <TaskSection
            label="Plan for Today"
            color="primary"
            ids={tasksData.doingToday}
            tasks={tasks}
          />

          {report.blockers && (
            <div>
              <h4 className="text-xs font-black uppercase text-red-500 tracking-widest mb-3">Blockers</h4>
              <div className="p-4 bg-red-50 rounded-xl">
                <p className="text-sm text-red-700">{report.blockers}</p>
              </div>
            </div>
          )}

          {report.impactLevel && report.impactLevel !== 'none' && (
            <div>
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3">Impact Level</h4>
              <span className={`px-4 py-2 rounded-xl font-bold text-sm ${
                report.impactLevel === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {report.impactLevel.charAt(0).toUpperCase() + report.impactLevel.slice(1)}
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

const TASK_SECTION_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  emerald: { label: 'text-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  amber: { label: 'text-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  primary: { label: 'text-primary', bg: 'bg-primary/5', text: 'text-primary' },
};

function TaskSection({
  label, color, ids, tasks,
}: {
  label: string;
  color: string;
  ids: string[];
  tasks: WorkItem[];
}) {
  const style = TASK_SECTION_STYLES[color];
  return (
    <div>
      <h4 className={`text-xs font-black uppercase ${style.label} tracking-widest mb-3`}>{label}</h4>
      <div className="space-y-2">
        {ids.length > 0 ? (
          ids.map((id, i) => {
            const task = tasks.find(t => t.id === id);
            return (
              <div key={i} className={`p-3 ${style.bg} rounded-xl text-sm font-medium ${style.text}`}>
                {task?.title || `Task: ${id.slice(0, 8)}...`}
              </div>
            );
          })
        ) : (
          <p className="text-slate-400 text-sm">No tasks</p>
        )}
      </div>
    </div>
  );
}
