import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '../../../contexts/theme-context';
import { chartColors } from './chart-palette';

export interface PieChartDataItem {
  name: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  data: PieChartDataItem[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLabels?: boolean;
  valueFormatter?: (value: number) => string;
}

export function PieChart({
  data,
  height = 300,
  innerRadius = 0,
  outerRadius = 80,
  showLabels = false,
  valueFormatter = (v) => String(v),
}: PieChartProps) {
  const { resolvedTheme } = useTheme();
  const theme = chartColors.getThemeColors(resolvedTheme);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          dataKey="value"
          nameKey="name"
          label={showLabels ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` : false}
          labelLine={showLabels}
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={entry.color ?? chartColors.series[index % 8]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: theme.tooltip.bg,
            border: `1px solid ${theme.tooltip.border}`,
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value: number) => [valueFormatter(value), '']}
        />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
