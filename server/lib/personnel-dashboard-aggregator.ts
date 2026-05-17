/**
 * Aggregate Personnel team-wide data for Executive Dashboard tab.
 * Builds: pulse (KPI strip), skillMovement (3-quarter radar), attentionItems (inbox).
 * Uses SELF assessments only (matches existing flag calculator convention).
 */

import type { PrismaClient, SkillGroup } from '@prisma/client';
import { calculateFlags, type PersonnelFlag, type PersonnelStatus } from './personnel-flag-calculator';
import { previousQuarter, quartersBack } from './quarter-config';
import { buildSmitosSnapshot } from './smitos-metrics-aggregator';
import { cached, cacheKey } from './external-cache';

export interface PulseGroupAverages {
  job: number;
  personal: number;
  general: number;
}

export interface PulseData {
  quarter: string;
  prevQuarter: string;
  current: PulseGroupAverages;
  previous: PulseGroupAverages;
  delta: PulseGroupAverages;
  evaluatedCount: number;
  totalCount: number;
  attentionCount: number;
  atRiskCount: number;
  onboardingCount: number;
}

export interface SkillTrendPoint {
  skillId: string;
  skillKey: string;
  label: string;
  group: SkillGroup;
  scores: Array<number | null>; // length = quarters.length
}

export interface TopMover {
  skillId: string;
  label: string;
  group: SkillGroup;
  delta: number; // current - previous (skip null)
  from: number;
  to: number;
}

export interface SkillMovementData {
  quarters: string[]; // [Q-2, Q-1, current]
  trends: SkillTrendPoint[];
  topUp: TopMover[];
  topDown: TopMover[];
}

export interface AttentionItem {
  personnelId: string;
  userId: string;
  fullName: string;
  avatar: string;
  position: string;
  status: PersonnelStatus;
  flags: PersonnelFlag[];
  lastAssessedQuarter: string | null;
}

export interface WorkloadEntry {
  personnelId: string;
  userId: string;
  fullName: string;
  avatar: string;
  submitted: number;
  businessDays: number;
  rate: number;
}

export interface WorkloadData {
  monthLabel: string; // YYYY-MM
  entries: WorkloadEntry[];
}

export interface PersonnelDashboardData {
  quarter: string;
  pulse: PulseData;
  skillMovement: SkillMovementData;
  attentionItems: AttentionItem[];
  workload: WorkloadData;
  generatedAt: string;
}

const SNAPSHOT_TTL_MS = 5 * 60 * 1000;

