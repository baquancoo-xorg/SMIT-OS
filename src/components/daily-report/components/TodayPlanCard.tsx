import React from 'react';
import { X } from 'lucide-react';
import { TodayPlanEntry, TeamType } from '../../../types/daily-report-metrics';
import CustomSelect from '../../ui/CustomSelect';

interface TodayPlanCardProps {
  plan: TodayPlanEntry;
  index: number;
  onUpdate: (field: keyof TodayPlanEntry, value: string | number | boolean) => void;
  onRemove: () => void;
  onTogglePriority: () => void;
  taskOptions: { value: string; label: string }[];
  teamType: TeamType;
  priorityLabel: string;
  priorityIcon: React.ReactNode;
}

export default function TodayPlanCard({
  plan,
  index,
  onUpdate,
  onRemove,
  onTogglePriority,
  taskOptions,
  teamType,
  priorityLabel,
  priorityIcon,
}: TodayPlanCardProps) {
  const isPriority = plan.isPriority;


  return (
    <div
      className={`p-4 rounded-xl relative group transition-all ${
        isPriority
          ? 'border-2 border-red-300 bg-red-50/30 shadow-md'
          : 'border border-slate-200 bg-slate-50/50'
      }`}
    >
      <button
        onClick={onRemove}
        className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors bg-white rounded-xl p-1 shadow-sm opacity-0 group-hover:opacity-100 z-10"
        title="Xóa công việc này"
      >
        <X size={16} />
      </button>

      <div className="mb-4 pr-8">
        <div className="flex justify-between items-end mb-1.5">
          <label
            className={`block text-[11px] font-bold uppercase ${
              isPriority ? 'text-red-600' : 'text-slate-500'
            }`}
          >
            Mục tiêu #{index + 1}
          </label>
          <button
            onClick={onTogglePriority}
            className={`flex items-center px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
              isPriority
                ? 'bg-red-50 border-red-200 text-red-600 shadow-sm'
                : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
            }`}
          >
            {priorityIcon}
            <span className="ml-1">{priorityLabel}</span>
          </button>
        </div>
        <CustomSelect
          value={plan.taskId || ''}
          onChange={(value) => {
            onUpdate('taskId', value);
            const option = taskOptions.find((o) => o.value === value);
            if (option) onUpdate('taskTitle', option.label);
          }}
          options={[
            { value: '', label: 'Chọn Task cần focus...' },
            ...taskOptions.map((opt) => ({ value: opt.value, label: opt.label }))
          ]}
          placeholder="Chọn Task cần focus..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <label
            className={`block text-[11px] font-bold uppercase mb-1.5 ${
              isPriority ? 'text-red-500' : 'text-slate-500'
            }`}
          >
            Cam kết đầu ra
          </label>
          <input
            type="text"
            value={plan.output}
            onChange={(e) => onUpdate('output', e.target.value)}
            className={`w-full text-sm p-3 rounded-xl border ${
              isPriority
                ? 'border-red-200 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:border-primary focus:ring-primary'
            } focus:ring-1 outline-none bg-white placeholder-slate-400`}
            placeholder="Kết quả sẽ đạt được..."
          />
        </div>
        <div>
          <label
            className={`block text-[11px] font-bold uppercase mb-1.5 ${
              isPriority ? 'text-red-500' : 'text-slate-500'
            }`}
          >
            Dự kiến tiến độ
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-slate-400 font-bold">+</span>
            <input
              type="number"
              value={plan.progress || ''}
              onChange={(e) => onUpdate('progress', parseInt(e.target.value) || 0)}
              className={`w-full text-sm p-3 pl-7 pr-8 rounded-xl border ${
                isPriority
                  ? 'border-red-200 focus:border-red-500 focus:ring-red-500 text-red-600'
                  : 'border-slate-300 focus:border-primary focus:ring-primary text-primary'
              } focus:ring-1 outline-none bg-white font-bold`}
              placeholder="0"
              min="0"
              max="100"
            />
            <span className="absolute right-3 text-slate-400 font-bold">%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
