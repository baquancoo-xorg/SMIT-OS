/**
 * Single row in the Attention Inbox.
 * Click body → open profile drawer.
 * Per-flag menu → dismiss / snooze 7/14/30 days.
 */

import { ChevronRight, MoreVertical, BellOff, AlarmClock } from 'lucide-react';
import { DropdownMenu } from '../../../ui';
import type { AttentionItem, PersonnelFlag } from '../../../../hooks/use-personnel-dashboard';
import { POSITION_LABEL } from '../../../../lib/personnel/personnel-types';
import type { PersonnelPosition } from '../../../../lib/personnel/personnel-types';
import { useDismissFlagMutation } from '../../../../hooks/use-attention-dismissal';

interface Props {
  item: AttentionItem;
  onOpen: (id: string) => void;
}

const STATUS_TONE: Record<AttentionItem['status'], string> = {
  at_risk: 'bg-error-container/60 text-error ring-error/30',
  needs_attention: 'bg-warning-container/60 text-warning ring-warning/30',
  on_track: 'bg-success-container/60 text-success ring-success/30',
  onboarding: 'bg-surface-2 text-text-muted ring-border',
};

const STATUS_LABEL: Record<AttentionItem['status'], string> = {
  at_risk: 'At Risk',
  needs_attention: 'Needs Attention',
  on_track: 'On Track',
  onboarding: 'Onboarding',
};

function FlagChip({ flag, personnelId }: { flag: PersonnelFlag; personnelId: string }) {
  const dismiss = useDismissFlagMutation();
  return (
    <span className="inline-flex items-center gap-1 rounded-chip bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-text-2">
      {flag.message}
      <DropdownMenu
        label={`Tuỳ chọn cho ${flag.code}`}
        width="11rem"
        trigger={
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="grid size-4 place-items-center rounded-full text-text-muted transition hover:bg-surface hover:text-text-1"
            aria-label="Tuỳ chọn"
          >
            <MoreVertical className="size-3" />
          </button>
        }
        items={[
          {
            key: 'dismiss',
            label: 'Dismiss vĩnh viễn',
            icon: <BellOff />,
            onClick: () => dismiss.mutate({ personnelId, flagCode: flag.code }),
          },
          {
            key: 'snooze-7',
            label: 'Snooze 7 ngày',
            icon: <AlarmClock />,
            onClick: () => dismiss.mutate({ personnelId, flagCode: flag.code, snoozeDays: 7 }),
          },
          {
            key: 'snooze-14',
            label: 'Snooze 14 ngày',
            icon: <AlarmClock />,
            onClick: () => dismiss.mutate({ personnelId, flagCode: flag.code, snoozeDays: 14 }),
          },
          {
            key: 'snooze-30',
            label: 'Snooze 30 ngày',
            icon: <AlarmClock />,
            onClick: () => dismiss.mutate({ personnelId, flagCode: flag.code, snoozeDays: 30 }),
          },
        ]}
      />
    </span>
  );
}

export function AttentionRow({ item, onOpen }: Props) {
  return (
    <div
      className="group flex items-center gap-3 rounded-input border border-transparent bg-surface-1 px-3 py-2.5 transition hover:border-border hover:bg-surface-2/60"
    >
      <button
        type="button"
        onClick={() => onOpen(item.personnelId)}
        className="flex flex-1 items-center gap-3 text-left"
      >
        <div className="size-10 shrink-0 overflow-hidden rounded-full bg-surface-2">
          {item.avatar ? (
            <img src={item.avatar} alt={item.fullName} className="size-full object-cover" loading="lazy" />
          ) : (
            <div className="grid size-full place-items-center text-sm font-bold text-text-muted">
              {item.fullName.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <p className="truncate text-sm font-bold text-text-1">{item.fullName}</p>
            <p className="text-xs text-text-muted">{POSITION_LABEL[item.position as PersonnelPosition] ?? item.position}</p>
          </div>
          <div className="mt-1 flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
            {item.flags.map((f) => (
              <FlagChip key={f.code} flag={f} personnelId={item.personnelId} />
            ))}
          </div>
        </div>
      </button>
      <span
        className={`shrink-0 rounded-chip px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${STATUS_TONE[item.status]}`}
      >
        {STATUS_LABEL[item.status]}
      </span>
      <ChevronRight className="size-4 shrink-0 text-text-muted transition group-hover:translate-x-0.5 group-hover:text-text-1" />
    </div>
  );
}
