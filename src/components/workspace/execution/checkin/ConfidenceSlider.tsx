import { Badge } from '@/components/ui/badge';

interface ConfidenceSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

/**
 * 0-10 confidence slider for KR weekly check-ins.
 *
 * Phase 8 follow-up (2026-05-10): migrated value indicator to v2 Badge variant
 * (in-place, API identical). Native range input retains accent-primary.
 */
function variantFor(value: number): 'success' | 'warning' | 'error' {
  if (value >= 7) return 'success';
  if (value >= 4) return 'warning';
  return 'error';
}

export default function ConfidenceSlider({ value, onChange, disabled = false }: ConfidenceSliderProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-primary"
      />
      <Badge variant={variantFor(value)} size="md" soft={false} className="min-w-[3rem] justify-center">
        {value}/10
      </Badge>
    </div>
  );
}
