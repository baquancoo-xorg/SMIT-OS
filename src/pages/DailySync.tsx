import { useState, useEffect } from 'react';
import { Plus, Calendar, CheckCircle, Eye, X, BarChart3, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DailyReport, WorkItem, DailyReportTasksData } from '../types';
import TeamFormSelector from '../components/daily-report/TeamFormSelector';
import PMDashboard from '../components/daily-report/PMDashboard';
import { getTeamDisplayName } from '../utils/team-detection';

type TabType = 'reports' | 'dashboard';

export default function DailySync() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [tasks, setTasks] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('reports');
  const { currentUser } = useAuth();

  // Dashboard date range - default to current week
  const getWeekRange = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0]
    };
  };
  const [dateRange, setDateRange] = useState(getWeekRange);

  const canViewDashboard = currentUser?.isAdmin || currentUser?.role?.includes('Leader');

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams({
        userId: currentUser?.id || '',
        userRole: currentUser?.role || '',
        userDepartment: currentUser?.departments?.[0] || ''
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

  useEffect(() => {
    fetchReports();
    fetchTasks();
  }, [currentUser?.id]);

  const handleApprove = async (reportId: string) => {
    try {
      const res = await fetch(`/api/daily-reports/${reportId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approverId: currentUser?.id
        })
      });
      if (res.ok) {
        await fetchReports();
        setIsDetailOpen(false);
      }
    } catch (error) {
      console.error('Failed to approve report:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const todayReports = reports.filter(r =>
    new Date(r.reportDate).toDateString() === new Date().toDateString()
  );
  const approvedCount = reports.filter(r => r.status === 'Approved').length;
  const pendingCount = reports.filter(r => r.status === 'Review').length;

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
          {canViewDashboard && (
            <div className="flex h-10 bg-surface-container-high rounded-full shadow-sm">
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex items-center gap-2 px-5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === 'reports' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-primary'
                }`}
              >
                <FileText size={12} />
                Reports
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === 'dashboard' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-primary'
                }`}
              >
                <BarChart3 size={12} />
                Dashboard
              </button>
            </div>
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

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && canViewDashboard && (
        <div className="flex-1 overflow-y-auto">
          <PMDashboard dateRange={dateRange} onDateRangeChange={setDateRange} onRefresh={fetchReports} />
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <>
      {/* Stats - 2x2 grid on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
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

      {/* Reports Table - C4: Scroll wrapper for mobile */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <div className="min-w-[700px]">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-outline-variant/10">
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
              {reports.map(report => (
                <tr key={report.id} className="hover:bg-primary/[0.02] transition-colors">
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
              {reports.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-16 text-center">
                    <p className="text-slate-400 font-medium">No daily reports yet</p>
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
        </>
      )}

      {/* Create Modal - Team-specific form */}
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
          canApprove={(currentUser?.isAdmin || currentUser?.role?.includes('Leader')) && selectedReport.status !== 'Approved'}
          tasks={tasks}
        />
      )}
    </div>
  );
}

// Detail Modal Component
function DailyReportDetailModal({
  report,
  onClose,
  onApprove,
  canApprove,
  tasks
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
              {new Date(report.reportDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
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
          <div>
            <h4 className="text-xs font-black uppercase text-emerald-500 tracking-widest mb-3">Completed Yesterday</h4>
            <div className="space-y-2">
              {tasksData.completedYesterday.length > 0 ? (
                tasksData.completedYesterday.map((id, i) => {
                  const task = tasks.find(t => t.id === id);
                  return (
                    <div key={i} className="p-3 bg-emerald-50 rounded-xl text-sm font-medium text-emerald-700">
                      {task?.title || `Task: ${id.slice(0, 8)}...`}
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-400 text-sm">No tasks completed</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase text-amber-500 tracking-widest mb-3">Still Working On</h4>
            <div className="space-y-2">
              {tasksData.doingYesterday.length > 0 ? (
                tasksData.doingYesterday.map((id, i) => {
                  const task = tasks.find(t => t.id === id);
                  return (
                    <div key={i} className="p-3 bg-amber-50 rounded-xl text-sm font-medium text-amber-700">
                      {task?.title || `Task: ${id.slice(0, 8)}...`}
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-400 text-sm">No ongoing tasks</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase text-primary tracking-widest mb-3">Plan for Today</h4>
            <div className="space-y-2">
              {tasksData.doingToday.length > 0 ? (
                tasksData.doingToday.map((id, i) => {
                  const task = tasks.find(t => t.id === id);
                  return (
                    <div key={i} className="p-3 bg-primary/5 rounded-xl text-sm font-medium text-primary">
                      {task?.title || `Task: ${id.slice(0, 8)}...`}
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-400 text-sm">No planned tasks</p>
              )}
            </div>
          </div>

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
