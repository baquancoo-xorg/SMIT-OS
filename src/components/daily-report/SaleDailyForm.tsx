import { useState } from 'react';
import { Plus, Flame, CheckCheck, Phone, Clock, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { WorkItem } from '../../types';
import { SaleMetrics, TaskEntry, BLOCKER_TAGS } from '../../types/daily-report-metrics';
import { useDailyReportForm } from '../../hooks/use-daily-report-form';
import DailyReportBase from './DailyReportBase';
import TaskStatusCard from './components/TaskStatusCard';
import BlockerCard from './components/BlockerCard';
import TodayPlanCard from './components/TodayPlanCard';
import AdHocTasksSection from './components/AdHocTasksSection';
import CustomSelect, { SelectOption } from '../ui/CustomSelect';

const FOLLOWUP_OPTIONS: SelectOption<string>[] = [
  { value: 'following', label: 'Đang bám sát / Gọi lại', icon: <Phone size={14} />, iconColor: 'text-emerald-600' },
  { value: 'waiting_customer', label: 'Đang chờ khách phản hồi', icon: <Clock size={14} />, iconColor: 'text-amber-600' },
  { value: 'waiting_internal', label: 'Đang chờ Tech/Mkt hỗ trợ', icon: <Settings size={14} />, iconColor: 'text-slate-500' },
];

const TICKET_TYPE_OPTIONS: SelectOption<string>[] = [
  { value: 'bug', label: 'Lỗi Bug' },
  { value: 'guide', label: 'HDSD' },
  { value: 'feature', label: 'Tính năng mới' },
];

interface SaleDailyFormProps {
  tasks: WorkItem[];
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_SALE_METRICS: SaleMetrics = { followupStatus: 'following', ticketType: 'bug' };

export default function SaleDailyForm({ tasks, onClose, onSuccess }: SaleDailyFormProps) {
  const { currentUser } = useAuth();
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    taskStatuses, taskMetrics, blockers, todayPlans, adHocTasks, setAdHocTasks,
    handleTaskStatusChange, updateTaskMetric,
    addBlocker, updateBlocker, removeBlocker, appendBlockerTag,
    addTodayPlan, updateTodayPlan, removeTodayPlan, togglePlanPriority,
  } = useDailyReportForm<SaleMetrics>({ defaultMetrics: DEFAULT_SALE_METRICS });

  const userTasks = tasks.filter((t) => currentUser?.id && t.assigneeId === currentUser?.id);
  const taskOptions = userTasks.map((t) => ({ value: t.id, label: t.title }));

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const yesterdayTasks: TaskEntry[] = Object.entries(taskStatuses).map(([taskId, status]) => ({ taskId, status: status as 'done' | 'doing', metrics: taskMetrics[taskId] }));
      const res = await fetch('/api/daily-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          reportDate: new Date(reportDate).toISOString(),
          teamType: 'sale',
          tasksData: JSON.stringify({
            completedYesterday: Object.entries(taskStatuses).filter(([, s]) => s === 'done').map(([id]) => id),
            doingYesterday: Object.entries(taskStatuses).filter(([, s]) => s === 'doing').map(([id]) => id),
            doingToday: todayPlans.map((p) => p.taskId).filter(Boolean),
          }),
          blockers: blockers.length > 0 ? JSON.stringify(blockers) : null,
          impactLevel: blockers.some((b) => b.impact === 'high') ? 'high' : blockers.some((b) => b.impact === 'low') ? 'low' : 'none',
          adHocTasks: adHocTasks.length > 0 ? JSON.stringify(adHocTasks) : null,
          teamMetrics: { yesterdayTasks, blockers, todayPlans, adHocTasks },
        }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.error || `Gửi thất bại (${res.status}). Vui lòng thử lại.`);
      }
    } catch (error) {
      console.error('Failed to create report:', error);
      setErrorMessage('Không thể kết nối server. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

  const renderYesterdaySection = () => (
    <>
      {userTasks.map((task) => (
        <TaskStatusCard key={task.id} task={task} status={taskStatuses[task.id] || null} onStatusChange={(status) => handleTaskStatusChange(task.id, status)} teamColor="emerald">
          {taskStatuses[task.id] === 'done' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Ghi chú kết quả</label>
                <input type="text" placeholder="VD: Đã tư vấn xong / Đã gửi báo giá..." className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-700" value={taskMetrics[task.id]?.note || ''} onChange={(e) => updateTaskMetric(task.id, 'note', e.target.value)} />
              </div>
              <div className="space-y-4 bg-emerald-50/40 p-4 rounded-xl border border-emerald-100">
                <div>
                  <h4 className="text-[11px] font-black text-emerald-800 mb-2 uppercase tracking-wider border-b border-emerald-200/50 pb-1.5">Phễu Lead & Chăm sóc</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-emerald-100/50 shadow-sm">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Lead nhận/Hunt</label>
                      <input type="number" placeholder="0" className="w-full p-1.5 text-sm focus:outline-none font-bold text-slate-700 bg-transparent" value={taskMetrics[task.id]?.leadsReceived || ''} onChange={(e) => updateTaskMetric(task.id, 'leadsReceived', parseInt(e.target.value) || 0)} />
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-emerald-100/50 shadow-sm">
                      <label className="block text-[10px] font-bold text-blue-500 uppercase mb-1">Đang xử lý</label>
                      <input type="number" placeholder="0" className="w-full p-1.5 text-sm focus:outline-none font-bold text-blue-600 bg-transparent" value={taskMetrics[task.id]?.leadsAttempted || ''} onChange={(e) => updateTaskMetric(task.id, 'leadsAttempted', parseInt(e.target.value) || 0)} />
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-emerald-100/50 shadow-sm">
                      <label className="block text-[10px] font-bold text-emerald-600 uppercase mb-1">Đạt chuẩn (SQL)</label>
                      <input type="number" placeholder="0" className="w-full p-1.5 text-sm focus:outline-none font-bold text-emerald-700 bg-transparent" value={taskMetrics[task.id]?.leadsQualified || ''} onChange={(e) => updateTaskMetric(task.id, 'leadsQualified', parseInt(e.target.value) || 0)} />
                    </div>
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200/50 shadow-sm">
                      <label className="block text-[10px] font-bold text-amber-600 uppercase mb-1">Demo Booked</label>
                      <input type="number" placeholder="0" className="w-full p-1.5 text-sm focus:outline-none font-bold text-amber-700 bg-transparent" value={taskMetrics[task.id]?.demosBooked || ''} onChange={(e) => updateTaskMetric(task.id, 'demosBooked', parseInt(e.target.value) || 0)} />
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-emerald-100/50 shadow-sm">
                      <label className="block text-[10px] font-bold text-red-500 uppercase mb-1">Hủy / Rác</label>
                      <input type="number" placeholder="0" className="w-full p-1.5 text-sm focus:outline-none font-bold text-red-600 bg-transparent" value={taskMetrics[task.id]?.leadsUnqualified || ''} onChange={(e) => updateTaskMetric(task.id, 'leadsUnqualified', parseInt(e.target.value) || 0)} />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-emerald-800 mb-2 uppercase tracking-wider border-b border-emerald-200/50 pb-1.5">Pipeline & Hỗ trợ</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-emerald-100/50 shadow-sm">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Giá trị Cơ hội mới</label>
                      <div className="relative">
                        <input type="number" placeholder="0" className="w-full p-1.5 pr-6 text-sm focus:outline-none font-bold text-slate-700 bg-transparent" value={taskMetrics[task.id]?.oppValue || ''} onChange={(e) => updateTaskMetric(task.id, 'oppValue', parseInt(e.target.value) || 0)} />
                        <span className="absolute right-2 top-1.5 text-slate-400 font-bold text-xs">₫</span>
                      </div>
                    </div>
                    <div className="bg-emerald-100/50 p-3 rounded-xl border border-emerald-200 shadow-sm">
                      <label className="block text-[10px] font-bold text-emerald-700 uppercase mb-1">Doanh thu WON</label>
                      <div className="relative">
                        <input type="number" placeholder="0" className="w-full p-1.5 pr-6 text-sm focus:outline-none font-bold text-emerald-700 bg-transparent" value={taskMetrics[task.id]?.revenue || ''} onChange={(e) => updateTaskMetric(task.id, 'revenue', parseInt(e.target.value) || 0)} />
                        <span className="absolute right-2 top-1.5 text-emerald-600/50 font-bold text-xs">₫</span>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-emerald-100/50 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-[10px] font-bold text-indigo-500 uppercase">Ticket Support</label>
                      </div>
                      <div className="mb-2">
                        <CustomSelect
                          value={taskMetrics[task.id]?.ticketType || 'bug'}
                          onChange={(value) => updateTaskMetric(task.id, 'ticketType', value)}
                          options={TICKET_TYPE_OPTIONS}
                          className="text-xs"
                        />
                      </div>
                      <input type="number" placeholder="Số lượng giải quyết..." className="w-full p-2 text-sm focus:outline-none font-bold text-indigo-600 bg-slate-50 rounded-xl shadow-sm" value={taskMetrics[task.id]?.ticketsResolved || ''} onChange={(e) => updateTaskMetric(task.id, 'ticketsResolved', parseInt(e.target.value) || 0)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {taskStatuses[task.id] === 'doing' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">Tình trạng chăm sóc</label>
              <CustomSelect
                value={taskMetrics[task.id]?.followupStatus || 'following'}
                onChange={(value) => updateTaskMetric(task.id, 'followupStatus', value)}
                options={FOLLOWUP_OPTIONS}
                placeholder="Chọn trạng thái..."
              />
            </div>
          )}
        </TaskStatusCard>
      ))}
      {userTasks.length === 0 && <div className="text-center py-8 bg-white rounded-xl border border-dashed border-slate-200"><p className="text-slate-400 font-medium">Không có task nào được assign</p></div>}
    </>
  );

  const renderBlockersSection = () => (
    <>
      <button onClick={addBlocker} className="mb-4 text-sm font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors flex items-center"><Plus size={16} className="mr-1" /> Thêm Vấn đề</button>
      {blockers.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl"><div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-500 rounded-full mb-3"><CheckCheck size={24} /></div><p className="text-sm font-bold text-slate-600">Tuyệt vời, không có rào cản!</p></div>
      ) : (
        <div className="space-y-4">{blockers.map((blocker) => <BlockerCard key={blocker.id} blocker={blocker} onUpdate={(field, value) => updateBlocker(blocker.id, field, value)} onRemove={() => removeBlocker(blocker.id)} onAppendTag={(tag) => appendBlockerTag(blocker.id, tag)} tags={BLOCKER_TAGS.sale} taskOptions={taskOptions} />)}</div>
      )}
    </>
  );

  const renderTodaySection = () => (
    <>
      <button onClick={addTodayPlan} className="mb-4 text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors flex items-center"><Plus size={16} className="mr-1" /> Thêm Công việc</button>
      {todayPlans.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl"><p className="text-sm font-bold text-slate-600">Chưa có mục tiêu nào!</p></div>
      ) : (
        <div className="space-y-4">{todayPlans.map((plan, index) => <TodayPlanCard key={plan.id} plan={plan} index={index} onUpdate={(field, value) => updateTodayPlan(plan.id, field, value)} onRemove={() => removeTodayPlan(plan.id)} onTogglePriority={() => togglePlanPriority(plan.id)} taskOptions={taskOptions} teamType="sale" priorityLabel="Deal Nóng (Cần PM)" priorityIcon={<Flame size={12} />} />)}</div>
      )}
    </>
  );

  return (
    <DailyReportBase teamType="sale" userName={currentUser?.fullName || ''} userRole={currentUser?.role || ''} userAvatar={currentUser?.fullName?.split(' ').map((n) => n[0]).join('') || '?'} reportDate={reportDate} onDateChange={setReportDate} onClose={onClose} onSubmit={handleSubmit} submitting={submitting} errorMessage={errorMessage} yesterdaySection={renderYesterdaySection()} adHocSection={<AdHocTasksSection tasks={adHocTasks} onTasksChange={setAdHocTasks} teamColor="emerald" />} blockersSection={renderBlockersSection()} todaySection={renderTodaySection()} />
  );
}
