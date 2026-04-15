import React from 'react';
import { X, Send, History, AlertOctagon, Target, CalendarClock } from 'lucide-react';
import { TeamType } from '../../types/daily-report-metrics';
import { getTeamColors, getTeamDisplayName } from '../../utils/team-detection';

interface DailyReportBaseProps {
  teamType: TeamType;
  userName: string;
  userRole: string;
  userAvatar: string;
  reportDate: string;
  onDateChange: (date: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  submitting: boolean;
  yesterdaySection: React.ReactNode;
  blockersSection: React.ReactNode;
  todaySection: React.ReactNode;
}

export default function DailyReportBase({
  teamType,
  userName,
  userRole,
  userAvatar,
  reportDate,
  onDateChange,
  onClose,
  onSubmit,
  submitting,
  yesterdaySection,
  blockersSection,
  todaySection,
}: DailyReportBaseProps) {
  const colors = getTeamColors(teamType);
  const teamName = getTeamDisplayName(teamType);

  const headerIcons: Record<TeamType, React.ReactNode> = {
    tech: <span className="material-symbols-outlined mr-2">code</span>,
    marketing: <span className="material-symbols-outlined mr-2">campaign</span>,
    media: <span className="material-symbols-outlined mr-2">movie</span>,
    sale: <span className="material-symbols-outlined mr-2">payments</span>,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />
      <div
        className="relative bg-slate-100 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${colors.bg} p-6 text-white flex justify-between items-center flex-wrap gap-4`}>
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 bg-white ${colors.text} rounded-full flex items-center justify-center font-black text-xl`}>
              {userAvatar}
            </div>
            <div>
              <h1 className="text-xl font-black flex items-center">
                {headerIcons[teamType]}
                {teamName.toUpperCase()} DAILY SYNC
              </h1>
              <p className="text-white/80 text-sm font-medium">
                Xin chào {userName} ({userRole})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-black/20 p-2.5 rounded-3xl border border-white/20">
              <CalendarClock size={18} className="text-white/70 mr-2" />
              <div className="flex flex-col">
                <label className="text-[10px] text-white/70 font-bold uppercase tracking-wider leading-none mb-1">
                  Ngày báo cáo
                </label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="bg-transparent text-white text-sm font-bold focus:outline-none cursor-pointer [color-scheme:dark] p-0 border-0 leading-none"
                />
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Yesterday */}
          <div>
            <h2 className={`text-lg font-black text-slate-800 mb-3 flex items-center`}>
              <History size={20} className={`mr-2 ${colors.text}`} />
              1. Review công việc hôm qua
            </h2>
            <div className="space-y-3">{yesterdaySection}</div>
          </div>

          {/* Section 2: Blockers */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-slate-800 flex items-center">
                <AlertOctagon size={20} className="mr-2 text-red-500" />
                2. Khó khăn & Rủi ro
              </h2>
            </div>
            {blockersSection}
          </div>

          {/* Section 3: Today */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-slate-800 flex items-center">
                <Target size={20} className="mr-2 text-amber-500" />
                3. Mục tiêu Focus hôm nay
              </h2>
            </div>
            {todaySection}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white">
          <button
            onClick={onSubmit}
            disabled={submitting}
            className={`w-full py-3.5 rounded-full font-black text-white ${colors.bg} hover:opacity-90 shadow-lg flex justify-center items-center transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50`}
          >
            <Send size={18} className="mr-2" />
            {submitting ? 'Đang gửi...' : 'Gửi Báo Cáo Daily'}
          </button>
        </div>
      </div>
    </div>
  );
}
