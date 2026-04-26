import { Router } from 'express';
import { handleAsync } from '../utils/async-handler';
import { RBAC } from '../middleware/rbac.middleware';
import { syncLeadsFromCrm } from '../services/lead-sync/crm-lead-sync.service';
import { getLeadSyncPrisma } from '../services/lead-sync/state';

export function createLeadSyncRoutes() {
  const router = Router();

  router.post('/sync-now', RBAC.adminOnly, handleAsync(async (_req: any, res: any) => {
    syncLeadsFromCrm({ mode: 'manual' })
      .then((result) => {
        console.log('[lead-sync] manual run result:', result);
      })
      .catch((error) => {
        console.error('[lead-sync] manual run failed:', error);
      });

    res.status(202).json({ accepted: true, mode: 'manual' });
  }));

  router.get('/sync-status', RBAC.adminOnly, handleAsync(async (_req: any, res: any) => {
    const prisma = getLeadSyncPrisma();

    const latest = await prisma.leadSyncRun.findFirst({
      orderBy: { startedAt: 'desc' },
    });

    res.json(latest);
  }));

  return router;
}
