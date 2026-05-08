import { Plus, Trash2, Briefcase, Clock } from 'lucide-react';
import { AdHocTask } from '../../../types/daily-report-metrics';
import CustomSelect, { SelectOption } from '../../ui/CustomSelect';
import { TableShell } from '../../ui/TableShell';
import { getTableContract } from '../../ui/table-contract';

interface AdHocTasksSectionProps {
  tasks: AdHocTask[];
  onTasksChange: (tasks: AdHocTask[]) => void;
  teamColor?: 'indigo' | 'orange' | 'pink' | 'emerald' | 'primary';
}

const IMPACT_OPTIONS: SelectOption<string>[] = [
  { value: 'low', label: 'Thấp' },
  { value: 'medium', label: 'Trung bình' },
  { value: 'high', label: 'Cao' },
];

const STATUS_OPTIONS: SelectOption<string>[] = [
  { value: 'in-progress', label: 'Đang làm' },
  { value: 'done', label: 'Hoàn thành' },
];

const COLOR_CLASSES = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200', badge: 'bg-pink-100 text-pink-700' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' },
  primary: { bg: 'bg-primary/5', text: 'text-primary', border: 'border-primary/20', badge: 'bg-primary/10 text-primary' },
};

export default function AdHocTasksSection({ tasks, onTasksChange, teamColor = 'indigo' }: AdHocTasksSectionProps) {
  const colors = COLOR_CLASSES[teamColor];
  const totalHours = tasks.reduce((sum, t) => sum + (t.hoursSpent || 0), 0);
  const standardTable = getTableContract('standard');

  const addTask = () => {
    onTasksChange([...tasks, {
      id: Date.now(),
      name: '',
      requester: '',
      impact: 'low',
      status: 'in-progress',
      hoursSpent: 0,
    }]);
  };

  const updateTask = (id: number, field: keyof AdHocTask, value: string | number) => {
    onTasksChange(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTask = (id: number) => {
    onTasksChange(tasks.filter(t => t.id !== id));
  };

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-xl p-4 mt-4`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <Briefcase size={16} className={colors.text} />
          Công việc phát sinh
          {totalHours > 0 && (
            <span className={`${colors.badge} text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1`}>
              <Clock size={12} />
              {totalHours}h
            </span>
          )}
        </h3>
        <button
          onClick={addTask}
          className={`${colors.text} text-xs font-bold px-2.5 py-1 rounded-xl hover:bg-white/50 transition-colors flex items-center gap-1`}
        >
          <Plus size={14} /> Thêm
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-4 bg-white/50 rounded-xl border border-dashed border-slate-200">
          <Briefcase className="mx-auto text-slate-300 mb-1.5" size={20} />
          <p className="text-xs text-slate-400">Không có công việc phát sinh</p>
        </div>
      ) : (
        <>
          <TableShell variant="standard" className="rounded-xl" tableClassName="text-left text-sm">
            <thead>
              <tr className={standardTable.headerRow}>
                <th className={`${standardTable.headerCell} min-w-[140px]`}>Công việc</th>
                <th className={`${standardTable.headerCell} min-w-[100px]`}>Người yêu cầu</th>
                <th className={`${standardTable.headerCell} w-24`}>Impact</th>
                <th className={`${standardTable.headerCell} w-28`}>Status</th>
                <th className={`${standardTable.headerCell} w-16 text-right`}>Giờ</th>
                <th className={standardTable.actionHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody className={standardTable.body}>
              {tasks.map((task) => (
                <tr key={task.id} className={`${standardTable.row} group`}>
                  <td className={standardTable.cell}>
                    <input
                      type="text"
                      value={task.name}
                      onChange={(e) => updateTask(task.id, 'name', e.target.value)}
                      placeholder="Tên công việc..."
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:ring-1 focus:ring-primary outline-none"
                    />
                  </td>
                  <td className={standardTable.cell}>
                    <input
                      type="text"
                      value={task.requester}
                      onChange={(e) => updateTask(task.id, 'requester', e.target.value)}
                      placeholder="Ai yêu cầu..."
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:ring-1 focus:ring-primary outline-none"
                    />
                  </td>
                  <td className={standardTable.cell}>
                    <CustomSelect
                      value={task.impact}
                      onChange={(value) => updateTask(task.id, 'impact', value)}
                      options={IMPACT_OPTIONS}
                      placeholder="Impact"
                    />
                  </td>
                  <td className={standardTable.cell}>
                    <CustomSelect
                      value={task.status}
                      onChange={(value) => updateTask(task.id, 'status', value)}
                      options={STATUS_OPTIONS}
                      placeholder="Status"
                    />
                  </td>
                  <td className={standardTable.cell}>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={task.hoursSpent || ''}
                      onChange={(e) => updateTask(task.id, 'hoursSpent', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-right focus:ring-1 focus:ring-primary outline-none"
                    />
                  </td>
                  <td className={standardTable.actionCell}>
                    <button
                      onClick={() => removeTask(task.id)}
                      className="text-slate-300 hover:text-rose-500 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Delete task"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableShell>
          <div className="mt-2 pt-2 border-t border-slate-200/50 text-right">
            <span className="text-xs text-slate-500">Tổng:</span>
            <span className={`ml-1 font-bold ${colors.text}`}>{totalHours}h</span>
          </div>
        </>
      )}
    </div>
  );
}
