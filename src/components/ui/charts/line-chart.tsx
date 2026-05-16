import { useMemo } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTheme } from '../../../contexts/theme-context';
import { chartColors, linePatterns, type ChartColorIndex } from './chart-palette';

export interface LineChartSeries {
  dataKey: string;
  name: string;
  colorIndex?: ChartColorIndex;
  dashed?: boolean;
}

export interface LineChartProps<T extends Record<string, unknown>> {
  data: T[];
  xKey: keyof T & string;
  series: LineChartSeries[];
  height?: number;
  xAxisFormatter?: (value: unknown) => string;
  yAxisFormatter?: (value: unknown) => string;
  tooltipFormatter?: (value: unknown, name: string) => [string, string];
}

export function LineChart<T extends Record<string, unknown>>({
  data,
  xKey,
  series,
  height = 300,
  xAxisFormatter,
  yAxisFormatter,
  tooltipFormatter,
}: LineChartProps<T>) {
  const { resolvedTheme } = useTheme();
  const theme = chartColors.getThemeColors(resolvedTheme);

  const lines = useMemo(
    () =>
      series.map((s, i) => ({
        ...s,
        color: chartColors.series[s.colorIndex ?? (i % 8) as ChartColorIndex],
        dashArray: s.dashed ? linePatterns.dashed : linePatterns.solid,
      })),
    [series],
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
          itemStyle={{ color: theme.tooltip.text }}
          formatter={tooltipFormatter}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          iconType="line"
        />
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name}
            stroke={line.color}
            strokeWidth={2}
            strokeDasharray={line.dashArray}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
