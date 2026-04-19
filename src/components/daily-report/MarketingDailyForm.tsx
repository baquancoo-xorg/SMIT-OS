import { useState } from 'react';
import { Plus, Rocket, CheckCheck, CircleCheck, FlaskConical, Clock, CircleAlert, CircleX } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { WorkItem } from '../../types';
import { MarketingMetrics, TaskEntry, BLOCKER_TAGS } from '../../types/daily-report-metrics';
import { useDailyReportForm } from '../../hooks/use-daily-report-form';
import DailyReportBase from './DailyReportBase';
import TaskStatusCard from './components/TaskStatusCard';
import BlockerCard from './components/BlockerCard';
import TodayPlanCard from './components/TodayPlanCard';
import AdHocTasksSection from './components/AdHocTasksSection';
import CustomSelect, { SelectOption } from '../ui/CustomSelect';

const CHANNEL_OPTIONS: SelectOption<string>[] = [
  { value: 'fb', label: 'Facebook', icon: <div className="w-3.5 h-3.5 rounded bg-blue-600 flex items-center justify-center text-[8px] font-bold text-white">f</div> },
  { value: 'google', label: 'Google', icon: <div className="w-3.5 h-3.5 rounded bg-red-500 flex items-center justify-center text-[8px] font-bold text-white">G</div> },
  { value: 'tiktok', label: 'TikTok', icon: <div className="w-3.5 h-3.5 rounded bg-black flex items-center justify-center text-[8px] font-bold text-white">T</div> },
];

const CAMP_STATUS_OPTIONS: SelectOption<string>[] = [
  { value: 'normal', label: 'Ổn định', icon: <CircleCheck size={14} />, iconColor: 'text-emerald-500' },
  { value: 'testing', label: 'Đang Test mẫu mới', icon: <FlaskConical size={14} />, iconColor: 'text-purple-500' },
  { value: 'waiting_media', label: 'Chờ Media', icon: <Clock size={14} />, iconColor: 'text-slate-500' },
  { value: 'expensive', label: 'Camp bị đắt', icon: <CircleAlert size={14} />, iconColor: 'text-amber-500' },
  { value: 'banned', label: 'Chết TKQC', icon: <CircleX size={14} />, iconColor: 'text-red-500' },
];

