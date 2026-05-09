import { useEffect, useState } from 'react';
import { Plus, X, Zap } from 'lucide-react';
import WeeklyCheckinModal from '../components/modals/WeeklyCheckinModal';
import ReportTableView from '../components/board/ReportTableView';
import PrimaryActionButton from '../components/ui/PrimaryActionButton';
import { Card } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { WeeklyReport, KrCheckin, WeeklyPriority } from '../types';

interface ParsedReport {
  krProgress: KrCheckin[];
  priorities: WeeklyPriority[];
  topThree: string[];
  risks: string;
  helpNeeded: string;
}

function safeParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function parseReport(report: WeeklyReport): ParsedReport {
  const kr = safeParse<KrCheckin[]>(report.krProgress, []);
  const progress = safeParse<{ priorities: WeeklyPriority[] }>(report.progress, { priorities: [] });
  const plans = safeParse<{ topThree: string[] }>(report.plans, { topThree: [] });
  const blockers = safeParse<{ risks: string; helpNeeded: string }>(report.blockers, { risks: '', helpNeeded: '' });
  return {
    krProgress: kr,
    priorities: progress.priorities ?? [],
    topThree: plans.topThree ?? [],
    risks: blockers.risks ?? '',
    helpNeeded: blockers.helpNeeded ?? '',
  };
}

export default function WeeklyCheckin() {
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);

  const isLeaderOrAdmin = !!currentUser && (currentUser.isAdmin || currentUser.role?.includes('Leader'));

  async function fetchReports() {
    setLoading(true);
    try {
      const res = await fetch('/api/reports', { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setReports(await res.json());
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReports();
  }, []);

  async function handleApprove(id: string) {
    try {
      const res = await fetch(`/api/reports/${id}/approve`, { method: 'POST', credentials: 'include' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Approve thất bại: ${err.error || res.status}`);
        return;
      }
      await fetchReports();
      setSelectedReport(null);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-headline text-slate-800">Weekly Check-in</h1>
          <p className="text-sm text-slate-500 font-medium">5-block Wodtke (KR + ưu tiên + rủi ro + hỗ trợ)</p>
        </div>
        <PrimaryActionButton onClick={() => setIsModalOpen(true)} icon={<Plus size={18} />}>
          Tạo check-in
        </PrimaryActionButton>
      </div>

      <Card>
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Đang tải...</div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">Chưa có check-in nào.</div>
        ) : (
          <ReportTableView reports={reports} onViewDetail={setSelectedReport} />
        )}
      </Card>

      <WeeklyCheckinModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchReports}
      />

      {selectedReport && (
        <ReportDetail
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onApprove={isLeaderOrAdmin ? handleApprove : undefined}
        />
      )}
    </div>
  );
}

function ReportDetail({
  report,
  onClose,
  onApprove,
}: {
  report: WeeklyReport;
  onClose: () => void;
  onApprove?: (id: string) => void;
}) {
  const parsed = parseReport(report);
  const weekEnding = new Date(report.weekEnding);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black font-headline text-slate-800">{report.user?.fullName ?? 'Unknown'}</h2>
            <p className="text-sm text-slate-500 font-medium">Week ending: {weekEnding.toLocaleDateString('vi-VN')}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <Section title="① OKR Check-in">
            {parsed.krProgress.length === 0 ? (
              <Empty />
            ) : (
              <ul className="space-y-2">
                {parsed.krProgress.map((c, i) => (
                  <li key={i} className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">KR: {c.krId.slice(0, 8)}…</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-black ${
                        c.confidence0to10 >= 7 ? 'bg-emerald-100 text-emerald-700'
                        : c.confidence0to10 >= 4 ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
                      }`}>
                        {c.confidence0to10}/10
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1">Current: {c.currentValue}</p>
                    {c.note && <p className="text-slate-500 italic mt-1">{c.note}</p>}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="② Ưu tiên tuần trước">
            {parsed.priorities.length === 0 ? (
              <Empty />
            ) : (
              <ul className="space-y-1 text-sm">
                {parsed.priorities.map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <input type="checkbox" checked={p.done} readOnly className="mt-1 accent-primary" />
                    <span className={p.done ? 'line-through text-slate-400' : 'text-slate-800'}>{p.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="③ Top 3 ưu tiên tuần tới">
            {parsed.topThree.length === 0 ? (
              <Empty />
            ) : (
              <ol className="list-decimal pl-5 space-y-1 text-sm text-slate-800">
                {parsed.topThree.map((t, i) => <li key={i}>{t}</li>)}
              </ol>
            )}
          </Section>

          <Section title="④ Rủi ro & Blockers" tone="warning">
            {parsed.risks ? <p className="text-sm whitespace-pre-wrap text-slate-800">{parsed.risks}</p> : <Empty />}
          </Section>

          <Section title="⑤ Cần hỗ trợ" tone="help">
            {parsed.helpNeeded ? <p className="text-sm whitespace-pre-wrap text-slate-800">{parsed.helpNeeded}</p> : <Empty />}
          </Section>
        </div>

        <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
          {onApprove && report.status === 'Review' && (
            <button
              onClick={() => onApprove(report.id)}
              className="px-8 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-full shadow-lg"
            >
              <Zap size={14} className="inline mr-1" /> Duyệt
            </button>
          )}
          <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200/50 rounded-full">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, tone = 'default', children }: { title: string; tone?: 'default' | 'warning' | 'help'; children: React.ReactNode }) {
  const bg =
    tone === 'warning' ? 'bg-rose-50 border-rose-100'
    : tone === 'help' ? 'bg-amber-50 border-amber-100'
    : 'bg-slate-50 border-slate-200';
  return (
    <div className={`${bg} border rounded-2xl p-5`}>
      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Empty() {
  return <p className="text-sm italic text-slate-400">(trống)</p>;
}
