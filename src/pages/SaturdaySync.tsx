import { useState, useEffect } from 'react';
import WeeklyCheckinModal from '../components/modals/WeeklyCheckinModal';
import ReportTableView from '../components/board/ReportTableView';
import ReportDetailDialog from '../components/modals/ReportDetailDialog';
import { Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { WeeklyReport, Sprint } from '../types';

export default function SaturdaySync() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const { users, currentUser } = useAuth();

  const leaders = users.filter(u => u.role.includes('Leader') || u.role === 'PM' || u.role.includes('Director'));

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

  if (loading || !currentUser) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const averageConfidence = reports.length > 0
    ? (reports.reduce((sum, r) => sum + (r.confidenceScore || 0), 0) / reports.length).toFixed(1)
    : '0.0';

  const activeBlockers = reports.filter(r => r.blockers && r.blockers.length > 10).length;

  return (
    <div className="h-full flex flex-col p-6 md:p-10 space-y-8 w-full">
      {/* Weekly Sync Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
            <span className="hover:text-primary cursor-pointer">Rituals</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">Weekly Report</span>
          </nav>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Saturday <span className="text-tertiary italic">Sync</span></h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            New Report
          </button>
        </div>
      </div>

      {/* Team Confidence Metrics - M9: 2x2 grid on small screens */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-sm flex flex-col gap-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average Confidence</p>
          <div className="flex items-baseline gap-1">
            <h4 className="text-3xl font-black font-headline">{averageConfidence}</h4>
            <span className="text-xs font-bold text-slate-400">/10</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-tertiary transition-all duration-1000" style={{ width: `${Number(averageConfidence) * 10}%` }}></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-sm flex flex-col gap-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reports Submitted</p>
          <h4 className="text-3xl font-black font-headline">{reports.length}/{leaders.length}</h4>
          <p className="text-[10px] font-bold text-emerald-500 mt-1">{Math.round((reports.length / leaders.length) * 100)}% Completion</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-sm flex flex-col gap-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Blockers</p>
          <h4 className={`text-3xl font-black font-headline ${activeBlockers > 0 ? 'text-error' : ''}`}>{activeBlockers}</h4>
          <p className={`text-[10px] font-bold mt-1 ${activeBlockers > 0 ? 'text-error' : 'text-emerald-500'}`}>
            {activeBlockers > 0 ? 'Attention Required' : 'System Normal'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-sm flex flex-col gap-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Sync</p>
          <h4 className="text-xl font-black font-headline">Tomorrow, 09:00</h4>
          <p className="text-[10px] font-bold text-slate-400 mt-1">Zoom Meeting ID: 422 991</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        <ReportTableView reports={reports} onViewDetail={handleViewDetail} sprints={sprints} />
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
