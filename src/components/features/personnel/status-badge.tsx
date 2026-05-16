/**
 * Personnel status badge. Phase 1 stub — always "On Track".
 * Phase 3 wires real flag data via use-personnel-flags.
 */

import type { PersonnelStatus } from '../../../lib/personnel/personnel-types';

interface Props {
  status?: PersonnelStatus;
  flagCount?: number;
}

const STATUS_STYLE: Record<PersonnelStatus, { label: string; cls: string }> = {
  on_track: { label: 'On Track', cls: 'bg-emerald-500/15 text-emerald-500 ring-emerald-500/30' },
  needs_attention: { label: 'Needs Attention', cls: 'bg-amber-500/15 text-amber-500 ring-amber-500/30' },
  at_risk: { label: 'At Risk', cls: 'bg-rose-500/15 text-rose-500 ring-rose-500/30' },
};

export function PersonnelStatusBadge({ status = 'on_track', flagCount = 0 }: Props) {
  const cfg = STATUS_STYLE[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cfg.cls}`}
      title={flagCount > 0 ? `${flagCount} flag(s)` : 'Không có flag'}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}
