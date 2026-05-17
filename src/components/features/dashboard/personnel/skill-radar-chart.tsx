/**
 * Skill radar overlay — 3-quarter trend across skills in a single group.
 * Q-2 brand300 30% / Q-1 brand400 50% / current brand500 70%.
 */

import { memo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { brandTokens } from '../../../../design/tokens';
import type { SkillTrendPoint } from '../../../../hooks/use-personnel-dashboard';

interface Props {
  trends: SkillTrendPoint[];
  quarters: string[]; // length 3
  height?: number;
}

function buildRows(trends: SkillTrendPoint[], quarters: string[]) {
  return trends.map((t) => ({
    skill: t.label,
    [quarters[0]]: t.scores[0] ?? 0,
    [quarters[1]]: t.scores[1] ?? 0,
    [quarters[2]]: t.scores[2] ?? 0,
  }));
}

function SkillRadarChartImpl({ trends, quarters, height = 320 }: Props) {
  if (trends.length === 0) {
    return (
      <div className="grid place-items-center rounded-card border border-dashed border-border bg-surface-2/40 text-xs text-text-muted" style={{ height }}>
        Chưa có dữ liệu kỹ năng cho nhóm này.
      </div>
    );
  }
  const data = buildRows(trends, quarters);
  const seriesConfig = [
    { q: quarters[0], color: brandTokens.brand300, opacity: 0.18 },
    { q: quarters[1], color: brandTokens.brand400, opacity: 0.28 },
    { q: quarters[2], color: brandTokens.brand500, opacity: 0.42 },
  ];

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="rgba(255,255,255,0.10)" />
          <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: 'currentColor' }} />
          <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 9, fill: 'currentColor' }} axisLine={false} tickCount={6} />
          {seriesConfig.map((s) => (
            <Radar key={s.q} name={s.q} dataKey={s.q} stroke={s.color} fill={s.color} fillOpacity={s.opacity} strokeWidth={1.5} />
          ))}
          <Tooltip
            contentStyle={{ background: 'rgba(15,15,20,0.94)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: 'white', fontWeight: 700 }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export const SkillRadarChart = memo(SkillRadarChartImpl);
