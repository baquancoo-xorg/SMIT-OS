import DatePicker from '../ui/date-picker';
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertCircle, TrendingUp, Calendar, Target, CheckCircle2, Briefcase } from 'lucide-react';
import { Objective, KeyResult } from '../../types';
import { AdHocTask } from '../../types/daily-report-metrics';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import CustomSelect from '../ui/CustomSelect';
import AdHocTasksSection from '../daily-report/components/AdHocTasksSection';

interface WeeklyCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const confidenceLabels: Record<number, string> = {
  1: 'Rất thấp',
  2: 'Thấp',
  3: 'Hơi thấp',
  4: 'Dưới trung bình',
  5: 'Trung bình',
  6: 'Khá',
  7: 'Tự tin',
  8: 'Khá tự tin',
  9: 'Rất tự tin',
  10: 'Cực kỳ tự tin'
};

export default function WeeklyCheckinModal({ isOpen, onClose, onSuccess }: WeeklyCheckinModalProps) {
  const { currentUser } = useAuth();
  const [selectedTeam, setSelectedTeam] = useState(currentUser?.departments?.[0] || 'Tech');
  const [confidenceScore, setConfidenceScore] = useState<number | ''>('');
  const [blockers, setBlockers] = useState('');
  const [adHocTasks, setAdHocTasks] = useState<AdHocTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [objectives, setObjectives] = useState<Objective[]>([]);

  // Computed: can switch teams if admin or leader
  const canSwitchTeam = currentUser?.isAdmin || currentUser?.role?.includes('Leader');

  // Weekly info - computed from current date
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // Calculate Friday of current week for weekEnding
  const weekEnding = new Date(now);
  const dayOfWeek = now.getDay();
  const daysToFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 6;
  weekEnding.setDate(now.getDate() + daysToFriday);

  // Update selectedTeam when currentUser changes
  useEffect(() => {
    if (currentUser?.departments?.[0]) {
      setSelectedTeam(currentUser.departments[0]);
    }
  }, [currentUser?.departments]);

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
          targetValue: kr.targetValue || 100,
          currentValue: kr.currentValue || 0,
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

  const handleSubmit = async () => {
    if (confidenceScore === '') {
      alert('Please select a Confidence Score');
      return;
    }

    setLoading(true);
    try {
      // Build krProgress in format expected by server syncOKRProgress
      const krProgressData = krReviews.map(r => {
        const newProgressPct = Math.min(100, r.currentProgress + r.progress_added);
        const newCurrentValue = r.targetValue * newProgressPct / 100;
        return {
          krId: r.kr_id,
          progressPct: newProgressPct,
          currentValue: newCurrentValue
        };
      });

      const payload = {
        userId: currentUser?.id,
        weekEnding: weekEnding.toISOString(),
        confidenceScore: Number(confidenceScore),
        progress: JSON.stringify(krReviews.map(r => ({
          krId: r.kr_id,
          title: r.title,
          what_we_did: r.what_we_did,
          progress_added: r.progress_added
        }))),
        plans: JSON.stringify(nextWeekPlans.map(({ item_name, expected_output, deadline }) => ({
          item_name, expected_output, deadline
        }))),
        blockers: blockers || '',
        score: Number(confidenceScore),
        krProgress: JSON.stringify(krProgressData),
        adHocTasks: adHocTasks.length > 0 ? JSON.stringify(adHocTasks) : null
      };

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Report submitted successfully!');
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
        className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black font-headline text-slate-800">Weekly Check-in</h2>
              <p className="text-sm text-slate-500 font-medium">Tuần {weekNumber} - Tháng {month}/{year}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {canSwitchTeam && (
              <>
                {/* C6: Mobile dropdown */}
                <div className="md:hidden">
                  <CustomSelect
                    value={selectedTeam}
                    onChange={setSelectedTeam}
                    options={['Tech', 'Marketing', 'Media', 'Sale'].map(team => ({ value: team, label: team }))}
                  />
                </div>
                {/* Desktop buttons */}
                <div className="hidden md:flex bg-slate-200/50 p-1 rounded-xl border border-slate-200">
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
              </>
            )}
            <button onClick={onClose} className="p-2 min-h-[44px] min-w-[44px] text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body - C6: Responsive padding */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-10">
          {/* Confidence Score */}
          <section className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Confidence Score</h3>
                <p className="text-xs text-slate-500 font-medium">Mức độ tự tin hoàn thành mục tiêu Quý</p>
              </div>
            </div>
            <CustomSelect
              value={confidenceScore === '' ? '' : String(confidenceScore)}
              onChange={(val) => setConfidenceScore(val ? Number(val) : '')}
              options={[
                { value: '', label: 'Chọn mức độ (1-10)' },
                ...[1,2,3,4,5,6,7,8,9,10].map(n => ({ value: String(n), label: `${n} - ${confidenceLabels[n]}` }))
              ]}
              placeholder="Chọn mức độ (1-10)"
            />
          </section>

          {/* Section 1: KR Reviews */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Target className="text-primary" size={20} />
              <h3 className="text-lg font-black font-headline text-slate-800 uppercase tracking-tight">Tiến độ Key Results</h3>
            </div>
            <div className="space-y-8">
              {krReviews.map((review, idx) => (
                <div key={review.kr_id} className="bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-6">
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
                        className="w-20 bg-white border border-slate-200 rounded-3xl px-3 py-2 text-center text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-3xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[100px] resize-none"
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
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-3xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[100px] resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Ad-hoc Tasks */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Briefcase className="text-primary" size={20} />
              <h3 className="text-lg font-black font-headline text-slate-800 uppercase tracking-tight">
                Công việc phát sinh
              </h3>
              {adHocTasks.length > 0 && (
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                  {adHocTasks.reduce((sum, t) => sum + (t.hoursSpent || 0), 0)}h
                </span>
              )}
            </div>
            <AdHocTasksSection
              tasks={adHocTasks}
              onTasksChange={setAdHocTasks}
              teamColor="primary"
            />
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
            
            {/* M17: Scroll wrapper for mobile */}
            <div className="overflow-hidden border border-slate-200 rounded-3xl">
              <div className="overflow-x-auto">
                <div className="min-w-[500px]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest min-w-[150px]">Hạng mục (Item)</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest min-w-[150px]">Cam kết đầu ra (Output)</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-36 md:w-48">Deadline</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-12 md:w-16"></th>
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
                        <DatePicker
                          value={plan.deadline}
                          onChange={(v) => {
                            const newPlans = [...nextWeekPlans];
                            newPlans[idx].deadline = v;
                            setNextWeekPlans(newPlans);
                          }}
                          className="w-full"
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
              </div>
            </div>
          </section>

          {/* Section 3: Blockers */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-rose-500" size={20} />
              <h3 className="text-lg font-black font-headline text-slate-800 uppercase tracking-tight">Rào cản & Yêu cầu hỗ trợ</h3>
            </div>
            <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6">
              <textarea 
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                placeholder="Nêu rõ các khó khăn đang gặp phải (nếu có)..."
                className="w-full px-4 py-3 bg-white border border-rose-200 rounded-3xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all min-h-[120px] resize-none text-rose-900 placeholder:text-rose-300"
              />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200/50 rounded-full transition-all"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-full shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
