import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

export interface OkrCycleCountdownProps {
  /** Deadline date (Q-end). Component re-renders every minute. */
  deadline: Date;
  /** Cycle label (e.g., "Q2 2026"). */
  cycleLabel: string;
  /** Hide minutes when ≥ 7 days remain. Default: true (compact). */
  compact?: boolean;
  className?: string;
}

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  past: boolean;
  totalMs: number;
}

function diff(deadline: Date): Remaining {
  const ms = deadline.getTime() - Date.now();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, past: true, totalMs: ms };
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return { days, hours, minutes, past: false, totalMs: ms };
}

function severity(rem: Remaining): 'safe' | 'soon' | 'urgent' | 'past' {
  if (rem.past) return 'past';
  if (rem.days <= 3) return 'urgent';
  if (rem.days <= 14) return 'soon';
  return 'safe';
}

const severityStyle: Record<ReturnType<typeof severity>, string> = {
  safe: 'bg-success-container text-on-success-container',
  soon: 'bg-warning-container text-on-warning-container',
  urgent: 'bg-error-container text-on-error-container',
  past: 'bg-surface-container text-on-surface-variant',
};

/**
 * OkrCycleCountdown v2 — live-ticking pill widget for header.
 *
 * Recomputes every 60s. Severity color shifts as deadline approaches:
 * - safe (>14d): success
 * - soon (≤14d): warning
 * - urgent (≤3d): error
 * - past: neutral
 *
 * @example
 * <OkrCycleCountdown deadline={new Date('2026-06-30T23:59:59Z')} cycleLabel="Q2 2026" />
 */
export function OkrCycleCountdown({ deadline, cycleLabel, compact = true, className = '' }: OkrCycleCountdownProps) {
  const [rem, setRem] = useState<Remaining>(() => diff(deadline));

  useEffect(() => {
    const tick = () => setRem(diff(deadline));
    tick(); // refresh on prop change
    const interval = window.setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, [deadline]);

  const sev = severity(rem);

  let label: string;
  if (rem.past) {
    label = `${cycleLabel} ended`;
  } else if (rem.days >= 7 && compact) {
    label = `${rem.days}d left`;
  } else if (rem.days >= 1) {
    label = `${rem.days}d ${rem.hours}h left`;
  } else if (rem.hours >= 1) {
    label = `${rem.hours}h ${rem.minutes}m left`;
  } else {
    label = `${rem.minutes}m left`;
  }

  return (
    <span
      role="timer"
      aria-live="polite"
      aria-label={`${cycleLabel}: ${label}`}
      title={`${cycleLabel} ends ${deadline.toLocaleString('vi-VN')}`}
      className={[
        'inline-flex h-7 items-center gap-1.5 rounded-chip px-2.5 text-[length:var(--text-caption)] font-semibold',
        severityStyle[sev],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Clock aria-hidden="true" className="size-3.5" />
      <span className="opacity-80">{cycleLabel}</span>
      <span className="opacity-30">·</span>
      <span>{label}</span>
    </span>
  );
}

OkrCycleCountdown.displayName = 'OkrCycleCountdown';
