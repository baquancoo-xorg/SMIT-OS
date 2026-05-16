/**
 * Big Five summary card — horizontal bars per OCEAN dimension.
 */

import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Cell } from 'recharts';
import type { PersonalityResult, BigFiveResults, BigFiveSummary, BigFiveDimension } from '../../../../../lib/personnel/personnel-types';
import { chartColors } from '../../../../ui/charts/chart-palette';
import { Card } from '../../../../ui';

interface Props {
  result: PersonalityResult | null;
  onStart?: () => void;
}

const DIM_LABEL: Record<BigFiveDimension, string> = {
  O: 'Openness',
  C: 'Conscientiousness',
  E: 'Extraversion',
  A: 'Agreeableness',
  N: 'Neuroticism',
};

const DIM_COLOR: Record<BigFiveDimension, string> = {
  O: chartColors.series[0],
  C: chartColors.series[2],
  E: chartColors.series[3],
  A: chartColors.series[4],
  N: chartColors.series[5],
};

export function BigFiveCard({ result, onStart }: Props) {
  return (
    <Card padding="md" className="flex h-full flex-col">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Big Five</p>
      <h3 className="mt-1 font-headline text-lg font-black text-text-1">Tính cách OCEAN</h3>

      {!result ? (
        <BigFiveEmpty onStart={onStart} />
      ) : (
        <BigFiveBody results={result.results as BigFiveResults} summary={result.summary as BigFiveSummary} />
      )}
    </Card>
  );
}

function BigFiveEmpty({ onStart }: { onStart?: () => void }) {
  return (
    <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border bg-surface-2 p-6 text-center">
      <p className="text-sm text-text-2">Chưa làm bài Big Five năm nay.</p>
      <button
        type="button"
        onClick={onStart}
        className="rounded-pill border border-accent/40 bg-surface px-4 py-2 text-xs font-semibold text-accent-text hover:bg-surface-2"
      >
        Bắt đầu test Big Five
      </button>
    </div>
  );
}

function BigFiveBody({ results, summary }: { results: BigFiveResults; summary: BigFiveSummary }) {
  const data = (Object.entries(results) as Array<[BigFiveDimension, number]>).map(([k, v]) => ({
    name: k,
    label: DIM_LABEL[k],
    value: v,
    color: DIM_COLOR[k],
  }));

  return (
    <div className="mt-3 flex flex-1 flex-col gap-3">
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={20} tick={{ fontSize: 11, fill: 'currentColor' }} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-1 text-xs">
        <p className="text-text-1"><strong>Mạnh nhất:</strong> {summary.highName}</p>
        <p className="text-text-2">{summary.highDescription}</p>
      </div>
      <div className="space-y-1 border-t border-border pt-2 text-xs">
        <p className="text-text-1"><strong>Yếu nhất:</strong> {summary.lowName}</p>
        <p className="text-text-2">{summary.lowDescription}</p>
      </div>
    </div>
  );
}
