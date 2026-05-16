/**
 * Quarterly skill assessment form. 3 tabs Job/General/Personal × Likert 1-5.
 */

import { useMemo, useState } from 'react';
import type { Skill, SkillGroup, AssessorType, PersonnelPosition } from '../../../../lib/personnel/personnel-types';
import { GROUP_LABEL } from '../../../../lib/personnel/personnel-types';
import { useSubmitSkillAssessmentMutation } from '../../../../hooks/use-skill-assessments';
import { currentQuarter } from '../../../../lib/personnel/quarter-utils';

interface Props {
  personnelId: string;
  position: PersonnelPosition;
  skills: Skill[];
  assessorType?: AssessorType;
  onSubmitted?: () => void;
}

const GROUPS: SkillGroup[] = ['JOB', 'GENERAL', 'PERSONAL'];
const LIKERT = [1, 2, 3, 4, 5] as const;
const LIKERT_LABEL: Record<number, string> = {
  1: 'Beginner',
  2: 'Developing',
  3: 'Proficient',
  4: 'Advanced',
  5: 'Expert',
};

export function SkillAssessmentForm({ personnelId, position, skills, assessorType = 'SELF', onSubmitted }: Props) {
  const [tab, setTab] = useState<SkillGroup>('JOB');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const mutate = useSubmitSkillAssessmentMutation(personnelId);

  const skillsByGroup = useMemo(() => {
    const out: Record<SkillGroup, Skill[]> = { JOB: [], GENERAL: [], PERSONAL: [] };
    for (const s of skills) {
      if (s.group === 'JOB' && s.position !== position) continue;
      out[s.group].push(s);
    }
    for (const g of GROUPS) out[g].sort((a, b) => a.order - b.order);
    return out;
  }, [skills, position]);

  const allSkills = useMemo(
    () => [...skillsByGroup.JOB, ...skillsByGroup.GENERAL, ...skillsByGroup.PERSONAL],
    [skillsByGroup],
  );

  const completedCount = Object.keys(scores).length;
  const totalCount = allSkills.length;

  function setScore(skillId: string, value: number) {
    setScores((prev) => ({ ...prev, [skillId]: value }));
  }

  function submit() {
    setError(null);
    const missing = allSkills.filter((s) => !scores[s.id]);
    if (missing.length > 0) {
      setError(`Còn ${missing.length} kỹ năng chưa đánh giá`);
      return;
    }
    mutate.mutate(
      {
        quarter: currentQuarter(),
        assessorType,
        scores: allSkills.map((s) => ({ skillId: s.id, score: scores[s.id] })),
      },
      {
        onSuccess: () => {
          setScores({});
          onSubmitted?.();
        },
        onError: (e: Error) => setError(e.message || 'Có lỗi khi gửi đánh giá'),
      },
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-full border border-white/10 bg-neutral-900 p-1">
          {GROUPS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setTab(g)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                tab === g ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {GROUP_LABEL[g]} ({skillsByGroup[g].length})
            </button>
          ))}
        </div>
        <div className="text-xs text-neutral-400">
          Tiến độ: <span className="text-neutral-200">{completedCount}/{totalCount}</span> · Quý {currentQuarter()}
        </div>
      </div>

      <div className="space-y-3">
        {skillsByGroup[tab].map((s) => (
          <div key={s.id} className="rounded-2xl border border-white/10 bg-neutral-900/40 p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-medium text-white">{s.label}</h4>
                <p className="text-[11px] text-neutral-500">{LIKERT_LABEL[scores[s.id] ?? 0] ?? 'Chưa chọn'}</p>
              </div>
              {scores[s.id] && <span className="text-xs text-neutral-500">{scores[s.id]}/5</span>}
            </div>
            <div className="flex gap-2">
              {LIKERT.map((n) => {
                const active = scores[s.id] === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setScore(s.id, n)}
                    className={`flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                      active
                        ? 'border-orange-500/50 bg-gradient-to-br from-neutral-800 to-neutral-900 text-white shadow-[0_0_0_1px_rgba(255,140,40,0.4)]'
                        : 'border-white/10 bg-neutral-900 text-neutral-400 hover:border-white/20 hover:text-neutral-200'
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-rose-400">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={mutate.isPending}
        className="group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-br from-neutral-800 to-neutral-950 px-6 py-3 text-sm font-medium text-white ring-1 ring-white/10 transition hover:ring-orange-500/40 disabled:opacity-50"
      >
        <span className="text-orange-400">✓</span>
        <span className="h-4 w-px bg-orange-500/60" />
        <span>{mutate.isPending ? 'Đang gửi...' : `Gửi đánh giá quý ${currentQuarter()}`}</span>
      </button>
    </div>
  );
}
