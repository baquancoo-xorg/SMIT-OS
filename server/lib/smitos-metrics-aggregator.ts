/**
 * Aggregate SMIT-OS internal data for Personnel Zone D (KR progress, daily report attendance).
 * KISS: pull from existing tables, no external MCP.
 */

import type { PrismaClient } from '@prisma/client';

export interface SmitosSnapshot {
  attendance: {
    submitted: number;
    businessDays: number;
    rate: number;
    daily: Array<{ date: string; submitted: boolean }>;
  };
  krs: Array<{ id: string; title: string; progress: number; current: number; target: number; unit: string }>;
  assessmentOverdue: boolean;
  generatedAt: string;
}

function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export async function buildSmitosSnapshot(prisma: PrismaClient, userId: string): Promise<SmitosSnapshot> {
  const now = new Date();
  const monthStart = startOfMonth(now);

  const reports = await prisma.dailyReport.findMany({
    where: { userId, reportDate: { gte: monthStart, lte: now } },
    select: { reportDate: true },
  });
  const submittedDays = new Set(reports.map((r) => ymd(r.reportDate)));

  const daily: Array<{ date: string; submitted: boolean }> = [];
  let businessDays = 0;
  let submitted = 0;
  for (let d = new Date(monthStart); d <= now; d.setDate(d.getDate() + 1)) {
    if (isWeekend(d)) continue;
    businessDays++;
    const key = ymd(d);
    const has = submittedDays.has(key);
    if (has) submitted++;
    daily.push({ date: key, submitted: has });
  }

  const krs = await prisma.keyResult.findMany({
    where: { ownerId: userId },
    select: {
      id: true,
      title: true,
      progressPercentage: true,
      currentValue: true,
      targetValue: true,
      unit: true,
    },
    orderBy: { progressPercentage: 'desc' },
    take: 5,
  });

  return {
    attendance: {
      submitted,
      businessDays,
      rate: businessDays === 0 ? 0 : Math.round((submitted / businessDays) * 100),
      daily,
    },
    krs: krs.map((k) => ({
      id: k.id,
      title: k.title,
      progress: Math.round(k.progressPercentage),
      current: k.currentValue,
      target: k.targetValue,
      unit: k.unit,
    })),
    assessmentOverdue: false, // wired by flag-calculator later
    generatedAt: now.toISOString(),
  };
}
