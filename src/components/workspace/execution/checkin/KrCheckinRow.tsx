import { KeyResult, KrCheckin } from '@/types';
import ConfidenceSlider from './ConfidenceSlider';

interface KrCheckinRowProps {
  kr: KeyResult;
  value: KrCheckin;
  onChange: (next: KrCheckin) => void;
}

export default function KrCheckinRow({ kr, value, onChange }: KrCheckinRowProps) {
  return (
    <div className="bg-surface-variant/30 rounded-card p-5 border border-outline-variant/40 space-y-4">
      <div>
        <h4 className="font-bold text-on-surface leading-tight">{kr.title}</h4>
        <p className="text-xs text-on-surface-variant mt-1">
          Target: {kr.targetValue ?? 100} {kr.unit ?? ''} • Hiện tại đã ghi nhận: {kr.currentValue ?? 0}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1 block">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Current value</span>
          <input
            type="number"
            value={value.currentValue}
            onChange={(e) => onChange({ ...value, currentValue: Number(e.target.value) })}
            className="w-full bg-surface-3 text-on-surface border border-outline-variant/40 rounded-card px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary"
          />
        </label>

        <label className="space-y-1 block">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Confidence</span>
          <ConfidenceSlider
            value={value.confidence0to10}
            onChange={(v) => onChange({ ...value, confidence0to10: v })}
          />
        </label>
      </div>

      <label className="space-y-1 block">
        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Note</span>
        <input
          type="text"
          value={value.note ?? ''}
          onChange={(e) => onChange({ ...value, note: e.target.value })}
          placeholder="Ngắn gọn 1 dòng (optional)"
          className="w-full bg-surface-3 text-on-surface border border-outline-variant/40 rounded-card px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary"
        />
      </label>
    </div>
  );
}
