import { PieChart } from './pie-chart';
import type { PieChartDataItem } from './pie-chart';

export interface DonutChartProps {
  data: PieChartDataItem[];
  height?: number;
  thickness?: number;
  showLabels?: boolean;
  valueFormatter?: (value: number) => string;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({
  data,
  height = 300,
  thickness = 20,
  showLabels = false,
  valueFormatter,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const outerRadius = 80;
  const innerRadius = outerRadius - thickness;

  return (
    <div className="relative">
      <PieChart
        data={data}
        height={height}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        showLabels={showLabels}
        valueFormatter={valueFormatter}
      />
      {(centerLabel || centerValue) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && <span className="font-headline text-2xl font-bold text-text-1">{centerValue}</span>}
          {centerLabel && <span className="text-xs text-text-muted">{centerLabel}</span>}
        </div>
      )}
    </div>
  );
}
