import React from 'react';
import { WeeklyReport, Sprint } from '../../types';

interface ReportTableViewProps {
  reports: WeeklyReport[];
  onViewDetail: (report: WeeklyReport) => void;
  sprints?: Sprint[];
}

// Helper to get week number from date
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Helper to format date to Vietnamese format
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Helper to get sprint name for a given date
function getSprintForDate(date: Date, sprints: Sprint[]): Sprint | null {
  const reportDate = new Date(date);
  for (const sprint of sprints) {
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    if (reportDate >= startDate && reportDate <= endDate) {
      return sprint;
    }
  }
  return null;
}

export default function ReportTableView({ reports, onViewDetail, sprints = [] }: ReportTableViewProps) {
  // Sort reports by week (most recent first)
  const sortedReports = [...reports].sort((a, b) => {
    const dateA = new Date(a.weekEnding).getTime();
    const dateB = new Date(b.weekEnding).getTime();
    return dateB - dateA;
  });

  return (
    <div className="bg-white rounded-3xl shadow-sm shadow-xl shadow-slate-200/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {/* Column order: Created at → Reporter → Status → Department → Week → Sprint */}
            <tr className="bg-slate-50/50 border-b border-outline-variant/10">
              <th className="px-4 md:px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 min-w-[100px]">Created at</th>
              <th className="px-4 md:px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 min-w-[150px]">Reporter</th>
              <th className="px-4 md:px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 min-w-[90px]">Status</th>
              <th className="px-4 md:px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 min-w-[100px]">Department</th>
              <th className="px-4 md:px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 min-w-[180px]">Week</th>
              <th className="px-4 md:px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 min-w-[100px]">Sprint</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50">
            {sortedReports.map(report => {
              const user = report.user;
              const weekEnding = new Date(report.weekEnding);
              const weekNumber = getWeekNumber(weekEnding);
              const weekStart = new Date(weekEnding);
              weekStart.setDate(weekStart.getDate() - 6);
              const sprint = getSprintForDate(weekEnding, sprints);

              return (
                <tr
                  key={report.id}
                  onClick={() => onViewDetail(report)}
                  className="hover:bg-primary/[0.02] transition-colors group cursor-pointer"
                >
                  {/* Created at */}
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">calendar_today</span>
                      {formatDate(report.createdAt)}
                    </div>
                  </td>

                  {/* Reporter */}
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-on-surface text-xs shadow-sm group-hover:scale-110 transition-transform">
                        {user?.fullName.split(' ').map(n => n[0]).join('') || '?'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-on-surface group-hover:text-primary transition-colors">
                          {user?.fullName || 'Unknown'}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {user?.role || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      report.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {report.status || 'Review'}
                    </span>
                  </td>

                  {/* Department */}
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-1">
                      {user?.departments?.map(dept => (
                        <span key={dept} className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          dept === 'Tech' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          dept === 'Marketing' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                          dept === 'Media' ? 'bg-pink-50 text-pink-600 border-pink-100' :
                          dept === 'Sale' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          'bg-indigo-50 text-indigo-600 border-indigo-100'
                        }`}>
                          {dept}
                        </span>
                      )) || <span className="text-slate-400 text-[10px]">N/A</span>}
                    </div>
                  </td>

                  {/* Week - Format: DD/MM/YYYY - DD/MM/YYYY (W15) */}
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">date_range</span>
                      <span>
                        {weekStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })} - {weekEnding.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                      <span className="text-xs font-bold text-slate-400 ml-1">
                        (W{weekNumber})
                      </span>
                    </div>
                  </td>

                  {/* Sprint */}
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-primary">track_changes</span>
                      <span className="text-sm font-bold text-on-surface">
                        {sprint ? sprint.name : 'N/A'}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
