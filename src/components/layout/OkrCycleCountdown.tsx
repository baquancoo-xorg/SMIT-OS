import { useNavigate } from 'react-router-dom';
import { useActiveOkrCycle } from '../../hooks/use-active-okr-cycle';

const COLOR_MAP: Record<string, string> = {
  green: 'text-emerald-700 bg-emerald-50 border-emerald-100',
  amber: 'text-amber-700 bg-amber-50 border-amber-100',
  red: 'text-rose-700 bg-rose-50 border-rose-100',
};

export default function OkrCycleCountdown() {
  const { cycle, daysLeft, color, isLoading, isError } = useActiveOkrCycle();
  const navigate = useNavigate();

  if (isLoading || isError || !cycle || daysLeft == null || !color) return null;

  const label = daysLeft <= 0 ? 'ended' : `${daysLeft}d left`;

  return (
    <button
      type="button"
      onClick={() => navigate('/okrs')}
      className={`hidden md:inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition hover:opacity-90 ${COLOR_MAP[color]}`}
      title={`${cycle.name} ends ${cycle.endDate.slice(0, 10)}`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
        track_changes
      </span>
      <span>{cycle.name} · {label}</span>
    </button>
  );
}
