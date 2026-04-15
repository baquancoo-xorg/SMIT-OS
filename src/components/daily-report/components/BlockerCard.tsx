import { X, CircleCheck, CircleAlert, CircleX } from 'lucide-react';
import { BlockerEntry } from '../../../types/daily-report-metrics';
import CustomSelect, { SelectOption } from '../../ui/CustomSelect';

interface BlockerCardProps {
  blocker: BlockerEntry;
  onUpdate: (field: keyof BlockerEntry, value: string) => void;
  onRemove: () => void;
  onAppendTag: (tag: string) => void;
  tags: string[];
  taskOptions: { value: string; label: string }[];
}

const IMPACT_OPTIONS: SelectOption<string>[] = [
  { value: 'none', label: 'Vẫn kiểm soát được', icon: <CircleCheck size={16} />, iconColor: 'text-emerald-500' },
  { value: 'low', label: 'Chậm 0.5 - 1 ngày', icon: <CircleAlert size={16} />, iconColor: 'text-amber-500' },
  { value: 'high', label: 'Nguy cơ trễ Deadline', icon: <CircleX size={16} />, iconColor: 'text-red-500' },
];

export default function BlockerCard({
  blocker,
  onUpdate,
  onRemove,
  onAppendTag,
  tags,
  taskOptions,
}: BlockerCardProps) {
  return (
    <div className="p-4 border border-red-100 bg-red-50/40 rounded-3xl relative group">
      <button
        onClick={onRemove}
        className="absolute top-3 right-3 text-red-300 hover:text-red-500 transition-colors bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100"
        title="Xóa rào cản này"
      >
        <X size={16} />
      </button>

      <div className="mb-4 pr-8">
        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
          Công việc đang gặp vấn đề
        </label>
        <CustomSelect
          value={blocker.taskId || ''}
          onChange={(value) => {
            onUpdate('taskId', value);
            const option = taskOptions.find((o) => o.value === value);
            if (option) onUpdate('taskTitle', option.label);
          }}
          options={[
            { value: '', label: 'Chọn task đang bị kẹt...' },
            ...taskOptions.map((opt) => ({ value: opt.value, label: opt.label }))
          ]}
          placeholder="Chọn task đang bị kẹt..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="flex justify-between items-end mb-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase">
              Mô tả chi tiết
            </label>
            <div className="flex gap-1.5 flex-wrap justify-end">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onAppendTag(tag)}
                  className="text-[10px] bg-white border border-slate-200 hover:bg-slate-100 px-1.5 py-0.5 rounded font-medium text-slate-600"
                >
                  {tag.replace(/\[|\]/g, '')}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={blocker.description}
            onChange={(e) => onUpdate('description', e.target.value)}
            className="w-full text-sm p-3 rounded-full border border-red-200 focus:border-red-400 focus:ring-1 focus:ring-red-400 outline-none min-h-[60px] bg-white placeholder-slate-400"
            placeholder="Mô tả chi tiết..."
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
            Mức độ nguy cơ
          </label>
          <CustomSelect
            value={blocker.impact}
            onChange={(value) => onUpdate('impact', value)}
            options={IMPACT_OPTIONS}
            placeholder="Chọn mức độ..."
          />
        </div>
      </div>
    </div>
  );
}
