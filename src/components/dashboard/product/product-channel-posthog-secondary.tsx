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
import { Badge, Skeleton } from '../../v5/ui';

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
    <div className="rounded-xl border border-outline-variant/40 bg-surface-2/90 p-3 shadow-lg backdrop-blur-sm">
      <p className="mb-1 text-xs font-black text-on-surface capitalize">{item.domain}</p>
      <p className="text-xs font-semibold text-on-surface-variant tabular-nums">{item.count.toLocaleString()} signup events</p>
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
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--md-sys-color-outline-variant, var(--sys-color-border))" />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: 'var(--sys-color-text-2)', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="domain"
                tick={{ fontSize: 11, fill: 'var(--sys-color-text-2)', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip content={<PostHogTooltip />} cursor={{ fill: 'var(--md-sys-color-surface-container-low, var(--sys-color-surface-3))' }} />
              <Bar dataKey="count" fill="var(--color-secondary)" radius={[0, 6, 6, 0]}>
                <LabelList dataKey="count" position="right" style={{ fontSize: 11, fontWeight: 700, fill: 'var(--sys-color-text-2)' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardPanel>
  );
}
