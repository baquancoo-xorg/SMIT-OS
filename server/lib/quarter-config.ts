/**
 * Quarter resolver with user-configurable fiscal year start.
 * AppSetting.fiscalYearStartMonth (1-12) + fiscalYearStartDay (1-31) define
 * where Q1 begins. Default = calendar (Jan 1).
 *
 * Quarter label format: "YYYY-Qn" where YYYY = fiscal year that contains start of Qn.
 */

import type { PrismaClient } from '@prisma/client';

const QUARTER_MS = 90 * 24 * 60 * 60 * 1000;

export interface QuarterConfig {
  startMonth: number; // 1-12
  startDay: number; // 1-31
}

let cachedConfig: QuarterConfig | null = null;
let cachedAt = 0;
const CONFIG_TTL_MS = 60_000;

export async function getQuarterConfig(prisma: PrismaClient): Promise<QuarterConfig> {
  if (cachedConfig && Date.now() - cachedAt < CONFIG_TTL_MS) return cachedConfig;
  const row = await prisma.appSetting.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton' },
    update: {},
  });
  cachedConfig = { startMonth: row.fiscalYearStartMonth, startDay: row.fiscalYearStartDay };
  cachedAt = Date.now();
  return cachedConfig;
}

export function invalidateQuarterConfigCache(): void {
  cachedConfig = null;
}

// Returns the Date object representing Q1 start of fiscal year for given calendar date.
function fiscalYearStartForDate(date: Date, config: QuarterConfig): Date {
  const startMonthIdx = config.startMonth - 1;
  const daysInStartMonth = new Date(date.getFullYear(), startMonthIdx + 1, 0).getDate();
  const safeDay = Math.min(config.startDay, daysInStartMonth);
  const thisYearStart = new Date(date.getFullYear(), startMonthIdx, safeDay);
  if (date >= thisYearStart) return thisYearStart;
  const prevDays = new Date(date.getFullYear() - 1, startMonthIdx + 1, 0).getDate();
  return new Date(date.getFullYear() - 1, startMonthIdx, Math.min(config.startDay, prevDays));
}

export function resolveQuarter(date: Date, config: QuarterConfig): string {
  const fyStart = fiscalYearStartForDate(date, config);
  const monthsIntoFY = (date.getFullYear() - fyStart.getFullYear()) * 12 + (date.getMonth() - fyStart.getMonth());
  const dayAdjust = date.getDate() < fyStart.getDate() ? -1 : 0;
  const effectiveMonths = monthsIntoFY + dayAdjust;
  const qIndex = Math.min(3, Math.max(0, Math.floor(effectiveMonths / 3)));
  return `${fyStart.getFullYear()}-Q${qIndex + 1}`;
}

export function previousQuarter(label: string): string {
  const [y, qn] = label.split('-Q').map(Number);
  return qn === 1 ? `${y - 1}-Q4` : `${y}-Q${qn - 1}`;
}

export function quartersBack(label: string, n: number): string[] {
  const out: string[] = [label];
  let cursor = label;
  for (let i = 0; i < n - 1; i++) {
    cursor = previousQuarter(cursor);
    out.unshift(cursor);
  }
  return out;
}

// Returns { start, end } for given quarter label and config. End is exclusive (start of next Q).
export function quarterBounds(label: string, config: QuarterConfig): { start: Date; end: Date } {
  const [y, qn] = label.split('-Q').map(Number);
  const startMonthIdx = config.startMonth - 1 + (qn - 1) * 3;
  const startYear = y + Math.floor(startMonthIdx / 12);
  const normMonth = ((startMonthIdx % 12) + 12) % 12;
  const daysInMonth = new Date(startYear, normMonth + 1, 0).getDate();
  const safeDay = Math.min(config.startDay, daysInMonth);
  const start = new Date(startYear, normMonth, safeDay);
  const endMonthIdx = startMonthIdx + 3;
  const endYear = y + Math.floor(endMonthIdx / 12);
  const normEndMonth = ((endMonthIdx % 12) + 12) % 12;
  const endDays = new Date(endYear, normEndMonth + 1, 0).getDate();
  const end = new Date(endYear, normEndMonth, Math.min(config.startDay, endDays));
  return { start, end };
}

export function weeksLeftInQuarter(label: string, config: QuarterConfig, now = new Date()): number {
  const { end } = quarterBounds(label, config);
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000)));
}

export function weeksIntoQuarter(label: string, config: QuarterConfig, now = new Date()): number {
  const { start } = quarterBounds(label, config);
  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)));
}
