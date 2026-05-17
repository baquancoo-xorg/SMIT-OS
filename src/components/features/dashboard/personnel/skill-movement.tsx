/**
 * Skill Movement section — 3-quarter radar overlay + top movers list.
 * Group tab switcher (Job/Personal/General).
 */

import { useMemo, useState } from 'react';
import { LineChart } from 'lucide-react';
import { Card } from '../../../ui';
import { SkillRadarChart } from './skill-radar-chart';
import { TopMoversList } from './top-movers-list';
import type { SkillMovementData } from '../../../../hooks/use-personnel-dashboard';
import type { SkillGroup } from '../../../../lib/personnel/personnel-types';

const GROUP_TABS: Array<{ id: SkillGroup; label: string }> = [
  { id: 'JOB', label: 'Job' },
  { id: 'PERSONAL', label: 'Personal' },
  { id: 'GENERAL', label: 'General' },
];

interface Props {
  data: SkillMovementData | undefined;
}

export function SkillMovement({ data }: Props) {
  const [group, setGroup] = useState<SkillGroup>('JOB');
  const filtered = useMemo(() => {
    if (!data) return [];
    return data.trends.filter((t) => t.group === group);
  }, [data, group]);

  const enoughData = data && data.quarters.length >= 2;

  return (
    <Card padding="md">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-card bg-surface-2 p-2 text-accent-text">
            <LineChart className="size-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Skill Movement</p>
            <h3 className="font-headline text-base font-black text-text-1">
              {data ? `${data.quarters[0]} → ${data.quarters[data.quarters.length - 1]}` : '—'}
            </h3>
          </div>
        </div>
        <div className="flex gap-1 rounded-input bg-surface-2 p-1">
          {GROUP_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setGroup(tab.id)}
              className={`rounded-input px-3 py-1 text-xs font-bold transition ${
                group === tab.id
                  ? 'bg-surface text-text-1 shadow-card'
                  : 'text-text-muted hover:text-text-1'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {!enoughData ? (
        <p className="rounded-input border border-dashed border-border bg-surface-2/40 px-4 py-6 text-center text-xs text-text-muted">
          Cần ≥ 2 quý dữ liệu để xem chuyển động.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <SkillRadarChart trends={filtered} quarters={data!.quarters} />
          <TopMoversList topUp={data!.topUp.filter((m) => m.group === group)} topDown={data!.topDown.filter((m) => m.group === group)} />
        </div>
      )}
    </Card>
  );
}
