import React from 'react';
import { X } from 'lucide-react';
import { WeeklyReport } from '../../types';

interface ReportDetailDialogProps {
  report: WeeklyReport | null;
  isOpen: boolean;
  onClose: () => void;
}

// Helper to parse JSON safely
function parseJSON<T>(str: string): T | null {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

export default function ReportDetailDialog({ report, isOpen, onClose }: ReportDetailDialogProps) {
  if (!isOpen || !report) return null;

  const user = report.user;
  const weekEnding = new Date(report.weekEnding);
  const weekStart = new Date(weekEnding);
  weekStart.setDate(weekStart.getDate() - 6);

  const progressData = parseJSON<{ keyResults?: Array<{ krId: string; title: string; previousProgress: number; currentProgress: number; progressChange: number; activities: string[]; impact: string }> }>(report.progress);
  const plansData = parseJSON<{ items?: Array<{ stt: number; item: string; output: string; deadline: string }> }>(report.plans);
  const blockersData = parseJSON<{ items?: Array<{ difficulty: string; supportRequest: string }> }>(report.blockers);

  const deptColors: Record<string, string> = {
    'Tech': 'bg-blue-50 text-blue-600 border-blue-200',
    'Marketing': 'bg-orange-50 text-orange-600 border-orange-200',
    'Media': 'bg-pink-50 text-pink-600 border-pink-200',
    'Sale': 'bg-emerald-50 text-emerald-600 border-emerald-200',
    'BOD': 'bg-indigo-50 text-indigo-600 border-indigo-200',
  };

  const deptColor = user ? (deptColors[user.department] || 'bg-slate-50 text-slate-600 border-slate-200') : 'bg-slate-50 text-slate-600 border-slate-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-on-surface text-lg border border-outline-variant/10 shadow-sm">
              {user?.fullName.split(' ').map(n => n[0]).join('') || '?'}
            </div>
            <div>
              <h3 className="text-xl font-black text-on-surface font-headline">{user?.fullName || 'Unknown User'}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${deptColor}`}>
                  {user?.department}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user?.role}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Week</p>
              <p className="text-sm font-bold text-on-surface mt-0.5">
                {weekStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - {weekEnding.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</p>
              <p className="text-2xl font-black text-on-surface font-headline">{report.score || 0}<span className="text-sm text-slate-400">/10</span></p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-error/10 hover:text-error text-slate-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
          {/* Progress Section */}
          <div>
            <h4 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Progress - Báo cáo tiến độ
            </h4>
            <div className="space-y-4">
              {progressData?.keyResults?.map((kr, idx) => (
                <div key={idx} className="bg-slate-50/50 rounded-2xl p-5 border border-outline-variant/5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{kr.krId}</span>
                      <h5 className="text-sm font-bold text-on-surface mt-1 leading-snug">{kr.title}</h5>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold">Before</span>
                        <p className="text-sm font-black text-slate-500">{kr.previousProgress}%</p>
                      </div>
                      <span className="material-symbols-outlined text-slate-300 text-[16px]">arrow_forward</span>
                      <div className="text-right">
                        <span className="text-[10px] text-emerald-500 font-bold">Current</span>
                        <p className="text-sm font-black text-emerald-600">{kr.currentProgress}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all"
                      style={{ width: `${kr.currentProgress}%` }}
                    />
                  </div>

                  {/* Activities */}
                  {kr.activities && kr.activities.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Đã làm gì trong tuần</p>
                      <ul className="space-y-1.5">
                        {kr.activities.map((activity, aIdx) => (
                          <li key={aIdx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5"></span>
                            <span className="text-xs text-on-surface-variant leading-relaxed">{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Impact */}
                  {kr.impact && (
                    <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/50">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Đánh giá tác động</p>
                      <p className="text-xs text-emerald-700/80 leading-relaxed">{kr.impact}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Plans Section */}
          <div>
            <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-primary"></span> Plans - Kế hoạch tuần tới
            </h4>
            <div className="bg-slate-50/50 rounded-2xl border border-outline-variant/5 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant/10">
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left w-12">STT</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">Hạng mục</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">Cam kết đầu ra</th>
                    <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left w-28">Deadline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {plansData?.items?.map((plan, idx) => (
                    <tr key={idx} className="hover:bg-primary/[0.02]">
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-black">
                          {plan.stt || idx + 1}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs font-bold text-on-surface">{plan.item}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs text-on-surface-variant leading-relaxed">{plan.output}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                          {new Date(plan.deadline).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Blockers Section */}
          <div>
            <h4 className="text-[10px] font-black uppercase text-error tracking-[0.2em] flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-error"></span> Blockers - Rào cản & Yêu cầu hỗ trợ
            </h4>
            {!blockersData?.items || blockersData.items.length === 0 ? (
              <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100/50 text-center">
                <span className="material-symbols-outlined text-3xl text-emerald-400 mb-2">check_circle</span>
                <p className="text-sm font-bold text-emerald-600">No blockers - All clear!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {blockersData.items.map((blocker, idx) => (
                  <div key={idx} className="bg-error/5 rounded-2xl p-5 border border-error/10">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-error/10 text-error flex-shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[18px]">warning</span>
                      </span>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-error uppercase tracking-widest mb-1">Khó khăn {idx + 1}</p>
                        <p className="text-sm text-error/80 leading-relaxed font-medium">{blocker.difficulty}</p>
                      </div>
                    </div>
                    {blocker.supportRequest && (
                      <div className="ml-10 bg-white/60 rounded-xl p-3 border border-error/5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Yêu cầu hỗ trợ</p>
                        <p className="text-xs text-on-surface-variant leading-relaxed">{blocker.supportRequest}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
