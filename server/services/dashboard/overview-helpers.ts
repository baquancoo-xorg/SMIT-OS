import type { MetricWithTrend } from '../../types/dashboard-overview.types';

export const MQL_TIERS = {
  BRONZE: { budget: 5_000_000, accounts: 1 },
  SILVER: { budget: 500_000_000, accounts: 20 },
  GOLD: { budget: 10_000_000_000, accounts: 100 },
} as const;

export const MQL_VALID_ROLES = ['manager', 'accountant', 'owner', 'ceo', 'director'];

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
    sql: 0, sqlRate: 0,
  };
}
