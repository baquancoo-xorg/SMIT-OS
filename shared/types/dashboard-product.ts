export interface DateRange {
  from: string;
  to: string;
}

export interface ProductSummary {
  totalSignups: number;
  firstSyncCount: number;
  pqlCount: number;
  activationCount: number;
  activationRate: number;
  dau: number;
  mau: number;
  dauMauRatio: number;
}

export interface FunnelStep {
  name: string;
  displayName: string;
  count: number;
  dropOffPct: number;
}

export interface ProductFunnel {
  steps: FunnelStep[];
}

export interface TopFeature {
  feature: string;
  users: number;
  totalUses: number;
  lastUsed: string | null;
}

export interface TopFeatures {
  items: TopFeature[];
}

export interface ProductSummaryResponse {
  success: boolean;
  data: ProductSummary | null;
  cached?: boolean;
  error?: string;
}

export interface ProductFunnelResponse {
  success: boolean;
  data: ProductFunnel | null;
  cached?: boolean;
  error?: string;
}

export interface TopFeaturesResponse {
  success: boolean;
  data: TopFeatures | null;
  cached?: boolean;
  error?: string;
}

// Phase 2 — Trends (line chart)
export type TrendMetric = 'signup' | 'firstsync' | 'pre_pql_rate' | 'activation';

export interface TrendPoint {
  date: string;
  value: number;
}

export interface ProductTrends {
  metric: string;
  points: TrendPoint[];
}

// Phase 2 — Heatmap (3 view variant)
export type HeatmapView = 'hour-day' | 'cohort' | 'business';

export interface HeatmapCell {
  x: number | string;
  y: number | string;
  value: number;
  label?: string;
}

export interface ProductHeatmap {
  view: string;
  xLabels: string[];
  yLabels: string[];
  cells: HeatmapCell[];
}

// Phase 2 — Time-to-Value
export interface TtvBucket {
  label: string;
  count: number;
}

export interface TtvStep {
  from: string;
  to: string;
  buckets: TtvBucket[];
  p50: number;
  p90: number;
  avgDays: number;
  sampleSize: number;
}

export interface ProductTtv {
  steps: TtvStep[];
}

// Phase 2 — Cohort Retention
export interface CohortRetention {
  cohort: string;
  size: number;
  retention: { d0: number; d1: number; d7: number; d14: number; d30: number };
}

export interface ProductCohort {
  cohorts: CohortRetention[];
  message?: string | null;
}

// Phase 2 — Channel (CRM primary + PostHog secondary)
export interface ChannelSource {
  source: string;
  signupCount: number;
  firstSyncCount: number;
  prePqlRate: number;
}

export interface ChannelPostHog {
  domain: string;
  count: number;
}

export interface ProductChannel {
  crm: ChannelSource[];
  posthog: ChannelPostHog[];
}

// Phase 2 Sprint 3 — Operational (online time + touchpoints)
export interface OnlineTimeRow {
  businessId: string;
  businessName: string | null;
  totalMinutes: number;
  dailyMinutes: number[]; // length 7, oldest → newest
}

export interface TouchpointRow {
  businessId: string;
  businessName: string | null;
  eventCount: number;
  lastActiveAt: string | null;
}

export interface ProductOperational {
  days: string[]; // ISO date strings, length 7
  onlineTime: OnlineTimeRow[];
  touchpoints: TouchpointRow[];
}

// Phase 2 Sprint 3 — Stuck businesses (TRACKING-ONLY, no email/phone)
export interface StuckBusiness {
  businessId: string;
  businessName: string | null;
  signupAt: string;
  daysStuck: number;
}

export interface ProductStuck {
  thresholdDays: number;
  totalCount: number;
  items: StuckBusiness[];
}
