/**
 * Executive Dashboard → Personnel tab.
 * Team Pulse view answering: team health, skill movement, who needs attention.
 * v4 contract (docs/ui-design-contract.md §3, §5, §7): dark gradient cards, Suspense skeletons,
 *   accent var(--brand-500) via tokens, no solid orange CTAs.
 */

import { Suspense, useMemo, useState } from 'react';
import { Calendar } from 'lucide-react';
import { Card } from '../../../ui';
import CustomSelect from '../../../ui/custom-select';
import { usePersonnelDashboardQuery } from '../../../../hooks/use-personnel-dashboard';
import { TeamPulseStrip } from './team-pulse-strip';
import { SkillMovement } from './skill-movement';
import { AttentionInbox } from './attention-inbox';
import { WorkloadSection } from './workload-section';

function quartersBack(label: string | undefined, n: number): string[] {
  if (!label) return [];
  const [y, qn] = label.split('-Q').map(Number);
  const out: string[] = [];
  let yy = y;
  let q = qn;
  for (let i = 0; i < n; i++) {
    out.push(`${yy}-Q${q}`);
    q--;
    if (q === 0) { q = 4; yy--; }
  }
  return out;
}

function SectionSkeleton({ height = 160 }: { height?: number }) {
  return <div className="animate-pulse rounded-card bg-surface-2" style={{ height }} />;
}

export default function PersonnelDashboardTab() {
  const [quarterOverride, setQuarterOverride] = useState<string | undefined>(undefined);
  const { data, isLoading, error } = usePersonnelDashboardQuery(quarterOverride);

  const quarterOptions = useMemo(() => {
    const base = data?.quarter;
    const list = quartersBack(base, 5);
    return list.map((q) => ({ value: q, label: q }));
  }, [data?.quarter]);

  if (error) {
    return (
      <Card padding="md">
        <p className="text-sm text-error">Lỗi tải dashboard: {(error as Error).message}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-card bg-surface-2 p-2 text-accent-text">
            <Calendar className="size-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Team Personnel</p>
            <h2 className="font-headline text-lg font-black text-text-1">
              Pulse · {data?.quarter ?? '—'}
            </h2>
          </div>
        </div>
        {data && (
          <CustomSelect
            value={quarterOverride ?? data.quarter}
            onChange={(v) => setQuarterOverride(v)}
            options={quarterOptions}
            buttonClassName="min-w-[10rem]"
          />
        )}
      </div>

      <Suspense fallback={<SectionSkeleton height={140} />}>
        <TeamPulseStrip data={data?.pulse} loading={isLoading} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height={360} />}>
        <SkillMovement data={data?.skillMovement} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height={260} />}>
        <AttentionInbox items={data?.attentionItems ?? []} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height={220} />}>
        <WorkloadSection data={data?.workload} />
      </Suspense>
    </div>
  );
}
