import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

export const viewModeSchema = z.enum(['realtime', 'cohort']).default('realtime');

export const overviewQuerySchema = z.object({
  from: isoDate,
  to: isoDate,
  previousFrom: isoDate.optional(),
  previousTo: isoDate.optional(),
  viewMode: viewModeSchema.optional(),
});

export const kpiQuerySchema = z.object({
  from: isoDate,
  to: isoDate,
  viewMode: viewModeSchema.optional(),
});

export const fbSyncBodySchema = z.object({
  accountId: z.string().min(1),
  dateStart: isoDate,
  dateEnd: isoDate,
});

export type OverviewQuery = z.infer<typeof overviewQuerySchema>;
export type KpiQuery = z.infer<typeof kpiQuerySchema>;
export type FbSyncBody = z.infer<typeof fbSyncBodySchema>;
