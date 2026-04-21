import { z } from 'zod';

export const createWeeklyReportSchema = z.object({
  userId: z.string().uuid(),
  weekEnding: z.string(),
  progress: z.string().default('[]'),
  plans: z.string().default('[]'),
  blockers: z.string().default(''),
  score: z.number().int().default(0),
  confidenceScore: z.number().int().default(0),
  krProgress: z.string().optional().nullable(),
  adHocTasks: z.string().optional().nullable(),
});

export const createDailyReportSchema = z.object({
  userId: z.string().uuid(),
  reportDate: z.string(),
  tasksData: z.union([z.string(), z.array(z.any())]),
  blockers: z.string().max(2000).optional().nullable(),
  impactLevel: z.enum(['none', 'low', 'medium', 'high']).default('none'),
  teamType: z.string().optional().nullable(),
  teamMetrics: z.record(z.string(), z.any()).optional().nullable(),
  adHocTasks: z.string().optional().nullable(),
});

export const updateWeeklyReportSchema = createWeeklyReportSchema.partial();
export const updateDailyReportSchema = createDailyReportSchema.partial();

export type CreateWeeklyReportInput = z.infer<typeof createWeeklyReportSchema>;
export type CreateDailyReportInput = z.infer<typeof createDailyReportSchema>;
