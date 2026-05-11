import { useEffect, useState } from 'react';
import { cn } from '../lib/cn';
import { Badge } from './badge';

export interface OkrCycleCountdownProps {
  /** Cycle end date (Date or ISO string). */
  endDate: Date | string;
  /** Label prefix. Default "Cycle ends in". */
  label?: string;
  /** Tick frequency in ms. Default 60_000 (1 min). */
  tickMs?: number;
  className?: string;
}

interface Breakdown {
  days: number;
  hours: number;
  minutes: number;
  totalMs: number;
  expired: boolean;
}

function breakdown(target: Date): Breakdown {
  const ms = target.getTime() - Date.now();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, totalMs: 0, expired: true };
  const minutes = Math.floor(ms / 60_000) % 60;
  const hours = Math.floor(ms / 3_600_000) % 24;
  const days = Math.floor(ms / 86_400_000);
  return { days, hours, minutes, totalMs: ms, expired: false };
}

/**
 * v4 OkrCycleCountdown — renders remaining time until an OKR cycle ends.
 * Updates on a ticker. Switches to red badge in the last 3 days; archived after expiry.
 */
export function OkrCycleCountdown({ endDate, label = 'Cycle ends in', tickMs = 60_000, className }: OkrCycleCountdownProps) {
  const target = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const [data, setData] = useState<Breakdown>(() => breakdown(target));

  useEffect(() => {
    setData(breakdown(target));
    const id = window.setInterval(() => setData(breakdown(target)), tickMs);
    return () => window.clearInterval(id);
  }, [target, tickMs]);

  if (data.expired) {
    return (
      <Badge intent="archived" className={className}>
        Cycle ended
      </Badge>
    );
  }

  const urgent = data.days < 3;
  const text = data.days > 0
    ? `${data.days}d ${data.hours}h`
    : `${data.hours}h ${data.minutes}m`;

  return (
    <div className={cn('inline-flex items-center gap-snug', className)}>
      <span className="text-caption text-fg-subtle">{label}</span>
      <Badge intent={urgent ? 'rework' : 'in-progress'}>{text}</Badge>
    </div>
  );
}
