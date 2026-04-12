import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertCircle, TrendingUp, Calendar, Target, CheckCircle2 } from 'lucide-react';
import { Objective, KeyResult, User } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface WeeklyCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function WeeklyCheckinModal({ isOpen, onClose, onSuccess }: WeeklyCheckinModalProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isPM, setIsPM] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('Tech');
  const [confidenceScore, setConfidenceScore] = useState<number | ''>('');
  const [blockers, setBlockers] = useState('');
  const [loading, setLoading] = useState(false);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  
  // Weekly info
  const now = new Date();
  const weekNumber = 2; // Mocked for now
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/users');
      const users = await res.json();
      const user = users[0]; // Mocking first user as current user for now
      setCurrentUser(user);
      setIsPM(user.role === 'PM');
      setSelectedTeam(user.department);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchObjectives = async () => {
      try {
        const res = await fetch('/api/objectives');
        const data = await res.json();
        const teamObjectives = data.filter((obj: Objective) => obj.department === selectedTeam);
        setObjectives(teamObjectives);
        
        const teamKRs = teamObjectives.flatMap((obj: Objective) => obj.keyResults);
        setKrReviews(teamKRs.map((kr: KeyResult) => ({
          kr_id: kr.id,
          title: kr.title,
          currentProgress: kr.progressPercentage,
          what_we_did: '',
          impact_assessment: '',
          progress_added: 0
        })));
      } catch (error) {
        console.error('Failed to fetch objectives:', error);
      }
    };
    if (isOpen) fetchObjectives();
  }, [selectedTeam, isOpen]);

  const [krReviews, setKrReviews] = useState<any[]>([]);

  // Next Week Plans state
  const [nextWeekPlans, setNextWeekPlans] = useState([
    { id: Date.now(), item_name: '', expected_output: '', deadline: '' }
  ]);

  const addPlanRow = () => {
    setNextWeekPlans([...nextWeekPlans, { id: Date.now(), item_name: '', expected_output: '', deadline: '' }]);
  };

  const removePlanRow = (id: number) => {
    if (nextWeekPlans.length > 1) {
      setNextWeekPlans(nextWeekPlans.filter(p => p.id !== id));
    }
  };

  const handleSubmit = async (status: 'SUBMITTED' | 'DRAFT') => {
    if (status === 'SUBMITTED') {
      if (confidenceScore === '') {
        alert('Please select a Confidence Score');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        userId: currentUser?.id,
        weekNumber,
        month,
        year,
        confidenceScore: Number(confidenceScore),
        progress: krReviews.map(r => `${r.title}: ${r.what_we_did}`).join('\n'),
        plans: nextWeekPlans.map(p => `${p.item_name} (${p.expected_output})`).join('\n'),
        blockers,
        status,
        krReviews: krReviews.map(({ kr_id, what_we_did, impact_assessment, progress_added }) => ({
          kr_id, what_we_did, impact_assessment, progress_added
        })),
        nextWeekPlans: nextWeekPlans.map(({ item_name, expected_output, deadline }) => ({
          item_name, expected_output, deadline
        }))
      };

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(status === 'SUBMITTED' ? 'Report submitted successfully!' : 'Draft saved!');
        onClose();
        if (onSuccess) onSuccess();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || 'Failed to submit report'}`);
      }
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black font-headline text-slate-800">Weekly Check-in</h2>
              <p className="text-sm text-slate-500 font-medium">Tuần {weekNumber} - Tháng {month}/{year}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isPM && (
              <div className="flex bg-slate-200/50 p-1 rounded-xl border border-slate-200">
                {(['Tech', 'Marketing', 'Media', 'Sale'] as const).map(team => (
                  <button
                    key={team}
                    onClick={() => setSelectedTeam(team)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedTeam === team ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {team}
                  </button>
                ))}
              </div>
            )}
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* Confidence Score */}
          <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Confidence Score</h3>
                <p className="text-xs text-slate-500 font-medium">Mức độ tự tin hoàn thành mục tiêu Quý</p>
              </div>
            </div>
            <select 
              value={confidenceScore}
              onChange={(e) => setConfidenceScore(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            >
              <option value="">Chọn mức độ (1-10)</option>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <option key={n} value={n}>{n} - {n <= 3 ? 'Rất thấp' : n <= 6 ? 'Trung bình' : n <= 8 ? 'Tự tin' : 'Rất tự tin'}</option>
              ))}
            </select>
          </section>

          {/* Section 1: KR Reviews */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Target className="text-primary" size={20} />
              <h3 className="text-lg font-black font-headline text-slate-800 uppercase tracking-tight">Tiến độ Key Results</h3>
            </div>
            <div className="space-y-8">
              {krReviews.map((review, idx) => (
                <div key={review.kr_id} className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="max-w-2xl">
                      <h4 className="font-bold text-slate-800 leading-tight mb-2">{review.title}</h4>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden w-64">
                          <div 
                            className="h-full bg-primary transition-all duration-500" 
                            style={{ width: `${Math.min(100, review.currentProgress + review.progress_added)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-primary">
                          {review.currentProgress}% 
                          {review.progress_added !== 0 && (
                            <span className={review.progress_added > 0 ? 'text-emerald-500' : 'text-rose-500'}>
                              {review.progress_added > 0 ? ` +${review.progress_added}%` : ` ${review.progress_added}%`}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Thay đổi %</label>
                      <input 
                        type="number"
                        value={review.progress_added}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const newReviews = [...krReviews];
                          newReviews[idx].progress_added = val;
                          setKrReviews(newReviews);
                        }}
                        className="w-20 bg-white border border-slate-200 rounded-xl px-3 py-2 text-center text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Đã làm gì tuần qua?</label>
                      <textarea 
                        value={review.what_we_did}
                        onChange={(e) => {
                          const newReviews = [...krReviews];
                          newReviews[idx].what_we_did = e.target.value;
                          setKrReviews(newReviews);
                        }}
                        placeholder="Liệt kê các task/epic đã hoàn thành..."
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[100px] resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Đánh giá mức độ ảnh hưởng</label>
                      <textarea 
                        value={review.impact_assessment}
                        onChange={(e) => {
                          const newReviews = [...krReviews];
                          newReviews[idx].impact_assessment = e.target.value;
                          setKrReviews(newReviews);
                        }}
                        placeholder="Phân tích xem việc đã làm giúp ích gì cho KR..."
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[100px] resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: Next Week Plan */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-primary" size={20} />
                <h3 className="text-lg font-black font-headline text-slate-800 uppercase tracking-tight">Cam kết tuần tới</h3>
              </div>
              <button 
                onClick={addPlanRow}
                className="flex items-center gap-1 text-primary text-xs font-bold hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-all"
              >
                <Plus size={16} />
                Thêm công việc
              </button>
            </div>
            
            <div className="overflow-hidden border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hạng mục (Item)</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cam kết đầu ra (Output)</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-48">Deadline</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {nextWeekPlans.map((plan, idx) => (
                    <tr key={plan.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <input 
                          type="text"
                          value={plan.item_name}
                          onChange={(e) => {
                            const newPlans = [...nextWeekPlans];
                            newPlans[idx].item_name = e.target.value;
                            setNextWeekPlans(newPlans);
                          }}
                          placeholder="Tên công việc..."
                          className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium outline-none"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="text"
                          value={plan.expected_output}
                          onChange={(e) => {
                            const newPlans = [...nextWeekPlans];
                            newPlans[idx].expected_output = e.target.value;
                            setNextWeekPlans(newPlans);
                          }}
                          placeholder="Kết quả cụ thể..."
                          className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium outline-none"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="date"
                          value={plan.deadline}
                          onChange={(e) => {
                            const newPlans = [...nextWeekPlans];
                            newPlans[idx].deadline = e.target.value;
                            setNextWeekPlans(newPlans);
                          }}
                          className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium outline-none text-slate-600"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {nextWeekPlans.length > 1 && (
                          <button 
                            onClick={() => removePlanRow(plan.id)}
                            className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Blockers */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-rose-500" size={20} />
              <h3 className="text-lg font-black font-headline text-slate-800 uppercase tracking-tight">Rào cản & Yêu cầu hỗ trợ</h3>
            </div>
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6">
              <textarea 
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                placeholder="Nêu rõ các khó khăn đang gặp phải (nếu có)..."
                className="w-full px-4 py-3 bg-white border border-rose-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all min-h-[120px] resize-none text-rose-900 placeholder:text-rose-300"
              />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
          <button 
            onClick={() => handleSubmit('DRAFT')}
            className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200/50 rounded-xl transition-all"
          >
            Lưu nháp
          </button>
          <button 
            onClick={() => handleSubmit('SUBMITTED')}
            className="px-8 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20 transition-all"
          >
            Gửi báo cáo
          </button>
        </div>
      </motion.div>
    </div>
  );
}
