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
    <div className="rounded-xl border border-black/5 bg-white/90 p-3 shadow-lg backdrop-blur-sm">
      <p className="mb-1 text-xs font-black text-slate-700 capitalize">{item.source}</p>
      <p className="text-xs font-semibold text-slate-600 tabular-nums">
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
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Pre-PQL Rate by Source</h3>
        <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">
          % FirstSync per source · PLG Gate target ≥{PLG_GATE_TARGET}%
        </p>
      </div>

      {isLoading ? (
        <div className="h-[280px] animate-pulse bg-slate-100 rounded-2xl" />
      ) : error || !data || data.crm.length === 0 ? (
        <div className="h-[200px] rounded-2xl border border-slate-100 flex items-center justify-center text-sm text-slate-500">
          Chưa có Pre-PQL by source data
        </div>
      ) : (
        <div className="h-[280px] rounded-2xl border border-slate-100 p-2">
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
