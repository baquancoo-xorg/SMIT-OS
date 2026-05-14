import { useMemo } from 'react';
import { useTheme } from '../../../../contexts/theme-context';
import { chartColors } from './chart-palette';

export interface FunnelStage {
  name: string;
  value: number;
  color?: string;
}

export interface FunnelChartProps {
  data: FunnelStage[];
  height?: number;
  showValues?: boolean;
  showPercentages?: boolean;
  valueFormatter?: (value: number) => string;
}

export function FunnelChart({
  data,
  height = 300,
  showValues = true,
  showPercentages = true,
  valueFormatter = (v) => v.toLocaleString(),
}: FunnelChartProps) {
  const { resolvedTheme } = useTheme();
  const theme = chartColors.getThemeColors(resolvedTheme);

  const stages = useMemo(() => {
    const maxValue = Math.max(...data.map((d) => d.value));
    return data.map((stage, i) => ({
      ...stage,
      color: stage.color ?? chartColors.series[i % 8],
      widthPercent: (stage.value / maxValue) * 100,
      conversionRate: i > 0 ? (stage.value / data[i - 1].value) * 100 : 100,
    }));
  }, [data]);

  const stageHeight = height / stages.length;

  return (
    <div className="flex flex-col gap-1" style={{ height }} role="img" aria-label="Funnel chart">
      {stages.map((stage, i) => (
        <div key={stage.name} className="flex items-center gap-3" style={{ height: stageHeight }}>
          <div className="w-24 shrink-0 text-right">
            <p className="text-xs font-semibold text-text-1">{stage.name}</p>
            {showPercentages && i > 0 && (
              <p className="text-[10px] text-text-muted">{stage.conversionRate.toFixed(1)}%</p>
            )}
          </div>
          <div className="relative flex-1">
            <div
              className="h-full rounded transition-all"
              style={{
                width: `${stage.widthPercent}%`,
                backgroundColor: stage.color,
                minWidth: 40,
              }}
            />
            {showValues && (
              <span
                className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold"
                style={{ color: theme.tooltip.text }}
              >
                {valueFormatter(stage.value)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
