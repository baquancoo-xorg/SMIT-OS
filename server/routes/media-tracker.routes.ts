/**
 * Media Tracker API.
 *  GET    /api/media-tracker/posts            → list with optional filters
 *  POST   /api/media-tracker/posts            → create
 *  PUT    /api/media-tracker/posts/:id        → update (write-own / admin override)
 *  DELETE /api/media-tracker/posts/:id        → delete (write-own / admin override)
 *
 * Auth: requires authenticated user (mounted under /api after auth middleware).
 */
import { Router } from 'express';
import { MediaPlatform, MediaPostType } from '@prisma/client';
import {
  listMediaPosts,
  createMediaPost,
  updateMediaPost,
  deleteMediaPost,
  type MediaPostInput,
} from '../services/media/media-post.service';

const VALID_PLATFORMS: MediaPlatform[] = [
  MediaPlatform.FACEBOOK,
  MediaPlatform.INSTAGRAM,
  MediaPlatform.YOUTUBE,
  MediaPlatform.BLOG,
  MediaPlatform.PR,
  MediaPlatform.OTHER,
];
const VALID_TYPES: MediaPostType[] = [
  MediaPostType.ORGANIC,
  MediaPostType.KOL,
  MediaPostType.KOC,
  MediaPostType.PR,
];

function ok(data: unknown) {
  return { success: true, data, timestamp: new Date().toISOString() };
}
function fail(status: number, error: string) {
  return { status, body: { success: false, data: null, error, timestamp: new Date().toISOString() } };
}

function parseInput(body: any) {
  if (!body || typeof body !== 'object') return { ok: false as const, error: 'Invalid payload' };

  const platform = body.platform as MediaPlatform;
  if (!VALID_PLATFORMS.includes(platform)) return { ok: false as const, error: `platform must be one of ${VALID_PLATFORMS.join(', ')}` };

  const type = (body.type ?? 'ORGANIC') as MediaPostType;
  if (!VALID_TYPES.includes(type)) return { ok: false as const, error: `type must be one of ${VALID_TYPES.join(', ')}` };

  if (!body.publishedAt) return { ok: false as const, error: 'publishedAt is required' };
  const publishedAt = new Date(body.publishedAt);
  if (isNaN(publishedAt.getTime())) return { ok: false as const, error: 'publishedAt invalid' };

  return {
    ok: true as const,
    input: {
      platform,
      type,
      externalId: body.externalId ?? null,
      url: body.url ?? null,
      title: body.title ?? null,
      publishedAt,
      reach: body.reach != null ? Number(body.reach) : 0,
      engagement: body.engagement != null ? Number(body.engagement) : 0,
      utmCampaign: body.utmCampaign ?? null,
      cost: body.cost != null ? Number(body.cost) : null,
      meta: body.meta ?? undefined,
    },
  };
}

export function createMediaTrackerRoutes() {
  const router = Router();

  // GET /api/media-tracker/posts
  router.get('/posts', async (req, res) => {
    try {
      const filters: Parameters<typeof listMediaPosts>[0] = {};
      const q = req.query;
      if (q.platform && VALID_PLATFORMS.includes(q.platform as MediaPlatform)) {
        filters.platform = q.platform as MediaPlatform;
      }
      if (q.type && VALID_TYPES.includes(q.type as MediaPostType)) {
        filters.type = q.type as MediaPostType;
      }
      if (q.from) filters.from = new Date(String(q.from));
      if (q.to) filters.to = new Date(String(q.to));
      if (q.search) filters.search = String(q.search);

      const posts = await listMediaPosts(filters);
      res.json(ok({ posts }));
    } catch (err) {
      const e = fail(500, (err as Error).message);
      res.status(e.status).json(e.body);
    }
  });

  // POST /api/media-tracker/posts
  router.post('/posts', async (req, res) => {
    try {
      if (!req.user || req.user.type === 'api-key') {
        const e = fail(401, 'Not authenticated');
        return res.status(e.status).json(e.body);
      }
      const parsed = parseInput(req.body);
      if (!parsed.ok) {
        const e = fail(400, parsed.error);
        return res.status(e.status).json(e.body);
      }
      const created = await createMediaPost(parsed.input, req.user.userId);
      res.status(201).json(ok(created));
    } catch (err) {
      const e = fail(500, (err as Error).message);
      res.status(e.status).json(e.body);
    }
  });

  // PUT /api/media-tracker/posts/:id
  router.put('/posts/:id', async (req, res) => {
    try {
      if (!req.user || req.user.type === 'api-key') {
        const e = fail(401, 'Not authenticated');
        return res.status(e.status).json(e.body);
      }
      const parsed = parseInput(req.body);
      if (!parsed.ok) {
        const e = fail(400, parsed.error);
        return res.status(e.status).json(e.body);
      }
      const result = await updateMediaPost(req.params.id, parsed.input, {
        id: req.user.userId,
        isAdmin: !!req.user.isAdmin,
      });
      if (!result.ok) {
        const e = fail(result.status, result.error);
        return res.status(e.status).json(e.body);
      }
      res.json(ok(result.post));
    } catch (err) {
      const e = fail(500, (err as Error).message);
      res.status(e.status).json(e.body);
    }
  });

  // DELETE /api/media-tracker/posts/:id
  router.delete('/posts/:id', async (req, res) => {
    try {
      if (!req.user || req.user.type === 'api-key') {
        const e = fail(401, 'Not authenticated');
        return res.status(e.status).json(e.body);
      }
      const result = await deleteMediaPost(req.params.id, {
        id: req.user.userId,
        isAdmin: !!req.user.isAdmin,
      });
      if (!result.ok) {
        const e = fail(result.status, result.error);
        return res.status(e.status).json(e.body);
      }
      res.status(204).end();
    } catch (err) {
      const e = fail(500, (err as Error).message);
      res.status(e.status).json(e.body);
    }
  });

  return router;
}
