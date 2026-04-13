import { useState, useEffect } from 'react';
import { Plus, Calendar, CheckCircle, AlertTriangle, Eye, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DailyReport, WorkItem, DailyReportTasksData } from '../types';

export default function DailySync() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [tasks, setTasks] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { currentUser } = useAuth();

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams({
        userId: currentUser?.id || '',
        userRole: currentUser?.role || '',
        userDepartment: currentUser?.department || ''
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
      const userTasks = data.filter((t: WorkItem) => t.assigneeId === currentUser?.id);
      setTasks(userTasks);
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
    <div className="h-full flex flex-col p-6 md:p-10 space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
            <span className="hover:text-primary cursor-pointer">Sync</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">Daily Report</span>
          </nav>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
            Daily <span className="text-primary italic">Sync</span>
          </h2>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:scale-95 transition-all"
        >
          <Plus size={18} />
          New Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Today's Reports</p>
          <h4 className="text-3xl font-black font-headline mt-2">{todayReports.length}</h4>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approved</p>
          <h4 className="text-3xl font-black font-headline text-emerald-600 mt-2">{approvedCount}</h4>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Review</p>
          <h4 className="text-3xl font-black font-headline text-amber-600 mt-2">{pendingCount}</h4>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Reports</p>
          <h4 className="text-3xl font-black font-headline mt-2">{reports.length}</h4>
        </div>
      </div>

      {/* Reports Table */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white rounded-[32px] border border-outline-variant/10 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-outline-variant/10">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">Date</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">Reporter</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">Impact</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">Blockers</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {reports.map(report => (
                <tr key={report.id} className="hover:bg-primary/[0.02] transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
                      <Calendar size={14} className="text-slate-400" />
                      {new Date(report.reportDate).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-8 py-5">
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
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      report.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      report.impactLevel === 'high' ? 'bg-red-100 text-red-700' :
                      report.impactLevel === 'low' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {report.impactLevel || 'none'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm text-slate-500 truncate max-w-[200px]">
                      {report.blockers || '-'}
                    </p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => { setSelectedReport(report); setIsDetailOpen(true); }}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center">
                    <p className="text-slate-400 font-medium">No daily reports yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <DailyReportModal
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
        />
      )}
    </div>
  );
}

