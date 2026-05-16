import { memo } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { chartColors, type ChartColorIndex } from './chart-palette';

export interface SparklineChartProps<T extends Record<string, unknown>> {
  data: T[];
  dataKey: keyof T & string;
  height?: number;
  width?: number | `${number}%`;
  colorIndex?: ChartColorIndex;
  showDot?: boolean;
}

function SparklineChartImpl<T extends Record<string, unknown>>({
  data,
  dataKey,
  height = 32,
  width = '100%',
  colorIndex = 0,
  showDot = false,
}: SparklineChartProps<T>) {
  const color = chartColors.series[colorIndex];

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={1.5}
          dot={showDot ? { r: 2, fill: color } : false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export const SparklineChart = memo(SparklineChartImpl) as typeof SparklineChartImpl;
