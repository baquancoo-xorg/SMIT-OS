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
import { Skeleton } from '../../ui/v2';

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
    <div className="rounded-card border border-outline-variant/40 bg-surface/95 p-3 shadow-lg backdrop-blur-sm">
      <p className="mb-1 text-[length:var(--text-body-sm)] font-semibold capitalize text-on-surface">{item.source}</p>
      <div className="space-y-1 text-[length:var(--text-body-sm)] font-medium">
        <div className="flex items-center justify-between gap-4">
          <span className="text-on-surface-variant">Signups</span>
          <span className="tabular-nums text-on-surface">{item.signupCount.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-on-surface-variant">First Sync</span>
          <span className="tabular-nums text-on-surface">{item.firstSyncCount.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-on-surface-variant">Pre-PQL</span>
          <span className="tabular-nums text-success">{item.prePqlRate}%</span>
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
        <h3 className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">Channel Breakdown (CRM)</h3>
        <p className="mt-0.5 text-[length:var(--text-caption)] font-medium italic text-on-surface-variant">
          Top 10 utm_source từ CRM · signup count · all-time (UTM tracking sparse cho subscribers gần đây)
        </p>
      </div>

      {isLoading ? (
        <Skeleton variant="rect" className="h-[320px] rounded-card" />
      ) : error || !data || data.crm.length === 0 ? (
        <div className="flex h-[200px] items-center justify-center rounded-card border border-outline-variant/40 text-[length:var(--text-body-sm)] text-on-surface-variant">
          Chưa có CRM channel data
        </div>
      ) : (
        <div className="h-[320px] rounded-card border border-outline-variant/40 p-2">
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
