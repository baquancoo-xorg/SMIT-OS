import { useMemo } from 'react';
import { useTheme } from '../../../../contexts/theme-context';
import { chartColors } from './chart-palette';

export interface HeatmapCell {
  x: string;
  y: string;
  value: number;
}

export interface HeatmapChartProps {
  data: HeatmapCell[];
  xLabels: string[];
  yLabels: string[];
  minValue?: number;
  maxValue?: number;
  valueFormatter?: (value: number) => string;
  colorScale?: 'brand' | 'success' | 'warning' | 'error';
}

// ui-canon-ok: heatmap color scales are intentional gradient palettes for data visualization
const colorScales = {
  brand: ['#1a1714', '#3d2a1a', '#5e3d1f', '#804f24', '#a26129', '#c4732e', '#e68533', '#ff9738'],
  success: ['#052e16', '#064e3b', '#065f46', '#047857', '#059669', '#10b981', '#34d399', '#6ee7b7'],
  warning: ['#451a03', '#78350f', '#92400e', '#b45309', '#d97706', '#f59e0b', '#fbbf24', '#fcd34d'],
  error: ['#450a0a', '#7f1d1d', '#991b1b', '#b91c1c', '#dc2626', '#ef4444', '#f87171', '#fca5a5'],
};

export function HeatmapChart({
  data,
  xLabels,
  yLabels,
  minValue: minProp,
  maxValue: maxProp,
  valueFormatter = (v) => String(v),
  colorScale = 'brand',
}: HeatmapChartProps) {
  const { resolvedTheme } = useTheme();
  const theme = chartColors.getThemeColors(resolvedTheme);
  const scale = colorScales[colorScale];

  const { min, max, cellMap } = useMemo(() => {
    const values = data.map((d) => d.value);
    const min = minProp ?? Math.min(...values);
    const max = maxProp ?? Math.max(...values);
    const cellMap = new Map(data.map((d) => [`${d.x}-${d.y}`, d.value]));
    return { min, max, cellMap };
  }, [data, minProp, maxProp]);

  const getColor = (value: number) => {
    const ratio = max === min ? 0.5 : (value - min) / (max - min);
    const index = Math.min(Math.floor(ratio * scale.length), scale.length - 1);
    return scale[index];
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs" role="grid" aria-label="Heatmap">
        <thead>
          <tr>
            <th className="p-1" />
            {xLabels.map((x) => (
              <th key={x} className="p-1 text-center font-semibold text-text-muted" scope="col">{x}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {yLabels.map((y) => (
            <tr key={y}>
              <th className="p-1 text-right font-semibold text-text-muted" scope="row">{y}</th>
              {xLabels.map((x) => {
                const value = cellMap.get(`${x}-${y}`) ?? 0;
                return (
                  <td
                    key={`${x}-${y}`}
                    className="p-0.5"
                    title={`${x}, ${y}: ${valueFormatter(value)}`}
                  >
                    <div
                      className="flex h-8 w-full items-center justify-center rounded text-[10px] font-bold"
                      style={{ backgroundColor: getColor(value), color: theme.tooltip.text }}
                    >
                      {valueFormatter(value)}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
