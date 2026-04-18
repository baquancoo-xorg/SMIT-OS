import { z } from 'zod';

export const createOkrCycleSchema = z.object({
  name: z.string().min(1, 'Name required').max(100),
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.boolean().default(false),
});

export const updateOkrCycleSchema = createOkrCycleSchema.partial();

export type CreateOkrCycleInput = z.infer<typeof createOkrCycleSchema>;
export type UpdateOkrCycleInput = z.infer<typeof updateOkrCycleSchema>;
