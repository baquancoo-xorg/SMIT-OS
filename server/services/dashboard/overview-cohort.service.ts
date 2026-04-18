import { getCrmClient, safeCrmQuery } from '../../lib/crm-db';
import { formatDate, getDateRange } from '../../lib/date-utils';
import { safeDivide, toNumber, createEmptyKpiRow, MQL_THRESHOLD, MQL_SCORING } from './overview-helpers';
import { getAdSpendByDate, getSessionsByDate } from './overview-ad-spend';
import type { KpiMetricsResponse, KpiMetricsRow } from '../../types/dashboard-overview.types';

export async function getCohortKpiMetrics(from: Date, to: Date): Promise<KpiMetricsResponse> {
  const dates = getDateRange(from, to);

  const [adSpendByDate, sessionsByDate, cohortData] = await Promise.all([
    getAdSpendByDate(from, to),
    getSessionsByDate(from, to),
    fetchCohortData(from, to),
  ]);

  const data: KpiMetricsRow[] = dates.map((date) => {
    const row = createEmptyKpiRow(date);
    row.adSpend = adSpendByDate.get(date) ?? 0;
    row.sessions = sessionsByDate.get(date) ?? 0;
    row.signups = cohortData.signups.get(date) ?? 0;
    row.opportunities = cohortData.opportunities.get(date) ?? 0;
    row.orders = cohortData.orders.get(date) ?? 0;
    row.revenue = cohortData.revenue.get(date) ?? 0;
    row.mql = cohortData.mql.get(date) ?? 0;
    row.mqlBronze = cohortData.mqlBronze.get(date) ?? 0;
    row.mqlSilver = cohortData.mqlSilver.get(date) ?? 0;
    row.mqlGold = cohortData.mqlGold.get(date) ?? 0;
    row.prePql = cohortData.prePql.get(date) ?? 0;
    row.pql = cohortData.pql.get(date) ?? 0;
    row.sql = cohortData.sql.get(date) ?? 0;

    row.costPerSession = safeDivide(row.adSpend, row.sessions);
    row.costPerSignup = safeDivide(row.adSpend, row.signups);
    row.costPerOpportunity = safeDivide(row.adSpend, row.opportunities);
    row.costPerOrder = safeDivide(row.adSpend, row.orders);
    row.opportunityRate = safeDivide(row.opportunities * 100, row.signups);
    row.orderRate = safeDivide(row.orders * 100, row.signups);
    row.mqlRate = safeDivide(row.mql * 100, row.signups);
    row.prePqlRate = safeDivide(row.prePql * 100, row.signups);
    row.pqlRate = safeDivide(row.pql * 100, row.signups);
    row.sqlRate = safeDivide(row.sql * 100, row.signups);
    row.roas = safeDivide(row.revenue, row.adSpend);

    return row;
  });

  const totals = aggregateTotals(data);
  return { data, totals };
}

