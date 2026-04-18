import { getCrmClient, safeCrmQuery } from '../../lib/crm-db';
import { formatDate, getDateRange } from '../../lib/date-utils';
import { safeDivide, toNumber, createEmptyKpiRow, MQL_THRESHOLD, MQL_SCORING } from './overview-helpers';
import { getAdSpendByDate, getSessionsByDate } from './overview-ad-spend';
import type { KpiMetricsResponse, KpiMetricsRow } from '../../types/dashboard-overview.types';

export async function getKpiMetrics(from: Date, to: Date): Promise<KpiMetricsResponse> {
  const dates = getDateRange(from, to);

  const [adSpendByDate, sessionsByDate, crmData] = await Promise.all([
    getAdSpendByDate(from, to),
    getSessionsByDate(from, to),
    fetchCrmData(from, to),
  ]);

  const data: KpiMetricsRow[] = dates.map((date) => {
    const row = createEmptyKpiRow(date);
    row.adSpend = adSpendByDate.get(date) ?? 0;
    row.sessions = sessionsByDate.get(date) ?? 0;
    row.signups = crmData.signups.get(date) ?? 0;
    row.trials = crmData.trials.get(date) ?? 0;
    row.opportunities = crmData.opportunities.get(date) ?? 0;
    row.orders = crmData.orders.get(date) ?? 0;
    row.revenue = crmData.revenue.get(date) ?? 0;

    // MQL metrics
    row.mql = crmData.mql.get(date) ?? 0;
    row.mqlBronze = crmData.mqlBronze.get(date) ?? 0;
    row.mqlSilver = crmData.mqlSilver.get(date) ?? 0;
    row.mqlGold = crmData.mqlGold.get(date) ?? 0;

    // Lead stage metrics
    row.prePql = crmData.prePql.get(date) ?? 0;
    row.pql = crmData.pql.get(date) ?? 0;
    row.sql = crmData.sql.get(date) ?? 0;

    // Cost metrics
    row.costPerSession = safeDivide(row.adSpend, row.sessions);
    row.costPerSignup = safeDivide(row.adSpend, row.signups);
    row.costPerTrial = safeDivide(row.adSpend, row.trials);
    row.costPerOpportunity = safeDivide(row.adSpend, row.opportunities);
    row.costPerOrder = safeDivide(row.adSpend, row.orders);

    // Rate metrics (percentage of signups)
    row.trialRate = safeDivide(row.trials * 100, row.signups);
    row.opportunityRate = safeDivide(row.opportunities * 100, row.signups);
    row.orderRate = safeDivide(row.orders * 100, row.signups);
    row.mqlRate = safeDivide(row.mql * 100, row.signups);
    row.mqlBronzeRate = safeDivide(row.mqlBronze * 100, row.signups);
    row.mqlSilverRate = safeDivide(row.mqlSilver * 100, row.signups);
    row.mqlGoldRate = safeDivide(row.mqlGold * 100, row.signups);
    row.prePqlRate = safeDivide(row.prePql * 100, row.signups);
    row.pqlRate = safeDivide(row.pql * 100, row.signups);
    row.sqlRate = safeDivide(row.sql * 100, row.signups);
    row.roas = safeDivide(row.revenue, row.adSpend);

    return row;
  });

  const totals = aggregateTotals(data);
  return { data, totals };
}

