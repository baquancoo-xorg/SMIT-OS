import { z } from 'zod';
import { MediaPlatform } from '@prisma/client';

export const socialChannelCreateSchema = z.object({
  platform: z.nativeEnum(MediaPlatform),
  externalId: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  accessToken: z.string().min(10, 'accessToken is required'),
  tokenExpiresAt: z.string().datetime({ offset: true }).optional(),
});

export const socialChannelUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  accessToken: z.string().min(10).optional(),
  tokenExpiresAt: z.string().datetime({ offset: true }).optional(),
  active: z.boolean().optional(),
});

export type SocialChannelCreateInput = z.infer<typeof socialChannelCreateSchema>;
export type SocialChannelUpdateInput = z.infer<typeof socialChannelUpdateSchema>;
