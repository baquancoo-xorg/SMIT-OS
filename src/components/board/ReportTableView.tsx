import React from 'react';
import { WeeklyReport } from '../../types';

interface ReportTableViewProps {
  reports: WeeklyReport[];
  onViewDetail: (report: WeeklyReport) => void;
}

// Helper to parse JSON safely
function parseJSON<T>(str: string): T | null {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

// Format progress data - show KR titles with progress indicators
function formatProgress(progressStr: string): React.ReactNode {
  const data = parseJSON<{ keyResults?: Array<{ krId: string; title: string; previousProgress: number; currentProgress: number; progressChange: number }> }>(progressStr);

  if (!data?.keyResults || data.keyResults.length === 0) {
    return <span className="text-xs text-slate-400 italic">No progress data</span>;
  }

  return (
    <div className="space-y-2">
      {data.keyResults.map((kr, idx) => (
        <div key={idx} className="flex items-start gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black flex-shrink-0 mt-0.5">
            {kr.progressChange > 0 ? '+' : ''}{kr.progressChange}%
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-on-surface-variant font-medium leading-snug line-clamp-2">
              {kr.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${kr.currentProgress}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-400 flex-shrink-0">{kr.currentProgress}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Format plans data - show plan items with deadlines
function formatPlans(plansStr: string): React.ReactNode {
  const data = parseJSON<{ items?: Array<{ item: string; output: string; deadline: string }> }>(plansStr);

  if (!data?.items || data.items.length === 0) {
    return <span className="text-xs text-slate-400 italic">No plans</span>;
  }

  return (
    <div className="space-y-2">
      {data.items.map((plan, idx) => (
        <div key={idx} className="flex items-start gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-black flex-shrink-0 mt-0.5">
            {idx + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-on-surface-variant font-medium leading-snug line-clamp-2">
              {plan.item}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">calendar_today</span>
              {new Date(plan.deadline).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Format blockers data - show blocker difficulties
function formatBlockers(blockersStr: string): React.ReactNode {
  const data = parseJSON<{ items?: Array<{ difficulty: string; supportRequest: string }> }>(blockersStr);

  if (!data?.items || data.items.length === 0) {
    return <span className="text-xs text-emerald-500 font-medium">None</span>;
  }

  return (
    <div className="space-y-2">
      {data.items.map((blocker, idx) => (
        <div key={idx} className="flex items-start gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-error/10 text-error text-[10px] font-black flex-shrink-0 mt-0.5">
            !
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-error/80 font-medium leading-snug line-clamp-2">
              {blocker.difficulty}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ReportTableView({ reports, onViewDetail }: ReportTableViewProps) {
  return (
    <div className="bg-white rounded-[32px] border border-outline-variant/10 shadow-xl shadow-slate-200/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-outline-variant/10">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Leader</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Dept</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 w-[300px]">Progress (P)</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 w-[250px]">Plans (P)</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 w-[250px]">Blockers (B)</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Confidence</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50">
            {reports.map(report => {
              const user = report.user;

              return (
                <tr key={report.id} className="hover:bg-primary/[0.02] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-on-surface text-xs border border-outline-variant/10 shadow-sm group-hover:scale-110 transition-transform">
                        {user?.fullName.split(' ').map(n => n[0]).join('') || '?'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-on-surface group-hover:text-primary transition-colors">{user?.fullName || 'Unknown'}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user?.role}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${user?.department === 'Tech' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      user?.department === 'Marketing' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                        user?.department === 'Media' ? 'bg-pink-50 text-pink-600 border-pink-100' :
                          user?.department === 'Sale' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            'bg-indigo-50 text-indigo-600 border-indigo-100'
                      }`}>
                      {user?.department}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    {formatProgress(report.progress)}
                  </td>
                  <td className="px-8 py-5">
                    {formatPlans(report.plans)}
                  </td>
                  <td className="px-8 py-5">
                    {formatBlockers(report.blockers)}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-4 rounded-sm ${i < Math.floor((report.confidenceScore || 0) / 2) ? 'bg-tertiary' : 'bg-slate-100'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-black text-on-surface font-headline">{(report.confidenceScore || 0)}/10</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => onViewDetail(report)}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </button>
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