// Create Modal Component
function DailyReportModal({
  tasks,
  onClose,
  onSuccess
}: {
  tasks: WorkItem[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { currentUser } = useAuth();
  const [completedYesterday, setCompletedYesterday] = useState<string[]>([]);
  const [doingYesterday, setDoingYesterday] = useState<string[]>([]);
  const [doingToday, setDoingToday] = useState<string[]>([]);
  const [blockers, setBlockers] = useState('');
  const [impactLevel, setImpactLevel] = useState<'none' | 'low' | 'high'>('none');
  const [submitting, setSubmitting] = useState(false);

  const inProgressTasks = tasks.filter(t => t.status === 'In Progress' || t.status === 'Doing');
  const allTasks = tasks;

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/daily-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          reportDate: new Date().toISOString(),
          tasksData: { completedYesterday, doingYesterday, doingToday },
          blockers: blockers || null,
          impactLevel
        })
      });

      if (res.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to create report:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />
      <div
        className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-black font-headline">New Daily Report</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Yesterday's Tasks */}
          <div>
            <h4 className="text-[11px] font-black uppercase text-emerald-500 tracking-widest mb-4 flex items-center gap-2">
              <CheckCircle size={14} /> Tasks completed yesterday
            </h4>
            <div className="space-y-2">
              {inProgressTasks.map(task => (
                <label key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={completedYesterday.includes(task.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setCompletedYesterday([...completedYesterday, task.id]);
                        setDoingYesterday(doingYesterday.filter(id => id !== task.id));
                      } else {
                        setCompletedYesterday(completedYesterday.filter(id => id !== task.id));
                      }
                    }}
                    className="w-4 h-4 rounded text-emerald-500"
                  />
                  <span className="text-sm font-medium">{task.title}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Still working on */}
          <div>
            <h4 className="text-[11px] font-black uppercase text-amber-500 tracking-widest mb-4 flex items-center gap-2">
              <AlertTriangle size={14} /> Still working on (from yesterday)
            </h4>
            <div className="space-y-2">
              {inProgressTasks.filter(t => !completedYesterday.includes(t.id)).map(task => (
                <label key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={doingYesterday.includes(task.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setDoingYesterday([...doingYesterday, task.id]);
                      } else {
                        setDoingYesterday(doingYesterday.filter(id => id !== task.id));
                      }
                    }}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span className="text-sm font-medium">{task.title}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Today's Plan */}
          <div>
            <h4 className="text-[11px] font-black uppercase text-primary tracking-widest mb-4 flex items-center gap-2">
              <Calendar size={14} /> Plan for today
            </h4>
            <div className="space-y-2">
              {allTasks.map(task => (
                <label key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={doingToday.includes(task.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setDoingToday([...doingToday, task.id]);
                      } else {
                        setDoingToday(doingToday.filter(id => id !== task.id));
                      }
                    }}
                    className="w-4 h-4 rounded text-primary"
                  />
                  <span className="text-sm font-medium">{task.title}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Blockers */}
          <div>
            <h4 className="text-[11px] font-black uppercase text-red-500 tracking-widest mb-4">Blockers & Difficulties</h4>
            <textarea
              value={blockers}
              onChange={e => setBlockers(e.target.value)}
              placeholder="Describe any blockers or difficulties..."
              className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none h-24"
            />
          </div>

          {/* Impact Level */}
          <div>
            <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-4">Impact Level</h4>
            <div className="flex gap-3">
              {['none', 'low', 'high'].map(level => (
                <button
                  key={level}
                  onClick={() => setImpactLevel(level as any)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                    impactLevel === level
                      ? level === 'high' ? 'bg-red-500 text-white' :
                        level === 'low' ? 'bg-yellow-500 text-white' :
                        'bg-slate-500 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-8 py-6 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-95 transition-all disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Detail Modal Component
function DailyReportDetailModal({
  report,
  onClose,
  onApprove,
  canApprove
}: {
  report: DailyReport;
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  canApprove: boolean;
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
        className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
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
            <h4 className="text-[11px] font-black uppercase text-emerald-500 tracking-widest mb-3">Completed Yesterday</h4>
            <div className="space-y-2">
              {tasksData.completedYesterday.length > 0 ? (
                tasksData.completedYesterday.map((id, i) => (
                  <div key={i} className="p-3 bg-emerald-50 rounded-xl text-sm font-medium text-emerald-700">
                    Task ID: {id}
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm">No tasks completed</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-black uppercase text-amber-500 tracking-widest mb-3">Still Working On</h4>
            <div className="space-y-2">
              {tasksData.doingYesterday.length > 0 ? (
                tasksData.doingYesterday.map((id, i) => (
                  <div key={i} className="p-3 bg-amber-50 rounded-xl text-sm font-medium text-amber-700">
                    Task ID: {id}
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm">No ongoing tasks</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-black uppercase text-primary tracking-widest mb-3">Plan for Today</h4>
            <div className="space-y-2">
              {tasksData.doingToday.length > 0 ? (
                tasksData.doingToday.map((id, i) => (
                  <div key={i} className="p-3 bg-primary/5 rounded-xl text-sm font-medium text-primary">
                    Task ID: {id}
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm">No planned tasks</p>
              )}
            </div>
          </div>

          {report.blockers && (
            <div>
              <h4 className="text-[11px] font-black uppercase text-red-500 tracking-widest mb-3">Blockers</h4>
              <div className="p-4 bg-red-50 rounded-xl">
                <p className="text-sm text-red-700">{report.blockers}</p>
              </div>
            </div>
          )}

          {report.impactLevel && report.impactLevel !== 'none' && (
            <div>
              <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-3">Impact Level</h4>
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
