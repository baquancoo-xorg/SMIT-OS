/**
 * Journey funnel — horizontal 3-stage layout (Pre · In · Post-product).
 * Each stage = vertical band with tinted background; steps shown as proportional bars.
 *
 * MVP scope: bars + conversion %. Sankey drill-down deferred (KISS per plan).
 */
import type { AcquisitionJourney, AcquisitionJourneyStage } from '@/types';

interface Props {
  journey: AcquisitionJourney;
}

const STAGE_STYLE = {
  pre: { label: 'Pre-product', bg: 'bg-info-container/30', accent: 'bg-info', text: 'text-info', border: 'border-info-container/40' },
  in: { label: 'In-product', bg: 'bg-warning/5', accent: 'bg-warning', text: 'text-warning', border: 'border-warning/15' },
  post: { label: 'Post-product', bg: 'bg-tertiary/5', accent: 'bg-tertiary', text: 'text-tertiary', border: 'border-tertiary/15' },
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
    ...stages.flatMap((s) => s.data.steps.map((step) => step.value))
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {stages.map(({ key, data }) => (
        <StageBand key={key} style={STAGE_STYLE[key]} stage={data} maxValue={maxValue} />
      ))}
    </div>
  );
}

interface StageStyle {
  label: string;
  bg: string;
  accent: string;
  text: string;
  border: string;
}

function StageBand({
  style,
  stage,
  maxValue,
}: {
  style: StageStyle;
  stage: AcquisitionJourneyStage;
  maxValue: number;
}) {
  return (
    <div
      className={`${style.bg} relative overflow-hidden rounded-card border ${style.border} p-4 shadow-sm backdrop-blur-md xl:p-6`}
    >
      <div className={`pointer-events-none absolute -top-16 -right-16 size-32 rounded-full opacity-10 ${style.accent}`} aria-hidden="true" />
      <div className="relative mb-4 flex items-center gap-2">
        <div className={`size-2 animate-pulse rounded-chip ${style.accent}`} aria-hidden="true" />
        <p className={`text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] ${style.text}`}>{stage.label}</p>
      </div>
      <div className="relative space-y-3">
        {stage.steps.map((step, idx) => {
          const widthPct = (step.value / maxValue) * 100;
          return (
            <div key={step.name} className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-[length:var(--text-body-sm)] font-semibold text-on-surface">{step.name}</span>
                <span className="font-headline text-[length:var(--text-h5)] font-bold">{fmtNumber(step.value)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-chip bg-surface-container-high/60">
                <div
                  className={`h-full ${style.accent} transition-all duration-700`}
                  style={{ width: `${Math.max(widthPct, 1)}%` }}
                />
              </div>
              {idx > 0 && step.conversionFromPrev != null && (
                <p className="text-[length:var(--text-caption)] font-semibold text-on-surface-variant">
                  ↓ {(step.conversionFromPrev * 100).toFixed(1)}% conversion
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
