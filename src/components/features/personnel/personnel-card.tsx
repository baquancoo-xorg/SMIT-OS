/**
 * Personnel grid card — avatar, identity, mini-radar, status badge.
 */

import { Suspense } from 'react';
import type { Personnel, SkillAssessment } from '../../../lib/personnel/personnel-types';
import { POSITION_LABEL } from '../../../lib/personnel/personnel-types';
import { PersonnelStatusBadge } from './status-badge';
import { PersonnelMiniRadar } from './personnel-mini-radar';

interface Props {
  personnel: Personnel;
  assessments?: SkillAssessment[];
  onOpen?: (id: string) => void;
}

function tenureLabel(startDate: string): string {
  const start = new Date(startDate);
  const now = new Date();
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (months < 1) return 'Mới onboard';
  if (months < 12) return `${months} tháng`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m === 0 ? `${y} năm` : `${y}n ${m}t`;
}

function lastAssessmentLabel(assessments: SkillAssessment[] | undefined): string {
  if (!assessments || assessments.length === 0) return 'Chưa có đánh giá';
  const latest = assessments[0];
  return `Lần cuối: ${latest.quarter}`;
}

export function PersonnelCard({ personnel, assessments, onOpen }: Props) {
  return (
    <button
      type="button"
      onClick={() => onOpen?.(personnel.id)}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900 to-neutral-950 p-5 text-left transition hover:border-white/20 hover:shadow-xl"
    >
      <div className="flex items-start gap-3">
        <div className="size-12 shrink-0 overflow-hidden rounded-full bg-neutral-800">
          {personnel.user.avatar ? (
            <img src={personnel.user.avatar} alt={personnel.user.fullName} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-lg font-semibold text-neutral-400">
              {personnel.user.fullName.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-white">{personnel.user.fullName}</h3>
          <p className="text-xs text-neutral-400">
            {POSITION_LABEL[personnel.position]} · {tenureLabel(personnel.startDate)}
          </p>
        </div>
      </div>

      <div className="mt-3 text-neutral-300">
        <Suspense fallback={<div className="h-[120px] animate-pulse rounded-xl bg-neutral-800/40" />}>
          <PersonnelMiniRadar assessments={assessments ?? []} />
        </Suspense>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <PersonnelStatusBadge />
        <span className="text-neutral-500">{lastAssessmentLabel(assessments)}</span>
      </div>
    </button>
  );
}
