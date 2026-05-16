// TTV Histogram — bucket distribution + p50/p90 captions
// 3 step transition: Created→FirstSync · FirstSync→Feature · Feature→PQL

import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useProductTtv } from '../../../../hooks/use-product-dashboard';
import type { DateRange } from '../../../../types/dashboard-product';
import DashboardPanel from '../ui/dashboard-panel';
import { Skeleton } from '../../../ui';

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
    <div className="rounded-card border border-outline-variant/40 bg-surface/95 p-3 shadow-lg backdrop-blur-sm">
      <p className="mb-1 text-[length:var(--text-body-sm)] font-semibold text-on-surface">{item.label}</p>
      <p className="text-[length:var(--text-body-sm)] font-medium tabular-nums text-on-surface-variant">{item.count.toLocaleString()} business</p>
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
          <h3 className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">Time-to-Value Distribution</h3>
          <p className="mt-0.5 text-[length:var(--text-caption)] font-medium italic text-on-surface-variant">
            {ttvStep && ttvStep.sampleSize > 0
              ? `n = ${ttvStep.sampleSize} · avg ${ttvStep.avgDays.toFixed(1)}d · p50 ${ttvStep.p50.toFixed(1)}d · p90 ${ttvStep.p90.toFixed(1)}d`
              : 'Phân bổ thời gian giữa các bước'}
          </p>
        </div>
        <select
          value={step}
          onChange={(e) => setStep(e.target.value as StepKey)}
          className="rounded-chip border border-outline-variant/40 bg-surface px-3 py-1 text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant hover:bg-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/35"
        >
          {STEP_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <Skeleton variant="rect" className="h-[280px] rounded-card" />
      ) : error || !ttvStep || ttvStep.sampleSize === 0 ? (
        <div className="flex h-[200px] items-center justify-center rounded-card border border-outline-variant/40 text-[length:var(--text-body-sm)] text-on-surface-variant">
          Không có sample cho {STEP_OPTIONS[stepIndex]?.label ?? 'step này'}
        </div>
      ) : (
        <div className="h-[280px] rounded-card border border-outline-variant/40 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ttvStep.buckets} margin={{ top: 20, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--md-sys-color-outline-variant, var(--sys-color-border))" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'var(--sys-color-text-2)', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--sys-color-text-2)', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<HistogramTooltip />} cursor={{ fill: 'var(--md-sys-color-surface-container-low, var(--sys-color-surface-3))' }} />
              <Bar dataKey="count" fill="var(--color-info)" radius={[6, 6, 0, 0]}>
                <LabelList dataKey="count" position="top" style={{ fontSize: 11, fontWeight: 700, fill: 'var(--sys-color-text-2)' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardPanel>
  );
}
