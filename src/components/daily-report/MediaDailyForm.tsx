import { useState } from 'react';
import { Plus, Siren, CheckCheck, FileEdit, CircleCheck, Rocket, Clapperboard, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { WorkItem } from '../../types';
import { MediaMetrics, BlockerEntry, TodayPlanEntry, TaskEntry, BLOCKER_TAGS } from '../../types/daily-report-metrics';
import DailyReportBase from './DailyReportBase';
import TaskStatusCard from './components/TaskStatusCard';
import BlockerCard from './components/BlockerCard';
import TodayPlanCard from './components/TodayPlanCard';
import CustomSelect, { SelectOption } from '../ui/CustomSelect';

const VERSION_OPTIONS: SelectOption<string>[] = [
  { value: 'demo', label: 'Bản Nháp / Demo', icon: <FileEdit size={14} />, iconColor: 'text-slate-500' },
  { value: 'final', label: 'Bản Final', icon: <CircleCheck size={14} />, iconColor: 'text-emerald-500' },
  { value: 'published', label: 'Đã Đăng tải', icon: <Rocket size={14} />, iconColor: 'text-blue-500' },
];

const PROD_STATUS_OPTIONS: SelectOption<string>[] = [
  { value: 'editing', label: 'Đang quay / dựng', icon: <Clapperboard size={14} />, iconColor: 'text-pink-500' },
  { value: 'rendering', label: 'Đang Render', icon: <Clock size={14} />, iconColor: 'text-amber-500' },
  { value: 'feedback', label: 'Đang sửa Feedback', icon: <RefreshCw size={14} />, iconColor: 'text-blue-500' },
];

const REVISION_OPTIONS: SelectOption<string>[] = [
  { value: 'v1', label: 'Lần 1' },
  { value: 'v2', label: 'Lần 2' },
  { value: 'v3+', label: 'Lần 3+' },
];

interface MediaDailyFormProps {
  tasks: WorkItem[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function MediaDailyForm({ tasks, onClose, onSuccess }: MediaDailyFormProps) {
  const { currentUser } = useAuth();
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const [taskStatuses, setTaskStatuses] = useState<Record<string, 'done' | 'doing'>>({});
  const [taskMetrics, setTaskMetrics] = useState<Record<string, MediaMetrics>>({});
  const [blockers, setBlockers] = useState<BlockerEntry[]>([]);
  const [todayPlans, setTodayPlans] = useState<TodayPlanEntry[]>([]);

  const userTasks = tasks.filter((t) => t.assigneeId === currentUser?.id);
  const taskOptions = userTasks.map((t) => ({ value: t.id, label: t.title }));

  const handleTaskStatusChange = (taskId: string, status: 'done' | 'doing') => {
    setTaskStatuses((prev) => {
      if (prev[taskId] === status) {
        const newState = { ...prev };
        delete newState[taskId];
        return newState;
      }
      return { ...prev, [taskId]: status };
    });
    if (!taskMetrics[taskId]) {
      setTaskMetrics((prev) => ({ ...prev, [taskId]: { version: 'demo', prodStatus: 'editing', revisionCount: 'v1' } }));
    }
  };

  const updateTaskMetric = (taskId: string, field: keyof MediaMetrics, value: string | number | boolean) => {
    setTaskMetrics((prev) => ({ ...prev, [taskId]: { ...prev[taskId], [field]: value } }));
  };

  const addBlocker = () => setBlockers((prev) => [...prev, { id: `b${Date.now()}`, description: '', impact: 'none', tags: [] }]);
  const updateBlocker = (id: string, field: keyof BlockerEntry, value: string) => setBlockers((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  const removeBlocker = (id: string) => setBlockers((prev) => prev.filter((b) => b.id !== id));
  const appendBlockerTag = (id: string, tag: string) => setBlockers((prev) => prev.map((b) => (b.id === id ? { ...b, description: b.description ? `${b.description} ${tag}` : tag } : b)));

  const addTodayPlan = () => setTodayPlans((prev) => [...prev, { id: `p${Date.now()}`, output: '', progress: 0, isPriority: false }]);
  const updateTodayPlan = (id: string, field: keyof TodayPlanEntry, value: string | number | boolean) => setTodayPlans((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  const removeTodayPlan = (id: string) => setTodayPlans((prev) => prev.filter((p) => p.id !== id));
  const togglePlanPriority = (id: string) => setTodayPlans((prev) => prev.map((p) => (p.id === id ? { ...p, isPriority: !p.isPriority } : p)));

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const yesterdayTasks: TaskEntry[] = Object.entries(taskStatuses).map(([taskId, status]) => ({ taskId, status: status as 'done' | 'doing', metrics: taskMetrics[taskId] }));
      const res = await fetch('/api/daily-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          reportDate: new Date(reportDate).toISOString(),
          teamType: 'media',
          tasksData: JSON.stringify({
            completedYesterday: Object.entries(taskStatuses).filter(([, s]) => s === 'done').map(([id]) => id),
            doingYesterday: Object.entries(taskStatuses).filter(([, s]) => s === 'doing').map(([id]) => id),
            doingToday: todayPlans.map((p) => p.taskId).filter(Boolean),
          }),
          blockers: blockers.length > 0 ? JSON.stringify(blockers) : null,
          impactLevel: blockers.some((b) => b.impact === 'high') ? 'high' : blockers.some((b) => b.impact === 'low') ? 'low' : 'none',
          teamMetrics: { yesterdayTasks, blockers, todayPlans },
        }),
      });
      if (res.ok) onSuccess();
    } catch (error) {
      console.error('Failed to create report:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderYesterdaySection = () => (
    <>
      {userTasks.map((task) => (
        <TaskStatusCard key={task.id} task={task} status={taskStatuses[task.id] || null} onStatusChange={(status) => handleTaskStatusChange(task.id, status)} teamColor="pink">
          {taskStatuses[task.id] === 'done' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Link File / Link Bài Đăng</label>
                  <input type="text" placeholder="Dán link ấn phẩm..." className="w-full border border-slate-300 rounded-3xl p-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none font-medium text-slate-700" value={taskMetrics[task.id]?.link || ''} onChange={(e) => updateTaskMetric(task.id, 'link', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Loại ấn phẩm</label>
                  <CustomSelect
                    value={taskMetrics[task.id]?.version || 'demo'}
                    onChange={(value) => updateTaskMetric(task.id, 'version', value)}
                    options={VERSION_OPTIONS}
                    placeholder="Chọn loại..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-pink-50/50 p-4 rounded-3xl border border-pink-100">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Số ấn phẩm</label>
                  <input type="number" placeholder="0" className="w-full border border-pink-200 rounded-3xl p-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none font-bold text-pink-700 bg-white" value={taskMetrics[task.id]?.publicationsCount || ''} onChange={(e) => updateTaskMetric(task.id, 'publicationsCount', parseInt(e.target.value) || 0)} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Lượt xem</label>
                  <input type="text" placeholder="VD: 15.5K" className="w-full border border-pink-200 rounded-3xl p-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none font-bold text-slate-700 bg-white" value={taskMetrics[task.id]?.views || ''} onChange={(e) => updateTaskMetric(task.id, 'views', e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tương tác</label>
                  <input type="text" placeholder="VD: 1.2K" className="w-full border border-pink-200 rounded-3xl p-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none font-bold text-slate-700 bg-white" value={taskMetrics[task.id]?.engagement || ''} onChange={(e) => updateTaskMetric(task.id, 'engagement', e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Follower mới</label>
                  <div className="relative">
                    <span className="absolute left-2 top-2 text-slate-400 font-bold">+</span>
                    <input type="number" placeholder="0" className="w-full border border-pink-200 rounded-3xl p-2.5 pl-6 text-sm focus:ring-2 focus:ring-pink-500 outline-none font-bold text-pink-600 bg-white" value={taskMetrics[task.id]?.followers || ''} onChange={(e) => updateTaskMetric(task.id, 'followers', parseInt(e.target.value) || 0)} />
                  </div>
                </div>
              </div>
            </div>
          )}
          {taskStatuses[task.id] === 'doing' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Tình trạng sản xuất</label>
                <CustomSelect
                  value={taskMetrics[task.id]?.prodStatus || 'editing'}
                  onChange={(value) => updateTaskMetric(task.id, 'prodStatus', value)}
                  options={PROD_STATUS_OPTIONS}
                  placeholder="Chọn trạng thái..."
                />
              </div>
              {taskMetrics[task.id]?.prodStatus === 'feedback' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Vòng sửa</label>
                  <CustomSelect
                    value={taskMetrics[task.id]?.revisionCount || 'v1'}
                    onChange={(value) => updateTaskMetric(task.id, 'revisionCount', value)}
                    options={REVISION_OPTIONS}
                    placeholder="Chọn vòng..."
                  />
                </div>
              )}
            </div>
          )}
        </TaskStatusCard>
      ))}
      {userTasks.length === 0 && <div className="text-center py-8 bg-white rounded-3xl border border-dashed border-slate-200"><p className="text-slate-400 font-medium">Không có task nào được assign</p></div>}
    </>
  );

  const renderBlockersSection = () => (
    <>
      <button onClick={addBlocker} className="mb-4 text-sm font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors flex items-center"><Plus size={16} className="mr-1" /> Thêm Vấn đề</button>
      {blockers.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-3xl"><div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-500 rounded-full mb-3"><CheckCheck size={24} /></div><p className="text-sm font-bold text-slate-600">Xưởng sản xuất đang chạy mượt!</p></div>
      ) : (
        <div className="space-y-4">{blockers.map((blocker) => <BlockerCard key={blocker.id} blocker={blocker} onUpdate={(field, value) => updateBlocker(blocker.id, field, value)} onRemove={() => removeBlocker(blocker.id)} onAppendTag={(tag) => appendBlockerTag(blocker.id, tag)} tags={BLOCKER_TAGS.media} taskOptions={taskOptions} />)}</div>
      )}
    </>
  );

  const renderTodaySection = () => (
    <>
      <button onClick={addTodayPlan} className="mb-4 text-sm font-bold text-pink-600 bg-pink-50 px-3 py-1.5 rounded-full hover:bg-pink-100 transition-colors flex items-center"><Plus size={16} className="mr-1" /> Thêm Công việc</button>
      {todayPlans.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-3xl"><p className="text-sm font-bold text-slate-600">Chưa có mục tiêu nào!</p></div>
      ) : (
        <div className="space-y-4">{todayPlans.map((plan, index) => <TodayPlanCard key={plan.id} plan={plan} index={index} onUpdate={(field, value) => updateTodayPlan(plan.id, field, value)} onRemove={() => removeTodayPlan(plan.id)} onTogglePriority={() => togglePlanPriority(plan.id)} taskOptions={taskOptions} teamType="media" priorityLabel="Ấn phẩm Nóng (SLA Đỏ)" priorityIcon={<Siren size={12} />} />)}</div>
      )}
    </>
  );

  return (
    <DailyReportBase teamType="media" userName={currentUser?.fullName || ''} userRole={currentUser?.role || ''} userAvatar={currentUser?.fullName?.split(' ').map((n) => n[0]).join('') || '?'} reportDate={reportDate} onDateChange={setReportDate} onClose={onClose} onSubmit={handleSubmit} submitting={submitting} yesterdaySection={renderYesterdaySection()} blockersSection={renderBlockersSection()} todaySection={renderTodaySection()} />
  );
}
