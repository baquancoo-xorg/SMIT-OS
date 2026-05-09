import { z } from 'zod';

export const keyResultSchema = z.object({
  title: z.string().min(1).max(200),
  targetValue: z.number().min(0).default(100),
  currentValue: z.number().min(0).default(0),
  unit: z.string().max(20).optional(),
  progressPercentage: z.number().min(0).max(100).default(0),
});

export const createObjectiveSchema = z.object({
  title: z.string().min(1, 'Title required').max(200),
  description: z.string().max(1000).optional().nullable(),
  level: z.enum(['L1', 'L2']).optional(),
  department: z.string().max(50).optional().nullable(),
  ownerId: z.string().uuid().optional().nullable(),
  parentId: z.string().uuid().nullable().optional(),
  progressPercentage: z.number().min(0).max(100).default(0),
  keyResults: z.array(keyResultSchema).optional(),
});

export const updateObjectiveSchema = createObjectiveSchema.partial();

export type CreateObjectiveInput = z.infer<typeof createObjectiveSchema>;
export type UpdateObjectiveInput = z.infer<typeof updateObjectiveSchema>;

// Key Result CRUD schemas
export const createKeyResultSchema = z.object({
  objectiveId: z.string().uuid('Invalid objective ID'),
  title: z.string().min(1, 'Title required').max(200),
  targetValue: z.number().min(0).default(100),
  currentValue: z.number().min(0).default(0),
  unit: z.string().max(20).optional(),
  ownerId: z.string().uuid().nullable().optional(),
});

export const updateKeyResultSchema = createKeyResultSchema.omit({ objectiveId: true }).partial();

export type CreateKeyResultInput = z.infer<typeof createKeyResultSchema>;
export type UpdateKeyResultInput = z.infer<typeof updateKeyResultSchema>;