async function fetchCohortData(from: Date, to: Date) {
  const signups = new Map<string, number>();
  const opportunities = new Map<string, number>();
  const orders = new Map<string, number>();
  const revenue = new Map<string, number>();
  const mql = new Map<string, number>();
  const mqlBronze = new Map<string, number>();
  const mqlSilver = new Map<string, number>();
  const mqlGold = new Map<string, number>();
  const prePql = new Map<string, number>();
  const pql = new Map<string, number>();
  const sql = new Map<string, number>();

  const crm = getCrmClient();
  if (!crm) {
    return { signups, opportunities, orders, revenue, mql, mqlBronze, mqlSilver, mqlGold, prePql, pql, sql };
  }

  // Get all signups in range with their data for MQL classification
  const signupsData = await safeCrmQuery(
    () =>
      crm.crmSubscriber.findMany({
        where: { createdAt: { gte: from, lte: to }, PEERDB_IS_DELETED: false },
        select: {
          id: true,
          createdAt: true,
          adBudgetMonth: true,
          adAccountQty: true,
          status: true,
          mql_date: true,
        },
      }),
    []
  );

  // Build subscriber ID to signup date map
  const subscriberSignupDate = new Map<bigint, string>();
  (signupsData ?? []).forEach((r) => {
    const date = formatDate(new Date(r.createdAt));
    subscriberSignupDate.set(r.id, date);
    signups.set(date, (signups.get(date) ?? 0) + 1);

    // MQL classification (cohort = attributed to signup date)
    const tier = classifyMqlTier(r.adBudgetMonth, r.adAccountQty);
    if (tier) {
      mql.set(date, (mql.get(date) ?? 0) + 1);
      if (tier === 'gold') mqlGold.set(date, (mqlGold.get(date) ?? 0) + 1);
      else if (tier === 'silver') mqlSilver.set(date, (mqlSilver.get(date) ?? 0) + 1);
      else if (tier === 'bronze') mqlBronze.set(date, (mqlBronze.get(date) ?? 0) + 1);
    }

    // SQL: attributed to signup date if status = 'mql_qualified'
    if (r.status === 'mql_qualified') {
      sql.set(date, (sql.get(date) ?? 0) + 1);
    }
  });

  const subscriberIds = Array.from(subscriberSignupDate.keys()).map(Number);
  if (subscriberIds.length === 0) {
    return { signups, opportunities, orders, revenue, mql, mqlBronze, mqlSilver, mqlGold, prePql, pql, sql };
  }

  // Get business creations for these subscribers
  const businessCreations = await safeCrmQuery(
    () =>
      crm.crmGateBusinessCreation.findMany({
        where: {
          subscriber_id: { in: subscriberIds },
          PEERDB_IS_DELETED: false,
        },
        select: { subscriber_id: true, businessId: true },
      }),
    []
  );

  const subscriberToBusiness = new Map<number, number>();
  const businessIds: number[] = [];
  (businessCreations ?? []).forEach((r) => {
    if (r.subscriber_id && r.businessId) {
      subscriberToBusiness.set(r.subscriber_id, r.businessId);
      businessIds.push(r.businessId);
    }
  });

  if (businessIds.length === 0) {
    return { signups, opportunities, orders, revenue, mql, mqlBronze, mqlSilver, mqlGold, prePql, pql, sql };
  }

  // Fetch cohort metrics in parallel
  const [oppsData, ordersData, pqlStatusData] = await Promise.all([
    // Opportunities - attributed to signup date
    safeCrmQuery(
      () =>
        crm.crmOpportunity.findMany({
          where: { subscriber_id: { in: subscriberIds }, PEERDB_IS_DELETED: false },
          select: { subscriber_id: true },
        }),
      []
    ),
    // Orders - attributed to signup date via business
    safeCrmQuery(
      () =>
        crm.businessTransaction.findMany({
          where: {
            business_id: { in: businessIds },
            isTrial: false,
            status: 'completed',
            PEERDB_IS_DELETED: false,
          },
          select: { business_id: true, userPaid: true },
        }),
      []
    ),
    // PQL status - attributed to signup date
    safeCrmQuery(
      () =>
        crm.crmBusinessPqlStatus.findMany({
          where: { businessId: { in: businessIds }, PEERDB_IS_DELETED: false },
          select: { businessId: true, has_first_sync: true, is_pql: true },
        }),
      []
    ),
  ]);

  // Build business to subscriber map (reverse lookup)
  const businessToSubscriber = new Map<number, number>();
  subscriberToBusiness.forEach((businessId, subscriberId) => {
    businessToSubscriber.set(businessId, subscriberId);
  });

  // Process opportunities - attributed to signup date
  (oppsData ?? []).forEach((r) => {
    if (!r.subscriber_id) return;
    const date = subscriberSignupDate.get(BigInt(r.subscriber_id));
    if (date) {
      opportunities.set(date, (opportunities.get(date) ?? 0) + 1);
    }
  });

  // Process orders - attributed to signup date via business
  (ordersData ?? []).forEach((r) => {
    if (!r.business_id) return;
    const subscriberId = businessToSubscriber.get(r.business_id);
    if (!subscriberId) return;
    const date = subscriberSignupDate.get(BigInt(subscriberId));
    if (date) {
      orders.set(date, (orders.get(date) ?? 0) + 1);
      revenue.set(date, (revenue.get(date) ?? 0) + toNumber(r.userPaid));
    }
  });

  // Process PQL status - attributed to signup date
  (pqlStatusData ?? []).forEach((r) => {
    const subscriberId = businessToSubscriber.get(r.businessId);
    if (!subscriberId) return;
    const date = subscriberSignupDate.get(BigInt(subscriberId));
    if (!date) return;

    if (r.has_first_sync) {
      prePql.set(date, (prePql.get(date) ?? 0) + 1);
    }
    if (r.is_pql) {
      pql.set(date, (pql.get(date) ?? 0) + 1);
    }
  });

  return { signups, opportunities, orders, revenue, mql, mqlBronze, mqlSilver, mqlGold, prePql, pql, sql };
}

