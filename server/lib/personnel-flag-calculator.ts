/**
 * Personnel auto-flag rules (SMIT-OS internal data only — no external systems):
 *  1. Any skill score Δ ≤ -1 vs previous quarter
 *  2. Daily report submission rate < 80% current month
 *  3. Any owned KR < 50% progress with <= 2 weeks left in quarter
 *  4. Quarterly assessment overdue > 2 weeks into new quarter
 *
 * Status: 0 flag = on_track, 1-2 = needs_attention, ≥3 = at_risk
 */

import type { PrismaClient } from '@prisma/client';
import { buildSmitosSnapshot } from './smitos-metrics-aggregator';
import { cached, cacheKey } from './external-cache';

const TTL_MS = 5 * 60 * 1000;

export type FlagCode = 'skill_regression' | 'low_attendance' | 'kr_at_risk' | 'assessment_overdue';

export interface PersonnelFlag {
  code: FlagCode;
  message: string;
}

export type PersonnelStatus = 'on_track' | 'needs_attention' | 'at_risk';

export interface PersonnelFlagsResult {
  flags: PersonnelFlag[];
  status: PersonnelStatus;
  generatedAt: string;
}

function currentQuarter(now = new Date()): string {
  return `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`;
}

function previousQuarter(q: string): string {
  const [y, qn] = q.split('-Q').map(Number);
  return qn === 1 ? `${y - 1}-Q4` : `${y}-Q${qn - 1}`;
}

function weeksLeftInQuarter(now = new Date()): number {
  const qIndex = Math.floor(now.getMonth() / 3);
  const endMonth = qIndex * 3 + 2;
  const end = new Date(now.getFullYear(), endMonth + 1, 0);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (7 * 24 * 60 * 60 * 1000)));
}

function weeksIntoQuarter(now = new Date()): number {
  const qIndex = Math.floor(now.getMonth() / 3);
  const start = new Date(now.getFullYear(), qIndex * 3, 1);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
}

export async function calculateFlags(prisma: PrismaClient, personnelId: string): Promise<PersonnelFlagsResult> {
  const flags: PersonnelFlag[] = [];

  const personnel = await prisma.personnel.findUnique({
    where: { id: personnelId },
    select: { id: true, userId: true },
  });
  if (!personnel) {
    return { flags: [], status: 'on_track', generatedAt: new Date().toISOString() };
  }

  const currentQ = currentQuarter();
  const prevQ = previousQuarter(currentQ);

  // Rule 1: skill regression (SELF assessments)
  const [curAssess, prevAssess] = await Promise.all([
    prisma.skillAssessment.findUnique({
      where: { personnelId_quarter_assessorType: { personnelId, quarter: currentQ, assessorType: 'SELF' } },
      include: { scores: true },
    }),
    prisma.skillAssessment.findUnique({
      where: { personnelId_quarter_assessorType: { personnelId, quarter: prevQ, assessorType: 'SELF' } },
      include: { scores: true },
    }),
  ]);
  if (curAssess && prevAssess) {
    const prevMap = new Map(prevAssess.scores.map((s) => [s.skillId, s.score]));
    const regressed = curAssess.scores.filter((s) => {
      const prev = prevMap.get(s.skillId);
      return prev !== undefined && s.score - prev <= -1;
    });
    if (regressed.length > 0) {
      flags.push({ code: 'skill_regression', message: `${regressed.length} kỹ năng giảm ≥1 điểm so với ${prevQ}` });
    }
  }

  // Rule 4: assessment overdue > 2 weeks into quarter
  if (!curAssess && weeksIntoQuarter() > 2) {
    flags.push({ code: 'assessment_overdue', message: `Chưa hoàn thành đánh giá quý ${currentQ}` });
  }

  // Rule 2 + 3: from SMIT-OS snapshot
  const snapshot = await cached(cacheKey('smitos', personnel.userId), TTL_MS, () =>
    buildSmitosSnapshot(prisma, personnel.userId),
  );
  if (snapshot.attendance.businessDays > 0 && snapshot.attendance.rate < 80) {
    flags.push({ code: 'low_attendance', message: `Chuyên cần tháng này ${snapshot.attendance.rate}% (<80%)` });
  }
  const weeksLeft = weeksLeftInQuarter();
  if (weeksLeft <= 2) {
    const atRisk = snapshot.krs.filter((k) => k.progress < 50);
    if (atRisk.length > 0) {
      flags.push({ code: 'kr_at_risk', message: `${atRisk.length} KR <50% khi còn ${weeksLeft} tuần` });
    }
  }

  const status: PersonnelStatus =
    flags.length === 0 ? 'on_track' : flags.length <= 2 ? 'needs_attention' : 'at_risk';

  return { flags, status, generatedAt: new Date().toISOString() };
}
