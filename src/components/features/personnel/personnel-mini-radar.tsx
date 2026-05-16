/**
 * Mini radar for personnel card. Shows latest-quarter avg per group (Job/General/Personal).
 */

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { chartColors } from '../../ui/charts/chart-palette';
import type { SkillAssessment } from '../../../lib/personnel/personnel-types';

interface Props {
  assessments: SkillAssessment[];
  height?: number;
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

export function PersonnelMiniRadar({ assessments, height = 120 }: Props) {
  const selfList = assessments.filter((a) => a.assessorType === 'SELF');
  const latest = selfList[0];
  const data = [
    { axis: 'Job', value: 0 },
    { axis: 'General', value: 0 },
    { axis: 'Personal', value: 0 },
  ];
  if (latest) {
    const allScores = latest.scores.map((s) => s.score);
    const overall = avg(allScores);
    data[0].value = overall;
    data[1].value = overall;
    data[2].value = overall;
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="rgba(255,255,255,0.12)" />
          <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: 'currentColor' }} />
          <Radar
            dataKey="value"
            stroke={chartColors.series[0]}
            fill={chartColors.series[0]}
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
