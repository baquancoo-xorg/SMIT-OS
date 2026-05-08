// Channel Breakdown — horizontal bar, top 10 source từ CRM crm_subscribers_utm

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useProductChannel } from '../../../hooks/use-product-dashboard';
import type { DateRange } from '../../../types/dashboard-product';
import DashboardPanel from '../ui/dashboard-panel';

interface ProductChannelBreakdownProps {
  range: DateRange;
}

interface TooltipPayloadItem {
  value: number;
  payload: { source: string; signupCount: number; firstSyncCount: number; prePqlRate: number };
}

interface ChannelTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function ChannelTooltip({ active, payload }: ChannelTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-xl border border-black/5 bg-white/90 p-3 shadow-lg backdrop-blur-sm">
      <p className="mb-1 text-xs font-black text-slate-700 capitalize">{item.source}</p>
      <div className="space-y-1 text-xs font-semibold">
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500">Signups</span>
          <span className="text-slate-700 tabular-nums">{item.signupCount.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500">First Sync</span>
          <span className="text-slate-700 tabular-nums">{item.firstSyncCount.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500">Pre-PQL</span>
          <span className="text-emerald-600 tabular-nums">{item.prePqlRate}%</span>
        </div>
      </div>
    </div>
  );
}

export function ProductChannelBreakdown({ range }: ProductChannelBreakdownProps) {
  const { data, isLoading, error } = useProductChannel(range);

  return (
    <DashboardPanel className="p-4 md:p-5">
      <div className="mb-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Channel Breakdown (CRM)</h3>
        <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">
          Top 10 utm_source từ CRM · signup count · all-time (UTM tracking sparse cho subscribers gần đây)
        </p>
      </div>

      {isLoading ? (
        <div className="h-[320px] animate-pulse bg-slate-100 rounded-2xl" />
      ) : error || !data || data.crm.length === 0 ? (
        <div className="h-[200px] rounded-2xl border border-slate-100 flex items-center justify-center text-sm text-slate-500">
          Chưa có CRM channel data
        </div>
      ) : (
        <div className="h-[320px] rounded-2xl border border-slate-100 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.crm} layout="vertical" margin={{ top: 8, right: 32, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="source"
                tick={{ fontSize: 11, fill: '#475569', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip content={<ChannelTooltip />} cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="signupCount" fill="#0ea5e9" radius={[0, 6, 6, 0]}>
                <LabelList dataKey="signupCount" position="right" style={{ fontSize: 11, fontWeight: 700, fill: '#475569' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardPanel>
  );
}
