import { useState, useEffect, useMemo } from 'react';
import { Plus, X, CheckCircle, Calendar, AlertTriangle, ListChecks, Target, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DailyReport } from '../types';
import { TableShell } from '../components/ui/TableShell';
import { TableRowActions } from '../components/ui/TableRowActions';
import { getTableContract } from '../components/ui/table-contract';
import { formatTableDate, formatTableDateTime } from '../components/ui/table-date-format';
import { Card } from '../components/ui';
import PrimaryActionButton from '../components/ui/PrimaryActionButton';

function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

function getSubmissionStatus(dateStr: string): { label: string; detail: string; type: 'early' | 'ontime' | 'late' } {
  const d = new Date(dateStr);
  const totalMinutes = d.getHours() * 60 + d.getMinutes();
  const windowStart = 8 * 60 + 30;
  const windowEnd = 10 * 60;
  if (totalMinutes < windowStart) {
    const diff = windowStart - totalMinutes;
    return { label: 'Early', detail: `${diff} min early`, type: 'early' };
  }
  if (totalMinutes <= windowEnd) {
    return { label: 'On Time', detail: '', type: 'ontime' };
  }
  const diff = totalMinutes - windowEnd;
  return { label: 'Late', detail: `+${diff} min`, type: 'late' };
}

