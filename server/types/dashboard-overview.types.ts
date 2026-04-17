export interface DateRange {
  from: Date;
  to: Date;
}

export interface DateRangeWithComparison extends DateRange {
  previousFrom: Date;
  previousTo: Date;
}

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
  trialAvgDays?: number;
  costPerTrial: number;
  opportunities: number;
  opportunityRate: number;
  oppsAvgDays?: number;
  costPerOpportunity: number;
  orders: number;
  orderRate: number;
  orderAvgDays?: number;
  costPerOrder: number;
  revenue: number;
  roas: number;
  mql: number;
  mqlRate: number;
  mqlAvgDays?: number;
  mqlBronze: number;
  mqlBronzeRate: number;
  mqlSilver: number;
  mqlSilverRate: number;
  mqlGold: number;
  mqlGoldRate: number;
  prePql: number;
  prePqlRate: number;
  prePqlAvgDays?: number;
  pql: number;
  pqlRate: number;
  pqlAvgDays?: number;
  sql: number;
  sqlRate: number;
  sqlAvgDays?: number;
}

export interface KpiMetricsResponse {
  data: KpiMetricsRow[];
  totals: KpiMetricsRow;
}

export interface OverviewQueryParams {
  from: string;
  to: string;
  previousFrom?: string;
  previousTo?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
}
