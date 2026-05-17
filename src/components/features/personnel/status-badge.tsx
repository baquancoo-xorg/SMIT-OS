/**
 * Personnel status badge. Wired with use-personnel-flags hook (P3).
 */

import { usePersonnelFlagsQuery } from '../../../hooks/use-personnel-flags';
import type { PersonnelStatus } from '../../../lib/personnel/personnel-types';

interface Props {
  personnelId?: string | null;
  status?: PersonnelStatus;
  flagCount?: number;
}

const STATUS_STYLE: Record<PersonnelStatus, { label: string; cls: string }> = {
  on_track: { label: 'On Track', cls: 'bg-emerald-500/15 text-emerald-500 ring-emerald-500/30' },
  needs_attention: { label: 'Needs Attention', cls: 'bg-amber-500/15 text-amber-500 ring-amber-500/30' },
  at_risk: { label: 'At Risk', cls: 'bg-rose-500/15 text-rose-500 ring-rose-500/30' },
  onboarding: { label: 'Onboarding', cls: 'bg-neutral-500/15 text-neutral-400 ring-neutral-500/30' },
};

export function PersonnelStatusBadge({ personnelId, status, flagCount }: Props) {
  const { data } = usePersonnelFlagsQuery(personnelId ?? null);
  const effectiveStatus = status ?? data?.status ?? 'on_track';
  const effectiveCount = flagCount ?? data?.flags.length ?? 0;
  const cfg = STATUS_STYLE[effectiveStatus];
  const title = effectiveCount > 0
    ? (data?.flags.map((f) => f.message).join(' · ') ?? `${effectiveCount} flag(s)`)
    : 'Không có flag';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cfg.cls}`}
      title={title}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {cfg.label}
      {effectiveCount > 0 && <span className="ml-1 text-[10px] opacity-70">·{effectiveCount}</span>}
    </span>
  );
}
