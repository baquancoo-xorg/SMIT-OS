import { z } from 'zod';

export const createUserSchema = z.object({
  fullName: z.string().min(1, 'Full name required').max(100),
  username: z
    .string()
    .min(3, 'Username min 3 chars')
    .max(50)
    .regex(/^[a-zA-Z0-9_.]+$/, 'Username: letters, numbers, underscores, dots only'),
  password: z.string().min(6, 'Password min 6 chars').optional(),
  departments: z.array(z.string().max(50)).min(1, 'At least one department required'),
  role: z.string().min(1, 'Role required').max(50),
  scope: z.string().max(100).optional().nullable(),
  avatar: z.string().url('Invalid avatar URL'),
  isAdmin: z.boolean().optional().default(false),
});

export const updateUserSchema = createUserSchema.partial();

// Self-profile update - whitelist only safe fields (no isAdmin, password, role)
export const updateSelfProfileSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateSelfProfileInput = z.infer<typeof updateSelfProfileSchema>;
