/**
 * Personnel profile drawer. Phase 1: only Zone A enabled.
 * Tabs B/C/D disabled until later phases.
 */

import { Suspense, useState } from 'react';
import { usePersonnelQuery, useSkillsQuery } from '../../../hooks/use-personnel';
import { useSkillAssessmentsQuery } from '../../../hooks/use-skill-assessments';
import { POSITION_LABEL } from '../../../lib/personnel/personnel-types';
import { SkillRadarZone } from './zones/skill-radar-zone';
import { SkillAssessmentForm } from './forms/skill-assessment-form';
import { PersonnelStatusBadge } from './status-badge';

interface Props {
  personnelId: string | null;
  onClose: () => void;
}

type Tab = 'overview' | 'assessment' | 'personality' | 'jira' | 'smitos';

const TABS: Array<{ key: Tab; label: string; phase: 1 | 2 | 3 }> = [
  { key: 'overview', label: 'Skill Radar', phase: 1 },
  { key: 'assessment', label: 'Đánh giá quý', phase: 1 },
  { key: 'personality', label: 'Personality', phase: 2 },
  { key: 'jira', label: 'Jira', phase: 3 },
  { key: 'smitos', label: 'SMIT-OS', phase: 3 },
];

export function PersonnelProfileDrawer({ personnelId, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const { data: personnel, isLoading } = usePersonnelQuery(personnelId);
  const { data: assessments } = useSkillAssessmentsQuery(personnelId);
  const { data: jobSkills } = useSkillsQuery({ group: 'JOB', position: personnel?.position });
  const { data: generalSkills } = useSkillsQuery({ group: 'GENERAL', position: 'null' });
  const { data: personalSkills } = useSkillsQuery({ group: 'PERSONAL', position: 'null' });

  if (!personnelId) return null;

  const allSkills = [...(jobSkills ?? []), ...(generalSkills ?? []), ...(personalSkills ?? [])];

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative ml-auto flex h-full w-full max-w-4xl flex-col overflow-hidden bg-neutral-950 shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
          {isLoading || !personnel ? (
            <div className="flex-1 animate-pulse">
              <div className="h-5 w-40 rounded bg-white/10" />
              <div className="mt-2 h-3 w-24 rounded bg-white/10" />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="size-14 overflow-hidden rounded-full bg-neutral-800">
                {personnel.user.avatar ? (
                  <img src={personnel.user.avatar} alt={personnel.user.fullName} className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-xl font-semibold text-neutral-400">
                    {personnel.user.fullName.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{personnel.user.fullName}</h2>
                <p className="text-xs text-neutral-400">
                  {POSITION_LABEL[personnel.position]} · @{personnel.user.username}
                </p>
                <div className="mt-1">
                  <PersonnelStatusBadge />
                </div>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-400 hover:bg-white/5 hover:text-white"
          >
            Đóng
          </button>
        </header>

        <nav className="flex gap-1 border-b border-white/10 px-6">
          {TABS.map((t) => {
            const disabled = t.phase > 1;
            return (
              <button
                key={t.key}
                type="button"
                disabled={disabled}
                onClick={() => setTab(t.key)}
                title={disabled ? `Khả dụng từ Phase ${t.phase}` : undefined}
                className={`relative px-4 py-3 text-xs font-medium transition ${
                  tab === t.key
                    ? 'text-white'
                    : disabled
                    ? 'cursor-not-allowed text-neutral-600'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {t.label}
                {tab === t.key && (
                  <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-orange-500" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex-1 overflow-y-auto p-6">
          <Suspense fallback={<div className="h-72 animate-pulse rounded-3xl bg-white/5" />}>
            {personnel && tab === 'overview' && (
              <SkillRadarZone
                position={personnel.position}
                skills={allSkills}
                assessments={assessments ?? []}
              />
            )}
            {personnel && tab === 'assessment' && (
              <SkillAssessmentForm
                personnelId={personnel.id}
                position={personnel.position}
                skills={allSkills}
                assessorType={personnel.user.isAdmin ? 'MANAGER' : 'SELF'}
              />
            )}
          </Suspense>
        </div>
      </aside>
    </div>
  );
}
