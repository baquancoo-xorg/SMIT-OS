/**
 * Acquisition Journey Funnel — 3 stages × steps:
 *  PRE   = Reach (MediaPost.reach + AdSpendRecord.impressions) → Click (AdSpendRecord.clicks)
 *  IN    = Visit (proxy = clicks) → Lead (Lead.count)         → Trial (CrmBusiness.isTrial)
 *  POST  = Active (Trial that activated) → Paid (BusinessTransaction completed) → Retained (renewal_status retained)
 *
 * Conversion rates computed step-by-step within each stage and across stage boundaries.
 * Heavy CRM queries reuse `safeCrmQuery` so cross-DB outages don't break the dashboard.
 * Result cached 5min per (from, to) pair to match React Query staleTime.
 */
import { prisma } from '../../lib/prisma';
import { getCrmClient, safeCrmQuery } from '../../lib/crm-db';

export interface JourneyStep {
  name: string;
  value: number;
  conversionFromPrev: number | null; // 0..1
}

export interface JourneyStage {
  label: string;
  steps: JourneyStep[];
}

export interface JourneyResponse {
  range: { from: string; to: string };
  stages: {
    pre: JourneyStage;
    in: JourneyStage;
    post: JourneyStage;
  };
  totals: {
    reach: number;
    clicks: number;
    visits: number;
    leads: number;
    trials: number;
    activeUsers: number;
    paidCustomers: number;
    revenue: number;
  };
}

function safeRatio(numerator: number, denominator: number): number | null {
  if (!denominator || denominator <= 0) return null;
  return numerator / denominator;
}

// 5-min cache (matches React Query staleTime on the FE).
const TTL_MS = 5 * 60_000;
const _cache = new Map<string, { data: JourneyResponse; expiresAt: number }>();
const _inFlight = new Map<string, Promise<JourneyResponse>>();

export async function getJourneyFunnel(from: Date, to: Date): Promise<JourneyResponse> {
  const key = `${from.toISOString()}|${to.toISOString()}`;
  const hit = _cache.get(key);
  if (hit && Date.now() < hit.expiresAt) return hit.data;
  const pending = _inFlight.get(key);
  if (pending) return pending;

  const task = computeJourneyFunnel(from, to)
    .then((data) => {
      _cache.set(key, { data, expiresAt: Date.now() + TTL_MS });
      return data;
    })
    .finally(() => {
      _inFlight.delete(key);
    });
  _inFlight.set(key, task);
  return task;
}

async function computeJourneyFunnel(from: Date, to: Date): Promise<JourneyResponse> {
  const crm = getCrmClient();

  const [
    mediaReachAgg,
    spendAgg,
    leadCount,
    trials,
    paidTransactions,
    activeBusinesses,
  ] = await Promise.all([
    prisma.mediaPost.aggregate({
      where: { publishedAt: { gte: from, lte: to } },
      _sum: { reach: true },
    }),
    prisma.adSpendRecord.aggregate({
      where: { date: { gte: from, lte: to } },
      _sum: { impressions: true, clicks: true, conversions: true },
    }),
    prisma.lead.count({
      where: { receivedDate: { gte: from, lte: to } },
    }),
    safeCrmQuery(
      () =>
        crm.crmBusiness.count({
          where: { createdAt: { gte: from, lte: to }, isTrial: true, PEERDB_IS_DELETED: false },
        }),
      0
    ),
    safeCrmQuery(
      () =>
        crm.businessTransaction.aggregate({
          _sum: { userPaid: true },
          _count: { _all: true },
          where: {
            createdAt: { gte: from, lte: to },
            isTrial: false,
            status: 'completed',
            PEERDB_IS_DELETED: false,
          },
        }),
      { _sum: { userPaid: null as number | null }, _count: { _all: 0 } }
    ),
    safeCrmQuery(
      () =>
        crm.crmBusinessPqlStatus.count({
          where: {
            first_sync_at: { gte: from, lte: to },
            has_first_sync: true,
            PEERDB_IS_DELETED: false,
          },
        }),
      0
    ),
  ]);

  const mediaReach = mediaReachAgg._sum.reach ?? 0;
  const adImpressions = spendAgg._sum.impressions ?? 0;
  const reach = mediaReach + adImpressions;
  const clicks = spendAgg._sum.clicks ?? 0;
  const visits = clicks; // proxy until pageview tracking lands
  const leads = leadCount;
  const trialsCount = trials ?? 0;
  const activeUsers = activeBusinesses ?? 0;
  const paidCount = paidTransactions._count._all ?? 0;
  const revenue = paidTransactions._sum.userPaid != null ? Number(paidTransactions._sum.userPaid) : 0;
  // Approximate retained = paid (we don't yet split renewals from first-purchase).
  // Until Phase 6, surface paid as the retention proxy and keep a separate `revenue` total.
  const retained = paidCount;

  const pre: JourneyStage = {
    label: 'Pre-product',
    steps: [
      { name: 'Reach', value: reach, conversionFromPrev: null },
      { name: 'Click', value: clicks, conversionFromPrev: safeRatio(clicks, reach) },
    ],
  };

  const inStage: JourneyStage = {
    label: 'In-product',
    steps: [
      { name: 'Visit', value: visits, conversionFromPrev: safeRatio(visits, clicks) },
      { name: 'Lead', value: leads, conversionFromPrev: safeRatio(leads, visits) },
      { name: 'Trial', value: trialsCount, conversionFromPrev: safeRatio(trialsCount, leads) },
    ],
  };

  const post: JourneyStage = {
    label: 'Post-product',
    steps: [
      { name: 'Active', value: activeUsers, conversionFromPrev: safeRatio(activeUsers, trialsCount) },
      { name: 'Paid', value: paidCount, conversionFromPrev: safeRatio(paidCount, activeUsers) },
      { name: 'Retained', value: retained, conversionFromPrev: safeRatio(retained, paidCount) },
    ],
  };

  return {
    range: { from: from.toISOString(), to: to.toISOString() },
    stages: { pre, in: inStage, post },
    totals: {
      reach,
      clicks,
      visits,
      leads,
      trials: trialsCount,
      activeUsers,
      paidCustomers: paidCount,
      revenue,
    },
  };
}
