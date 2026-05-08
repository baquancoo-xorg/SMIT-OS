// TTV Histogram — bucket distribution + p50/p90 captions
// 3 step transition: Created→FirstSync · FirstSync→Feature · Feature→PQL

import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useProductTtv } from '../../../hooks/use-product-dashboard';
import type { DateRange } from '../../../types/dashboard-product';
import DashboardPanel from '../ui/dashboard-panel';

interface ProductTtvHistogramProps {
  range: DateRange;
}

type StepKey = 'created→first_sync' | 'first_sync→feature_activated' | 'feature_activated→pql';

const STEP_OPTIONS: Array<{ value: StepKey; label: string }> = [
  { value: 'created→first_sync', label: 'Created → First Sync' },
  { value: 'first_sync→feature_activated', label: 'First Sync → Feature' },
  { value: 'feature_activated→pql', label: 'Feature → PQL' },
];

interface TooltipPayloadItem {
  value: number;
  payload: { label: string; count: number };
}

interface HistogramTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function HistogramTooltip({ active, payload }: HistogramTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-xl border border-black/5 bg-white/90 p-3 shadow-lg backdrop-blur-sm">
      <p className="mb-1 text-xs font-black text-slate-700">{item.label}</p>
      <p className="text-xs font-semibold text-slate-600 tabular-nums">{item.count.toLocaleString()} business</p>
    </div>
  );
}

export function ProductTtvHistogram({ range }: ProductTtvHistogramProps) {
  const [step, setStep] = useState<StepKey>('created→first_sync');
  const { data, isLoading, error } = useProductTtv(range);

  const stepIndex = STEP_OPTIONS.findIndex((o) => o.value === step);
  const ttvStep = data?.steps[stepIndex];

  return (
    <DashboardPanel className="p-4 md:p-5">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Time-to-Value Distribution</h3>
          <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">
            {ttvStep && ttvStep.sampleSize > 0
              ? `n = ${ttvStep.sampleSize} · avg ${ttvStep.avgDays.toFixed(1)}d · p50 ${ttvStep.p50.toFixed(1)}d · p90 ${ttvStep.p90.toFixed(1)}d`
              : 'Phân bổ thời gian giữa các bước'}
          </p>
        </div>
        <select
          value={step}
          onChange={(e) => setStep(e.target.value as StepKey)}
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/35"
        >
          {STEP_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="h-[280px] animate-pulse bg-slate-100 rounded-2xl" />
      ) : error || !ttvStep || ttvStep.sampleSize === 0 ? (
        <div className="h-[200px] rounded-2xl border border-slate-100 flex items-center justify-center text-sm text-slate-500">
          Không có sample cho {STEP_OPTIONS[stepIndex]?.label ?? 'step này'}
        </div>
      ) : (
        <div className="h-[280px] rounded-2xl border border-slate-100 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ttvStep.buckets} margin={{ top: 20, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<HistogramTooltip />} cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]}>
                <LabelList dataKey="count" position="top" style={{ fontSize: 11, fontWeight: 700, fill: '#475569' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardPanel>
  );
}
