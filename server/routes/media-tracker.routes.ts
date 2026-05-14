/**
 * Media Tracker API (Phase 04 rewrite — read-only + sync trigger).
 *
 *  GET  /api/media-tracker/posts   → filtered list or grouped result
 *  GET  /api/media-tracker/kpi     → aggregate KPI
 *  POST /api/media-tracker/sync    → admin: trigger channel sync
 *
 * Auth: all routes require authenticated user (mounted under /api after auth middleware).
 * Sync: admin only.
 */
import { Router, Request, Response, NextFunction } from 'express';
import { listMediaPosts, computeMediaKpi } from '../services/media/media-post.service';
import {
  mediaTrackerListQuerySchema,
  mediaKpiQuerySchema,
  mediaSyncBodySchema,
} from '../schemas/media-tracker.schema';

function ok(data: unknown) {
  return { success: true, data, timestamp: new Date().toISOString() };
}
function fail(status: number, error: string) {
  return { status, body: { success: false, data: null, error, timestamp: new Date().toISOString() } };
}
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
}

export function createMediaTrackerRoutes() {
  const router = Router();

  // GET /api/media-tracker/posts
  router.get('/posts', async (req, res) => {
    try {
      const parsed = mediaTrackerListQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        const e = fail(400, parsed.error.message);
        return res.status(e.status).json(e.body);
      }
      const result = await listMediaPosts(parsed.data);
      res.json(ok(result));
    } catch (err) {
      const e = fail(500, (err as Error).message);
      res.status(e.status).json(e.body);
    }
  });

  // GET /api/media-tracker/kpi
  router.get('/kpi', async (req, res) => {
    try {
      const parsed = mediaKpiQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        const e = fail(400, parsed.error.message);
        return res.status(e.status).json(e.body);
      }
      const kpi = await computeMediaKpi(parsed.data);
      res.json(ok(kpi));
    } catch (err) {
      const e = fail(500, (err as Error).message);
      res.status(e.status).json(e.body);
    }
  });

  // POST /api/media-tracker/sync  (admin only)
  router.post('/sync', requireAdmin, async (req, res) => {
    try {
      const parsed = mediaSyncBodySchema.safeParse(req.body);
      if (!parsed.success) {
        const e = fail(400, parsed.error.message);
        return res.status(e.status).json(e.body);
      }

      // Dynamic import — Phase 03 file; stub if not yet wired
      let result: unknown;
      try {
        const syncService = await import('../services/media/media-sync.service');
        if (parsed.data.channelId) {
          result = await syncService.syncChannel(parsed.data.channelId);
        } else {
          result = await syncService.syncAllActive();
        }
      } catch (importErr) {
        const msg = (importErr as Error).message ?? '';
        // Re-throw only if it is a genuine runtime error, not missing module
        if (!msg.includes('Cannot find module') && !msg.includes('not yet wired')) throw importErr;
        // TODO: Phase 03 — remove stub once media-sync.service.ts is merged
        throw new Error('sync service not yet wired');
      }

      res.json(ok(result));
    } catch (err) {
      const e = fail(500, (err as Error).message);
      res.status(e.status).json(e.body);
    }
  });

  return router;
}
