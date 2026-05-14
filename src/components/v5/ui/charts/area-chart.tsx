import { useMemo } from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTheme } from '../../../../contexts/theme-context';
import { chartColors, type ChartColorIndex } from './chart-palette';

export interface AreaChartSeries {
  dataKey: string;
  name: string;
  colorIndex?: ChartColorIndex;
  stackId?: string;
}

export interface AreaChartProps<T extends Record<string, unknown>> {
  data: T[];
  xKey: keyof T & string;
  series: AreaChartSeries[];
  height?: number;
  xAxisFormatter?: (value: unknown) => string;
  yAxisFormatter?: (value: unknown) => string;
}

export function AreaChart<T extends Record<string, unknown>>({
  data,
  xKey,
  series,
  height = 300,
  xAxisFormatter,
  yAxisFormatter,
}: AreaChartProps<T>) {
  const { resolvedTheme } = useTheme();
  const theme = chartColors.getThemeColors(resolvedTheme);

  const areas = useMemo(
    () =>
      series.map((s, i) => ({
        ...s,
        color: chartColors.series[s.colorIndex ?? (i % 8) as ChartColorIndex],
      })),
    [series],
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          {areas.map((area) => (
            <linearGradient key={`gradient-${area.dataKey}`} id={`gradient-${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={area.color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={area.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={xKey as any}
          stroke={theme.axis}
          tick={{ fill: theme.text, fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: theme.grid }}
          tickFormatter={xAxisFormatter}
        />
        <YAxis
          stroke={theme.axis}
          tick={{ fill: theme.text, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={yAxisFormatter}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: theme.tooltip.bg,
            border: `1px solid ${theme.tooltip.border}`,
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: theme.tooltip.text, fontWeight: 600 }}
        />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        {areas.map((area) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            name={area.name}
            stroke={area.color}
            strokeWidth={2}
            fill={`url(#gradient-${area.dataKey})`}
            stackId={area.stackId}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
