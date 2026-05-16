import { memo, useMemo } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTheme } from '@/contexts/theme-context';
import { chartColors, type ChartColorIndex } from './chart-palette';

export interface BarChartSeries {
  dataKey: string;
  name: string;
  colorIndex?: ChartColorIndex;
  stackId?: string;
}

export interface BarChartProps<T extends Record<string, unknown>> {
  data: T[];
  xKey: keyof T & string;
  series: BarChartSeries[];
  height?: number;
  layout?: 'horizontal' | 'vertical';
  xAxisFormatter?: (value: unknown) => string;
  yAxisFormatter?: (value: unknown) => string;
}

function BarChartImpl<T extends Record<string, unknown>>({
  data,
  xKey,
  series,
  height = 300,
  layout = 'horizontal',
  xAxisFormatter,
  yAxisFormatter,
}: BarChartProps<T>) {
  const { resolvedTheme } = useTheme();
  const theme = chartColors.getThemeColors(resolvedTheme);

  const bars = useMemo(
    () =>
      series.map((s, i) => ({
        ...s,
        color: chartColors.series[s.colorIndex ?? (i % 8) as ChartColorIndex],
      })),
    [series],
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} layout={layout} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={layout === 'vertical'} horizontal={layout === 'horizontal'} />
        <XAxis
          dataKey={layout === 'horizontal' ? (xKey as any) : undefined}
          type={layout === 'horizontal' ? 'category' : 'number'}
          stroke={theme.axis}
          tick={{ fill: theme.text, fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: theme.grid }}
          tickFormatter={layout === 'horizontal' ? xAxisFormatter : yAxisFormatter}
        />
        <YAxis
          dataKey={layout === 'vertical' ? (xKey as any) : undefined}
          type={layout === 'vertical' ? 'category' : 'number'}
          stroke={theme.axis}
          tick={{ fill: theme.text, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={layout === 'vertical' ? xAxisFormatter : yAxisFormatter}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: theme.tooltip.bg,
            border: `1px solid ${theme.tooltip.border}`,
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: theme.tooltip.text, fontWeight: 600 }}
          cursor={{ fill: theme.grid }}
        />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        {bars.map((bar) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            name={bar.name}
            fill={bar.color}
            stackId={bar.stackId}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

export const BarChart = memo(BarChartImpl) as typeof BarChartImpl;
