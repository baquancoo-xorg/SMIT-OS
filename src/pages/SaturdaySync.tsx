import { useState, useEffect } from 'react';
import WeeklyCheckinModal from '../components/modals/WeeklyCheckinModal';
import ReportTableView from '../components/board/ReportTableView';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { WeeklyReport } from '../types';

export default function SaturdaySync() {
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reports, setReports] = useState<WeeklyReport[]>([]);
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

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading || !currentUser) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const averageConfidence = reports.length > 0 
    ? (reports.reduce((sum, r) => sum + r.confidenceScore, 0) / reports.length).toFixed(1)
    : '0.0';

  const activeBlockers = reports.filter(r => r.blockers && r.blockers.length > 10).length;

  return (
    <div className="h-full flex flex-col p-6 md:p-10 space-y-8 w-full">
      {/* Weekly Sync Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
            <span className="hover:text-primary cursor-pointer">Sync</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">Weekly Report</span>
          </nav>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Saturday <span className="text-tertiary italic">Sync</span></h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-surface-container-high rounded-full border border-outline-variant/10">
            <button 
              onClick={() => setView('grid')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${view === 'grid' ? 'bg-white text-primary shadow-md' : 'text-slate-500 hover:text-primary'}`}
            >
              <LayoutGrid size={14} />
              Grid
            </button>
            <button 
              onClick={() => setView('table')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${view === 'table' ? 'bg-white text-primary shadow-md' : 'text-slate-500 hover:text-primary'}`}
            >
              <List size={14} />
              Table
            </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            New Report
          </button>
        </div>
      </div>

      {/* Team Confidence Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

      {view === 'table' ? (
        <div className="flex-1 overflow-y-auto pb-8">
          <ReportTableView reports={reports} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 overflow-y-auto pb-8">
          {reports.map(report => (
            <ReportCard key={report.id} report={report} />
          ))}
          {reports.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                <span className="material-symbols-outlined text-4xl">description</span>
              </div>
              <p className="text-slate-400 font-medium">No reports submitted yet for this cycle.</p>
            </div>
          )}
        </div>
      )}

      <WeeklyCheckinModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchReports}
      />
    </div>
  );
}

function ReportCard({ report }: { report: WeeklyReport }) {
  const deptColors: Record<string, string> = {
    'Tech': 'text-blue-500 bg-blue-50',
    'Marketing': 'text-orange-500 bg-orange-50',
    'Media': 'text-pink-500 bg-pink-50',
    'Sale': 'text-emerald-500 bg-emerald-50',
    'BOD': 'text-indigo-500 bg-indigo-50',
  };
  
  const user = report.user;
  const colorClass = user ? (deptColors[user.department] || 'text-slate-500 bg-slate-50') : 'text-slate-500 bg-slate-50';

  return (
    <div className="bg-white rounded-[40px] border border-outline-variant/10 shadow-xl shadow-slate-200/20 overflow-hidden flex flex-col hover:scale-[1.02] transition-all duration-500 group">
      <div className="p-8 border-b border-outline-variant/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.fullName} 
                className="w-14 h-14 rounded-2xl object-cover border border-outline-variant/10 shadow-sm group-hover:rotate-6 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-on-surface border border-outline-variant/10 shadow-sm group-hover:rotate-6 transition-transform">
                {user?.fullName.split(' ').map((n: string) => n[0]).join('') || '?'}
              </div>
            )}
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg border-2 border-white flex items-center justify-center ${colorClass}`}>
              <span className="text-[10px] font-black">{user?.department[0] || 'U'}</span>
            </div>
          </div>
          <div>
            <h3 className="font-black text-on-surface text-lg font-headline">{user?.fullName || 'Unknown User'}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user?.department} • {user?.role}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-on-surface font-headline">{report.confidenceScore}</div>
          <div className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em]">Confidence</div>
        </div>
      </div>
      
      <div className="p-8 space-y-8 flex-1">
        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Progress
          </h4>
          <p className="text-sm text-on-surface-variant leading-relaxed font-medium pl-3.5 border-l-2 border-emerald-100">
            {report.progress}
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Plans
          </h4>
          <p className="text-sm text-on-surface-variant leading-relaxed font-medium pl-3.5 border-l-2 border-primary/10">
            {report.plans}
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase text-error tracking-[0.2em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-error"></span> Blockers
          </h4>
          <p className="text-sm text-error/80 leading-relaxed font-medium pl-3.5 border-l-2 border-error/10">
            {report.blockers || 'None'}
          </p>
        </div>
      </div>
      
      <div className="p-6 bg-slate-50/50 border-t border-outline-variant/5 flex justify-center">
        <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors flex items-center gap-2">
          View Full Report
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
