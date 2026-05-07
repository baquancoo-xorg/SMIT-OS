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

// Inferred types
export type DateRangeQuery = z.infer<typeof dateRangeQuerySchema>;
export type ProductSummary = z.infer<typeof productSummarySchema>;
export type FunnelStep = z.infer<typeof funnelStepSchema>;
export type ProductFunnel = z.infer<typeof productFunnelSchema>;
export type TopFeature = z.infer<typeof topFeatureSchema>;
export type TopFeatures = z.infer<typeof topFeaturesSchema>;
