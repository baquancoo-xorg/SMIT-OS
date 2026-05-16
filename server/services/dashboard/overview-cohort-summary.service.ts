import { calculateTrend } from './overview-helpers';
import { getCohortKpiMetrics } from './overview-cohort.service';
import { getAdSpendTotal } from './overview-ad-spend';
import type { SummaryMetrics } from '../../types/dashboard-overview.types';

export async function getCohortSummary(
  from: Date,
  to: Date,
  prevFrom: Date,
  prevTo: Date,
): Promise<SummaryMetrics> {
  const [curKpi, prevKpi, curAd, prevAd] = await Promise.all([
    getCohortKpiMetrics(from, to),
    getCohortKpiMetrics(prevFrom, prevTo),
    getAdSpendTotal(from, to),
    getAdSpendTotal(prevFrom, prevTo),
  ]);

  const curRev = curKpi.totals.revenue;
  const prevRev = prevKpi.totals.revenue;
  const curSign = curKpi.totals.signups;
  const prevSign = prevKpi.totals.signups;
  const curRoas = prevAd === 0 ? 0 : curRev / curAd;
  const prevRoas = prevAd === 0 ? 0 : prevRev / prevAd;

  return {
    revenue: calculateTrend(curRev, prevRev),
    adSpend: calculateTrend(curAd, prevAd),
    signups: calculateTrend(curSign, prevSign),
    roas: calculateTrend(curRoas, prevRoas),
  };
}
