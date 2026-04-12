import React from 'react';
import { User } from '../../types';
import { 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  Star,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';

interface ReportTableViewProps {
  leaders: User[];
}

export default function ReportTableView({ leaders }: ReportTableViewProps) {
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
    'Sale': {
      progress: 'Chốt thành công hợp đồng Agency A. Đang deal với Tập đoàn XYZ.',
      plans: 'Đẩy mạnh chốt sale các deal đang ở bước Demo. Review lại Sale Playbook.',
      blockers: 'Tỷ lệ rớt deal ở bước Demo còn cao do thiếu tính năng X.',
      score: 8
    },
    'BOD': {
      progress: 'Chốt thành công hợp đồng Agency A. Đang deal với Tập đoàn XYZ.',
      plans: 'Đẩy mạnh chốt sale các deal đang ở bước Demo. Review lại Sale Playbook.',
      blockers: 'Tỷ lệ rớt deal ở bước Demo còn cao do thiếu tính năng X.',
      score: 8
    }
  };

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
            {leaders.map(leader => {
              const data = mockData[leader.department] || mockData['Tech'];
              
              return (
                <tr key={leader.id} className="hover:bg-primary/[0.02] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-on-surface text-xs border border-outline-variant/10 shadow-sm group-hover:scale-110 transition-transform">
                        {leader.fullName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-on-surface group-hover:text-primary transition-colors">{leader.fullName}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{leader.role}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      leader.department === 'Tech' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      leader.department === 'Marketing' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      leader.department === 'Media' ? 'bg-pink-50 text-pink-600 border-pink-100' :
                      leader.department === 'Sale' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      'bg-indigo-50 text-indigo-600 border-indigo-100'
                    }`}>
                      {leader.department}
                    </span>
                  </td>
                  <td className="px-8 py-5 max-w-xs">
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed font-medium">{data.progress}</p>
                  </td>
                  <td className="px-8 py-5 max-w-xs">
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed font-medium">{data.plans}</p>
                  </td>
                  <td className="px-8 py-5 max-w-xs">
                    <p className="text-xs text-error/80 line-clamp-2 leading-relaxed font-bold">{data.blockers}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-2 h-4 rounded-sm ${i < Math.floor(data.score / 2) ? 'bg-tertiary' : 'bg-slate-100'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-black text-on-surface font-headline">{data.score}/10</span>
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
