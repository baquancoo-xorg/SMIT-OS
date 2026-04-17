import { Router } from 'express';
import { fbSyncBodySchema } from '../schemas/dashboard-overview.schema';
import { syncFbAdAccount } from '../services/facebook/fb-sync.service';
import { adminAuth } from '../middleware/admin-auth.middleware';

export function createFbSyncRoutes() {
  const router = Router();

  router.post('/', adminAuth, async (req, res) => {
    try {
      const parsed = fbSyncBodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          data: null,
          error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
          timestamp: new Date().toISOString(),
        });
      }

      const { accountId, dateStart, dateEnd } = parsed.data;

      // Fire-and-forget async sync
      syncFbAdAccount(accountId, dateStart, dateEnd)
        .then((r) => console.log('[fb-sync] result:', r))
        .catch((e) => console.error('[fb-sync] failed:', e));

      res.status(202).json({
        success: true,
        data: { accepted: true, accountId },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[fb-sync]', err);
      res.status(500).json({
        success: false,
        data: null,
        error: (err as Error).message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  return router;
}
