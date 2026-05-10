/**
 * Journey funnel — horizontal 3-stage layout (Pre · In · Post-product).
 * Each stage = vertical band with tinted background; steps shown as proportional bars.
 *
 * MVP scope: bars + conversion %. Sankey drill-down deferred (KISS per plan).
 */
import type { AcquisitionJourney, AcquisitionJourneyStage } from '../../../types';

interface Props {
  journey: AcquisitionJourney;
}

const STAGE_STYLE = {
  pre: { label: 'Pre-product', bg: 'bg-[#0866FF]/5', accent: 'bg-[#0866FF]', text: 'text-[#0866FF]', border: 'border-[#0866FF]/15' },
  in: { label: 'In-product', bg: 'bg-amber-500/5', accent: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-500/15' },
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
      className={`${style.bg} backdrop-blur-md border ${style.border} rounded-3xl shadow-sm p-4 xl:p-6 relative overflow-hidden`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 ${style.accent} opacity-10 rounded-full -mr-16 -mt-16`} />
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className={`w-2 h-2 rounded-full ${style.accent} animate-pulse`} />
        <p className={`text-[10px] font-black uppercase tracking-widest ${style.text}`}>{stage.label}</p>
      </div>
      <div className="space-y-3 relative z-10">
        {stage.steps.map((step, idx) => {
          const widthPct = (step.value / maxValue) * 100;
          return (
            <div key={step.name} className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-on-surface">{step.name}</span>
                <span className="text-2xl font-black font-headline">{fmtNumber(step.value)}</span>
              </div>
              <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                <div
                  className={`h-full ${style.accent} transition-all duration-700`}
                  style={{ width: `${Math.max(widthPct, 1)}%` }}
                />
              </div>
              {idx > 0 && step.conversionFromPrev != null && (
                <p className="text-[10px] font-bold text-slate-400">
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
