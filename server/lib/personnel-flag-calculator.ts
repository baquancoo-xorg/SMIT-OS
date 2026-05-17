/**
 * Personnel auto-flag rules (SMIT-OS internal data only — no external systems):
 *  1. Any skill score Δ ≤ -1 vs previous quarter
 *  2. Daily report submission rate < 80% current month (needs ≥ 5 business days)
 *  3. Any owned KR < 50% progress with <= 2 weeks left in quarter
 *  4. Quarterly assessment overdue > 2 weeks into new quarter (skipped if tenure < 4 weeks)
 *
 * Status: tenure < 4 weeks → onboarding; else 0 flag = on_track, 1-2 = needs_attention, ≥3 = at_risk
 */

import type { PrismaClient } from '@prisma/client';
import { buildSmitosSnapshot } from './smitos-metrics-aggregator';
import { cached, cacheKey } from './external-cache';
import {
  getQuarterConfig,
  resolveQuarter,
  previousQuarter as prevQuarterLabel,
  weeksIntoQuarter as weeksIntoQ,
  weeksLeftInQuarter as weeksLeftQ,
} from './quarter-config';

const TTL_MS = 5 * 60 * 1000;
const ONBOARDING_WEEK_THRESHOLD = 4;
const MIN_ATTENDANCE_BUSINESS_DAYS = 5;

export type FlagCode = 'skill_regression' | 'low_attendance' | 'kr_at_risk' | 'assessment_overdue';

export interface PersonnelFlag {
  code: FlagCode;
  message: string;
}

export type PersonnelStatus = 'on_track' | 'needs_attention' | 'at_risk' | 'onboarding';

export interface PersonnelFlagsResult {
  flags: PersonnelFlag[];
  status: PersonnelStatus;
  generatedAt: string;
}

export async function calculateFlags(prisma: PrismaClient, personnelId: string): Promise<PersonnelFlagsResult> {
  const flags: PersonnelFlag[] = [];

  const personnel = await prisma.personnel.findUnique({
    where: { id: personnelId },
    select: { id: true, userId: true, startDate: true },
  });
  if (!personnel) {
    return { flags: [], status: 'on_track', generatedAt: new Date().toISOString() };
  }

  const config = await getQuarterConfig(prisma);
  const now = new Date();
  const currentQ = resolveQuarter(now, config);
  const prevQ = prevQuarterLabel(currentQ);

  const tenureWeeks = Math.floor((now.getTime() - personnel.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  const isOnboarding = tenureWeeks < ONBOARDING_WEEK_THRESHOLD;

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

  // Rule 4: assessment overdue > 2 weeks into quarter (skip for onboarding)
  if (!isOnboarding && !curAssess && weeksIntoQ(currentQ, config, now) > 2) {
    flags.push({ code: 'assessment_overdue', message: `Chưa hoàn thành đánh giá quý ${currentQ}` });
  }

  // Rule 2 + 3: from SMIT-OS snapshot
  const snapshot = await cached(cacheKey('smitos', personnel.userId), TTL_MS, () =>
    buildSmitosSnapshot(prisma, personnel.userId),
  );
  if (
    !isOnboarding &&
    snapshot.attendance.businessDays >= MIN_ATTENDANCE_BUSINESS_DAYS &&
    snapshot.attendance.rate < 80
  ) {
    flags.push({ code: 'low_attendance', message: `Chuyên cần tháng này ${snapshot.attendance.rate}% (<80%)` });
  }
  const weeksLeft = weeksLeftQ(currentQ, config, now);
  if (weeksLeft <= 2) {
    const atRisk = snapshot.krs.filter((k) => k.progress < 50);
    if (atRisk.length > 0) {
      flags.push({ code: 'kr_at_risk', message: `${atRisk.length} KR <50% khi còn ${weeksLeft} tuần` });
    }
  }

  let status: PersonnelStatus;
  if (isOnboarding && flags.length === 0) {
    status = 'onboarding';
  } else if (flags.length === 0) {
    status = 'on_track';
  } else if (flags.length <= 2) {
    status = 'needs_attention';
  } else {
    status = 'at_risk';
  }

  return { flags, status, generatedAt: new Date().toISOString() };
}
