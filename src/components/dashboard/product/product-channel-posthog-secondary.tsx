// PostHog Referring Domain — secondary cross-validation widget
// Filtered noise ($direct, agency.smit.vn). For cross-check với CRM utm_source.

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
import { Badge, Skeleton } from '../../ui/v2';

interface ProductChannelPostHogSecondaryProps {
  range: DateRange;
}

interface TooltipPayloadItem {
  payload: { domain: string; count: number };
}

interface PostHogTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function PostHogTooltip({ active, payload }: PostHogTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-xl border border-black/5 bg-white/90 p-3 shadow-lg backdrop-blur-sm">
      <p className="mb-1 text-xs font-black text-slate-700 capitalize">{item.domain}</p>
      <p className="text-xs font-semibold text-slate-600 tabular-nums">{item.count.toLocaleString()} signup events</p>
    </div>
  );
}

export function ProductChannelPostHogSecondary({ range }: ProductChannelPostHogSecondaryProps) {
  const { data, isLoading, error } = useProductChannel(range);

  return (
    <DashboardPanel className="p-4 md:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">PostHog Referring Domain</h3>
          <p className="mt-0.5 text-[length:var(--text-caption)] font-medium italic text-on-surface-variant">
            Cross-validation từ event tracking · loại $direct + internal noise
          </p>
        </div>
        <Badge variant="warning">Secondary</Badge>
      </div>

      {isLoading ? (
        <Skeleton variant="rect" className="h-[260px] rounded-card" />
      ) : error || !data || data.posthog.length === 0 ? (
        <div className="flex h-[180px] items-center justify-center rounded-card border border-outline-variant/40 text-[length:var(--text-body-sm)] text-on-surface-variant">
          Không có PostHog referrer data sau khi loại noise
        </div>
      ) : (
        <div className="h-[260px] rounded-card border border-outline-variant/40 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.posthog} layout="vertical" margin={{ top: 8, right: 32, left: 8, bottom: 8 }}>
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
                dataKey="domain"
                tick={{ fontSize: 11, fill: '#475569', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip content={<PostHogTooltip />} cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="count" fill="#a855f7" radius={[0, 6, 6, 0]}>
                <LabelList dataKey="count" position="right" style={{ fontSize: 11, fontWeight: 700, fill: '#475569' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardPanel>
  );
}
