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

  if (loading || !currentUser) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
            className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            New Report
          </button>
        </div>
      </div>

      {/* Team Confidence Metrics - M9: 2x2 grid on small screens */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm flex flex-col gap-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average Confidence</p>
          <div className="flex items-baseline gap-1">
            <h4 className="text-3xl font-black font-headline">{averageConfidence}</h4>
            <span className="text-xs font-bold text-slate-400">/10</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-tertiary transition-all duration-1000" style={{ width: `${Number(averageConfidence) * 10}%` }}></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm flex flex-col gap-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approved</p>
          <h4 className="text-3xl font-black font-headline text-emerald-600">{approvedReports}</h4>
          <p className="text-[10px] font-bold mt-1 text-emerald-500">
            {reports.length > 0 ? Math.round((approvedReports / reports.length) * 100) : 0}% of total
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm flex flex-col gap-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Review</p>
          <h4 className={`text-3xl font-black font-headline ${pendingReports > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{pendingReports}</h4>
          <p className={`text-[10px] font-bold mt-1 ${pendingReports > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
            {pendingReports > 0 ? 'Need attention' : 'All clear'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm flex flex-col gap-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Sync</p>
          <h4 className="text-xl font-black font-headline">{nextSyncTime}</h4>
          <p className="text-[10px] font-bold text-slate-400 mt-1">Office Meeting Room</p>
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