interface MarketingDailyFormProps {
  tasks: WorkItem[];
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_MARKETING_METRICS: MarketingMetrics = { campStatus: 'normal', channel: 'fb' };

export default function MarketingDailyForm({ tasks, onClose, onSuccess }: MarketingDailyFormProps) {
  const { currentUser } = useAuth();
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const {
    taskStatuses, taskMetrics, blockers, todayPlans, adHocTasks, setAdHocTasks,
    handleTaskStatusChange, updateTaskMetric,
    addBlocker, updateBlocker, removeBlocker, appendBlockerTag,
    addTodayPlan, updateTodayPlan, removeTodayPlan, togglePlanPriority,
  } = useDailyReportForm<MarketingMetrics>({ defaultMetrics: DEFAULT_MARKETING_METRICS });

  const userTasks = tasks.filter((t) => currentUser?.id && t.assigneeId === currentUser?.id);
  const taskOptions = userTasks.map((t) => ({ value: t.id, label: t.title }));

  const calculateCPA = (taskId: string) => {
    const metrics = taskMetrics[taskId];
    if (metrics?.spend && metrics?.mqls && metrics.mqls > 0) {
      const cpa = Math.round(metrics.spend / metrics.mqls);
      updateTaskMetric(taskId, 'cpa', cpa);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const yesterdayTasks: TaskEntry[] = Object.entries(taskStatuses).map(([taskId, status]) => ({
        taskId,
        status: status as 'done' | 'doing',
        metrics: taskMetrics[taskId],
      }));

      const res = await fetch('/api/daily-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          reportDate: new Date(reportDate).toISOString(),
          teamType: 'marketing',
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
      if (res.ok) onSuccess();
    } catch (error) {
      console.error('Failed to create report:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

  const renderYesterdaySection = () => (
    <>
      {userTasks.map((task) => (
        <TaskStatusCard
          key={task.id}
          task={task}
          status={taskStatuses[task.id] || null}
          onStatusChange={(status) => handleTaskStatusChange(task.id, status)}
          teamColor="orange"
        >
          {taskStatuses[task.id] === 'done' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Kết quả đầu ra / Link tài liệu</label>
                <input
                  type="text"
                  placeholder="VD: Đã duyệt xong kịch bản / Link Docs..."
                  className="w-full border border-slate-300 rounded-3xl p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none font-medium text-slate-700"
                  value={taskMetrics[task.id]?.link || ''}
                  onChange={(e) => updateTaskMetric(task.id, 'link', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-orange-50/50 p-4 rounded-3xl border border-orange-100">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ngân sách (Spend)</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full border border-orange-200 rounded-3xl p-2.5 pr-6 text-sm focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-700 bg-white"
                      value={taskMetrics[task.id]?.spend || ''}
                      onChange={(e) => { updateTaskMetric(task.id, 'spend', parseInt(e.target.value) || 0); calculateCPA(task.id); }}
                    />
                    <span className="absolute right-2 top-2 text-xs text-slate-400 font-bold">₫</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Số MQLs (Lead)</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full border border-orange-200 rounded-3xl p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-700 bg-white"
                    value={taskMetrics[task.id]?.mqls || ''}
                    onChange={(e) => { updateTaskMetric(task.id, 'mqls', parseInt(e.target.value) || 0); calculateCPA(task.id); }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">CPA (Auto)</label>
                  <input
                    type="text"
                    readOnly
                    className="w-full border border-orange-200 bg-orange-100/50 rounded-3xl p-2.5 text-sm outline-none font-bold text-orange-700"
                    value={taskMetrics[task.id]?.cpa ? formatCurrency(taskMetrics[task.id].cpa!) + '₫' : 'Auto'}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Số Mẫu Ads Test</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full border border-purple-200 rounded-3xl p-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none font-bold text-purple-700 bg-white"
                    value={taskMetrics[task.id]?.adsTested || ''}
                    onChange={(e) => updateTaskMetric(task.id, 'adsTested', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          )}
          {taskStatuses[task.id] === 'doing' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Channel</label>
                <CustomSelect
                  value={taskMetrics[task.id]?.channel || 'fb'}
                  onChange={(value) => updateTaskMetric(task.id, 'channel', value)}
                  options={CHANNEL_OPTIONS}
                  placeholder="Chọn channel..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Tình trạng Campaign</label>
                <CustomSelect
                  value={taskMetrics[task.id]?.campStatus || 'normal'}
                  onChange={(value) => updateTaskMetric(task.id, 'campStatus', value)}
                  options={CAMP_STATUS_OPTIONS}
                  placeholder="Chọn trạng thái..."
                />
              </div>
            </div>
          )}
        </TaskStatusCard>
      ))}
      {userTasks.length === 0 && (
        <div className="text-center py-8 bg-white rounded-3xl border border-dashed border-slate-200">
          <p className="text-slate-400 font-medium">Không có task nào được assign</p>
        </div>
      )}
    </>
  );

  const renderBlockersSection = () => (
    <>
      <button onClick={addBlocker} className="mb-4 text-sm font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors flex items-center">
        <Plus size={16} className="mr-1" /> Thêm Vấn đề
      </button>
      {blockers.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-500 rounded-full mb-3"><CheckCheck size={24} /></div>
          <p className="text-sm font-bold text-slate-600">Mọi việc đều suôn sẻ!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {blockers.map((blocker) => (
            <BlockerCard key={blocker.id} blocker={blocker} onUpdate={(field, value) => updateBlocker(blocker.id, field, value)} onRemove={() => removeBlocker(blocker.id)} onAppendTag={(tag) => appendBlockerTag(blocker.id, tag)} tags={BLOCKER_TAGS.marketing} taskOptions={taskOptions} />
          ))}
        </div>
      )}
    </>
  );

  const renderTodaySection = () => (
    <>
      <button onClick={addTodayPlan} className="mb-4 text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors flex items-center">
        <Plus size={16} className="mr-1" /> Thêm Công việc
      </button>
      {todayPlans.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
          <p className="text-sm font-bold text-slate-600">Chưa có mục tiêu nào!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {todayPlans.map((plan, index) => (
            <TodayPlanCard key={plan.id} plan={plan} index={index} onUpdate={(field, value) => updateTodayPlan(plan.id, field, value)} onRemove={() => removeTodayPlan(plan.id)} onTogglePriority={() => togglePlanPriority(plan.id)} taskOptions={taskOptions} teamType="marketing" priorityLabel="Camp Trọng Điểm" priorityIcon={<Rocket size={12} />} />
          ))}
        </div>
      )}
    </>
  );

  return (
    <DailyReportBase
      teamType="marketing"
      userName={currentUser?.fullName || ''}
      userRole={currentUser?.role || ''}
      userAvatar={currentUser?.fullName?.split(' ').map((n) => n[0]).join('') || '?'}
      reportDate={reportDate}
      onDateChange={setReportDate}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={submitting}
      yesterdaySection={renderYesterdaySection()}
      adHocSection={<AdHocTasksSection tasks={adHocTasks} onTasksChange={setAdHocTasks} teamColor="orange" />}
      blockersSection={renderBlockersSection()}
      todaySection={renderTodaySection()}
    />
  );
}
