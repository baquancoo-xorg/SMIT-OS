import { getCrmClient, safeCrmQuery } from '../../lib/crm-db';
import { calculateTrend, safeDivide, toNumber } from './overview-helpers';
import { getAdSpendTotal } from './overview-ad-spend';
import type { SummaryMetrics } from '../../types/dashboard-overview.types';

export async function getSummaryMetrics(
  from: Date,
  to: Date,
  prevFrom: Date,
  prevTo: Date
): Promise<SummaryMetrics> {
  const crm = getCrmClient();

  const [curRev, prevRev, curSign, prevSign, curAd, prevAd] = await Promise.all([
    safeCrmQuery(
      () =>
        crm.businessTransaction.aggregate({
          _sum: { userPaid: true },
          where: {
            isTrial: false,
            status: 'completed',
            createdAt: { gte: from, lte: to },
            PEERDB_IS_DELETED: false,
          },
        }),
      { _sum: { userPaid: null } }
    ),
    safeCrmQuery(
      () =>
        crm.businessTransaction.aggregate({
          _sum: { userPaid: true },
          where: {
            isTrial: false,
            status: 'completed',
            createdAt: { gte: prevFrom, lte: prevTo },
            PEERDB_IS_DELETED: false,
          },
        }),
      { _sum: { userPaid: null } }
    ),
    safeCrmQuery(
      () =>
        crm.crmSubscriber.count({
          where: { createdAt: { gte: from, lte: to }, PEERDB_IS_DELETED: false },
        }),
      0
    ),
    safeCrmQuery(
      () =>
        crm.crmSubscriber.count({
          where: { createdAt: { gte: prevFrom, lte: prevTo }, PEERDB_IS_DELETED: false },
        }),
      0
    ),
    getAdSpendTotal(from, to),
    getAdSpendTotal(prevFrom, prevTo),
  ]);

  const revenue = curRev ? toNumber(curRev._sum.userPaid) : 0;
  const prevRevenue = prevRev ? toNumber(prevRev._sum.userPaid) : 0;
  const signups = curSign ?? 0;
  const prevSignups = prevSign ?? 0;
  const roas = safeDivide(revenue, curAd);
  const prevRoas = safeDivide(prevRevenue, prevAd);

  return {
    revenue: calculateTrend(revenue, prevRevenue),
    adSpend: calculateTrend(curAd, prevAd),
    signups: calculateTrend(signups, prevSignups),
    roas: calculateTrend(roas, prevRoas),
  };
}
