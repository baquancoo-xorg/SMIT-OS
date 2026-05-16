import { z } from 'zod';

// Weekly Check-in (Wodtke 5-block) — JSON columns stored as strings.
//   krProgress: JSON string of [{krId, currentValue, confidence0to10, note}]
//   progress  : JSON string of {priorities: [{text, done}]} (last week)
//   plans     : JSON string of {topThree: string[]}
//   blockers  : JSON string of {risks: string, helpNeeded: string}
export const createWeeklyReportSchema = z.object({
  userId: z.string().uuid(),
  weekEnding: z.string(),
  krProgress: z.string().default('[]'),
  progress: z.string().default('{"priorities":[]}'),
  plans: z.string().default('{"topThree":[]}'),
  blockers: z.string().default('{"risks":"","helpNeeded":""}'),
  rawData: z.record(z.string(), z.any()).optional().nullable(),
});

// Daily Sync — 4 plain text fields.
// userId is taken from authenticated session in the route handler, NOT from body
// (prevents client spoofing). Zod's default strip mode silently drops legacy
// body.userId sent by v1 form — backward compatible.
export const createDailyReportSchema = z.object({
  reportDate: z.string(),
  completedYesterday: z.string().max(20000).default(''),
  doingYesterday: z.string().max(20000).default(''),
  blockers: z.string().max(20000).default(''),
  planToday: z.string().max(20000).default(''),
  rawData: z.record(z.string(), z.any()).optional().nullable(),
});

export const updateWeeklyReportSchema = createWeeklyReportSchema.partial();
export const updateDailyReportSchema = createDailyReportSchema.partial();

// Approval comment — bắt buộc non-empty, max 2000 chars.
export const approveReportSchema = z.object({
  comment: z.string().trim().min(1, 'Nhận xét là bắt buộc').max(2000),
});

export type CreateWeeklyReportInput = z.infer<typeof createWeeklyReportSchema>;
export type CreateDailyReportInput = z.infer<typeof createDailyReportSchema>;
export type ApproveReportInput = z.infer<typeof approveReportSchema>;
