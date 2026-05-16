import type { AcquisitionJourney, AcquisitionJourneyStage } from '../../../../types';
import { Card } from '../../../ui';

interface Props {
  journey: AcquisitionJourney;
}

const STAGE_LABEL = {
  pre: 'Pre-product',
  in: 'In-product',
  post: 'Post-product',
} as const;

function fmtNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString('en-US');
}

export default function JourneyFunnel({ journey }: Props) {
  const stages = [
    { key: 'pre' as const, data: journey.stages.pre },
    { key: 'in' as const, data: journey.stages.in },
    { key: 'post' as const, data: journey.stages.post },
  ];
  const maxValue = Math.max(
    1,
    ...stages.flatMap((s) => s.data.steps.map((step) => step.value)),
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {stages.map(({ key, data }) => (
        <StageBand key={key} label={STAGE_LABEL[key]} stage={data} maxValue={maxValue} />
      ))}
    </div>
  );
}

function StageBand({
  label,
  stage,
  maxValue,
}: {
  label: string;
  stage: AcquisitionJourneyStage;
  maxValue: number;
}) {
  return (
    <Card padding="md" glow>
      <div className="mb-4 flex items-center gap-2">
        <div className="size-2 animate-pulse rounded-chip bg-accent" aria-hidden="true" />
        <p className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-accent-text">
          {label}
        </p>
      </div>
      <div className="space-y-3">
        {stage.steps.map((step, idx) => {
          const widthPct = (step.value / maxValue) * 100;
          return (
            <div key={step.name} className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-[length:var(--text-body-sm)] font-semibold text-text-1">{step.name}</span>
                <span className="font-headline text-[length:var(--text-h5)] font-bold tabular-nums text-text-1">
                  {fmtNumber(step.value)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-chip bg-surface-2">
                <div
                  className="h-full bg-accent transition-all duration-700"
                  style={{ width: `${Math.max(widthPct, 1)}%` }}
                />
              </div>
              {idx > 0 && step.conversionFromPrev != null && (
                <p className="text-[length:var(--text-caption)] font-semibold text-text-2">
                  ↓ {(step.conversionFromPrev * 100).toFixed(1)}% conversion
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