async function fetchCrmData(from: Date, to: Date) {
  const signups = new Map<string, number>();
  const trials = new Map<string, number>();
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
    return { signups, trials, opportunities, orders, revenue, mql, mqlBronze, mqlSilver, mqlGold, prePql, pql, sql };
  }

  const [signupsData, trialsData, oppsData, ordersData, mqlData, prePqlData, pqlData, sqlData] = await Promise.all([
    // Signups: all subscribers created in range
    safeCrmQuery(
      () =>
        crm.crmSubscriber.findMany({
          where: { createdAt: { gte: from, lte: to }, PEERDB_IS_DELETED: false },
          select: { createdAt: true },
        }),
      []
    ),
    // Trials: businesses with is_trial = true
    safeCrmQuery(
      () =>
        crm.crmBusiness.findMany({
          where: { createdAt: { gte: from, lte: to }, isTrial: true, PEERDB_IS_DELETED: false },
          select: { createdAt: true },
        }),
      []
    ),
    // Opportunities
    safeCrmQuery(
      () =>
        crm.crmOpportunity.findMany({
          where: { createdAt: { gte: from, lte: to }, PEERDB_IS_DELETED: false },
          select: { createdAt: true },
        }),
      []
    ),
    // Orders: completed non-trial transactions
    safeCrmQuery(
      () =>
        crm.businessTransaction.findMany({
          where: {
            createdAt: { gte: from, lte: to },
            isTrial: false,
            status: 'completed',
            PEERDB_IS_DELETED: false,
          },
          select: { createdAt: true, userPaid: true },
        }),
      []
    ),
    // MQL: subscribers grouped by created_at, classified by budget AND accounts only
    safeCrmQuery(
      () =>
        crm.crmSubscriber.findMany({
          where: {
            createdAt: { gte: from, lte: to },
            PEERDB_IS_DELETED: false,
          },
          select: { createdAt: true, adBudgetMonth: true, adAccountQty: true },
        }),
      []
    ),
    // Pre-PQL: business with first sync completed
    safeCrmQuery(
      () =>
        crm.crmBusinessPqlStatus.findMany({
          where: {
            first_sync_at: { gte: from, lte: to },
            has_first_sync: true,
            PEERDB_IS_DELETED: false,
          },
          select: { first_sync_at: true },
        }),
      []
    ),
    // PQL: business pql status where is_pql = true
    safeCrmQuery(
      () =>
        crm.crmBusinessPqlStatus.findMany({
          where: {
            pql_achieved_at: { gte: from, lte: to },
            is_pql: true,
            PEERDB_IS_DELETED: false,
          },
          select: { pql_achieved_at: true },
        }),
      []
    ),
    // SQL: subscribers with status = 'mql_qualified', grouped by mql_date
    safeCrmQuery(
      () =>
        crm.crmSubscriber.findMany({
          where: {
            mql_date: { gte: from, lte: to },
            status: 'mql_qualified',
            PEERDB_IS_DELETED: false,
          },
          select: { mql_date: true },
        }),
      []
    ),
  ]);

  (signupsData ?? []).forEach((r) => {
    const date = formatDate(new Date(r.createdAt));
    signups.set(date, (signups.get(date) ?? 0) + 1);
  });

  (trialsData ?? []).forEach((r) => {
    const date = formatDate(new Date(r.createdAt));
    trials.set(date, (trials.get(date) ?? 0) + 1);
  });

  (oppsData ?? []).forEach((r) => {
    const date = formatDate(new Date(r.createdAt));
    opportunities.set(date, (opportunities.get(date) ?? 0) + 1);
  });

  (ordersData ?? []).forEach((r) => {
    const date = formatDate(new Date(r.createdAt));
    orders.set(date, (orders.get(date) ?? 0) + 1);
    revenue.set(date, (revenue.get(date) ?? 0) + toNumber(r.userPaid));
  });

  // Process MQL data with tier classification (exclusive, AND logic)
  // Group by created_at, classify by budget AND accounts only (no role filter)
  (mqlData ?? []).forEach((r) => {
    const date = formatDate(new Date(r.createdAt));
    const tier = classifyMqlTier(r.adBudgetMonth, r.adAccountQty);
    if (tier) {
      mql.set(date, (mql.get(date) ?? 0) + 1);
      if (tier === 'gold') mqlGold.set(date, (mqlGold.get(date) ?? 0) + 1);
      else if (tier === 'silver') mqlSilver.set(date, (mqlSilver.get(date) ?? 0) + 1);
      else if (tier === 'bronze') mqlBronze.set(date, (mqlBronze.get(date) ?? 0) + 1);
    }
  });

  // Pre-PQL: group by first_sync_at
  (prePqlData ?? []).forEach((r) => {
    if (!r.first_sync_at) return;
    const date = formatDate(new Date(r.first_sync_at));
    prePql.set(date, (prePql.get(date) ?? 0) + 1);
  });

  // PQL: group by pql_achieved_at
  (pqlData ?? []).forEach((r) => {
    if (!r.pql_achieved_at) return;
    const date = formatDate(new Date(r.pql_achieved_at));
    pql.set(date, (pql.get(date) ?? 0) + 1);
  });

  // SQL: group by mql_date (subscribers with status = 'mql_qualified')
  (sqlData ?? []).forEach((r) => {
    if (!r.mql_date) return;
    const date = formatDate(new Date(r.mql_date));
    sql.set(date, (sql.get(date) ?? 0) + 1);
  });

  return { signups, trials, opportunities, orders, revenue, mql, mqlBronze, mqlSilver, mqlGold, prePql, pql, sql };
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

