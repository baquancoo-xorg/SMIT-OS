import { memo } from 'react';

export interface RadarAxis {
  key: string;
  label: string;
  score: number;
  maxScore?: number;
}

export interface RadarChartProps {
  axes: RadarAxis[];
  size?: number;
  showLabels?: boolean;
  fillColor?: string;
  strokeColor?: string;
  rings?: number;
  className?: string;
  label?: string;
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleRad: number,
): [number, number] {
  return [cx + r * Math.cos(angleRad), cy + r * Math.sin(angleRad)];
}

function RadarChartImpl({
  axes,
  size = 260,
  showLabels = true,
  fillColor,
  strokeColor,
  rings = 4,
  className,
  label = 'Radar skill chart',
}: RadarChartProps) {
  const n = axes.length;
  if (n < 3) return null;

  const cx = size / 2;
  const cy = size / 2;
  const labelPad = 28;
  const maxR = cx - labelPad;
  const angleStep = (2 * Math.PI) / n;
  const angles = axes.map((_, i) => -Math.PI / 2 + i * angleStep);

  const point = (i: number, frac: number): [number, number] =>
    polarToCartesian(cx, cy, maxR * frac, angles[i]);

  const gridPolygons = Array.from({ length: rings }, (_, ri) => {
    const frac = (ri + 1) / rings;
    const pts = angles.map((_, i) => point(i, frac).join(',')).join(' ');
    return pts;
  });

  const dataPoints = axes.map((axis, i) => {
    const max = axis.maxScore ?? 5;
    const frac = Math.min(Math.max(axis.score / max, 0), 1);
    return point(i, frac);
  });
  const dataPolygon = dataPoints.map(p => p.join(',')).join(' ');

  const labelRadius = maxR + 14;
  const labelPositions = angles.map(a => polarToCartesian(cx, cy, labelRadius, a));

  const resolvedStroke = strokeColor ?? 'var(--brand-500)';
  const resolvedFill = fillColor ?? 'color-mix(in oklab, var(--brand-500) 22%, transparent)';
  const summary = axes
    .map((axis) => `${axis.label}: ${axis.score}/${axis.maxScore ?? 5}`)
    .join(', ');

  return (
    <figure className={className}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        aria-label={`${label}: ${summary}`}
        role="img"
      >
      {gridPolygons.map((pts, ri) => (
        <polygon
          key={`ring-${ri}`}
          points={pts}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={0.75}
          opacity={0.6}
        />
      ))}
      {angles.map((_, i) => {
        const [x, y] = point(i, 1);
        return (
          <line
            key={`spoke-${i}`}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="var(--color-border)"
            strokeWidth={0.75}
            opacity={0.5}
          />
        );
      })}
      <polygon
        points={dataPolygon}
        fill={resolvedFill}
        stroke={resolvedStroke}
        strokeWidth={1.75}
        strokeLinejoin="round"
      />
      {dataPoints.map(([x, y], i) => (
        <circle
          key={`dot-${i}`}
          cx={x}
          cy={y}
          r={3}
          fill={resolvedStroke}
          stroke="var(--color-surface)"
          strokeWidth={1.5}
        />
      ))}
      {showLabels &&
        labelPositions.map(([lx, ly], i) => {
          const axis = axes[i];
          const textAnchor =
            Math.abs(lx - cx) < 4 ? 'middle' : lx < cx ? 'end' : 'start';
          const max = axis.maxScore ?? 5;
          return (
            <g key={`label-${i}`}>
              <text
                x={lx}
                y={ly - 4}
                textAnchor={textAnchor}
                dominantBaseline="auto"
                fontSize={9}
                fontWeight={700}
                letterSpacing="0.06em"
                fill="var(--color-text-muted)"
                style={{ textTransform: 'uppercase' }}
              >
                {axis.label}
              </text>
              <text
                x={lx}
                y={ly + 7}
                textAnchor={textAnchor}
                dominantBaseline="auto"
                fontSize={9}
                fontWeight={600}
                fill="var(--color-text-1)"
              >
                {axis.score}/{max}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="sr-only">{label}: {summary}</figcaption>
      <table className="sr-only">
        <caption>{label} data</caption>
        <thead>
          <tr>
            <th scope="col">Skill</th>
            <th scope="col">Score</th>
            <th scope="col">Max score</th>
          </tr>
        </thead>
        <tbody>
          {axes.map((axis) => (
            <tr key={axis.key}>
              <td>{axis.label}</td>
              <td>{axis.score}</td>
              <td>{axis.maxScore ?? 5}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export const RadarChart = memo(RadarChartImpl);
