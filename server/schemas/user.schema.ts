import { z } from 'zod';

export const createUserSchema = z.object({
  fullName: z.string().min(1, 'Full name required').max(100),
  username: z
    .string()
    .min(3, 'Username min 3 chars')
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username: letters, numbers, underscores only'),
  password: z.string().min(6, 'Password min 6 chars').optional(),
  department: z.string().min(1, 'Department required').max(50),
  role: z.string().min(1, 'Role required').max(50),
  scope: z.string().max(100).optional().nullable(),
  avatar: z.string().url('Invalid avatar URL'),
  isAdmin: z.boolean().optional().default(false),
});

export const updateUserSchema = createUserSchema.partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