// Parse budget range string to VND value (minimum of range)
// Formats: "<5" (tỷ), "5-20", "20-100", ">100", or raw number
function parseBudgetRange(v: string | null | undefined): number {
  if (!v) return 0;
  const s = v.trim();

  // New format: "<5", "5-20", "20-100", ">100" (unit: tỷ VND = billion)
  if (s === '<5') return 0;
  if (s === '>100') return 100_000_000_000; // 100 tỷ
  const rangeMatch = s.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    return parseInt(rangeMatch[1], 10) * 1_000_000_000; // Convert tỷ to VND
  }

  // Legacy format: raw number (VND)
  const num = s.replace(/[^\d]/g, '');
  return parseInt(num, 10) || 0;
}

// Parse accounts range string to number (minimum of range)
// Formats: "100-1000", "1000-4000", "4000-10000", "10000+", or raw number
function parseAccountsRange(v: string | null | undefined): number {
  if (!v) return 0;
  const s = v.trim();

  // New format: "100-1000", "1000-4000", "4000-10000", "10000+"
  if (s.endsWith('+')) {
    return parseInt(s.replace('+', ''), 10) || 0;
  }
  const rangeMatch = s.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    return parseInt(rangeMatch[1], 10); // Return minimum of range
  }

  // Legacy format: raw number
  const num = s.replace(/[^\d]/g, '');
  return parseInt(num, 10) || 0;
}

function aggregateTotals(rows: KpiMetricsRow[]): KpiMetricsRow {
  const totals = createEmptyKpiRow('Total');

  rows.forEach((r) => {
    totals.adSpend += r.adSpend;
    totals.sessions += r.sessions;
    totals.signups += r.signups;
    totals.trials += r.trials;
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
  totals.costPerTrial = safeDivide(totals.adSpend, totals.trials);
  totals.costPerOpportunity = safeDivide(totals.adSpend, totals.opportunities);
  totals.costPerOrder = safeDivide(totals.adSpend, totals.orders);
  totals.trialRate = safeDivide(totals.trials * 100, totals.signups);
  totals.opportunityRate = safeDivide(totals.opportunities * 100, totals.signups);
  totals.orderRate = safeDivide(totals.orders * 100, totals.signups);
  totals.mqlRate = safeDivide(totals.mql * 100, totals.signups);
  totals.mqlBronzeRate = safeDivide(totals.mqlBronze * 100, totals.signups);
  totals.mqlSilverRate = safeDivide(totals.mqlSilver * 100, totals.signups);
  totals.mqlGoldRate = safeDivide(totals.mqlGold * 100, totals.signups);
  totals.prePqlRate = safeDivide(totals.prePql * 100, totals.signups);
  totals.pqlRate = safeDivide(totals.pql * 100, totals.signups);
  totals.sqlRate = safeDivide(totals.sql * 100, totals.signups);
  totals.roas = safeDivide(totals.revenue, totals.adSpend);

  return totals;
}