function classifyMqlTier(
  adBudgetMonth: string | null | undefined,
  adAccountQty: string | null | undefined
): 'bronze' | 'silver' | 'gold' | null {
  const budget = parseBudgetRange(adBudgetMonth);
  const accounts = parseAccountsRange(adAccountQty);

  // MQL Qualification: budget >= 5 tỷ AND accounts >= 100
  if (budget < MQL_THRESHOLD.budgetMin || accounts < MQL_THRESHOLD.accountsMin) {
    return null;
  }

  // Calculate weighted score for tier classification
  const budgetScore = MQL_SCORING.budget.find((t) => budget >= t.min)?.score ?? 0;
  const accountScore = MQL_SCORING.accounts.find((t) => accounts >= t.min)?.score ?? 0;
  const totalScore = budgetScore + accountScore;

  // Tier based on total score (2-6 range)
  if (totalScore >= MQL_SCORING.tiers.gold) return 'gold';
  if (totalScore >= MQL_SCORING.tiers.silver) return 'silver';
  return 'bronze';
}

function parseBudgetRange(v: string | null | undefined): number {
  if (!v) return 0;
  const s = v.trim();
  if (s === '<5') return 0;
  if (s === '>100') return 100_000_000_000;
  const rangeMatch = s.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) return parseInt(rangeMatch[1], 10) * 1_000_000_000;
  const num = s.replace(/[^\d]/g, '');
  return parseInt(num, 10) || 0;
}

function parseAccountsRange(v: string | null | undefined): number {
  if (!v) return 0;
  const s = v.trim();
  if (s.endsWith('+')) return parseInt(s.replace('+', ''), 10) || 0;
  const rangeMatch = s.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) return parseInt(rangeMatch[1], 10);
  const num = s.replace(/[^\d]/g, '');
  return parseInt(num, 10) || 0;
}

function aggregateTotals(rows: KpiMetricsRow[]): KpiMetricsRow {
  const totals = createEmptyKpiRow('Total');

  rows.forEach((r) => {
    totals.adSpend += r.adSpend;
    totals.sessions += r.sessions;
    totals.signups += r.signups;
    totals.opportunities += r.opportunities;
    totals.orders += r.orders;
    totals.revenue += r.revenue;
    totals.mql += r.mql;
    totals.mqlBronze += r.mqlBronze;
    totals.mqlSilver += r.mqlSilver;
    totals.mqlGold += r.mqlGold;
    totals.prePql += r.prePql;
    totals.pql += r.pql;
    totals.sql += r.sql;
  });

  totals.costPerSession = safeDivide(totals.adSpend, totals.sessions);
  totals.costPerSignup = safeDivide(totals.adSpend, totals.signups);
  totals.costPerOpportunity = safeDivide(totals.adSpend, totals.opportunities);
  totals.costPerOrder = safeDivide(totals.adSpend, totals.orders);
  totals.opportunityRate = safeDivide(totals.opportunities * 100, totals.signups);
  totals.orderRate = safeDivide(totals.orders * 100, totals.signups);
  totals.mqlRate = safeDivide(totals.mql * 100, totals.signups);
  totals.prePqlRate = safeDivide(totals.prePql * 100, totals.signups);
  totals.pqlRate = safeDivide(totals.pql * 100, totals.signups);
  totals.sqlRate = safeDivide(totals.sql * 100, totals.signups);
  totals.roas = safeDivide(totals.revenue, totals.adSpend);

  return totals;
}
