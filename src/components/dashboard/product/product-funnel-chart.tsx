import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { useProductFunnel } from '../../../hooks/use-product-dashboard';
import type { DateRange } from '../../../types/dashboard-product';
import DashboardPanel from '../ui/dashboard-panel';
import DashboardSectionTitle from '../ui/dashboard-section-title';
import DashboardEmptyState from '../ui/dashboard-empty-state';
import { Skeleton } from '../../v5/ui';

interface ProductFunnelChartProps {
  range: DateRange;
}

const COLORS = [
  'var(--sys-color-accent)',
  'var(--sys-color-accent-text)',
  'var(--color-info)',
  'var(--color-info-container)',
];

export function ProductFunnelChart({ range }: ProductFunnelChartProps) {
  const { data, isLoading, error } = useProductFunnel(range);

  if (isLoading) {
    return (
      <DashboardPanel className="p-6">
        <DashboardSectionTitle>Conversion Funnel</DashboardSectionTitle>
        <Skeleton variant="rect" className="mt-4 h-64 rounded-card" />
      </DashboardPanel>
    );
  }

  if (error || !data) {
    return (
      <DashboardPanel className="p-6">
        <DashboardSectionTitle>Conversion Funnel</DashboardSectionTitle>
        <DashboardEmptyState description="Không thể tải funnel data" />
      </DashboardPanel>
    );
  }

  const steps = data.steps;
  if (!steps.length) {
    return (
      <DashboardPanel className="p-6">
        <DashboardSectionTitle>Conversion Funnel</DashboardSectionTitle>
        <DashboardEmptyState description="Chưa có dữ liệu funnel" />
      </DashboardPanel>
    );
  }

  const chartData = steps.map((step, idx) => ({
    name: step.displayName,
    count: step.count,
    dropOff: step.dropOffPct,
    fill: COLORS[idx % COLORS.length],
  }));

  return (
    <DashboardPanel className="p-6">
      <DashboardSectionTitle>Conversion Funnel</DashboardSectionTitle>
      <div className="h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 40 }}>
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: number) => [value.toLocaleString(), 'Count']}
              labelFormatter={(label: string) => {
                const step = chartData.find((d) => d.name === label);
                return step ? `${label} (Drop-off: ${step.dropOff}%)` : label;
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
              <LabelList dataKey="count" position="right" formatter={(v: number) => v.toLocaleString()} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardPanel>
  );
}
