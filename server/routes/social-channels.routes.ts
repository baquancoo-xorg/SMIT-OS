/**
 * Social Channels admin REST API.
 *
 *  GET    /api/social-channels          → list (token redacted)
 *  POST   /api/social-channels          → create (admin)
 *  PATCH  /api/social-channels/:id      → update (admin)
 *  DELETE /api/social-channels/:id      → soft-delete / set active=false (admin)
 *  POST   /api/social-channels/:id/test → verify FB token (admin)
 *
 * All routes require auth. Mutations require admin.
 */
import { Router, Request, Response, NextFunction } from 'express';
import {
  listChannels,
  createChannel,
  updateChannel,
  softDeleteChannel,
  testChannel,
} from '../services/media/social-channel.service';
import {
  socialChannelCreateSchema,
  socialChannelUpdateSchema,
} from '../schemas/social-channel.schema';

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

export function createSocialChannelsRoutes() {
  const router = Router();

  // GET /api/social-channels
  router.get('/', async (_req, res) => {
    try {
      const channels = await listChannels();
      res.json(ok(channels));
    } catch (err) {
      const e = fail(500, (err as Error).message);
      res.status(e.status).json(e.body);
    }
  });

  // POST /api/social-channels  (admin)
  router.post('/', requireAdmin, async (req, res) => {
    try {
      const parsed = socialChannelCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        const e = fail(400, parsed.error.message);
        return res.status(e.status).json(e.body);
      }
      const channel = await createChannel(parsed.data);
      res.status(201).json(ok(channel));
    } catch (err) {
      const e = fail(500, (err as Error).message);
      res.status(e.status).json(e.body);
    }
  });

  // PATCH /api/social-channels/:id  (admin)
  router.patch('/:id', requireAdmin, async (req, res) => {
    try {
      const parsed = socialChannelUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        const e = fail(400, parsed.error.message);
        return res.status(e.status).json(e.body);
      }
      const channel = await updateChannel(req.params.id, parsed.data);
      if (!channel) {
        const e = fail(404, 'Channel not found');
        return res.status(e.status).json(e.body);
      }
      res.json(ok(channel));
    } catch (err) {
      const e = fail(500, (err as Error).message);
      res.status(e.status).json(e.body);
    }
  });

  // DELETE /api/social-channels/:id  (admin) — soft delete
  router.delete('/:id', requireAdmin, async (req, res) => {
    try {
      const deleted = await softDeleteChannel(req.params.id);
      if (!deleted) {
        const e = fail(404, 'Channel not found');
        return res.status(e.status).json(e.body);
      }
      res.json(ok({ id: req.params.id, active: false }));
    } catch (err) {
      const e = fail(500, (err as Error).message);
      res.status(e.status).json(e.body);
    }
  });

  // POST /api/social-channels/:id/test  (admin)
  router.post('/:id/test', requireAdmin, async (req, res) => {
    try {
      const result = await testChannel(req.params.id);
      if (!result.ok) {
        const e = fail(422, result.error ?? 'Token test failed');
        return res.status(e.status).json(e.body);
      }
      res.json(ok(result));
    } catch (err) {
      const e = fail(500, (err as Error).message);
      res.status(e.status).json(e.body);
    }
  });

  return router;
}
