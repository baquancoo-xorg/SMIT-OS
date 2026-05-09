import { useEffect, useState } from 'react';
import { X, Calendar, Target, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { KeyResult, KrCheckin } from '../../types';
import KrCheckinRow from '../checkin/KrCheckinRow';

interface WeeklyCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface PriorityRow {
  text: string;
  done: boolean;
}

function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function fridayOfThisWeek(now: Date): Date {
  const friday = new Date(now);
  const day = now.getDay();
  const diff = day <= 5 ? 5 - day : 6;
  friday.setDate(now.getDate() + diff);
  return friday;
}

export default function WeeklyCheckinModal({ isOpen, onClose, onSuccess }: WeeklyCheckinModalProps) {
  const { currentUser } = useAuth();
  const [krs, setKrs] = useState<KeyResult[]>([]);
  const [krCheckins, setKrCheckins] = useState<KrCheckin[]>([]);
  const [lastWeekPriorities, setLastWeekPriorities] = useState<PriorityRow[]>([{ text: '', done: false }]);
  const [topThree, setTopThree] = useState<string[]>(['', '', '']);
  const [risks, setRisks] = useState('');
  const [helpNeeded, setHelpNeeded] = useState('');
  const [loading, setLoading] = useState(false);

  const now = new Date();
  const weekNumber = isoWeekNumber(now);
  const weekEnding = fridayOfThisWeek(now);

  useEffect(() => {
    if (!isOpen || !currentUser) return;
    (async () => {
      try {
        const res = await fetch(`/api/key-results?ownerId=${currentUser.id}`, { credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: KeyResult[] = await res.json();
        setKrs(data);
        setKrCheckins(data.map(kr => ({
          krId: kr.id,
          currentValue: kr.currentValue ?? 0,
          confidence0to10: 7,
          note: '',
        })));
      } catch (err) {
        console.error('Failed to load KRs:', err);
        setKrs([]);
        setKrCheckins([]);
      }
    })();
  }, [isOpen, currentUser]);

  function updateKrCheckin(idx: number, next: KrCheckin) {
    setKrCheckins(prev => prev.map((c, i) => (i === idx ? next : c)));
  }

  function addPriorityRow() {
    setLastWeekPriorities(prev => [...prev, { text: '', done: false }]);
  }

  function updatePriorityRow(idx: number, patch: Partial<PriorityRow>) {
    setLastWeekPriorities(prev => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  }

  function removePriorityRow(idx: number) {
    setLastWeekPriorities(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit() {
    if (!currentUser) return;
    setLoading(true);
    try {
      const payload = {
        userId: currentUser.id,
        weekEnding: weekEnding.toISOString(),
        krProgress: JSON.stringify(krCheckins),
        progress: JSON.stringify({ priorities: lastWeekPriorities.filter(p => p.text.trim()) }),
        plans: JSON.stringify({ topThree: topThree.filter(t => t.trim()) }),
        blockers: JSON.stringify({ risks, helpNeeded }),
      };

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Lỗi: ${err.error || 'Submit thất bại'}`);
        return;
      }
      onClose();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert('Submit thất bại. Thử lại sau.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black font-headline text-slate-800">Weekly Check-in</h2>
              <p className="text-sm text-slate-500 font-medium">Tuần {weekNumber} • End: {weekEnding.toLocaleDateString('vi-VN')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          {/* Block 1: KR Check-in */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Target className="text-primary" size={20} />
              <h3 className="text-lg font-black font-headline text-slate-800 uppercase tracking-tight">① OKR Check-in</h3>
            </div>
            {krs.length === 0 ? (
              <p className="text-sm text-slate-500 italic">Bạn chưa được gán Key Result nào. Liên hệ Leader/Admin để được gán.</p>
            ) : (
              <div className="space-y-4">
                {krs.map((kr, idx) => (
                  <KrCheckinRow
                    key={kr.id}
                    kr={kr}
                    value={krCheckins[idx]}
                    onChange={(next) => updateKrCheckin(idx, next)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Block 2: Last week priorities */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-primary" size={20} />
                <h3 className="text-lg font-black font-headline text-slate-800 uppercase tracking-tight">② Ưu tiên tuần trước (kết quả)</h3>
              </div>
              <button onClick={addPriorityRow} className="text-primary text-xs font-bold hover:bg-primary/5 px-3 py-1.5 rounded-lg">
                + Thêm
              </button>
            </div>
            <div className="space-y-2">
              {lastWeekPriorities.map((row, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-2 border border-slate-200">
                  <input
                    type="checkbox"
                    checked={row.done}
                    onChange={(e) => updatePriorityRow(idx, { done: e.target.checked })}
                    className="rounded accent-primary"
                  />
                  <input
                    type="text"
                    value={row.text}
                    onChange={(e) => updatePriorityRow(idx, { text: e.target.value })}
                    placeholder="Mô tả ưu tiên + kết quả..."
                    className={`flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium outline-none ${row.done ? 'line-through text-slate-400' : ''}`}
                  />
                  {lastWeekPriorities.length > 1 && (
                    <button onClick={() => removePriorityRow(idx)} className="text-slate-400 hover:text-rose-500 text-xs">
                      Xoá
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Block 3: Top 3 next week */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Target className="text-primary" size={20} />
              <h3 className="text-lg font-black font-headline text-slate-800 uppercase tracking-tight">③ Top 3 ưu tiên tuần tới</h3>
            </div>
            <div className="space-y-2">
              {[0, 1, 2].map(i => (
                <input
                  key={i}
                  type="text"
                  value={topThree[i]}
                  onChange={(e) => {
                    const next = [...topThree];
                    next[i] = e.target.value;
                    setTopThree(next);
                  }}
                  placeholder={`Ưu tiên #${i + 1}`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              ))}
            </div>
          </section>

          {/* Block 4: Risks */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-rose-500" size={20} />
              <h3 className="text-lg font-black font-headline text-slate-800 uppercase tracking-tight">④ Rủi ro & Blockers</h3>
            </div>
            <textarea
              value={risks}
              onChange={(e) => setRisks(e.target.value)}
              placeholder="Khó khăn, blocker, rủi ro..."
              className="w-full px-4 py-3 bg-rose-50/50 border border-rose-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-200 min-h-[100px] resize-none"
            />
          </section>

          {/* Block 5: Help needed */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="text-amber-500" size={20} />
              <h3 className="text-lg font-black font-headline text-slate-800 uppercase tracking-tight">⑤ Cần hỗ trợ</h3>
            </div>
            <textarea
              value={helpNeeded}
              onChange={(e) => setHelpNeeded(e.target.value)}
              placeholder="Cần ai hỗ trợ điều gì..."
              className="w-full px-4 py-3 bg-amber-50/50 border border-amber-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-200 min-h-[100px] resize-none"
            />
          </section>
        </div>

        <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
          <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200/50 rounded-full">
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-full shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {loading ? 'Đang gửi...' : 'Gửi check-in'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
