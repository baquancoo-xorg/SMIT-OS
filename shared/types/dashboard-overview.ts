export interface MetricWithTrend {
  value: number;
  previousValue: number;
  trend: number;
  trendDirection: 'up' | 'down' | 'neutral';
}

export interface SummaryMetrics {
  revenue: MetricWithTrend;
  adSpend: MetricWithTrend;
  signups: MetricWithTrend;
  roas: MetricWithTrend;
}

export interface KpiMetricsRow {
  date: string;
  adSpend: number;
  sessions: number;
  costPerSession: number;
  signups: number;
  costPerSignup: number;
  trials: number;
  trialRate: number;
  costPerTrial: number;
  opportunities: number;
  opportunityRate: number;
  costPerOpportunity: number;
  orders: number;
  orderRate: number;
  costPerOrder: number;
  revenue: number;
  roas: number;
  mql: number;
  mqlRate: number;
  mqlBronze: number;
  mqlBronzeRate: number;
  mqlSilver: number;
  mqlSilverRate: number;
  mqlGold: number;
  mqlGoldRate: number;
  prePql: number;
  prePqlRate: number;
  pql: number;
  pqlRate: number;
  preSql: number;
  preSqlRate: number;
  sql: number;
  sqlRate: number;
}

export interface KpiMetricsResponse {
  data: KpiMetricsRow[];
  totals: KpiMetricsRow;
}

export interface OverviewData {
  summary: SummaryMetrics;
  kpiMetrics: KpiMetricsResponse;
}

export interface DateRange {
  from: string;
  to: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
}
