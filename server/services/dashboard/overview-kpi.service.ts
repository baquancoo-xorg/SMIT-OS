import { getCrmClient, safeCrmQuery } from '../../lib/crm-db';
import { formatDate, getDateRange } from '../../lib/date-utils';
import { safeDivide, toNumber, createEmptyKpiRow } from './overview-helpers';
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

    row.costPerSession = safeDivide(row.adSpend, row.sessions);
    row.costPerSignup = safeDivide(row.adSpend, row.signups);
    row.costPerTrial = safeDivide(row.adSpend, row.trials);
    row.costPerOpportunity = safeDivide(row.adSpend, row.opportunities);
    row.costPerOrder = safeDivide(row.adSpend, row.orders);

    row.trialRate = safeDivide(row.trials * 100, row.signups);
    row.opportunityRate = safeDivide(row.opportunities * 100, row.signups);
    row.orderRate = safeDivide(row.orders * 100, row.signups);
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

  const crm = getCrmClient();
  if (!crm) {
    return { signups, trials, opportunities, orders, revenue };
  }

  const [signupsData, trialsData, oppsData, ordersData] = await Promise.all([
    safeCrmQuery(
      () =>
        crm.crmSubscriber.findMany({
          where: { createdAt: { gte: from, lte: to }, PEERDB_IS_DELETED: false },
          select: { createdAt: true },
        }),
      []
    ),
    safeCrmQuery(
      () =>
        crm.crmBusiness.findMany({
          where: { createdAt: { gte: from, lte: to }, isTrial: true, PEERDB_IS_DELETED: false },
          select: { createdAt: true },
        }),
      []
    ),
    safeCrmQuery(
      () =>
        crm.crmOpportunity.findMany({
          where: { createdAt: { gte: from, lte: to }, PEERDB_IS_DELETED: false },
          select: { createdAt: true },
        }),
      []
    ),
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

  return { signups, trials, opportunities, orders, revenue };
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
  });

  totals.costPerSession = safeDivide(totals.adSpend, totals.sessions);
  totals.costPerSignup = safeDivide(totals.adSpend, totals.signups);
  totals.costPerTrial = safeDivide(totals.adSpend, totals.trials);
  totals.costPerOpportunity = safeDivide(totals.adSpend, totals.opportunities);
  totals.costPerOrder = safeDivide(totals.adSpend, totals.orders);
  totals.trialRate = safeDivide(totals.trials * 100, totals.signups);
  totals.opportunityRate = safeDivide(totals.opportunities * 100, totals.signups);
  totals.orderRate = safeDivide(totals.orders * 100, totals.signups);
  totals.roas = safeDivide(totals.revenue, totals.adSpend);

  return totals;
}
