/**
 * Media sync service — orchestrates SocialChannel → FB Graph → MediaPost upserts.
 * Supports FACEBOOK_PAGE only in Phase 1. Other platforms throw UnsupportedPlatformError.
 */
import { prisma } from '../../lib/prisma';
import { decrypt } from '../../lib/crypto';
import { childLogger } from '../../lib/logger';
import {
  fetchPagePosts,
  fetchPostInsights,
  FBTokenError,
  FBRateLimitError,
  type RawPost,
  type InsightMap,
} from '../facebook/fb-graph-client';
import { MediaSyncStatus, MediaPlatform } from '@prisma/client';

const log = childLogger('media-sync');

// Global concurrency lock — prevents overlapping runs (tsx watch safe)
declare const globalThis: { __smitMediaSyncRunning?: boolean };

export interface SyncResult {
  channelId: string;
  fetched: number;
  upserted: number;
  errors: string[];
  // Fields for route compatibility (mirrors syncAll shape)
  channelsProcessed: number;
  totalFetched: number;
}

export interface SyncAllResult {
  channelsProcessed: number;
  totalFetched: number;
  totalUpserted: number;
  failures: string[];
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function chunkPromise<T, R>(
  items: T[],
  size: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    const chunk = items.slice(i, i + size);
    const chunkResults = await Promise.all(chunk.map(fn));
    results.push(...chunkResults);
  }
  return results;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function upsertPosts(
  channelId: string,
  posts: RawPost[],
  insights: Record<string, InsightMap>
): Promise<number> {
  let upserted = 0;
  for (const post of posts) {
    const ins = insights[post.externalId];
    const metrics = {
      views: ins?.views ?? 0,
      engagement: ins?.engagement ?? 0,
      likes: ins?.likes ?? 0,
      comments: ins?.comments ?? 0,
      shares: ins?.shares ?? 0,
      saves: ins?.saves ?? 0,
      metricsExtra: ins?.raw ? (ins.raw as any) : undefined,
      lastSyncedAt: new Date(),
    };
    await prisma.mediaPost.upsert({
      where: { channelId_externalId: { channelId, externalId: post.externalId } },
      create: {
        channelId,
        externalId: post.externalId,
        message: post.message ?? null,
        publishedAt: new Date(post.createdTime),
        format: post.format as any,
        url: post.permalinkUrl ?? null,
        permalink: post.permalinkUrl ?? null,
        thumbnailUrl: post.fullPicture ?? null,
        ...metrics,
      },
      update: {
        message: post.message ?? null,
        url: post.permalinkUrl ?? null,
        permalink: post.permalinkUrl ?? null,
        thumbnailUrl: post.fullPicture ?? null,
        ...metrics,
      },
    });
    upserted++;
  }
  return upserted;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function syncChannel(channelId: string): Promise<SyncResult> {
  const errors: string[] = [];

  const channel = await prisma.socialChannel.findUnique({ where: { id: channelId } });
  if (!channel || !channel.active) {
    return { channelId, fetched: 0, upserted: 0, channelsProcessed: 1, totalFetched: 0, errors: ['Channel not found or inactive'] };
  }

  if (channel.platform !== MediaPlatform.FACEBOOK_PAGE) {
    return {
      channelId,
      fetched: 0,
      upserted: 0,
      channelsProcessed: 1,
      totalFetched: 0,
      errors: [`Platform ${channel.platform} not supported in Phase 1`],
    };
  }

  // Surface token expiry warning without failing sync
  if (channel.tokenExpiresAt && channel.tokenExpiresAt < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
    log.warn({ channelId, tokenExpiresAt: channel.tokenExpiresAt }, 'token expiring soon');
    await prisma.socialChannel.update({
      where: { id: channelId },
      data: { lastSyncStatus: 'TOKEN_EXPIRING' },
    });
  }

  let token: string;
  try {
    token = decrypt(channel.accessTokenEncrypted);
  } catch (err) {
    log.error({ channelId, err }, 'token decrypt failed');
    await prisma.socialChannel.update({
      where: { id: channelId },
      data: { lastSyncStatus: 'DECRYPT_ERROR' },
    });
    return { channelId, fetched: 0, upserted: 0, channelsProcessed: 1, totalFetched: 0, errors: ['Token decrypt failed'] };
  }

  // Incremental: refetch last 24h to catch updated insights
  const lastPost = await prisma.mediaPost.findFirst({
    where: { channelId },
    orderBy: { publishedAt: 'desc' },
    select: { publishedAt: true },
  });
  const since = lastPost
    ? new Date(lastPost.publishedAt.getTime() - 24 * 60 * 60 * 1000)
    : undefined;

  const syncRun = await prisma.mediaSyncRun.create({
    data: { channelId, status: MediaSyncStatus.FAILED },
  });

  let posts: RawPost[] = [];
  let insights: Record<string, InsightMap> = {};
  let upserted = 0;

  try {
    posts = await fetchPagePosts(channel.externalId, token, since);

    // Fetch insights in batches of 50
    const postIds = posts.map((p) => p.externalId);
    if (postIds.length > 0) {
      insights = await fetchPostInsights(postIds, token);
    }

    upserted = await upsertPosts(channelId, posts, insights);

    await prisma.mediaSyncRun.update({
      where: { id: syncRun.id },
      data: {
        status: errors.length > 0 ? MediaSyncStatus.PARTIAL : MediaSyncStatus.SUCCESS,
        finishedAt: new Date(),
        fetched: posts.length,
        upserted,
        errorMessage: errors.length > 0 ? errors.join('; ') : null,
      },
    });

    await prisma.socialChannel.update({
      where: { id: channelId },
      data: {
        lastSyncedAt: new Date(),
        lastSyncStatus: errors.length > 0 ? 'PARTIAL' : 'OK',
      },
    });

    log.info({ channelId, fetched: posts.length, upserted }, 'channel synced');
  } catch (err) {
    if (err instanceof FBTokenError) {
      log.error({ channelId }, 'token invalid — deactivating channel');
      await prisma.socialChannel.update({
        where: { id: channelId },
        data: { active: false, lastSyncStatus: 'TOKEN_INVALID' },
      });
      errors.push(`Token invalid: ${err.message}`);
    } else if (err instanceof FBRateLimitError) {
      log.warn({ channelId }, 'rate limited — retrying once after 60s');
      await sleep(60_000);
      try {
        posts = await fetchPagePosts(channel.externalId, token, since);
        const retryIds = posts.map((p) => p.externalId);
        if (retryIds.length > 0) insights = await fetchPostInsights(retryIds, token);
        upserted = await upsertPosts(channelId, posts, insights);
      } catch (retryErr) {
        errors.push(`Rate limit retry failed: ${(retryErr as Error).message}`);
      }
    } else {
      errors.push(`Sync error: ${(err as Error).message}`);
      log.error({ channelId, err }, 'sync failed');
    }

    await prisma.mediaSyncRun.update({
      where: { id: syncRun.id },
      data: {
        status: errors.length > 0 ? MediaSyncStatus.FAILED : MediaSyncStatus.SUCCESS,
        finishedAt: new Date(),
        fetched: posts.length,
        upserted,
        errorMessage: errors.join('; ') || null,
      },
    });
  }

  return { channelId, fetched: posts.length, upserted, channelsProcessed: 1, totalFetched: posts.length, errors };
}

/** Alias for route compatibility — wraps syncAllActive with shape expected by media-tracker.routes.ts */
export async function syncAll(): Promise<{ channelsProcessed: number; totalFetched: number; errors: string[] }> {
  const r = await syncAllActive();
  return { channelsProcessed: r.channelsProcessed, totalFetched: r.totalFetched, errors: r.failures };
}

export async function syncAllActive(): Promise<SyncAllResult> {
  if (globalThis.__smitMediaSyncRunning) {
    log.warn('sync already running — skipping');
    return { channelsProcessed: 0, totalFetched: 0, totalUpserted: 0, failures: ['skipped: already running'] };
  }

  globalThis.__smitMediaSyncRunning = true;
  try {
    const channels = await prisma.socialChannel.findMany({
      where: { active: true },
      select: { id: true },
    });

    const results = await chunkPromise(channels, 3, (ch) => syncChannel(ch.id));

    const totalFetched = results.reduce((s, r) => s + r.fetched, 0);
    const totalUpserted = results.reduce((s, r) => s + r.upserted, 0);
    const failures = results.flatMap((r) => r.errors);

    log.info(
      { channels: channels.length, totalFetched, totalUpserted, failures: failures.length },
      `synced ${totalFetched} posts across ${channels.length} channels`
    );

    return { channelsProcessed: channels.length, totalFetched, totalUpserted, failures };
  } finally {
    globalThis.__smitMediaSyncRunning = false;
  }
}
