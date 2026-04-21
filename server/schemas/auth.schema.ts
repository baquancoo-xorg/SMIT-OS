import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username required').max(50),
  password: z.string().min(1, 'Password required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const totpVerifySchema = z.object({
  tempToken: z.string().min(1),
  // 6 digits for TOTP or 8 uppercase hex chars for backup code
  code: z.string().regex(/^(\d{6}|[0-9A-F]{8})$/, 'Invalid code format'),
});

export const totpEnableSchema = z.object({
  code: z.string().length(6).regex(/^\d+$/),
});

export const totpDisableSchema = z.object({
  password: z.string().min(1),
});
