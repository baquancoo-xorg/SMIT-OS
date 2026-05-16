/**
 * DISC summary card. Natural style only.
 */

import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Cell } from 'recharts';
import type { PersonalityResult, DiscResults, DiscSummary, DiscType } from '../../../../../lib/personnel/personnel-types';
import { chartColors } from '../../../../ui/charts/chart-palette';
import { Card } from '../../../../ui';

interface Props {
  result: PersonalityResult | null;
  onStart?: () => void;
}

// D/I/S/C → distinct color from chart palette
const TYPE_COLOR: Record<DiscType, string> = {
  D: chartColors.series[0],
  I: chartColors.series[3],
  S: chartColors.series[2],
  C: chartColors.series[1],
};

export function DiscCard({ result, onStart }: Props) {
  return (
    <Card padding="md" className="flex h-full flex-col">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">DISC</p>
      <h3 className="mt-1 font-headline text-lg font-black text-text-1">Phong cách hành vi</h3>

      {!result ? (
        <DiscEmpty onStart={onStart} />
      ) : (
        <DiscBody results={result.results as DiscResults} summary={result.summary as DiscSummary} />
      )}
    </Card>
  );
}

function DiscEmpty({ onStart }: { onStart?: () => void }) {
  return (
    <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border bg-surface-2 p-6 text-center">
      <p className="text-sm text-text-2">Chưa làm bài DISC năm nay.</p>
      <button
        type="button"
        onClick={onStart}
        className="rounded-pill border border-accent/40 bg-surface px-4 py-2 text-xs font-semibold text-accent-text hover:bg-surface-2"
      >
        Bắt đầu test DISC
      </button>
    </div>
  );
}

function DiscBody({ results, summary }: { results: DiscResults; summary: DiscSummary }) {
  const data = (Object.entries(results) as Array<[DiscType, number]>).map(([k, v]) => ({ type: k, value: v, color: TYPE_COLOR[k] }));
  return (
    <div className="mt-3 flex flex-1 flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <span
          className="inline-flex size-10 items-center justify-center rounded-card font-headline text-xl font-black text-white"
          style={{ backgroundColor: TYPE_COLOR[summary.primary] }}
        >
          {summary.primary}
        </span>
        <div>
          <p className="text-sm font-semibold text-text-1">{summary.primaryShortLabel}</p>
          <p className="text-xs text-text-2">{summary.primaryName}{summary.secondary ? ` · phụ ${summary.secondary}` : ''}</p>
        </div>
      </div>

      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="horizontal">
            <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'currentColor' }} />
            <YAxis domain={[0, 100]} hide />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((d) => (
                <Cell key={d.type} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs leading-relaxed text-text-2">{summary.primaryStyle}</p>
    </div>
  );
}
