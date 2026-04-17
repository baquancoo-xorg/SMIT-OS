import { z } from 'zod';

export const createFbAccountSchema = z.object({
  accountId: z.string().regex(/^act_\d+$/, 'Must be format act_XXXXX'),
  accountName: z.string().min(1).max(100).optional(),
  accessToken: z.string().min(10, 'Token required'),
  currency: z.enum(['USD', 'VND']).default('USD'),
});

export const updateFbAccountSchema = z.object({
  accountName: z.string().min(1).max(100).optional(),
  accessToken: z.string().min(10).optional(),
  currency: z.enum(['USD', 'VND']).optional(),
  isActive: z.boolean().optional(),
});

export const syncFbAccountSchema = z.object({
  dateStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const updateExchangeRateSchema = z.object({
  exchangeRate: z.number().min(1).max(100000),
});

export type CreateFbAccountInput = z.infer<typeof createFbAccountSchema>;
export type UpdateFbAccountInput = z.infer<typeof updateFbAccountSchema>;
