import React from 'react';
import { WeeklyReport } from '../../types';

interface ReportTableViewProps {
  reports: WeeklyReport[];
}

export default function ReportTableView({ reports }: ReportTableViewProps) {
  return (
    <div className="bg-white rounded-[32px] border border-outline-variant/10 shadow-xl shadow-slate-200/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-outline-variant/10">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Leader</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Dept</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Progress (P)</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Plans (P)</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Blockers (B)</th>
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
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      user?.department === 'Tech' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      user?.department === 'Marketing' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      user?.department === 'Media' ? 'bg-pink-50 text-pink-600 border-pink-100' :
                      user?.department === 'Sale' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      'bg-indigo-50 text-indigo-600 border-indigo-100'
                    }`}>
                      {user?.department}
                    </span>
                  </td>
                  <td className="px-8 py-5 max-w-xs">
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed font-medium">{report.progress}</p>
                  </td>
                  <td className="px-8 py-5 max-w-xs">
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed font-medium">{report.plans}</p>
                  </td>
                  <td className="px-8 py-5 max-w-xs">
                    <p className="text-xs text-error/80 line-clamp-2 leading-relaxed font-bold">{report.blockers || 'None'}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-2 h-4 rounded-sm ${i < Math.floor(report.confidenceScore / 2) ? 'bg-tertiary' : 'bg-slate-100'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-black text-on-surface font-headline">{report.confidenceScore}/10</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
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
