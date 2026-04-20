import type { MetricWithTrend } from '../../types/dashboard-overview.types';

// MQL Qualification: budget >= 5 tỷ AND accounts >= 100
export const MQL_THRESHOLD = {
  budgetMin: 5_000_000_000,  // 5 tỷ VND
  accountsMin: 100,
} as const;

// MQL Tier scoring thresholds (weighted score system)
// Budget levels: 5-20 tỷ = 1, 20-100 tỷ = 2, >100 tỷ = 3
// Account levels: 100-1000 = 1, 1000-4000 = 2, >=4000 = 3
// Total score (2-6): Bronze = 2, Silver = 3-4, Gold = 5-6
export const MQL_SCORING = {
  budget: [
    { min: 100_000_000_000, score: 3 },  // > 100 tỷ
    { min: 20_000_000_000, score: 2 },   // 20-100 tỷ
    { min: 5_000_000_000, score: 1 },    // 5-20 tỷ
  ],
  accounts: [
    { min: 4000, score: 3 },   // >= 4000 TKQC
    { min: 1000, score: 2 },   // 1000-4000 TKQC
    { min: 100, score: 1 },    // 100-1000 TKQC
  ],
  tiers: {
    gold: 5,    // score >= 5
    silver: 3,  // score >= 3
    bronze: 2,  // score >= 2 (minimum for MQL)
  },
} as const;

export function calculateTrend(current: number, previous: number): MetricWithTrend {
  const trend = previous === 0 ? 0 : ((current - previous) / previous) * 100;
  return {
    value: current,
    previousValue: previous,
    trend: Math.round(trend * 100) / 100,
    trendDirection: trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral',
  };
}

export function safeDivide(n: number, d: number): number {
  if (d === 0) return 0;
  return Math.round((n / d) * 100) / 100;
}

export function toNumber(v: any): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'object' && 'toNumber' in v) return v.toNumber();
  if (typeof v === 'bigint') return Number(v);
  return Number(v) || 0;
}

export function extractLandingPageViews(actions: unknown): number {
  if (!Array.isArray(actions)) return 0;
  const lpv = actions.find((a: any) => a.action_type === 'landing_page_view');
  return lpv ? parseInt(lpv.value, 10) || 0 : 0;
}

export function createEmptyKpiRow(date: string) {
  return {
    date,
    adSpend: 0, sessions: 0, costPerSession: 0,
    signups: 0, costPerSignup: 0,
    trials: 0, trialRate: 0, costPerTrial: 0,
    opportunities: 0, opportunityRate: 0, costPerOpportunity: 0,
    orders: 0, orderRate: 0, costPerOrder: 0,
    revenue: 0, roas: 0,
    mql: 0, mqlRate: 0,
    mqlBronze: 0, mqlBronzeRate: 0,
    mqlSilver: 0, mqlSilverRate: 0,
    mqlGold: 0, mqlGoldRate: 0,
    prePql: 0, prePqlRate: 0,
    pql: 0, pqlRate: 0,
    preSql: 0, preSqlRate: 0,
    sql: 0, sqlRate: 0,
  };
}
