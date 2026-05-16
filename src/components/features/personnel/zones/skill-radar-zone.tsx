/**
 * Zone A — Skill Radar.
 * 3 tabs (Job/General/Personal) × radar overlay 4 quarters × toggle Self/Manager/Both.
 * Phase 1: Manager toggle disabled with tooltip "Phase 2".
 */

import { useMemo, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { chartColors } from '../../../ui/charts/chart-palette';
import { buildRadarDataset } from '../../../../lib/personnel/radar-data-builder';
import type { Skill, SkillAssessment, SkillGroup, AssessorType, PersonnelPosition } from '../../../../lib/personnel/personnel-types';
import { GROUP_LABEL } from '../../../../lib/personnel/personnel-types';

interface Props {
  position: PersonnelPosition;
  skills: Skill[];
  assessments: SkillAssessment[];
}

const GROUPS: SkillGroup[] = ['JOB', 'GENERAL', 'PERSONAL'];

export function SkillRadarZone({ skills, assessments }: Props) {
  const [group, setGroup] = useState<SkillGroup>('JOB');
  const [assessor, setAssessor] = useState<AssessorType | 'BOTH'>('SELF');

  const dataset = useMemo(
    () => buildRadarDataset(skills, assessments, group, assessor),
    [skills, assessments, group, assessor],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-full border border-white/10 bg-neutral-900 p-1">
          {GROUPS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGroup(g)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                group === g ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {GROUP_LABEL[g]}
            </button>
          ))}
        </div>

        <div className="flex rounded-full border border-white/10 bg-neutral-900 p-1">
          {(['SELF', 'MANAGER', 'BOTH'] as const).map((t) => {
            const disabled = t !== 'SELF';
            return (
              <button
                key={t}
                type="button"
                disabled={disabled}
                title={disabled ? 'Khả dụng từ Phase 2' : undefined}
                onClick={() => setAssessor(t)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  assessor === t ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-neutral-200'
                } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
              >
                {t === 'SELF' ? 'Tự đánh giá' : t === 'MANAGER' ? 'Manager' : 'Cả hai'}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-neutral-900/40 p-4">
        {dataset.rows.length === 0 || dataset.series.length === 0 ? (
          <div className="flex h-72 items-center justify-center text-sm text-neutral-500">
            Chưa có dữ liệu đánh giá cho nhóm này
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={360}>
            <RadarChart data={dataset.rows} outerRadius="75%">
              <PolarGrid stroke="rgba(255,255,255,0.12)" />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: 'rgb(212,212,216)' }} />
              <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10, fill: 'rgb(115,115,115)' }} />
              {dataset.series.map((s, i) => (
                <Radar
                  key={s.key}
                  name={s.label}
                  dataKey={s.key}
                  stroke={chartColors.series[i % chartColors.series.length]}
                  fill={chartColors.series[i % chartColors.series.length]}
                  fillOpacity={0.18}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: 'rgba(23,23,23,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>

      <SkillScoreTable rows={dataset.rows} series={dataset.series} />
    </div>
  );
}

interface TableProps {
  rows: ReturnType<typeof buildRadarDataset>['rows'];
  series: ReturnType<typeof buildRadarDataset>['series'];
}

function SkillScoreTable({ rows, series }: TableProps) {
  if (rows.length === 0 || series.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-3xl border border-white/10 bg-neutral-900/40">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-xs uppercase text-neutral-400">
          <tr>
            <th className="px-4 py-2 text-left font-medium">Kỹ năng</th>
            {series.map((s) => (
              <th key={s.key} className="px-4 py-2 text-right font-medium">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-neutral-200">
          {rows.map((r) => (
            <tr key={r.skillKey}>
              <td className="px-4 py-2">{r.skill}</td>
              {series.map((s) => (
                <td key={s.key} className="px-4 py-2 text-right tabular-nums">
                  {r[s.key] || '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
