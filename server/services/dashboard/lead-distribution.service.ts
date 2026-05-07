import { prisma } from '../../lib/prisma';
import type { LeadDistributionResponse, LeadDistributionBySourceItem, LeadDistributionByAeItem, LeadDistributionByCountryItem } from '../../types/lead-distribution.types';

const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_KEYS = 100;
const CLOSED_STATUSES = ['Qualified', 'Unqualified'];

type CacheEntry = {
  expiresAt: number;
  data: LeadDistributionResponse;
};

const cache = new Map<string, CacheEntry>();

function getCacheKey(from: Date, to: Date, topSources: number) {
  return `${from.toISOString()}::${to.toISOString()}::${topSources}`;
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

function writeCache(key: string, data: LeadDistributionResponse) {
  if (cache.size >= MAX_CACHE_KEYS) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

export async function getLeadDistribution(from: Date, to: Date, topSources = 8): Promise<LeadDistributionResponse> {
  const key = getCacheKey(from, to, topSources);
  const cached = readCache(key);
  if (cached) return cached;

  // Query A: Group by source
  const sourceGroupRaw = await prisma.lead.groupBy({
    by: ['source'],
    _count: { _all: true },
    where: {
      receivedDate: { gte: from, lte: to },
    },
    orderBy: { _count: { source: 'desc' } },
  });

  // Build bySource with top N + Others
  const sourceItems: LeadDistributionBySourceItem[] = [];
  let othersCount = 0;

  for (let i = 0; i < sourceGroupRaw.length; i++) {
    const row = sourceGroupRaw[i];
    const sourceName = row.source?.trim() || 'Unknown';
    const count = row._count._all;

    if (i < topSources) {
      sourceItems.push({ source: sourceName, count });
    } else {
      othersCount += count;
    }
  }

  if (othersCount > 0) {
    sourceItems.push({ source: 'Others', count: othersCount });
  }

  // Query B: Group by AE - total leads
  const aeGroupTotal = await prisma.lead.groupBy({
    by: ['ae'],
    _count: { _all: true },
    where: {
      receivedDate: { gte: from, lte: to },
    },
  });

  // Query B2: Group by AE - cleared leads only
  const aeGroupCleared = await prisma.lead.groupBy({
    by: ['ae'],
    _count: { _all: true },
    where: {
      receivedDate: { gte: from, lte: to },
      status: { in: CLOSED_STATUSES },
    },
  });

  // Build AE map
  const clearedMap = new Map(aeGroupCleared.map((r) => [r.ae.trim(), r._count._all]));

  const aeItems: LeadDistributionByAeItem[] = aeGroupTotal
    .map((row) => {
      const ae = row.ae.trim();
      const total = row._count._all;
      const cleared = clearedMap.get(ae) ?? 0;
      const active = total - cleared;
      return { ae, active, cleared, total };
    })
    .sort((a, b) => b.total - a.total);

  // Query C: Group by leadType (country)
  const countryGroupRaw = await prisma.lead.groupBy({
    by: ['leadType'],
    _count: { _all: true },
    where: {
      receivedDate: { gte: from, lte: to },
    },
    orderBy: { _count: { leadType: 'desc' } },
  });

  const countryItems: LeadDistributionByCountryItem[] = countryGroupRaw.map((row) => ({
    country: row.leadType?.trim() || 'Unknown',
    count: row._count._all,
  }));

  const data: LeadDistributionResponse = {
    bySource: sourceItems,
    byAe: aeItems,
    byCountry: countryItems,
  };

  writeCache(key, data);
  return data;
}
