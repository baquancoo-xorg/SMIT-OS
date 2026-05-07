import { prisma } from '../../lib/prisma';
import type { LeadFlowResponse, LeadFlowDailyItem } from '../../types/lead-flow.types';

const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_KEYS = 100;
const CLOSED_STATUSES = ['Qualified', 'Unqualified'];

type CacheEntry = {
  expiresAt: number;
  data: LeadFlowResponse;
};

const cache = new Map<string, CacheEntry>();

function getCacheKey(from: Date, to: Date) {
  return `${from.toISOString()}::${to.toISOString()}`;
}

function readCache(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function writeCache(key: string, data: LeadFlowResponse) {
  if (cache.size >= MAX_CACHE_KEYS) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

function formatDateVn(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(date);
}

function getDaysBetween(from: Date, to: Date): string[] {
  const days: string[] = [];
  const current = new Date(from);
  while (current <= to) {
    days.push(formatDateVn(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

export async function getLeadFlow(from: Date, to: Date): Promise<LeadFlowResponse> {
  const key = getCacheKey(from, to);
  const cached = readCache(key);
  if (cached) return cached;

  // Query 1: Inflow - leads received in range
  const inflowTotal = await prisma.lead.count({
    where: {
      receivedDate: { gte: from, lte: to },
    },
  });

  // Query 2: Cleared - leads resolved in range with closed status
  const clearedTotal = await prisma.lead.count({
    where: {
      resolvedDate: { gte: from, lte: to },
      status: { in: CLOSED_STATUSES },
    },
  });

  // Query 3: Active Backlog at end of range
  // Leads received by 'to' date that are still active (not closed, or closed after 'to')
  const activeBacklog = await prisma.lead.count({
    where: {
      receivedDate: { lte: to },
      OR: [
        { status: { notIn: CLOSED_STATUSES } },
        { resolvedDate: { gt: to } },
      ],
    },
  });

  // Query 4: Opening backlog (for daily accumulation)
  const openingBacklog = await prisma.lead.count({
    where: {
      receivedDate: { lt: from },
      OR: [
        { status: { notIn: CLOSED_STATUSES } },
        { resolvedDate: { gte: from } },
      ],
    },
  });

  // Query 5: Daily inflow (groupBy receivedDate)
  const dailyInflowRaw = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
    SELECT
      TO_CHAR("receivedDate" AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD') AS date,
      COUNT(*)::bigint AS count
    FROM "Lead"
    WHERE "receivedDate" >= ${from} AND "receivedDate" <= ${to}
    GROUP BY TO_CHAR("receivedDate" AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD')
  `;

  // Query 6: Daily cleared (groupBy resolvedDate)
  const dailyClearedRaw = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
    SELECT
      TO_CHAR("resolvedDate" AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD') AS date,
      COUNT(*)::bigint AS count
    FROM "Lead"
    WHERE "resolvedDate" >= ${from} AND "resolvedDate" <= ${to}
      AND "status" IN ('Qualified', 'Unqualified')
    GROUP BY TO_CHAR("resolvedDate" AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD')
  `;

  const dailyInflowMap = new Map(dailyInflowRaw.map((r) => [r.date, Number(r.count)]));
  const dailyClearedMap = new Map(dailyClearedRaw.map((r) => [r.date, Number(r.count)]));

  // Build daily series with accumulating backlog
  const days = getDaysBetween(from, to);
  const daily: LeadFlowDailyItem[] = [];
  let runningBacklog = openingBacklog;

  for (const date of days) {
    const inflow = dailyInflowMap.get(date) ?? 0;
    const cleared = dailyClearedMap.get(date) ?? 0;
    runningBacklog = runningBacklog + inflow - cleared;

    daily.push({
      date,
      inflow,
      cleared,
      activeBacklog: runningBacklog,
    });
  }

  // Calculate clearance rate
  const denominator = clearedTotal + activeBacklog;
  const clearanceRate = denominator > 0
    ? Math.round((clearedTotal * 100) / denominator * 10) / 10
    : null;

  const data: LeadFlowResponse = {
    summary: {
      inflow: inflowTotal,
      cleared: clearedTotal,
      activeBacklog,
      clearanceRate,
    },
    daily,
  };

  writeCache(key, data);
  return data;
}
