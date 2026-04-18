import { useState } from 'react';
import { Plus, Bug, CheckCheck, Monitor, FlaskConical, Rocket, Sparkles, Clock, Wrench, Link2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { WorkItem } from '../../types';
import { TechMetrics, TaskEntry, BLOCKER_TAGS } from '../../types/daily-report-metrics';
import { useDailyReportForm } from '../../hooks/use-daily-report-form';
import DailyReportBase from './DailyReportBase';
import TaskStatusCard from './components/TaskStatusCard';
import BlockerCard from './components/BlockerCard';
import TodayPlanCard from './components/TodayPlanCard';
import AdHocTasksSection from './components/AdHocTasksSection';
import CustomSelect, { SelectOption } from '../ui/CustomSelect';

const TEST_STATUS_OPTIONS: SelectOption<string>[] = [
  { value: 'local', label: 'Pass Local', icon: <Monitor size={14} />, iconColor: 'text-slate-600' },
  { value: 'staging', label: 'Đã lên Staging', icon: <FlaskConical size={14} />, iconColor: 'text-amber-600' },
  { value: 'prod', label: 'Đã lên Production', icon: <Rocket size={14} />, iconColor: 'text-emerald-600' },
];

const BLOCKED_BY_OPTIONS: SelectOption<string>[] = [
  { value: '', label: 'Không bị block' },
  { value: 'design', label: 'Chờ Design', icon: <Clock size={14} />, iconColor: 'text-purple-600' },
  { value: 'qa', label: 'Chờ QA', icon: <FlaskConical size={14} />, iconColor: 'text-amber-600' },
  { value: 'devops', label: 'Chờ DevOps', icon: <Wrench size={14} />, iconColor: 'text-slate-600' },
  { value: 'external', label: 'Chờ External', icon: <Link2 size={14} />, iconColor: 'text-blue-600' },
];

interface TechDailyFormProps {
  tasks: WorkItem[];
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_TECH_METRICS: TechMetrics = { taskType: 'feature', testStatus: 'local' };

export default function TechDailyForm({ tasks, onClose, onSuccess }: TechDailyFormProps) {
  const { currentUser } = useAuth();
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const {
    taskStatuses, taskMetrics, blockers, todayPlans, adHocTasks, setAdHocTasks,
    handleTaskStatusChange, updateTaskMetric,
    addBlocker, updateBlocker, removeBlocker, appendBlockerTag,
    addTodayPlan, updateTodayPlan, removeTodayPlan, togglePlanPriority,
  } = useDailyReportForm<TechMetrics>({ defaultMetrics: DEFAULT_TECH_METRICS });

  const userTasks = tasks.filter((t) => t.assigneeId === currentUser?.id);
  const taskOptions = userTasks.map((t) => ({ value: t.id, label: t.title }));

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
          teamType: 'tech',
          tasksData: JSON.stringify({
            completedYesterday: Object.entries(taskStatuses)
              .filter(([, s]) => s === 'done')
              .map(([id]) => id),
            doingYesterday: Object.entries(taskStatuses)
              .filter(([, s]) => s === 'doing')
              .map(([id]) => id),
            doingToday: todayPlans.map((p) => p.taskId).filter(Boolean),
          }),
          blockers: blockers.length > 0 ? JSON.stringify(blockers) : null,
          impactLevel: blockers.some((b) => b.impact === 'high')
            ? 'high'
            : blockers.some((b) => b.impact === 'low')
            ? 'low'
            : 'none',
          adHocTasks: adHocTasks.length > 0 ? JSON.stringify(adHocTasks) : null,
          teamMetrics: {
            yesterdayTasks,
            blockers,
            todayPlans,
            adHocTasks,
          },
        }),
      });

      if (res.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to create report:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderYesterdaySection = () => (
    <>
      {userTasks.map((task) => (
        <TaskStatusCard
          key={task.id}
          task={task}
          status={taskStatuses[task.id] || null}
          onStatusChange={(status) => handleTaskStatusChange(task.id, status)}
          teamColor="indigo"
        >
          {taskStatuses[task.id] === 'done' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Link PR / Branch
                  </label>
                  <input
                    type="text"
                    placeholder="VD: feature/smit-chat-auth"
                    className="w-full border border-slate-300 rounded-3xl p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-700"
                    value={taskMetrics[task.id]?.prLink || ''}
                    onChange={(e) => updateTaskMetric(task.id, 'prLink', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Trạng thái Test
                  </label>
                  <CustomSelect
                    value={taskMetrics[task.id]?.testStatus || 'local'}
                    onChange={(value) => updateTaskMetric(task.id, 'testStatus', value)}
                    options={TEST_STATUS_OPTIONS}
                    placeholder="Chọn trạng thái..."
                  />
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-3xl border border-slate-200">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">
                  Loại công việc
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name={`taskType-${task.id}`}
                      value="feature"
                      checked={taskMetrics[task.id]?.taskType === 'feature'}
                      onChange={(e) => updateTaskMetric(task.id, 'taskType', e.target.value)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm font-semibold text-slate-600 group-hover:text-indigo-600 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-indigo-500" /> Feature mới
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name={`taskType-${task.id}`}
                      value="bug"
                      checked={taskMetrics[task.id]?.taskType === 'bug'}
                      onChange={(e) => updateTaskMetric(task.id, 'taskType', e.target.value)}
                      className="w-4 h-4 text-red-500 border-slate-300 focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm font-semibold text-slate-600 group-hover:text-red-500 flex items-center gap-1.5">
                      <Bug size={14} className="text-red-500" /> Fix Bug / Tech Debt
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
          {taskStatuses[task.id] === 'doing' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">
                Blocked By
              </label>
              <CustomSelect
                value={taskMetrics[task.id]?.blockedBy || ''}
                onChange={(value) => updateTaskMetric(task.id, 'blockedBy', value)}
                options={BLOCKED_BY_OPTIONS}
                placeholder="Chọn trạng thái..."
              />
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
      <button
        onClick={addBlocker}
        className="mb-4 text-sm font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors flex items-center"
      >
        <Plus size={16} className="mr-1" /> Thêm Vấn đề
      </button>
      {blockers.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-500 rounded-full mb-3">
            <CheckCheck size={24} />
          </div>
          <p className="text-sm font-bold text-slate-600">Mọi việc đều suôn sẻ!</p>
          <p className="text-xs text-slate-400 mt-1">Không có rào cản nào.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {blockers.map((blocker) => (
            <BlockerCard
              key={blocker.id}
              blocker={blocker}
              onUpdate={(field, value) => updateBlocker(blocker.id, field, value)}
              onRemove={() => removeBlocker(blocker.id)}
              onAppendTag={(tag) => appendBlockerTag(blocker.id, tag)}
              tags={BLOCKER_TAGS.tech}
              taskOptions={taskOptions}
            />
          ))}
        </div>
      )}
    </>
  );

  const renderTodaySection = () => (
    <>
      <button
        onClick={addTodayPlan}
        className="mb-4 text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors flex items-center"
      >
        <Plus size={16} className="mr-1" /> Thêm Công việc
      </button>
      {todayPlans.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
          <p className="text-sm font-bold text-slate-600">Chưa có mục tiêu nào!</p>
          <p className="text-xs text-slate-400 mt-1">Thêm công việc focus hôm nay.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {todayPlans.map((plan, index) => (
            <TodayPlanCard
              key={plan.id}
              plan={plan}
              index={index}
              onUpdate={(field, value) => updateTodayPlan(plan.id, field, value)}
              onRemove={() => removeTodayPlan(plan.id)}
              onTogglePriority={() => togglePlanPriority(plan.id)}
              taskOptions={taskOptions}
              teamType="tech"
              priorityLabel="Bug P0 / Hot Fix"
              priorityIcon={<Bug size={12} />}
            />
          ))}
        </div>
      )}
    </>
  );

  return (
    <DailyReportBase
      teamType="tech"
      userName={currentUser?.fullName || ''}
      userRole={currentUser?.role || ''}
      userAvatar={currentUser?.fullName?.split(' ').map((n) => n[0]).join('') || '?'}
      reportDate={reportDate}
      onDateChange={setReportDate}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={submitting}
      yesterdaySection={renderYesterdaySection()}
      adHocSection={<AdHocTasksSection tasks={adHocTasks} onTasksChange={setAdHocTasks} teamColor="indigo" />}
      blockersSection={renderBlockersSection()}
      todaySection={renderTodaySection()}
    />
  );
}
