import React from 'react';
import { X, CheckCircle } from 'lucide-react';
import { WeeklyReport } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface ReportDetailDialogProps {
  report: WeeklyReport | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (reportId: string) => Promise<void>;
}

// Helper to parse JSON safely
function parseJSON<T>(str: string): T | null {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

export default function ReportDetailDialog({ report, isOpen, onClose, onApprove }: ReportDetailDialogProps) {
  const { currentUser } = useAuth();
  const [approving, setApproving] = React.useState(false);

  if (!isOpen || !report) return null;

  const user = report.user;
  const canApprove = currentUser?.isAdmin && report.status !== 'Approved';

  const handleApprove = async () => {
    if (!onApprove || approving) return;
    setApproving(true);
    try {
      await onApprove(report.id);
    } finally {
      setApproving(false);
    }
  };
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

  const primaryDept = user?.departments?.[0] || '';
  const deptColor = user ? (deptColors[primaryDept] || 'bg-slate-50 text-slate-600 border-slate-200') : 'bg-slate-50 text-slate-600 border-slate-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />

      {/* Dialog */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 md:px-10 py-5 md:py-6 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Reporter Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl md:text-2xl font-black text-gray-900 font-headline truncate">{user?.fullName || 'Unknown User'}</h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {user?.departments?.map(dept => (
                  <span key={dept} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${deptColors[dept] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                    {dept}
                  </span>
                ))}
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user?.role}</span>
              </div>
            </div>

            {/* Right: Metrics Grid */}
            <div className="flex items-center gap-4">
              <div className="hidden md:grid grid-cols-4 gap-4">
                <div className="text-center px-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Week</p>
                  <p className="text-xs font-bold text-gray-900">
                    {weekStart.getDate().toString().padStart(2, '0')}/{(weekStart.getMonth() + 1).toString().padStart(2, '0')} - {weekEnding.getDate().toString().padStart(2, '0')}/{(weekEnding.getMonth() + 1).toString().padStart(2, '0')}
                  </p>
                  <p className="text-[10px] text-gray-400">{weekEnding.getFullYear()}</p>
                </div>
                <div className="text-center px-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    report.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {report.status || 'Review'}
                  </span>
                </div>
                <div className="text-center px-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Score</p>
                  <p className="text-2xl font-black text-gray-900 font-headline">{report.score || 0}<span className="text-sm text-gray-400">/10</span></p>
                </div>
                <div className="text-center px-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Confidence</p>
                  <p className="text-2xl font-black text-gray-900 font-headline">{report.confidenceScore || 0}<span className="text-sm text-gray-400">/10</span></p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {canApprove && (
                  <button
                    onClick={handleApprove}
                    disabled={approving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-full font-bold text-sm hover:bg-emerald-600 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle size={18} />
                    <span className="hidden sm:inline">{approving ? 'Approving...' : 'Approve'}</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-11 h-11 flex items-center justify-center rounded-full bg-gray-50 hover:bg-red-50 hover:text-red-500 text-gray-400 transition-all border border-gray-200 hover:border-red-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-10 py-8 space-y-10 bg-gradient-to-b from-gray-50/30 to-white">
          {/* Progress Section */}
          <div>
            <h4 className="text-xs font-black uppercase text-emerald-500 tracking-[0.25em] flex items-center gap-3 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30"></span> Progress - Báo cáo tiến độ
            </h4>
            <div className="space-y-6">
              {progressData?.keyResults?.map((kr, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-6 mb-4">
                    <div className="flex-1">
                      <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">{kr.krId}</span>
                      <h5 className="text-base font-bold text-gray-900 mt-2 leading-snug">{kr.title}</h5>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 font-bold">Before</span>
                        <p className="text-lg font-black text-gray-500">{kr.previousProgress}%</p>
                      </div>
                      <span className="material-symbols-outlined text-gray-300 text-[20px]">arrow_forward</span>
                      <div className="text-right">
                        <span className="text-[10px] text-emerald-500 font-bold">Current</span>
                        <p className="text-lg font-black text-emerald-600">{kr.currentProgress}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-5 shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${kr.currentProgress}%` }}
                    />
                  </div>

                  {/* Activities */}
                  {kr.activities && kr.activities.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Đã làm gì trong tuần</p>
                      <ul className="space-y-2.5">
                        {kr.activities.map((activity, aIdx) => (
                          <li key={aIdx} className="flex items-start gap-3">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 mt-2 shadow-sm"></span>
                            <span className="text-sm text-gray-700 leading-relaxed">{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Impact */}
                  {kr.impact && (
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-100 shadow-sm">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Đánh giá tác động</p>
                      <p className="text-sm text-emerald-800 leading-relaxed">{kr.impact}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Plans Section */}
          <div>
            <h4 className="text-xs font-black uppercase text-blue-500 tracking-[0.25em] flex items-center gap-3 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30"></span> Plans - Kế hoạch tuần tới
            </h4>
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-left w-14">STT</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-left">Hạng mục</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-left">Cam kết đầu ra</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-left w-32">Deadline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {plansData?.items?.map((plan, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 text-xs font-black border border-blue-100">
                          {plan.stt || idx + 1}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-gray-900">{plan.item}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm text-gray-600 leading-relaxed">{plan.output}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
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
            <h4 className="text-xs font-black uppercase text-red-500 tracking-[0.25em] flex items-center gap-3 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-lg shadow-red-500/30"></span> Blockers - Rào cản & Yêu cầu hỗ trợ
            </h4>
            {!blockersData?.items || blockersData.items.length === 0 ? (
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 border border-emerald-100 text-center shadow-sm">
                <span className="material-symbols-outlined text-4xl text-emerald-400 mb-3">check_circle</span>
                <p className="text-base font-bold text-emerald-600">No blockers - All clear!</p>
              </div>
            ) : (
              <div className="space-y-5">
                {blockersData.items.map((blocker, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-red-50 to-rose-50 rounded-3xl p-7 border border-red-100 shadow-sm">
                    <div className="flex items-start gap-4 mb-4">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-red-100 to-rose-100 text-red-500 flex-shrink-0 mt-0.5 border border-red-200 shadow-sm">
                        <span className="material-symbols-outlined text-[20px]">warning</span>
                      </span>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Khó khăn {idx + 1}</p>
                        <p className="text-base text-red-700 leading-relaxed font-medium">{blocker.difficulty}</p>
                      </div>
                    </div>
                    {blocker.supportRequest && (
                      <div className="ml-13 bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-red-100/50 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Yêu cầu hỗ trợ</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{blocker.supportRequest}</p>
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
