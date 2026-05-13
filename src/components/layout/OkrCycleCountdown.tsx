import { useNavigate } from 'react-router-dom';
import { useActiveOkrCycle } from '../../hooks/use-active-okr-cycle';

const COLOR_MAP: Record<string, string> = {
  green: 'text-success bg-success-container/30 border-success-container/40',
  amber: 'text-warning bg-warning-container/30 border-warning-container/40',
  red: 'text-error bg-error-container/30 border-error-container/40',
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
