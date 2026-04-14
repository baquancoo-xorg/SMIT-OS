import { z } from 'zod';

export const createSprintSchema = z.object({
  name: z.string().min(1, 'Name required').max(100),
  startDate: z.string(),
  endDate: z.string(),
  goal: z.string().max(500).optional().nullable(),
  status: z.enum(['Planning', 'Active', 'Completed']).default('Planning'),
});

export const updateSprintSchema = createSprintSchema.partial();

export type CreateSprintInput = z.infer<typeof createSprintSchema>;
export type UpdateSprintInput = z.infer<typeof updateSprintSchema>;
