/**
 * Transform skill assessments into radar chart datasets.
 * Phase 1: SELF only; Phase 2 will merge MANAGER overlay.
 */

import type { Skill, SkillAssessment, AssessorType, SkillGroup } from './personnel-types';
import { lastNQuarters, quarterLabel } from './quarter-utils';

export interface RadarRow {
  skill: string;
  skillKey: string;
  [seriesKey: string]: string | number;
}

export interface RadarDataset {
  rows: RadarRow[];
  series: Array<{ key: string; label: string; quarter: string; assessorType: AssessorType }>;
}

export function buildRadarDataset(
  skills: Skill[],
  assessments: SkillAssessment[],
  group: SkillGroup,
  assessorFilter: AssessorType | 'BOTH',
  maxQuarters = 4,
): RadarDataset {
  const groupSkills = skills.filter((s) => s.group === group).sort((a, b) => a.order - b.order);
  if (groupSkills.length === 0) return { rows: [], series: [] };

  const quarters = lastNQuarters(maxQuarters);
  const series: RadarDataset['series'] = [];
  const types: AssessorType[] = assessorFilter === 'BOTH' ? ['SELF', 'MANAGER'] : [assessorFilter];

  for (const quarter of quarters) {
    for (const t of types) {
      const hit = assessments.find((a) => a.quarter === quarter && a.assessorType === t);
      if (hit) {
        const key = `${quarter}_${t}`;
        series.push({ key, label: `${quarterLabel(quarter)} · ${t === 'SELF' ? 'Tự đánh giá' : 'Manager'}`, quarter, assessorType: t });
      }
    }
  }

  const rows: RadarRow[] = groupSkills.map((s) => {
    const row: RadarRow = { skill: s.label, skillKey: s.key };
    for (const ser of series) {
      const a = assessments.find((x) => x.quarter === ser.quarter && x.assessorType === ser.assessorType);
      const score = a?.scores.find((sc) => sc.skillId === s.id)?.score ?? 0;
      row[ser.key] = score;
    }
    return row;
  });

  return { rows, series };
}
