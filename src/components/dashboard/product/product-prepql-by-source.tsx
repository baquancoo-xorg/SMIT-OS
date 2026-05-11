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
import { useProductChannel } from '../../../hooks/use-product-dashboard';
import type { DateRange } from '../../../types/dashboard-product';
import DashboardPanel from '../ui/dashboard-panel';
import { Skeleton } from '../../ui';

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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="source"
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip content={<PrePqlBySourceTooltip />} cursor={{ fill: '#f1f5f9' }} />
              <ReferenceLine
                y={PLG_GATE_TARGET}
                stroke="#16a34a"
                strokeDasharray="4 4"
                label={{ value: `${PLG_GATE_TARGET}%`, position: 'right', fontSize: 10, fill: '#16a34a', fontWeight: 700 }}
              />
              <Bar dataKey="prePqlRate" fill="#16a34a" radius={[6, 6, 0, 0]}>
                <LabelList
                  dataKey="prePqlRate"
                  position="top"
                  formatter={(v: number) => `${v}%`}
                  style={{ fontSize: 11, fontWeight: 700, fill: '#475569' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardPanel>
  );
}
