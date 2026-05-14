/**
 * Media Post read service (Phase 04 rewrite).
 * All CRUD removed — posts are managed via sync only (Phase 03).
 *
 * Exports:
 *   listMediaPosts(query) → { posts: MediaPostDTO[] } | { groups: GroupedResult[] }
 *   computeMediaKpi(query) → KpiResult
 */
import { MediaPlatform, MediaFormat, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import type { MediaTrackerListQuery, MediaKpiQuery } from '../../schemas/media-tracker.schema';

// ── DTO ──────────────────────────────────────────────────────────────────────

export interface MediaPostDTO {
  id: string;
  channelId: string;
  channel: { id: string; name: string; platform: MediaPlatform };
  externalId: string;
  url: string | null;
  permalink: string | null;
  title: string | null;
  message: string | null;
  content: string | null;   // alias for message — frontend consumers use this name
  publishedAt: string;      // ISO
  format: MediaFormat;
  reach: number;
  views: number;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  thumbnailUrl: string | null;
  lastSyncedAt: string | null;
}

export interface KpiResult {
  totalPosts: number;
  totalReach: number;
  totalViews: number;
  totalEngagement: number;
  avgEngagementRate: number;
}

export interface GroupedResult {
  key: string;
  count: number;
  summary: KpiResult;
  posts: MediaPostDTO[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildWhere(q: Pick<MediaTrackerListQuery, 'channelId' | 'platform' | 'format' | 'dateFrom' | 'dateTo' | 'search'>): Prisma.MediaPostWhereInput {
  const where: Prisma.MediaPostWhereInput = {};
  if (q.channelId) where.channelId = q.channelId;
  if (q.platform) where.channel = { platform: q.platform };
  if (q.format) where.format = q.format;
  if (q.dateFrom || q.dateTo) {
    where.publishedAt = {
      ...(q.dateFrom ? { gte: new Date(q.dateFrom) } : {}),
      ...(q.dateTo ? { lte: new Date(q.dateTo) } : {}),
    };
  }
  if (q.search) {
    where.OR = [
      { title: { contains: q.search, mode: 'insensitive' } },
      { message: { contains: q.search, mode: 'insensitive' } },
    ];
  }
  return where;
}

function toDTO(post: Prisma.MediaPostGetPayload<{ include: { channel: true } }>): MediaPostDTO {
  return {
    id: post.id,
    channelId: post.channelId,
    channel: { id: post.channel.id, name: post.channel.name, platform: post.channel.platform },
    externalId: post.externalId,
    url: post.url,
    permalink: post.permalink,
    title: post.title,
    message: post.message,
    content: post.message,
    publishedAt: post.publishedAt.toISOString(),
    format: post.format,
    reach: post.reach,
    views: post.views,
    engagement: post.engagement,
    likes: post.likes,
    comments: post.comments,
    shares: post.shares,
    saves: post.saves,
    thumbnailUrl: post.thumbnailUrl,
    lastSyncedAt: post.lastSyncedAt ? post.lastSyncedAt.toISOString() : null,
  };
}

function buildKpi(posts: MediaPostDTO[]): KpiResult {
  const totalReach = posts.reduce((s, p) => s + p.reach, 0);
  const totalViews = posts.reduce((s, p) => s + p.views, 0);
  const totalEngagement = posts.reduce((s, p) => s + p.engagement, 0);
  const avgEngagementRate = totalReach > 0 ? totalEngagement / totalReach : 0;
  return { totalPosts: posts.length, totalReach, totalViews, totalEngagement, avgEngagementRate };
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function listMediaPosts(query: MediaTrackerListQuery): Promise<
  { posts: MediaPostDTO[] } | { groups: GroupedResult[] }
> {
  const where = buildWhere(query);
  const orderBy = { [query.sortBy]: query.sortDir } as Prisma.MediaPostOrderByWithRelationInput;

  const raw = await prisma.mediaPost.findMany({
    where,
    include: { channel: true },
    orderBy,
    take: query.limit,
  });

  const posts = raw.map(toDTO);

  if (!query.groupBy) return { posts };

  // Group-by logic
  const buckets = new Map<string, MediaPostDTO[]>();
  for (const p of posts) {
    let key: string;
    if (query.groupBy === 'channel') key = p.channelId;
    else if (query.groupBy === 'format') key = p.format;
    else key = p.publishedAt.slice(0, 7); // month: YYYY-MM
    const arr = buckets.get(key) ?? [];
    arr.push(p);
    buckets.set(key, arr);
  }

  const groups: GroupedResult[] = Array.from(buckets.entries()).map(([key, items]) => ({
    key,
    count: items.length,
    summary: buildKpi(items),
    posts: items,
  }));

  return { groups };
}

export async function computeMediaKpi(query: MediaKpiQuery): Promise<KpiResult> {
  const where = buildWhere(query);

  const [agg, count] = await Promise.all([
    prisma.mediaPost.aggregate({
      where,
      _sum: { reach: true, views: true, engagement: true },
    }),
    prisma.mediaPost.count({ where }),
  ]);

  const totalReach = agg._sum.reach ?? 0;
  const totalViews = agg._sum.views ?? 0;
  const totalEngagement = agg._sum.engagement ?? 0;
  const avgEngagementRate = totalReach > 0 ? totalEngagement / totalReach : 0;

  return { totalPosts: count, totalReach, totalViews, totalEngagement, avgEngagementRate };
}
