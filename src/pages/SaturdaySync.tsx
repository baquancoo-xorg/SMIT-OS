import { useState } from 'react';
import { users } from '../data/mockData';
import WeeklyCheckinModal from '../components/modals/WeeklyCheckinModal';
import ReportTableView from '../components/board/ReportTableView';
import { Plus, LayoutGrid, List } from 'lucide-react';

export default function SaturdaySync() {
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const leaders = users.filter(u => u.role.includes('Leader') || u.role === 'PM');
  const currentUser = users[0]; // Mocked as Nguyễn Quân (PM)

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
            <h4 className="text-3xl font-black font-headline">8.2</h4>
            <span className="text-xs font-bold text-slate-400">/10</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-tertiary w-[82%]"></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-sm flex flex-col gap-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reports Submitted</p>
          <h4 className="text-3xl font-black font-headline">12/15</h4>
          <p className="text-[10px] font-bold text-emerald-500 mt-1">80% Completion</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-sm flex flex-col gap-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Blockers</p>
          <h4 className="text-3xl font-black font-headline text-error">5</h4>
          <p className="text-[10px] font-bold text-error mt-1">Requires Attention</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-outline-variant/10 shadow-sm flex flex-col gap-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Sync</p>
          <h4 className="text-xl font-black font-headline">Tomorrow, 09:00</h4>
          <p className="text-[10px] font-bold text-slate-400 mt-1">Zoom Meeting ID: 422 991</p>
        </div>
      </div>

      {view === 'table' ? (
        <div className="flex-1 overflow-y-auto pb-8">
          <ReportTableView leaders={leaders} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 overflow-y-auto pb-8">
          {leaders.map(leader => (
            <ReportCard key={leader.id} leader={leader} />
          ))}
        </div>
      )}

      <WeeklyCheckinModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        currentUser={currentUser}
      />
    </div>
  );
}

function ReportCard({ leader }: any) {
  const deptColors: Record<string, string> = {
    'Tech': 'text-blue-500 bg-blue-50',
    'Marketing': 'text-orange-500 bg-orange-50',
    'Media': 'text-pink-500 bg-pink-50',
    'Sale': 'text-emerald-500 bg-emerald-50',
    'BOD': 'text-indigo-500 bg-indigo-50',
  };
  const colorClass = deptColors[leader.department] || 'text-slate-500 bg-slate-50';

  const mockData: Record<string, any> = {
    'Tech': {
      progress: 'Hoàn thành 80% Sprint 1. Đã fix xong lỗi Proxy. Deploy thành công Aha Block lên staging.',
      plans: 'Release Aha Block lên Production. Setup tracking event cho In-app.',
      blockers: 'Thiếu API key từ đối tác thứ 3 để test luồng thanh toán.',
      score: 8
    },
    'Marketing': {
      progress: 'Chạy xong Webinar thu về 300 MQLs. Đã lên kịch bản seeding cho tuần sau.',
      plans: 'A/B Test Landing Page mới. Tối ưu lại tệp đối tượng chạy Ads.',
      blockers: 'Ngân sách Ads đang bị limit do tài khoản mới.',
      score: 7
    },
    'Media': {
      progress: 'Edit xong Video Onboarding. Bàn giao Layout PDF Sale cho đội Sale.',
      plans: 'Quay video phỏng vấn khách hàng. Lên concept cho chiến dịch tháng 5.',
      blockers: 'Chưa chốt được lịch quay với khách hàng.',
      score: 9
    },
    'BOD': {
      progress: 'Chốt thành công hợp đồng Agency A. Đang deal với Tập đoàn XYZ.',
      plans: 'Đẩy mạnh chốt sale các deal đang ở bước Demo. Review lại Sale Playbook.',
      blockers: 'Tỷ lệ rớt deal ở bước Demo còn cao do thiếu tính năng X.',
      score: 8
    }
  };

  const data = mockData[leader.department] || mockData['Tech'];

  return (
    <div className="bg-white rounded-[40px] border border-outline-variant/10 shadow-xl shadow-slate-200/20 overflow-hidden flex flex-col hover:scale-[1.02] transition-all duration-500 group">
      <div className="p-8 border-b border-outline-variant/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            {leader.avatar ? (
              <img 
                src={leader.avatar} 
                alt={leader.fullName} 
                className="w-14 h-14 rounded-2xl object-cover border border-outline-variant/10 shadow-sm group-hover:rotate-6 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-on-surface border border-outline-variant/10 shadow-sm group-hover:rotate-6 transition-transform">
                {leader.fullName.split(' ').map((n: string) => n[0]).join('')}
              </div>
            )}
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg border-2 border-white flex items-center justify-center ${colorClass}`}>
              <span className="text-[10px] font-black">{leader.department[0]}</span>
            </div>
          </div>
          <div>
            <h3 className="font-black text-on-surface text-lg font-headline">{leader.fullName}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{leader.department} • {leader.role}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-on-surface font-headline">{data.score}</div>
          <div className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em]">Confidence</div>
        </div>
      </div>
      
      <div className="p-8 space-y-8 flex-1">
        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Progress
          </h4>
          <p className="text-sm text-on-surface-variant leading-relaxed font-medium pl-3.5 border-l-2 border-emerald-100">
            {data.progress}
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Plans
          </h4>
          <p className="text-sm text-on-surface-variant leading-relaxed font-medium pl-3.5 border-l-2 border-primary/10">
            {data.plans}
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase text-error tracking-[0.2em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-error"></span> Blockers
          </h4>
          <p className="text-sm text-error/80 leading-relaxed font-medium pl-3.5 border-l-2 border-error/10">
            {data.blockers}
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
