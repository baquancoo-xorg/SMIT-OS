import { z } from 'zod';

export const createWeeklyReportSchema = z.object({
  userId: z.string().uuid(),
  weekEnding: z.string(),
  summary: z.string().max(2000).optional().nullable(),
  accomplishments: z.string().max(5000).optional().nullable(),
  blockers: z.string().max(2000).optional().nullable(),
  nextWeekPlan: z.string().max(5000).optional().nullable(),
  krProgress: z.string().optional().nullable(),
});

export const createDailyReportSchema = z.object({
  userId: z.string().uuid(),
  reportDate: z.string(),
  tasksData: z.union([z.string(), z.array(z.any())]),
  blockers: z.string().max(2000).optional().nullable(),
  impactLevel: z.enum(['None', 'Low', 'Medium', 'High']).default('None'),
});

export const updateWeeklyReportSchema = createWeeklyReportSchema.partial();
export const updateDailyReportSchema = createDailyReportSchema.partial();

export type CreateWeeklyReportInput = z.infer<typeof createWeeklyReportSchema>;
export type CreateDailyReportInput = z.infer<typeof createDailyReportSchema>;
