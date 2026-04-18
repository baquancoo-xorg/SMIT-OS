import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { format, subDays, startOfMonth } from 'date-fns';

export interface DateRangeValue {
  from: string;
  to: string;
}

const PRESETS = [
  { label: 'Hôm nay', getValue: () => ({ from: new Date(), to: new Date() }) },
  { label: '7 ngày qua', getValue: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
  { label: '14 ngày qua', getValue: () => ({ from: subDays(new Date(), 13), to: new Date() }) },
  { label: '30 ngày qua', getValue: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
  { label: 'Tháng này', getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
];

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (v: DateRangeValue) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customFrom, setCustomFrom] = useState(value.from);
  const [customTo, setCustomTo] = useState(value.to);

  const handlePresetClick = (preset: (typeof PRESETS)[0]) => {
    const v = preset.getValue();
    onChange({
      from: format(v.from, 'yyyy-MM-dd'),
      to: format(v.to, 'yyyy-MM-dd'),
    });
    setShowCustom(false);
    setIsOpen(false);
  };

  const handleCustomApply = () => {
    if (customFrom && customTo) {
      onChange({ from: customFrom, to: customTo });
      setShowCustom(false);
      setIsOpen(false);
    }
  };

  const handleCustomClick = () => {
    setCustomFrom(value.from);
    setCustomTo(value.to);
    setShowCustom(true);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-full bg-white shadow-sm hover:shadow-md transition-all"
      >
        <Calendar className="h-3 w-3 text-primary" />
        <span className="text-slate-700 normal-case font-medium text-sm">
          {value.from} → {value.to}
        </span>
        <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => { setIsOpen(false); setShowCustom(false); }} />
          <div className="absolute right-0 top-full mt-2 z-20 bg-white rounded-xl shadow-lg p-2 min-w-[220px]">
            {!showCustom ? (
              <>
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handlePresetClick(p)}
                    className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-[#0059B6]/5 hover:text-slate-900 rounded-md transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
                <hr className="my-2 border-slate-100" />
                <button
                  type="button"
                  onClick={handleCustomClick}
                  className="w-full text-left px-3 py-2 text-sm text-[#0059B6] font-medium hover:bg-[#0059B6]/5 rounded-md transition-colors"
                >
                  Custom...
                </button>
              </>
            ) : (
              <div className="p-2 space-y-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Chọn khoảng thời gian</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1.5 block">Từ ngày</label>
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0059B6]/30 focus:border-[#0059B6] transition-all [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1.5 block">Đến ngày</label>
                    <input
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0059B6]/30 focus:border-[#0059B6] transition-all [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCustom(false)}
                    className="flex-1 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Huỷ
                  </button>
                  <button
                    type="button"
                    onClick={handleCustomApply}
                    className="flex-1 px-3 py-2 text-sm bg-[#0059B6] text-white font-medium rounded-lg hover:bg-[#0059B6]/90 transition-colors"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
