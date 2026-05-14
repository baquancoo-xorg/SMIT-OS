import { z } from 'zod';
import { MediaPlatform, MediaFormat } from '@prisma/client';

const platformEnum = z.nativeEnum(MediaPlatform);
const formatEnum = z.nativeEnum(MediaFormat);

const sortByValues = ['publishedAt', 'reach', 'views', 'engagement', 'comments', 'likes'] as const;
const sortDirValues = ['asc', 'desc'] as const;
const groupByValues = ['channel', 'format', 'month'] as const;

export const mediaTrackerListQuerySchema = z.object({
  channelId: z.string().uuid().optional(),
  platform: platformEnum.optional(),
  format: formatEnum.optional(),
  dateFrom: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  dateTo: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(sortByValues).default('publishedAt'),
  sortDir: z.enum(sortDirValues).default('desc'),
  groupBy: z.enum(groupByValues).optional(),
  limit: z.coerce.number().int().min(1).max(1000).default(500),
});

export const mediaSyncBodySchema = z.object({
  channelId: z.string().uuid().optional(),
});

export const mediaKpiQuerySchema = mediaTrackerListQuerySchema.pick({
  channelId: true,
  platform: true,
  format: true,
  dateFrom: true,
  dateTo: true,
});

export type MediaTrackerListQuery = z.infer<typeof mediaTrackerListQuerySchema>;
export type MediaKpiQuery = z.infer<typeof mediaKpiQuerySchema>;
export type MediaSyncBody = z.infer<typeof mediaSyncBodySchema>;
