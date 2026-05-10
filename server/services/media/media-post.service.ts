/**
 * Media Tracker CRUD service.
 *
 * Phase 4 MVP scope (per plan 260510-0237 + role-simplification 260510-0318):
 *  - Owned media: manual entry for BLOG/OTHER (FB/IG/YouTube auto-sync deferred — needs OAuth + token setup)
 *  - KOL/KOC: manual entry with cost tracking
 *  - PR: manual entry with sentiment metadata
 *  - RBAC: read-shared (everyone), write-own (Member edits own; Admin edits all)
 */
import { MediaPlatform, MediaPostType, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export interface MediaPostInput {
  platform: MediaPlatform;
  type: MediaPostType;
  externalId?: string | null;
  url?: string | null;
  title?: string | null;
  publishedAt: Date;
  reach?: number;
  engagement?: number;
  utmCampaign?: string | null;
  cost?: number | null;
  meta?: Prisma.InputJsonValue;
}

export interface ListFilters {
  platform?: MediaPlatform;
  type?: MediaPostType;
  from?: Date;
  to?: Date;
  search?: string;
}

export async function listMediaPosts(filters: ListFilters = {}) {
  const where: Prisma.MediaPostWhereInput = {};
  if (filters.platform) where.platform = filters.platform;
  if (filters.type) where.type = filters.type;
  if (filters.from || filters.to) {
    where.publishedAt = {
      ...(filters.from ? { gte: filters.from } : {}),
      ...(filters.to ? { lte: filters.to } : {}),
    };
  }
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { url: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  return prisma.mediaPost.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
    take: 500,
  });
}

export async function createMediaPost(input: MediaPostInput, createdById: string | null) {
  return prisma.mediaPost.create({
    data: {
      platform: input.platform,
      type: input.type,
      externalId: input.externalId ?? null,
      url: input.url ?? null,
      title: input.title ?? null,
      publishedAt: input.publishedAt,
      reach: input.reach ?? 0,
      engagement: input.engagement ?? 0,
      utmCampaign: input.utmCampaign ?? null,
      cost: input.cost ?? null,
      createdById,
      meta: input.meta,
    },
  });
}

export async function updateMediaPost(
  id: string,
  patch: Partial<MediaPostInput>,
  user: { id: string; isAdmin: boolean }
) {
  const existing = await prisma.mediaPost.findUnique({ where: { id } });
  if (!existing) return { ok: false as const, status: 404, error: 'Media post not found' };

  // Ownership check (read-shared, write-own).
  if (!user.isAdmin && existing.createdById !== user.id) {
    return { ok: false as const, status: 403, error: 'You can only edit your own media posts' };
  }

  const updated = await prisma.mediaPost.update({
    where: { id },
    data: {
      ...(patch.platform ? { platform: patch.platform } : {}),
      ...(patch.type ? { type: patch.type } : {}),
      ...(patch.externalId !== undefined ? { externalId: patch.externalId } : {}),
      ...(patch.url !== undefined ? { url: patch.url } : {}),
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.publishedAt ? { publishedAt: patch.publishedAt } : {}),
      ...(patch.reach !== undefined ? { reach: patch.reach } : {}),
      ...(patch.engagement !== undefined ? { engagement: patch.engagement } : {}),
      ...(patch.utmCampaign !== undefined ? { utmCampaign: patch.utmCampaign } : {}),
      ...(patch.cost !== undefined ? { cost: patch.cost } : {}),
      ...(patch.meta !== undefined ? { meta: patch.meta } : {}),
    },
  });
  return { ok: true as const, post: updated };
}

export async function deleteMediaPost(id: string, user: { id: string; isAdmin: boolean }) {
  const existing = await prisma.mediaPost.findUnique({ where: { id } });
  if (!existing) return { ok: false as const, status: 404, error: 'Media post not found' };
  if (!user.isAdmin && existing.createdById !== user.id) {
    return { ok: false as const, status: 403, error: 'You can only delete your own media posts' };
  }
  await prisma.mediaPost.delete({ where: { id } });
  return { ok: true as const };
}