function SubmissionStatusBadge({ createdAt }: { createdAt: string }) {
  const { label, detail, type } = getSubmissionStatus(createdAt);
  const styles = {
    early: 'bg-blue-100 text-blue-700',
    ontime: 'bg-emerald-100 text-emerald-700',
    late: 'bg-red-100 text-red-700',
  };
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit ${styles[type]}`}>
        {label}
      </span>
      {detail && <span className="text-[10px] text-slate-400 font-medium pl-1">{detail}</span>}
    </div>
  );
}

interface FormState {
  reportDate: string;
  completedYesterday: string;
  doingYesterday: string;
  blockers: string;
  planToday: string;
}

const EMPTY_FORM: FormState = {
  reportDate: todayIso(),
  completedYesterday: '',
  doingYesterday: '',
  blockers: '',
  planToday: '',
};

export default function DailySync() {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const standardTable = getTableContract('standard');

  // Approve = admin only (matches backend RBAC.adminOnly).
  const canApprove = !!currentUser?.isAdmin;

  async function fetchReports() {
    setLoading(true);
    try {
      const res = await fetch('/api/daily-reports', { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setReports(await res.json());
    } catch (err) {
      console.error('Failed to load daily reports:', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReports();
  }, []);

  const sortedReports = useMemo(
    () => [...reports].sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()),
    [reports]
  );

  function openForm() {
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  }

  async function handleSubmit() {
    if (!currentUser) return;
    setSubmitting(true);
    try {
      const payload = { userId: currentUser.id, ...form };
      const res = await fetch('/api/daily-reports', {
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
      setIsFormOpen(false);
      await fetchReports();
    } catch (err) {
      console.error(err);
      alert('Submit thất bại. Thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApprove(id: string) {
    try {
      const res = await fetch(`/api/daily-reports/${id}/approve`, {
        method: 'POST',
        credentials: 'include',
      });
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
          <h1 className="text-3xl font-black font-headline text-slate-800">Daily Sync</h1>
          <p className="text-sm text-slate-500 font-medium">Báo cáo 4 mục mỗi ngày</p>
        </div>
        <PrimaryActionButton onClick={openForm} icon={<Plus size={18} />}>Tạo báo cáo</PrimaryActionButton>
      </div>

      <Card>
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Đang tải...</div>
        ) : sortedReports.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">Chưa có báo cáo nào.</div>
        ) : (
          <TableShell variant="standard">
            <thead>
              <tr className={standardTable.headerRow}>
                <th className={standardTable.headerCell}>Reporter</th>
                <th className={standardTable.headerCell}>Ngày</th>
                <th className={standardTable.headerCell}>Status</th>
                <th className={standardTable.headerCell}>Submission</th>
                <th className={standardTable.headerCell}>Created at</th>
                <th className={standardTable.actionHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody className={standardTable.body}>
              {sortedReports.map(r => (
                <tr key={r.id} onClick={() => setSelectedReport(r)} className={`${standardTable.row} cursor-pointer`}>
                  <td className={standardTable.cell}>
                    <span className="text-sm font-bold text-slate-800">{r.user?.fullName || 'Unknown'}</span>
                  </td>
                  <td className={standardTable.cell}>{formatTableDate(r.reportDate)}</td>
                  <td className={standardTable.cell}>
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                      r.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>{r.status}</span>
                  </td>
                  <td className={standardTable.cell}><SubmissionStatusBadge createdAt={r.createdAt} /></td>
                  <td className={standardTable.cell}>{formatTableDateTime(r.createdAt)}</td>
                  <td className={standardTable.actionCell} onClick={(e) => e.stopPropagation()}>
                    <TableRowActions onView={() => setSelectedReport(r)} variant="standard" />
                  </td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </Card>

      {/* Submit form modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <Calendar className="text-primary" size={24} />
                <h2 className="text-2xl font-black font-headline text-slate-800">Báo cáo hằng ngày</h2>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <label className="block space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ngày</span>
                <input
                  type="date"
                  value={form.reportDate}
                  onChange={(e) => setForm({ ...form, reportDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </label>

              <FormBlock
                icon={<CheckCircle size={18} />}
                label="① Hoàn thành hôm qua"
                value={form.completedYesterday}
                onChange={(v) => setForm({ ...form, completedYesterday: v })}
                placeholder="Liệt kê việc đã hoàn thành..."
              />

              <FormBlock
                icon={<ListChecks size={18} />}
                label="② Đang thực hiện hôm qua"
                value={form.doingYesterday}
                onChange={(v) => setForm({ ...form, doingYesterday: v })}
                placeholder="Việc còn dang dở, chưa xong..."
              />

              <FormBlock
                icon={<AlertTriangle size={18} />}
                label="③ Khó khăn / Vấn đề (kèm đề xuất)"
                value={form.blockers}
                onChange={(v) => setForm({ ...form, blockers: v })}
                placeholder="Blocker, rủi ro, yêu cầu hỗ trợ..."
                tone="warning"
              />

              <FormBlock
                icon={<Target size={18} />}
                label="④ Sẽ thực hiện hôm nay"
                value={form.planToday}
                onChange={(v) => setForm({ ...form, planToday: v })}
                placeholder="Plan cho ngày hôm nay..."
              />
            </div>

            <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button onClick={() => setIsFormOpen(false)} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200/50 rounded-full">
                Huỷ
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-full shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black font-headline text-slate-800">{selectedReport.user?.fullName}</h2>
                <p className="text-sm text-slate-500 font-medium">{formatTableDate(selectedReport.reportDate)}</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <DetailBlock title="① Hoàn thành hôm qua" body={selectedReport.completedYesterday} />
              <DetailBlock title="② Đang thực hiện hôm qua" body={selectedReport.doingYesterday} />
              <DetailBlock title="③ Khó khăn / Vấn đề" body={selectedReport.blockers} tone="warning" />
              <DetailBlock title="④ Sẽ thực hiện hôm nay" body={selectedReport.planToday} />
            </div>
            <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              {canApprove && selectedReport.status === 'Review' && (
                <button
                  onClick={() => handleApprove(selectedReport.id)}
                  className="px-8 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-full shadow-lg"
                >
                  <Zap size={14} className="inline mr-1" /> Duyệt
                </button>
              )}
              <button onClick={() => setSelectedReport(null)} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200/50 rounded-full">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface FormBlockProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  tone?: 'default' | 'warning';
}

function FormBlock({ icon, label, value, onChange, placeholder, tone = 'default' }: FormBlockProps) {
  const bg = tone === 'warning' ? 'bg-rose-50/40 border-rose-100 focus:ring-rose-200' : 'bg-slate-50 border-slate-200 focus:ring-primary/20';
  return (
    <label className="block space-y-2">
      <span className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
        {icon}
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 ${bg} border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 min-h-[120px] resize-vertical`}
      />
    </label>
  );
}

function DetailBlock({ title, body, tone = 'default' }: { title: string; body: string; tone?: 'default' | 'warning' }) {
  const bg = tone === 'warning' ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-200';
  return (
    <div className={`${bg} border rounded-2xl p-5`}>
      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{title}</h3>
      <p className="text-sm text-slate-800 whitespace-pre-wrap">{body || <span className="italic text-slate-400">(trống)</span>}</p>
    </div>
  );
}
