import { z } from 'zod';

// Request schemas
export const dateRangeQuerySchema = z.object({
  from: z.string().datetime({ offset: true }),
  to: z.string().datetime({ offset: true }),
});

// Response schemas
export const productSummarySchema = z.object({
  totalSignups: z.number(),
  firstSyncCount: z.number(),
  pqlCount: z.number(),
  activationCount: z.number(),
  activationRate: z.number(),
  dau: z.number(),
  mau: z.number(),
  dauMauRatio: z.number(),
});

export const funnelStepSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  count: z.number(),
  dropOffPct: z.number(),
});

export const productFunnelSchema = z.object({
  steps: z.array(funnelStepSchema),
});

export const topFeatureSchema = z.object({
  feature: z.string(),
  users: z.number(),
  totalUses: z.number(),
  lastUsed: z.string().nullable(),
});

export const topFeaturesSchema = z.object({
  items: z.array(topFeatureSchema),
});

// Phase 2: Trends — line chart Pre-PQL Rate / Signup / FirstSync / Activation by date
export const trendsQuerySchema = z.object({
  from: z.string().datetime({ offset: true }),
  to: z.string().datetime({ offset: true }),
  metric: z.enum(['signup', 'firstsync', 'pre_pql_rate', 'activation']).default('pre_pql_rate'),
});

export const trendPointSchema = z.object({
  date: z.string(),
  value: z.number(),
});

export const productTrendsSchema = z.object({
  metric: z.string(),
  points: z.array(trendPointSchema),
});

// Phase 2: Heatmap — 3 view variant (hour-day · cohort · business)
export const heatmapQuerySchema = z.object({
  view: z.enum(['hour-day', 'cohort', 'business']).default('hour-day'),
});

export const heatmapCellSchema = z.object({
  x: z.union([z.number(), z.string()]),
  y: z.union([z.number(), z.string()]),
  value: z.number(),
  label: z.string().optional(),
});

export const productHeatmapSchema = z.object({
  view: z.string(),
  xLabels: z.array(z.string()),
  yLabels: z.array(z.string()),
  cells: z.array(heatmapCellSchema),
});

// Phase 2: Time-to-Value — histogram + p50/p90 per step
export const ttvBucketSchema = z.object({
  label: z.string(),
  count: z.number(),
});

export const ttvStepSchema = z.object({
  from: z.string(),
  to: z.string(),
  buckets: z.array(ttvBucketSchema),
  p50: z.number(),
  p90: z.number(),
  avgDays: z.number(),
  sampleSize: z.number(),
});

export const productTtvSchema = z.object({
  steps: z.array(ttvStepSchema),
});

// Phase 2 — Cohort Retention (replace iframe Retention)
export const cohortRetentionSchema = z.object({
  cohort: z.string(), // ISO week label e.g. "2026-W18"
  size: z.number(),   // signup count
  retention: z.object({
    d0: z.number(),
    d1: z.number(),
    d7: z.number(),
    d14: z.number(),
    d30: z.number(),
  }),
});

export const productCohortSchema = z.object({
  cohorts: z.array(cohortRetentionSchema),
  message: z.string().nullable().optional(),
});

// Phase 2 — Channel (CRM primary + PostHog secondary)
export const channelSourceSchema = z.object({
  source: z.string(),
  signupCount: z.number(),
  firstSyncCount: z.number(),
  prePqlRate: z.number(),
});

export const channelPostHogSchema = z.object({
  domain: z.string(),
  count: z.number(),
});

export const productChannelSchema = z.object({
  crm: z.array(channelSourceSchema),
  posthog: z.array(channelPostHogSchema),
});

export type CohortRetention = z.infer<typeof cohortRetentionSchema>;
export type ProductCohort = z.infer<typeof productCohortSchema>;
export type ChannelSource = z.infer<typeof channelSourceSchema>;
export type ChannelPostHog = z.infer<typeof channelPostHogSchema>;
export type ProductChannel = z.infer<typeof productChannelSchema>;

// Phase 2 Sprint 3 — Operational (online time per business per day + touchpoints top 50)
export const onlineTimeRowSchema = z.object({
  businessId: z.string(),
  businessName: z.string().nullable(),
  totalMinutes: z.number(),
  dailyMinutes: z.array(z.number()), // last 7 days, idx 0 = oldest, idx 6 = newest
});

export const touchpointRowSchema = z.object({
  businessId: z.string(),
  businessName: z.string().nullable(),
  eventCount: z.number(),
  lastActiveAt: z.string().nullable(),
});

export const productOperationalSchema = z.object({
  days: z.array(z.string()), // ISO date strings, length 7 (oldest → newest)
  onlineTime: z.array(onlineTimeRowSchema),
  touchpoints: z.array(touchpointRowSchema),
});

// Phase 2 Sprint 3 — Stuck businesses (TRACKING-ONLY, no email/phone)
export const stuckBusinessSchema = z.object({
  businessId: z.string(),
  businessName: z.string().nullable(),
  signupAt: z.string(),
  daysStuck: z.number(),
});

export const productStuckSchema = z.object({
  thresholdDays: z.number(),
  totalCount: z.number(),
  items: z.array(stuckBusinessSchema),
});

export type OnlineTimeRow = z.infer<typeof onlineTimeRowSchema>;
export type TouchpointRow = z.infer<typeof touchpointRowSchema>;
export type ProductOperational = z.infer<typeof productOperationalSchema>;
export type StuckBusiness = z.infer<typeof stuckBusinessSchema>;
export type ProductStuck = z.infer<typeof productStuckSchema>;

// Inferred types
export type DateRangeQuery = z.infer<typeof dateRangeQuerySchema>;
export type ProductSummary = z.infer<typeof productSummarySchema>;
export type FunnelStep = z.infer<typeof funnelStepSchema>;
export type ProductFunnel = z.infer<typeof productFunnelSchema>;
export type TopFeature = z.infer<typeof topFeatureSchema>;
export type TopFeatures = z.infer<typeof topFeaturesSchema>;
export type TrendsQuery = z.infer<typeof trendsQuerySchema>;
export type TrendPoint = z.infer<typeof trendPointSchema>;
export type ProductTrends = z.infer<typeof productTrendsSchema>;
export type HeatmapQuery = z.infer<typeof heatmapQuerySchema>;
export type HeatmapCell = z.infer<typeof heatmapCellSchema>;
export type ProductHeatmap = z.infer<typeof productHeatmapSchema>;
export type TtvBucket = z.infer<typeof ttvBucketSchema>;
export type TtvStep = z.infer<typeof ttvStepSchema>;
export type ProductTtv = z.infer<typeof productTtvSchema>;
