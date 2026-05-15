// Pre-PQL by Source — bar chart so sánh % FirstSync per source
// PLG Gate target line 45%

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useProductChannel } from '@/hooks/use-product-dashboard';
import type { DateRange } from '@/types/dashboard-product';
import DashboardPanel from '@/components/workspace/dashboard/ui/dashboard-panel';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductPrePqlBySourceProps {
  range: DateRange;
}

const PLG_GATE_TARGET = 45;

interface TooltipPayloadItem {
  payload: { source: string; signupCount: number; firstSyncCount: number; prePqlRate: number };
}

interface PrePqlBySourceTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function PrePqlBySourceTooltip({ active, payload }: PrePqlBySourceTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-card border border-outline-variant/40 bg-surface/95 p-3 shadow-lg backdrop-blur-sm">
      <p className="mb-1 text-[length:var(--text-body-sm)] font-semibold capitalize text-on-surface">{item.source}</p>
      <p className="text-[length:var(--text-body-sm)] font-medium tabular-nums text-on-surface-variant">
        {item.firstSyncCount}/{item.signupCount} = {item.prePqlRate}%
      </p>
    </div>
  );
}

export function ProductPrePqlBySource({ range }: ProductPrePqlBySourceProps) {
  const { data, isLoading, error } = useProductChannel(range);

  return (
    <DashboardPanel className="p-4 md:p-5">
      <div className="mb-3">
        <h3 className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">Pre-PQL Rate by Source</h3>
        <p className="mt-0.5 text-[length:var(--text-caption)] font-medium italic text-on-surface-variant">
          % FirstSync per source · PLG Gate target ≥{PLG_GATE_TARGET}%
        </p>
      </div>

      {isLoading ? (
        <Skeleton variant="rect" className="h-[280px] rounded-card" />
      ) : error || !data || data.crm.length === 0 ? (
        <div className="flex h-[200px] items-center justify-center rounded-card border border-outline-variant/40 text-[length:var(--text-body-sm)] text-on-surface-variant">
          Chưa có Pre-PQL by source data
        </div>
      ) : (
        <div className="h-[280px] rounded-card border border-outline-variant/40 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.crm} margin={{ top: 24, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--md-sys-color-outline-variant, var(--sys-color-border))" />
              <XAxis
                dataKey="source"
                tick={{ fontSize: 11, fill: 'var(--sys-color-text-2)', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--sys-color-text-2)', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip content={<PrePqlBySourceTooltip />} cursor={{ fill: 'var(--md-sys-color-surface-container-low, var(--sys-color-surface-3))' }} />
              <ReferenceLine
                y={PLG_GATE_TARGET}
                stroke="var(--color-success)"
                strokeDasharray="4 4"
                label={{ value: `${PLG_GATE_TARGET}%`, position: 'right', fontSize: 10, fill: 'var(--color-success)', fontWeight: 700 }}
              />
              <Bar dataKey="prePqlRate" fill="var(--color-success)" radius={[6, 6, 0, 0]}>
                <LabelList
                  dataKey="prePqlRate"
                  position="top"
                  formatter={(v: number) => `${v}%`}
                  style={{ fontSize: 11, fontWeight: 700, fill: 'var(--sys-color-text-2)' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardPanel>
  );
}
