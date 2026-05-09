import { useState, useEffect, useMemo } from 'react';
import { Zap, Download, Trash2 } from 'lucide-react';
import WeeklyCheckinModal from '../components/modals/WeeklyCheckinModal';
import ReportTableView from '../components/board/ReportTableView';
import ReportDetailDialog from '../components/modals/ReportDetailDialog';
import PrimaryActionButton from '../components/ui/PrimaryActionButton';
import { useAuth } from '../contexts/AuthContext';
import { WeeklyReport, Sprint } from '../types';
import { exportWeeklyReportsAsMarkdown, getSprintWeek, WeeklyExportFilters } from '../utils/export-weekly-report';

export default function SaturdaySync() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);

  // Bulk action state
  const [exportMode, setExportMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [exportFilters, setExportFilters] = useState<WeeklyExportFilters>({
    assignUserId: '',
    sprintId: '',
    week: '',
  });

  const { users, currentUser } = useAuth();
  const canAccessPage = currentUser?.isAdmin || currentUser?.role?.includes('Leader');
  const canExport = currentUser?.isAdmin || currentUser?.role?.includes('Leader');

  // Get current week's date range (Monday to Sunday)
  const getCurrentWeekRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { monday, sunday };
  };

  // Get next Saturday at 15:00
  const getNextSaturday = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilSaturday = dayOfWeek === 6 ? 7 : (6 - dayOfWeek);
    const nextSat = new Date(now);
    nextSat.setDate(now.getDate() + daysUntilSaturday);
    nextSat.setHours(15, 0, 0, 0);

    // Format display
    const isToday = dayOfWeek === 6 && now.getHours() < 15;
    const isTomorrow = daysUntilSaturday === 1;

    if (isToday) return 'Today, 15:00';
    if (isTomorrow) return 'Tomorrow, 15:00';

    const day = nextSat.getDate().toString().padStart(2, '0');
    const month = (nextSat.getMonth() + 1).toString().padStart(2, '0');
    return `Saturday, ${day}/${month}, 15:00`;
  };

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      setReports(data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
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
    fetchSprints();
  }, []);

  const handleViewDetail = (report: WeeklyReport) => {
    setSelectedReport(report);
    setIsDetailOpen(true);
  };

  const handleApprove = async (reportId: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approverId: currentUser?.id })
      });
      if (res.ok) {
        await fetchReports();
        setIsDetailOpen(false);
      }
    } catch (error) {
      console.error('Failed to approve report:', error);
    }
  };

  // Quick action handlers
  const toggleExportMode = () => {
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
        const date = new Date(r.weekEnding);
        const start = new Date(sprint.startDate);
        const end = new Date(sprint.endDate);
        if (date < start || date > end) return false;
        if (exportFilters.week) {
          const week = getSprintWeek(r.weekEnding, sprint);
          if (week !== Number(exportFilters.week)) return false;
        }
      }
      return true;
    });
  }, [reports, exportMode, exportFilters, sprints]);

  const handleExport = () => {
    exportWeeklyReportsAsMarkdown(selectedIds, reports, sprints, exportFilters);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Xóa ${selectedIds.size} báo cáo đã chọn? Không thể hoàn tác.`)) return;
    setDeleting(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map(id =>
          fetch(`/api/reports/${id}`, { method: 'DELETE' })
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

  if (loading || !currentUser) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!canAccessPage) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl text-amber-600">lock</span>
        </div>
        <h2 className="text-xl font-bold text-slate-700">Không có quyền truy cập</h2>
        <p className="text-slate-500 text-center max-w-md">
          Trang Weekly Report chỉ dành cho Leader và Admin. Vui lòng liên hệ quản lý nếu bạn cần truy cập.
        </p>
      </div>
    );
  }

  // Filter reports for current week
  const { monday, sunday } = getCurrentWeekRange();
  const currentWeekReports = reports.filter(r => {
    const reportDate = new Date(r.weekEnding);
    return reportDate >= monday && reportDate <= sunday;
  });

  // Calculate average confidence using 'score' field (correct field name)
  const averageConfidence = currentWeekReports.length > 0
    ? (currentWeekReports.reduce((sum, r) => sum + (r.score || 0), 0) / currentWeekReports.length).toFixed(1)
    : '0.0';

  // Count approved and pending reports
  const approvedReports = reports.filter(r => r.status === 'Approved').length;
  const pendingReports = reports.filter(r => r.status !== 'Approved').length;
  const nextSyncTime = getNextSaturday();

  return (
    <div className="h-full flex flex-col gap-[var(--space-lg)] w-full">
      {/* Weekly Sync Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div>
          <nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
            <span className="hover:text-primary cursor-pointer">Rituals</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-on-surface">Weekly Report</span>
          </nav>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Saturday <span className="text-tertiary italic">Sync</span></h2>
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
          <PrimaryActionButton onClick={() => setIsModalOpen(true)}>
            New Report
          </PrimaryActionButton>
        </div>
      </section>

      {/* Team Confidence Metrics - M9: 2x2 grid on small screens */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 shrink-0">
        <div className="bg-white/50 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-sm flex flex-col gap-2">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Average Confidence</p>
          <div className="flex items-baseline gap-1">
            <h4 className="text-3xl font-black font-headline">{averageConfidence}</h4>
            <span className="text-xs font-bold text-slate-400">/10</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-tertiary transition-all duration-1000" style={{ width: `${Number(averageConfidence) * 10}%` }}></div>
          </div>
        </div>
        <div className="bg-white/50 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-sm flex flex-col gap-2">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Approved</p>
          <h4 className="text-3xl font-black font-headline text-emerald-600">{approvedReports}</h4>
          <p className="text-xs font-bold mt-1 text-emerald-500">
            {reports.length > 0 ? Math.round((approvedReports / reports.length) * 100) : 0}% of total
          </p>
        </div>
        <div className="bg-white/50 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-sm flex flex-col gap-2">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pending Review</p>
          <h4 className={`text-3xl font-black font-headline ${pendingReports > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{pendingReports}</h4>
          <p className={`text-xs font-bold mt-1 ${pendingReports > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
            {pendingReports > 0 ? 'Need attention' : 'All clear'}
          </p>
        </div>
        <div className="bg-white/50 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-sm flex flex-col gap-2">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Next Sync</p>
          <h4 className="text-xl font-black font-headline">{nextSyncTime}</h4>
          <p className="text-xs font-bold text-slate-400 mt-1">Office Meeting Room</p>
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
                onChange={e => setExportFilters(f => ({ ...f, week: e.target.value as WeeklyExportFilters['week'] }))}
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

      <div className="flex-1 overflow-y-auto pb-8">
        <ReportTableView
          reports={exportMode ? displayedReports : reports}
          onViewDetail={handleViewDetail}
          sprints={sprints}
          exportMode={exportMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelectReport}
          onToggleSelectAll={toggleSelectAll}
        />
      </div>

      <WeeklyCheckinModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchReports}
      />

      <ReportDetailDialog
        report={selectedReport}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onApprove={handleApprove}
      />
    </div>
  );
}