const MIN_DELTA_FOR_MOVER = 1; // 1-5 scale; Δ ≥ 1 = meaningful

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export async function buildPersonnelDashboard(
  prisma: PrismaClient,
  currentQuarter: string,
): Promise<PersonnelDashboardData> {
  const prevQ = previousQuarter(currentQuarter);
  const last3 = quartersBack(currentQuarter, 3);

  // Load all personnel + their last-3-quarter SELF assessments + skills metadata.
  const personnel = await prisma.personnel.findMany({
    include: {
      user: { select: { id: true, fullName: true, avatar: true } },
      assessments: {
        where: { quarter: { in: last3 }, assessorType: 'SELF', deletedAt: null },
        include: { scores: { include: { skill: true } } },
        orderBy: { quarter: 'desc' },
      },
    },
  });

  // ---- Pulse ----
  const groupScoresByQuarter = (q: string) => {
    const byGroup: Record<SkillGroup, number[]> = { JOB: [], GENERAL: [], PERSONAL: [] };
    for (const p of personnel) {
      const a = p.assessments.find((x) => x.quarter === q);
      if (!a) continue;
      for (const s of a.scores) {
        byGroup[s.skill.group].push(s.score);
      }
    }
    return {
      job: round1(avg(byGroup.JOB)),
      personal: round1(avg(byGroup.PERSONAL)),
      general: round1(avg(byGroup.GENERAL)),
    };
  };
  const current = groupScoresByQuarter(currentQuarter);
  const previous = groupScoresByQuarter(prevQ);
  const evaluatedCount = personnel.filter((p) => p.assessments.some((a) => a.quarter === currentQuarter)).length;

  // Flags for all personnel in parallel + active dismissals (snoozeUntil > now OR null)
  const [flagResultsRaw, dismissals] = await Promise.all([
    Promise.all(personnel.map((p) => calculateFlags(prisma, p.id))),
    prisma.attentionDismissal.findMany({
      where: { OR: [{ snoozeUntil: null }, { snoozeUntil: { gt: new Date() } }] },
      select: { personnelId: true, flagCode: true },
    }),
  ]);
  const dismissalSet = new Set(dismissals.map((d) => `${d.personnelId}::${d.flagCode}`));
  // Filter dismissed flags out + recompute status
  const flagResults = flagResultsRaw.map((fr, i) => {
    const pid = personnel[i].id;
    const visibleFlags = fr.flags.filter((f) => !dismissalSet.has(`${pid}::${f.code}`));
    if (visibleFlags.length === fr.flags.length) return fr;
    let status = fr.status;
    if (fr.status !== 'onboarding') {
      status = visibleFlags.length === 0 ? 'on_track' : visibleFlags.length <= 2 ? 'needs_attention' : 'at_risk';
    }
    return { ...fr, flags: visibleFlags, status };
  });
  const attentionCount = flagResults.filter((f) => f.status === 'needs_attention').length;
  const atRiskCount = flagResults.filter((f) => f.status === 'at_risk').length;
  const onboardingCount = flagResults.filter((f) => f.status === 'onboarding').length;

  const pulse: PulseData = {
    quarter: currentQuarter,
    prevQuarter: prevQ,
    current,
    previous,
    delta: {
      job: round1(current.job - previous.job),
      personal: round1(current.personal - previous.personal),
      general: round1(current.general - previous.general),
    },
    evaluatedCount,
    totalCount: personnel.length,
    attentionCount,
    atRiskCount,
    onboardingCount,
  };

  // ---- Skill Movement ----
  // Per-skill team avg for each of last 3 quarters.
  type Acc = { skillId: string; skillKey: string; label: string; group: SkillGroup; scores: Array<number[]> };
  const accBySkill = new Map<string, Acc>();
  for (const p of personnel) {
    for (const a of p.assessments) {
      const qIdx = last3.indexOf(a.quarter);
      if (qIdx === -1) continue;
      for (const s of a.scores) {
        const key = s.skill.id;
        if (!accBySkill.has(key)) {
          accBySkill.set(key, {
            skillId: s.skill.id,
            skillKey: s.skill.key,
            label: s.skill.label,
            group: s.skill.group,
            scores: [[], [], []],
          });
        }
        accBySkill.get(key)!.scores[qIdx].push(s.score);
      }
    }
  }
  const trends: SkillTrendPoint[] = Array.from(accBySkill.values()).map((a) => ({
    skillId: a.skillId,
    skillKey: a.skillKey,
    label: a.label,
    group: a.group,
    scores: a.scores.map((arr) => (arr.length === 0 ? null : round1(avg(arr)))),
  }));

  // Top movers: compare current (last index) vs previous (index 1).
  const movers: TopMover[] = trends
    .map((t) => {
      const to = t.scores[2];
      const from = t.scores[1];
      if (to === null || from === null) return null;
      return { skillId: t.skillId, label: t.label, group: t.group, delta: round1(to - from), from, to };
    })
    .filter((m): m is TopMover => m !== null && Math.abs(m.delta) >= MIN_DELTA_FOR_MOVER);

  const topUp = [...movers].filter((m) => m.delta > 0).sort((a, b) => b.delta - a.delta).slice(0, 3);
  const topDown = [...movers].filter((m) => m.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, 3);

  const skillMovement: SkillMovementData = { quarters: last3, trends, topUp, topDown };

  // ---- Attention Inbox ----
  const attentionItems: AttentionItem[] = personnel
    .map((p, i) => {
      const f = flagResults[i];
      const lastAssessed = p.assessments[0]?.quarter ?? null;
      return {
        personnelId: p.id,
        userId: p.user.id,
        fullName: p.user.fullName,
        avatar: p.user.avatar,
        position: p.position,
        status: f.status,
        flags: f.flags,
        lastAssessedQuarter: lastAssessed,
      };
    })
    .filter((it) => it.status === 'needs_attention' || it.status === 'at_risk')
    .sort((a, b) => {
      // at_risk first, then by flag count desc
      if (a.status !== b.status) return a.status === 'at_risk' ? -1 : 1;
      return b.flags.length - a.flags.length;
    });

  // ---- Workload (current month DailyReport submission counts) ----
  const snapshots = await Promise.all(
    personnel.map((p) =>
      cached(cacheKey('smitos', p.user.id), SNAPSHOT_TTL_MS, () => buildSmitosSnapshot(prisma, p.user.id)),
    ),
  );
  const now = new Date();
  const monthLabel = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const workloadEntries: WorkloadEntry[] = personnel
    .map((p, i) => ({
      personnelId: p.id,
      userId: p.user.id,
      fullName: p.user.fullName,
      avatar: p.user.avatar,
      submitted: snapshots[i].attendance.submitted,
      businessDays: snapshots[i].attendance.businessDays,
      rate: snapshots[i].attendance.rate,
    }))
    .sort((a, b) => b.submitted - a.submitted);

  return {
    quarter: currentQuarter,
    pulse,
    skillMovement,
    attentionItems,
    workload: { monthLabel, entries: workloadEntries },
    generatedAt: new Date().toISOString(),
  };
}
